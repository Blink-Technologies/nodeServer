// pidMapping.js

// Define the mapping of strings to their corresponding values
const mapping = {
  "01f9": "rpm",
  "0354": "speed",
  "05c5": "odometer",
  "0580": "engineTemperature",
};

// Exporting the function pidMapping
module.exports = function pidMapping(pid, data) {
  // Convert input to lowercase for case insensitivity
  pid = pid.toLowerCase();

  // Check if the input is 4 characters long
  if (pid.length !== 4) {
    throw new Error("Input string must be 4 characters long");
  }

  // Lookup the pid in the mapping
  const result = mapping[pid];

  // If found, process data accordingly and return the corresponding value
  if (result !== undefined) {
    let value;
    switch (pid) {
      case "01f9":
        value = parseInt(data.substring(4, 8), 16);
        break;
      case "0354":
        value = parseInt(data.substring(0, 4), 16);
        break;
      case "05c5":
        value = parseInt(data.substring(2, 8), 16);
        break;
      case "0580":
        value = parseInt(data.substring(0, 2), 16) - 40;
        break;
      default:
        throw new Error("Invalid PID");
    }
    return [result, value];
  } else {
    throw new Error("Invalid PID");
  }
};
