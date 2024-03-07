// tcpServer.js
const net = require("net");
const config = require("./config");
const { makeHttpRequest } = require("./httpRequests");

let buffer = {};
let socketToImeiMap = {}; // Mapping socket objects to their corresponding IMEI numbers

function start() {
  const server = net.createServer((socket) => {
    socket.on("data", (data) => {
      processData(data, socket);
    });

    socket.on("end", () => {
      // Clean up when client disconnects
      console.log("socket closed:" + socket.remoteAddress);
      delete buffer[socket.remoteAddress];
      delete socketToImeiMap[socket.remoteAddress];
    });
  });

  server.listen(config.tcpPort, () => {
    console.log(`TCP server listening on port ${config.tcpPort}`);
  });
}

function processData(data, socket) {
  // Process received data and extract information
  // Add data to buffer
  if (!buffer[socket.remoteAddress]) {
    buffer[socket.remoteAddress] = [];
  }
  buffer[socket.remoteAddress].push(data.toString());

  // Check if buffer has complete messages
  const messages = buffer[socket.remoteAddress].join("").split("\r\n");
  let incompleteMessage = messages.pop(); // Keep incomplete message in buffer
  if (incompleteMessage && incompleteMessage.length > 256) {
    console.log(
      "Discarding incomplete message - exceeded 256 characters:",
      incompleteMessage
    );
    incompleteMessage = undefined; // Discard the message
  } else if (incompleteMessage && !incompleteMessage.match(/^#.{1,2}#/)) {
    console.log(
      "Discarding incomplete message - invalid format:",
      incompleteMessage
    );
    incompleteMessage = undefined; // Discard the message
  }
  buffer[socket.remoteAddress] = incompleteMessage ? [incompleteMessage] : [];

  // Process complete messages
  messages.forEach((message) => {
    console.log("Received message:", message);
    if (message.startsWith("#L#")) {
      console.log("Received IMEI message");
      const imei = processImeiMessage(message);
      if (imei) {
        socketToImeiMap[socket.remoteAddress] = imei; // Associate IMEI with the socket
      }
    } else if (message.startsWith("#SD#")) {
      console.log("Received location message");
      processLocationMessage(message, socket);
    } else {
      console.log("Unknown message format:", message);
    }
  });
}

function processImeiMessage(message) {
  const parts = message.split(";");
  const imei = parts[0].substring(3); // Extract IMEI number from the message
  console.log("IMEI:", imei);
  return imei;
}

function processLocationMessage(message, socket) {
  const parts = message.split(";");
  const lat1 = parseFloat(parts[2]);
  const lat2 = parts[3];
  const lon1 = parseFloat(parts[4]);
  const lon2 = parts[5];

  // Convert lat1 to degrees and minutes
  const latDegrees = Math.floor(lat1 / 100);
  const latMinutes = lat1 - latDegrees * 100;
  const latitude =
    lat2 === "N"
      ? latDegrees + latMinutes / 60
      : -(latDegrees + latMinutes / 60);

  // Convert lon1 to degrees and minutes
  const lonDegrees = Math.floor(lon1 / 100);
  const lonMinutes = lon1 - lonDegrees * 100;
  const longitude =
    lon2 === "W"
      ? lonDegrees + lonMinutes / 60
      : -(lonDegrees + lonMinutes / 60);

  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);

  // Here you can use socketToImeiMap[socket.remoteAddress] to get the associated IMEI
  const imei = socketToImeiMap[socket.remoteAddress];
  if (imei) {
    console.log("IMEI associated with this socket:", imei);

    // Example: Make HTTP request using makeHttpRequest function
    makeHttpRequest(imei, latitude, longitude)
      .then((response) => {
        console.log("HTTP request successful:", response);
        // Further processing if needed
      })
      .catch((error) => {
        console.error("HTTP request failed:", error);
        // Handle error if needed
      });
  } else {
    console.log("No IMEI associated with this socket");
  }
}

module.exports = { start };
