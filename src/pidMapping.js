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
  65276: { parameter: "fuelLevel", function: processFuelLevel },
  4804467: { parameter: "IOs", function: processInputsOutputs },
};

// Exporting the function pidMapping
module.exports = function pidMapping(pgn, data) {
  console.log(pgn);
  const mappingResult = mapping[pgn];
  console.log(mappingResult.parameter);

  // If found, process data accordingly and return the corresponding value
  if (mappingResult !== undefined) {
    const { parameter, function: processingFunction } = mappingResult;
    const dataObj = processingFunction(data, parameter);
    return dataObj;
  } else {
    throw new Error("Invalid PGN");
  }
};

function processEngineSpeed(data, parameter) {
  const byte4 = parseInt(data.substring(6, 8), 16);
  console.log(data);
  console.log(data.substring(6, 8), 16);
  console.log(byte4);
  const byte5 = parseInt(data.substring(8, 10), 16);
  console.log(data.substring(8, 10), 16);
  console.log(byte5);
  const engineSpeed = (byte5 * 256 + byte4) * 0.125;
  return { [parameter]: engineSpeed };
}

function processVehicleSpeed(data, parameter) {
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const vehicleSpeed = (byte3 * 256 + byte2) / 256;
  return { [parameter]: vehicleSpeed };
}

function processHoursOfOperation(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const byte4 = parseInt(data.substring(6, 8), 16);
  const hoursOfOperation =
    (byte4 * 16777216 + byte3 * 65536 + byte2 * 256 + byte1) * 0.05;
  return { [parameter]: hoursOfOperation };
}

function processOdometer(data, parameter) {
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);
  const odometer =
    (byte8 * 16777216 + byte7 * 65536 + byte6 * 256 + byte5) * 0.125;
  return { [parameter]: odometer };
}

function processEngineTemperature(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const engineTemperature = byte1 - 40;
  return { [parameter]: engineTemperature };
}

function processEngineOilLevel(data, parameter) {
  const byte3 = parseInt(data.substring(0, 2), 16);
  const engineOilLevel = byte3 * 0.4;
  return { [parameter]: engineOilLevel };
}

function processBatteryVoltage(data, parameter) {
  const byte7 = parseInt(data.substring(0, 2), 16);
  const byte8 = parseInt(data.substring(2, 4), 16);
  const batteryVoltage = (byte8 * 256 + byte7) * 0.05;
  return { [parameter]: batteryVoltage };
}
function processFuelLevel(data, parameter) {
  const byte2 = parseInt(data.substring(2, 4), 16);
  const fuelLevel = byte2 * 0.4;
  return { [parameter]: fuelLevel };
}

function processInputsOutputs(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const byte4 = parseInt(data.substring(6, 8), 16);
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);

  const digitalInputs = byte1
    .toString(2)
    .padStart(8, "0")
    .split("")
    .map((bit) => parseInt(bit));
  const digitalOutputs = byte2
    .toString(2)
    .padStart(8, "0")
    .split("")
    .map((bit) => parseInt(bit));
  const DI1 = digitalInputs[0];
  const DI2 = digitalInputs[1];
  const DO1 = digitalOutputs[0];
  const DO2 = digitalOutputs[1];
  const analogInput1 = (byte3 << 8) | byte4;
  const analogInput2 = (byte5 << 8) | byte6;
  const analogInput3 = (byte7 << 8) | byte8;
  console.log(analogInput1);
  console.log(analogInput2);

  return {
    DI1: DI1,
    DI2: DI2,
    DO1: DO1,
    DO2: DO2,
    AI1: analogInput1,
    AI2: analogInput2,
  };
}

//**********************NISSAN AD********************/

function processEngineSpeedStd(data, parameter) {
  const byte3 = parseInt(data.substring(4, 6), 16);
  console.log(data);
  console.log(data.substring(6, 8), 16);
  console.log(byte3);
  const byte4 = parseInt(data.substring(6, 8), 16);
  console.log(data.substring(8, 10), 16);
  console.log(byte4);
  const engineSpeed = ((byte3 * 256 + byte4) / 10).toFixed(1);

  return { [parameter]: engineSpeed };
}

function processVehicleSpeedStd(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const vehicleSpeed = ((byte1 * 256 + byte2) / 80).toFixed(1);
  return { [parameter]: vehicleSpeed };
}

function processOdometerStd(data, parameter) {
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const byte4 = parseInt(data.substring(6, 8), 16);
  const odometer = (byte2 * 65536 + byte3 * 256 + byte4).toFixed(1);
  return { [parameter]: odometer };
}
function processEngineTemperatureStd(data, parameter) {
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);
  const odometer =
    (byte8 * 16777216 + byte7 * 65536 + byte6 * 256 + byte5) * 0.125;
  return { [parameter]: odometer };
}
