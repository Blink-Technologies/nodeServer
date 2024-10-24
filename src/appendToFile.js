const fs = require("fs");
const filePath = "./console-logs.html";

module.exports = {
  appendToFile: function (text) {
    return;
    text = "<p>" + new Date().toISOString() + " - " + text + "</p>" + "\n";
    return new Promise((resolve, reject) => {
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
  },

  deleteFile: function () {
    return new Promise((resolve, reject) => {
      // Check if the file exists
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          if (err.code === "ENOENT") {
            // File doesn't exist, resolve immediately
            resolve();
          } else {
            // Other error, reject with the error
            reject(err);
          }
        } else {
          // File exists, proceed with deletion
          fs.unlink(filePath, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  },
};
