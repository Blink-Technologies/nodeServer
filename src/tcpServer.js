// tcpServer.js
const net = require("net");
const config = require("./config");
const {
  makeHttpRequest,
  makeKeyValueHttpRequest,
  makeLogHttpRequest,
} = require("./httpRequests");
const pidMapping = require("./pidMapping");

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

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      socket.destroy();
      delete buffer[socket.remoteAddress];
      delete socketToImeiMap[socket.remoteAddress];
    });
  });

  server.listen(config.tcpPort, () => {
    console.log(`TCP server listening on port ${config.tcpPort}`);
  });
}

async function processData(data, socket) {
  const textToAppend = "Received: " + data + " from: " + socket.remoteAddress;
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
  messages.forEach(async (message) => {
    console.log(
      "Received message:" + message + "  from: " + socket.remoteAddress
    );

    if (message.startsWith("#L#")) {
      console.log("Received IMEI message");
      const imei = processImeiMessage(message);
      if (imei) {
        socketToImeiMap[socket.remoteAddress] = imei; // Associate IMEI with the socket
        socket.write("#AL#1\r\n");
      } else {
        socket.write("#AL#0\r\n");
      }
    } else if (message.startsWith("#SD#")) {
      console.log("Received location message");
      processLocationMessage(message, socket);
    } else if (message.startsWith("#D#")) {
      console.log("Received can message");
      processCanMessage(message, socket);
    } else {
      console.log("Unknown message format:", message);
    }

    const imei = socketToImeiMap[socket.remoteAddress];
    await makeLogHttpRequest(imei, message);
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
    lon2 === "E"
      ? lonDegrees + lonMinutes / 60
      : -(lonDegrees + lonMinutes / 60);

  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);

  // Here you can use socketToImeiMap[socket.remoteAddress] to get the associated IMEI
  const imei = socketToImeiMap[socket.remoteAddress];
  if (imei) {
    console.log("IMEI associated with this socket:", imei);

    socket.write("#ASD#1\r\n");

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
    socket.write("#ASD#0\r\n");
  }
}

async function processCanMessage(message, socket) {
  const imei = socketToImeiMap[socket.remoteAddress];
  if (!imei) {
    console.log("no associated devices");
    socket.write("#AD#0\r\n");
    return;
  }

  // Define the regular expression pattern to match the expected format
  const regex =
    /^#D#([0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8});([0-9a-fA-F]{16}).*$/;

  // Execute the regular expression pattern on the message
  const match = message.match(regex);

  // Check if the message matches the expected format
  if (match) {
    // Extract the 4-character string and the second 16-character string
    const canID = match[1];

    let pgn;
    if (canID.length === 8) {
      // Remove the first 2 and last characters from canID and extract middle 4 characters
      const pgnString = canID.substring(2, 6);
      pgn = parseInt(pgnString, 16); // Convert hexadecimal string to integer
    } else if (canID.length === 6) {
      pgn = parseInt(canID, 16); // Directly convert the 4-character string to integer
    } else if (canID.length === 4) {
      pgn = parseInt(canID, 16); // Directly convert the 4-character string to integer
    } else {
      // Handle invalid length or other cases
      console.error("Invalid length of canID:", canID.length);
      return; // or throw an error, depending on your use case
    }

    const data = match[2];

    // Call your pidMapping function (assuming it's already defined)
    try {
      const keyValue = pidMapping(pgn, data);

      /*console.log("Parameter:", param);
      console.log("Value:", value);
      const keyValue = { [param]: value };*/

      // Making the HTTP request using the key-value pair
      await makeKeyValueHttpRequest(imei, keyValue);

      socket.write("#AD#1;\r\n");
    } catch (error) {
      console.error(error.message);
      socket.write("#AD#0\r\n");
    }
  } else {
    console.error("Error: Incorrect message format");
    socket.write("#AD#0\r\n");
  }
}

module.exports = { start };
