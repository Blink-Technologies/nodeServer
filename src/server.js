// server.js
const tcpServer = require("./tcpServer");
const httpRequests = require("./httpRequests");

tcpServer.start(); // Start TCP server
httpRequests.login(); // Attempt login to get token

// Handle reattempting login on 401 Unauthorized
httpRequests.setOnUnauthorizedCallback(() => {
  httpRequests.login();
});
