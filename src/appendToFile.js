const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "logs");
const defaultFile = path.join(logsDir, "console-logs.html");

module.exports = {
  appendToFile: function (text, imei) {
    const filePath = imei
      ? path.join(logsDir, `logs-${imei}.html`)
      : defaultFile;
    console.log(`Appending to file: ${filePath}`);

    text = "<p>" + new Date().toISOString() + " - " + text + "</p>\n";

    return new Promise((resolve, reject) => {
      // Ensure logs directory exists
      fs.mkdir(logsDir, { recursive: true }, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Open (or create) the file
        fs.open(filePath, "a", (err, fd) => {
          if (err) {
            reject(err);
            return;
          }

          fs.appendFile(fd, text, "utf8", (err) => {
            if (err) {
              fs.close(fd, () => {
                reject(err);
              });
              return;
            }

            fs.close(fd, (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve();
            });
          });
        });
      });
    });
  },

  deleteFile: function () {
    return new Promise((resolve, reject) => {
      fs.access(defaultFile, fs.constants.F_OK, (err) => {
        if (err) {
          if (err.code === "ENOENT") {
            resolve(); // File doesn't exist, no problem
          } else {
            reject(err);
          }
        } else {
          fs.unlink(defaultFile, (err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    });
  },
};
