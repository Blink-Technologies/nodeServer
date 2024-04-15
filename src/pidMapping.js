// pidMapping.js

// Define the mapping of strings to their corresponding values
const mapping = {
  505: { parameter: "rpm", function: processEngineSpeedStd },
  852: { parameter: "speed", function: processVehicleSpeedStd },
  1477: { parameter: "odometer", function: processOdometerStd },
  1408: {
    parameter: "engineTemperature",
    function: processEngineTemperatureStd,
  },
  61444: { parameter: "rpm", function: processEngineSpeed },
  65265: { parameter: "speed", function: processVehicleSpeed },
  65255: { parameter: "hoursOfOperation", function: processHoursOfOperation },
  65248: { parameter: "odometer", function: processOdometer },
  65262: { parameter: "engineTemperature", function: processEngineTemperature },
  65263: { parameter: "engineOilLevel", function: processEngineOilLevel },
  65271: { parameter: "batteryVoltage", function: processBatteryVoltage },
};

// Exporting the function pidMapping
module.exports = function pidMapping(pgn, data) {
  console.log(pgn);
  const mappingResult = mapping[pgn];
  console.log(mappingResult.parameter);

  // If found, process data accordingly and return the corresponding value
  if (mappingResult !== undefined) {
    const { parameter, function: processingFunction } = mappingResult;
    const value = processingFunction(data);
    return [parameter, value];
  } else {
    throw new Error("Invalid PGN");
  }
};

function processEngineSpeed(data) {
  const byte4 = parseInt(data.substring(6, 8), 16);
  console.log(data);
  console.log(data.substring(6, 8), 16);
  console.log(byte4);
  const byte5 = parseInt(data.substring(8, 10), 16);
  console.log(data.substring(8, 10), 16);
  console.log(byte5);
  const engineSpeed = (byte5 * 256 + byte4) * 0.125;
  return engineSpeed;
}

function processVehicleSpeed(data) {
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const vehicleSpeed = (byte3 * 256 + byte2) / 256;
  return vehicleSpeed;
}

function processHoursOfOperation(data) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const byte4 = parseInt(data.substring(6, 8), 16);
  const hoursOfOperation =
    (byte4 * 16777216 + byte3 * 65536 + byte2 * 256 + byte1) * 0.05;
  return hoursOfOperation;
}

function processOdometer(data) {
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);
  const odometer =
    (byte8 * 16777216 + byte7 * 65536 + byte6 * 256 + byte5) * 0.125;
  return odometer;
}

function processEngineTemperature(data) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const engineTemperature = byte1 - 40;
  return engineTemperature;
}

function processEngineOilLevel(data) {
  const byte3 = parseInt(data.substring(0, 2), 16);
  const engineOilLevel = byte3 * 0.4;
  return engineOilLevel;
}

function processBatteryVoltage(data) {
  const byte7 = parseInt(data.substring(0, 2), 16);
  const byte8 = parseInt(data.substring(2, 4), 16);
  const batteryVoltage = (byte8 * 256 + byte7) * 0.05;
  return batteryVoltage;
}

//**********************NISSAN AD********************/

function processEngineSpeedStd(data) {
  const byte3 = parseInt(data.substring(4, 6), 16);
  console.log(data);
  console.log(data.substring(6, 8), 16);
  console.log(byte3);
  const byte4 = parseInt(data.substring(6, 8), 16);
  console.log(data.substring(8, 10), 16);
  console.log(byte4);
  const engineSpeed = byte3 * 256 + byte4;
  return engineSpeed;
}

function processVehicleSpeedStd(data) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const vehicleSpeed = byte1 * 256 + byte2;
  return vehicleSpeed;
}

function processOdometerStd(data) {
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);
  const odometer =
    (byte8 * 16777216 + byte7 * 65536 + byte6 * 256 + byte5) * 0.125;
  return odometer;
}
function processEngineTemperatureStd(data) {
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);
  const odometer =
    (byte8 * 16777216 + byte7 * 65536 + byte6 * 256 + byte5) * 0.125;
  return odometer;
}
