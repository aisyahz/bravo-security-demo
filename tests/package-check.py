"""Smoke-test the actual allowlisted ZIP with local PHP; sends no email."""
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile
from urllib.request import urlopen
from urllib.error import HTTPError
import json
import subprocess
import time

root = Path(__file__).resolve().parents[1]
with TemporaryDirectory(prefix='bravo-package-') as directory:
    target = Path(directory).resolve()
    with ZipFile(root/'dist/Bravo-Production.zip') as archive:
        for name in archive.namelist():
            assert (target/name).resolve().is_relative_to(target)
        archive.extractall(target)
    server = subprocess.Popen([str(root/'.local-tools/php/php.exe'), '-S', '127.0.0.1:5516', '-t', str(target)],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                              creationflags=subprocess.CREATE_NO_WINDOW)
    try:
        time.sleep(.5)
        manifest = json.loads((root/'dist/production-manifest.json').read_text())
        count = 0
        for name in manifest:
            if name.startswith('includes/') or name == '.htaccess':
                continue  # Apache deny rules require hosting; PHP guard checked below.
            with urlopen('http://127.0.0.1:5516/'+name) as response:
                assert response.status == 200, name
                body = response.read()
                assert body, name
                if name == 'contact.php':
                    assert b'name="csrf_token"' in body and b'<?php' not in body
                    assert response.headers['Cache-Control'] == 'no-store'
                count += 1
        try:
            urlopen('http://127.0.0.1:5516/includes/contact-security.php')
            raise AssertionError('Direct security include should be rejected')
        except HTTPError as error:
            assert error.code == 404
        result = f'ZIP smoke test passed: {count} public files served, contact PHP rendered with CSRF/no-store, direct helper access rejected. No mail sent.'
        print(result)
        (root/'tests/artifacts/package-results.txt').write_text(result+'\n')
    finally:
        server.terminate()
        server.wait(timeout=10)
