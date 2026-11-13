"""Explicit allowlist packaging; run from any directory. No source-tree recursion."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    '.htaccess', 'index.html', 'about.html', 'services.html', 'operations.html',
    'contact.php', 'sitemap.xml', 'includes/contact-security.php', 'includes/.htaccess',
    'assets/css/style.css', 'assets/js/main.js', 'assets/icons/lucide.svg', 'assets/icons/LICENSE',
    'assets/img/bravo-logo-104.png', 'assets/img/favicon-32.png', 'assets/img/apple-touch-icon.png',
    'assets/img/security-entrance.webp', 'assets/img/industrial-facility-patrol.webp',
    'assets/img/security-team.webp', 'assets/img/visitor-welcome.webp',
    'assets/img/urban-security-patrol.webp', 'assets/img/security-control-room.webp',
    'assets/img/hero.svg',
    'assets/images/hero-security.webp', 'assets/images/hero-security-mobile.webp',
    'assets/images/armed-guard.webp', 'assets/images/cctv-monitoring.webp',
    'assets/images/entrance-security.webp', 'assets/images/industrial-security.webp',
    'assets/images/k9-security.webp', 'assets/images/kuala-lumpur-skyline.webp',
    'assets/images/mobile-escort.webp', 'assets/images/mobile-patrol.webp',
    'assets/images/operations-team.webp', 'assets/images/visitor-assistance.webp',
    'assets/images/bodyguard.webp', 'assets/images/event-security.webp',
    'assets/images/cash-in-transit.webp', 'assets/images/corporate-security.webp',
    'assets/images/social-preview.jpg',
]
assert len(FILES) == len(set(FILES))
manifest = {}
for name in FILES:
    source = ROOT / name
    assert source.is_file() and not source.is_symlink(), name
    assert source.resolve().is_relative_to(ROOT), name
    data = source.read_bytes()
    manifest[name] = {'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
# Every local asset reference must be explicitly listed (not auto-included).
for name in ['index.html', 'about.html', 'services.html', 'contact.php']:
    for asset in re.findall(r'(?:src|href)="(assets/[^"?#]+)', (ROOT/name).read_text(encoding='utf-8')):
        assert asset in FILES, (name, asset)
for relative in re.findall(r'url\("([^"?#]+)', (ROOT/'assets/css/style.css').read_text(encoding='utf-8')):
    asset = (ROOT/'assets/css'/relative).resolve().relative_to(ROOT).as_posix()
    assert asset in FILES, asset
out = ROOT/'dist'
out.mkdir(exist_ok=True)
archive = out/'Bravo-Production.zip'
with ZipFile(archive, 'w', ZIP_DEFLATED, compresslevel=9) as package:
    for name in FILES:
        package.write(ROOT/name, name)
with ZipFile(archive) as package:
    assert package.testzip() is None
    assert package.namelist() == FILES
    for name, entry in manifest.items():
        assert hashlib.sha256(package.read(name)).hexdigest() == entry['sha256']
(out/'production-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
print(f'{archive}: {len(FILES)} files, {archive.stat().st_size:,} bytes; manifest and CRC verified.')
