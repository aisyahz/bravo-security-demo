import urllib.request,json,hashlib,zipfile,io
from pathlib import Path
meta=json.load(urllib.request.urlopen('https://windows.php.net/downloads/releases/releases.json'))['8.4']
key=next(k for k in meta if k.startswith('nts-') and k.endswith('-x64'))
z=meta[key]['zip']
data=urllib.request.urlopen('https://windows.php.net/downloads/releases/'+z['path'],timeout=60).read()
assert hashlib.sha256(data).hexdigest()==z['sha256']
target=Path('.local-tools/php'); target.mkdir(parents=True,exist_ok=True)
zipfile.ZipFile(io.BytesIO(data)).extractall(target)
print('Verified PHP',meta['version'])
