// htmlServer.js
const http = require("http");
const fs = require("fs");
const path = require("path");

function serveLatestHTML() {
  const htmlDir = ".";
  const endpoint = "/logs";
  const port = 3046;
  const server = http.createServer((req, res) => {
    const htmlFilePath = path.join(htmlDir, "console-logs.html");

    // Read the HTML file dynamically
    fs.readFile(htmlFilePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }

      // Serve the HTML file
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  });

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  console.log(
    `HTML server is serving files from ${htmlDir} at http://localhost:${port}${endpoint}`
  );
}

module.exports = serveLatestHTML;
