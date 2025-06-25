const http = require("http");
const fs = require("fs");
const path = require("path");

function serveAllFilesFromCurrentDirectory() {
  const baseDir = process.cwd(); // current directory
  const port = 3046;

  const server = http.createServer((req, res) => {
    let requestedPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(baseDir, decodeURIComponent(requestedPath));

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File Not Found");
        return;
      }

      // Determine content type
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".txt": "text/plain",
      };
      const contentType = contentTypes[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  });

  server.listen(port, () => {
    console.log(`Serving all files at http://localhost:${port}/`);
  });
}

module.exports = serveAllFilesFromCurrentDirectory;
