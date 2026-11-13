// Tiny static file server for LOCAL PREVIEW ONLY.
// Not part of the deployed site. Run: node dev-server.js  -> http://localhost:5500
var http = require("http");
var fs = require("fs");
var path = require("path");

var root = __dirname;
var port = 5500;
var types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

http.createServer(function (req, res) {
  var urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  var filePath = path.join(root, urlPath);
  if (!filePath.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
  if (path.extname(filePath).toLowerCase() === ".php") {
    res.writeHead(501, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("PHP is required to run this page. Start the PHP development server instead.");
  }

  fs.readFile(filePath, function (err, data) {
    if (err) { res.writeHead(404); return res.end("Not found: " + urlPath); }
    var ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, function () {
  console.log("Bravo demo running at http://localhost:" + port);
});
