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
  61441: {
    parameter: "asrEngineControlActive",
    function: processElectronicBrakeController1,
  },
  61443: {
    parameter: "acceleratorPedalPosition",
    function: processAcceleratorPedal,
  },
  61444: { parameter: "rpm", function: processEngineSpeed },
  65265: { parameter: "speed", function: processVehicleSpeed },
  65255: { parameter: "hoursOfOperation", function: processHoursOfOperation },
  65247: {
    parameter: "NominalFrictionTorquePercentage",
    function: processElectronicEngineController3,
  },
  65248: { parameter: "odometer", function: processOdometer },
  65262: { parameter: "engineTemperature", function: processEngineTemperature },
  65263: { parameter: "engineOilLevel", function: processEngineOilLevel },
  65264: {
    parameter: "powerTakeoffOilTemperature",
    function: processPowerTakeoffOilTemperature,
  },
  65269: {
    parameter: "BarometricPressure",
    function: processBarometricPressure,
  },
  65270: {
    parameter: "particulateTrapInletPressure",
    function: processParticulateTrapInletPressure,
  },
  65271: { parameter: "batteryVoltage", function: processBatteryVoltage },
  65276: { parameter: "fuelLevel", function: processFuelLevel },
  65170: {
    parameter: "InstantaneousBrakePower",
    function: processEngineInformation,
  },
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

const engineRetarderTorqueModes = {
  0: "Low idle governor/no request (default mode)",
  1: "Accelerator pedal/operator selection",
  2: "Cruise control",
  3: "PTO governor",
  4: "Road speed governor",
  5: "ASR control",
  6: "Transmission control",
  7: "ABS control",
  8: "Torque limiting",
  9: "High speed governor",
  10: "Braking system",
  11: "Remote accelerator",
  12: "not defined",
  13: "not defined",
  14: "Other",
  15: "Not available",
};

function processEngineSpeed(data, parameter) {
  const byte2 = parseInt(data.substring(2, 4), 16);
  const driverDemandTorque = byte2 - 125;

  const byte3 = parseInt(data.substring(4, 6), 16);
  const actualTorque = byte3 - 125;

  const byte4 = parseInt(data.substring(6, 8), 16);
  console.log(data);
  console.log(data.substring(6, 8), 16);
  console.log(byte4);

  const byte5 = parseInt(data.substring(8, 10), 16);
  console.log(data.substring(8, 10), 16);
  console.log(byte5);

  const engineSpeed = (byte5 * 256 + byte4) * 0.125;

  // Extracting the first 4 bits and converting to a decimal number
  const firstByte = parseInt(data.substring(0, 2), 16);
  const first4Bits = firstByte >> 4; // Right shift to get the first 4 bits
  const modeString = engineRetarderTorqueModes[first4Bits];

  const byte8 = parseInt(data.substring(14, 16), 16);
  const engineDemandTorque = byte2 - 125;

  return {
    [parameter]: engineSpeed,
    torqueMode: modeString,
    driverDemandTorquePercentage: driverDemandTorque,
    actualToquePercentage: actualTorque,
    engineDemandTorquePercentage: engineDemandTorque,
  };
}

const acceleratorPedalLowIdleSwitchMapping = {
  0: "Accelerator pedal 1 not in low idle condition",
  1: "Accelerator pedal 1 in low idle condition",
  2: "Error",
  3: "Not available",
};

const acceleratorPedalKickdownSwitchMapping = {
  0: "Kickdown passive",
  1: "Kickdown active",
};

const roadSpeedLimitStatusMapping = {
  0: "Active",
  1: "Passive",
};

function processAcceleratorPedal(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16).toString(2).padStart(8, "0");
  const firstTwoBits = byte1.substring(0, 2);
  const secondTwoBits = byte1.substring(2, 4);
  const thirdTwoBits = byte1.substring(4, 6);

  const accPedalLowIdleSwitch =
    acceleratorPedalLowIdleSwitchMapping[parseInt(firstTwoBits, 2)];
  const accPedalKickDownSwitch =
    acceleratorPedalKickdownSwitchMapping[parseInt(secondTwoBits, 2)];
  const roadSpeedLimitStatus =
    roadSpeedLimitStatusMapping[parseInt(thirdTwoBits, 2)];
  const accPedalPos1 = parseInt(data.substring(2, 4), 16) / 255;
  const loadPercentCurrentSpeed = parseInt(data.substring(4, 6), 16);
  const remoteAccPedalPos = parseInt(data.substring(6, 8), 16) / 255;
  return {
    [parameter]: accPedalPos1,
    acceleratorPedalLowIdleSwitch: accPedalLowIdleSwitch,
    acceleratorPedalKickdownSwitch: accPedalKickDownSwitch,
    percentLoatAtCurrentSpeed: loadPercentCurrentSpeed,
    remoteAcceleratorPedalPosition: remoteAccPedalPos,
    roadSpeedLimitStatus: roadSpeedLimitStatus,
  };
}

const twoSpeedAxleSwitchMapping = {
  0: "Low Speed Range",
  1: "High Speed Range",
};

const parkingBrakeSwitchMapping = {
  0: "Not set",
  1: "Set",
};

const cruiseCtrlPauseSwitchMapping = {
  0: "Off",
  1: "On",
  1: "Error",
  1: "Take No Action",
};

const cruiseControlActiveMapping = {
  0: "Off",
  1: "On",
};

const cruiseControlEnableSwitchMapping = {
  0: "Disabled",
  1: "Enabled",
};

const brakeSwitchMapping = {
  0: "Pedal Released",
  1: "Pedal Depressed",
  2: "Error",
  3: "Not Available",
};

const clutchSwitchMapping = {
  0: "Pedal Released",
  1: "Pedal Depressed",
};

const cruiseControlSetSwitchMapping = {
  0: "Activator Not in Set Position",
  1: "Activator In Set Position",
};

const cruiseControlCoastSwitchMapping = {
  0: "Activator Not in Coast Position",
  1: "Activator In Coast Position",
};

const cruiseControlResumeSwitchMapping = {
  0: "Activator Not in Resume Position",
  1: "Activator In Resume Position",
};

const cruiseControlAccelerateSwitchMapping = {
  0: "Activator Not in Accelerate Position",
  1: "Activator In Accelerate Position",
};

const ptoStatesMapping = {
  0: "Off/Disabled",
  1: "Hold",
  2: "Remote Hold",
  3: "Standby",
  4: "Remote Standby",
  5: "Set",
  6: "Decelerate/Coast",
  7: "Resume",
  8: "Accelerate",
  9: "Accelerator Override",
  10: "Preprogrammed set speed 1",
  11: "Preprogrammed set speed 2",
  12: "Preprogrammed set speed 3",
  13: "Preprogrammed set speed 4",
  14: "Preprogrammed set speed 5",
  15: "Preprogrammed set speed 6",
  16: "Preprogrammed set speed 7",
  17: "Preprogrammed set speed 8",
  18: "Not defined",
  19: "Not defined",
  20: "Not defined",
  21: "Not defined",
  22: "Not defined",
  23: "Not defined",
  24: "Not defined",
  25: "Not defined",
  26: "Not defined",
  27: "Not defined",
  28: "Not defined",
  29: "Not defined",
  30: "Not defined",
  31: "Not Available",
};

const cruiseCtrlStatesMapping = {
  0: "Off",
  1: "Hold",
  2: "Acceletate",
  3: "Decelerate",
  4: "Resume",
  5: "Set",
  6: "Accelerator Override",
  7: "Not Available",
};

const engineTest_IdleSwitchMapping = {
  0: "Off",
  1: "On",
};

const extract2Bits = (byte, bitPosition) => (byte >> (bitPosition - 1)) & 0b11;

function processVehicleSpeed(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16).toString(2).padStart(8, "0");
  const twoSpeedAxleSwitch =
    twoSpeedAxleSwitchMapping[parseInt(byte1.substring(0, 2), 2)];
  const parkingBrakeSwitch =
    parkingBrakeSwitchMapping[parseInt(byte1.substring(2, 4), 2)];
  const cruiseControlPauseSwitch =
    cruiseCtrlPauseSwitchMapping[parseInt(byte1.substring(4, 6), 2)];

  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const vehicleSpeed = (byte3 * 256 + byte2) / 256;

  const byte4 = parseInt(data.substring(6, 8), 16).toString(2).padStart(8, "0");
  const cruiseControlActive =
    cruiseControlActiveMapping[parseInt(byte4.substring(0, 2), 2)];
  const cruiseControlEnableSwitch =
    cruiseControlEnableSwitchMapping[parseInt(byte4.substring(2, 4), 2)];
  const brakeSwitch = brakeSwitchMapping[parseInt(byte4.substring(4, 6), 2)];
  const clutchSwitch = clutchSwitchMapping[parseInt(byte4.substring(6, 8), 2)];

  const byte5 = parseInt(data, 16).toString(2).padStart(8, "0");
  const cruiseControlSetSwitch =
    cruiseControlSetSwitchMapping[parseInt(byte5.substring(0, 2), 2)];
  const cruiseControlCoastSwitch =
    cruiseControlCoastSwitchMapping[parseInt(byte5.substring(2, 4), 2)];
  const cruiseControlResumeSwitch =
    cruiseControlResumeSwitchMapping[parseInt(byte5.substring(4, 6), 2)];
  const cruiseControlAccelerateSwitch =
    cruiseControlAccelerateSwitchMapping[parseInt(byte5.substring(6, 8), 2)];

  const cruiseCtrlSetSpeed = parseInt(data.substring(10, 12), 16);

  const byte7 = parseInt(data.substring(12, 14), 16)
    .toString(2)
    .padStart(8, "0");

  const PTO_State = ptoStatesMapping[parseInt(byte7.substring(0, 5), 2)];

  const cruiseCtrlState =
    cruiseCtrlStatesMapping[parseInt(byte7.substring(5, 8), 2)];

  const byte8 = parseInt(data.substring(14, 16), 16)
    .toString(2)
    .padStart(8, "0");
  const idleIncrementSwitch =
    engineTest_IdleSwitchMapping[parseInt(byte8.substring(0, 2), 2)];
  const idleDecrementSwitch =
    engineTest_IdleSwitchMapping[parseInt(byte8.substring(2, 4), 2)];
  const engineTestModeSwitch =
    engineTest_IdleSwitchMapping[parseInt(byte8.substring(4, 6), 2)];
  const engineShutdownOverrideSwitch =
    engineTest_IdleSwitchMapping[parseInt(byte8.substring(6, 8), 2)];

  return {
    [parameter]: vehicleSpeed,
    twoSpeedAxleSwitch: twoSpeedAxleSwitch,
    parkingBrakeSwitch: parkingBrakeSwitch,
    cruiseControlPauseSwitch: cruiseControlPauseSwitch,
    cruiseControlActive: cruiseControlActive,
    cruiseControlEnableSwitch: cruiseControlEnableSwitch,
    brakeSwitch: brakeSwitch,
    clutchSwitch: clutchSwitch,
    cruiseControlSetSwitch: cruiseControlSetSwitch,
    cruiseControlCoastSwitch: cruiseControlCoastSwitch,
    cruiseControlResumeSwitch: cruiseControlResumeSwitch,
    cruiseControlAccelerateSwitch: cruiseControlAccelerateSwitch,
    cruiseControlSetSpeed: cruiseCtrlSetSpeed,
    ptoState: PTO_State,
    cruiseControlStates: cruiseCtrlState,
    idleIncrementSwitch: idleIncrementSwitch,
    idleDecrementSwitch: idleDecrementSwitch,
    engineTestModeSwitch: engineTestModeSwitch,
    engineShutdownOverrideSwitch: engineShutdownOverrideSwitch,
  };
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
function processEngineInformation(data, parameter) {
  const preFilterOilPres = parseInt(data.substring(2, 4), 16) * 4;
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(2, 4), 16);
  const exhaustGasPres = (byte2 * 256 + byte3) / 128 - 250;
  const byte4 = parseInt(data.substring(2, 4), 16);
  const fuelRackPos = byte4 * 0.4;
  const byte5 = parseInt(data.substring(2, 4), 16);
  const byte6 = parseInt(data.substring(2, 4), 16);
  const massFlowEngine = (byte5 * 256 + byte6) * 0.05;
  const byte7 = parseInt(data.substring(2, 4), 16);
  const byte8 = parseInt(data.substring(2, 4), 16);
  const estimatedBrakePower = (byte7 * 256 + byte8) * 0.5;
  return {
    [parameter]: estimatedBrakePower,
    preFilterOilPressure: preFilterOilPres,
    exhaustGasPressure: exhaustGasPres,
    fuelRackPosition: fuelRackPos,
    massFlowToEngine: massFlowEngine,
  };
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
    AI3: analogInput3,
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

function processParticulateTrapInletPressure(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const byte4 = parseInt(data.substring(6, 8), 16);
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);
  const particulateTrapInletPressure = byte1 * 0.5;
  const boostPressure = byte2 * 2;
  const intakeManifoldTemperature = byte3 - 40;
  const airInletPressure = byte4 * 2;
  const airFilter1DiffPressure = byte5 * 2;
  const coolantFilter1DiffPressure = byte8 * 0.5;
  const exhaustGasTemperature = (byte7 * 256 + byte6) * 0.03125 - 273;
  return {
    [parameter]: particulateTrapInletPressure,
    boostPressure,
    intakeManifoldTemperature,
    airInletPressure,
    airFilter1DiffPressure,
    coolantFilter1DiffPressure,
    exhaustGasTemperature,
  };
}

function processElectronicEngineController3(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const byte4 = parseInt(data.substring(6, 8), 16);

  const NominalFrictionTorquePercentage = byte1 - 125;
  const engineDesiredOperatingSpeed = (byte3 * 256 + byte2) * 0.125;
  const engineDesiredOperatingSpeedAssymetryAdjustment = byte4;

  return {
    [parameter]: NominalFrictionTorquePercentage,
    engineDesiredOperatingSpeed,
    engineDesiredOperatingSpeedAssymetryAdjustment,
  };
}

const processElectronicBrakeController1 = (data, parameter) => {
  const bytes = [];
  for (let i = 0; i < data.length; i += 2) {
    bytes.push(parseInt(data.substring(i, i + 2), 16));
  }

  return {
    // Byte 1
    [parameter]: extract2Bits(bytes[0], 1), // SPN 561 (bits 1–2)
    asrBrakeControlActive: extract2Bits(bytes[0], 3), // SPN 562 (bits 3–4)
    absActive: extract2Bits(bytes[0], 5), // SPN 563 (bits 5–6)
    ebsBrakeSwitch: extract2Bits(bytes[0], 7), // SPN 1121 (bits 7–8)

    // Byte 2
    brakePedalPosition: bytes[1] * 0.4, // SPN 521 (0–100%)

    // Byte 3
    absOffRoadSwitch: extract2Bits(bytes[2], 1), // SPN 575 (bits 1–2)
    asrOffRoadSwitch: extract2Bits(bytes[2], 3), // SPN 576 (bits 3–4)
    asrHillHolderSwitch: extract2Bits(bytes[2], 5), // SPN 577 (bits 5–6)
    tractionControlOverrideSwitch: extract2Bits(bytes[2], 7), // SPN 1238 (bits 7–8)

    // Byte 4
    acceleratorInterlockSwitch: extract2Bits(bytes[3], 1), // SPN 972
    engineDerateSwitch: extract2Bits(bytes[3], 3), // SPN 971
    auxEngineShutdownSwitch: extract2Bits(bytes[3], 5), // SPN 970
    remoteAcceleratorEnableSwitch: extract2Bits(bytes[3], 7), // SPN 969

    // Byte 5
    engineRetarderSelection: bytes[4] * 0.4, // SPN 973 (raw value)

    // Byte 6
    absFullyOperational: extract2Bits(bytes[5], 1), // SPN 1243
    ebsRedWarningSignal: extract2Bits(bytes[5], 3), // SPN 1439
    absEbsAmberWarningSignal: extract2Bits(bytes[5], 5), // SPN 1438
    atcAsrInformationSignal: extract2Bits(bytes[5], 7), // SPN 1793

    // Byte 7
    sourceAddressOfBrakeControl: bytes[6], // SPN 1481

    // Byte 8
    trailerAbsStatus: extract2Bits(bytes[7], 5), // SPN 1836 (bits 5–6)
    trailerAbsWarning: extract2Bits(bytes[7], 7), // SPN 1792 (bits 7–8)
  };
};

function processPowerTakeoffOilTemperature(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const byte4 = parseInt(data.substring(6, 8), 16);
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);

  const powerTakeoffOilTemperature = byte1 - 40;
  const powerTakeoffSpeed = (byte3 * 256 + byte2) * 0.125;
  const powerTakeoffSetSpeed = (byte5 * 256 + byte4) * 0.125;

  const PtoEnableSwitch = extract2Bits(byte6, 1);
  const remotePtoPreprogrammedSpeedControlSwitch = extract2Bits(byte6, 3);
  const remotePtoVariableSpeedControlSwitch = extract2Bits(byte6, 5);

  const ptoSetSwitch = extract2Bits(byte7, 1);
  const ptoCoastSwitch = extract2Bits(byte7, 3);
  const ptoResumeSwitch = extract2Bits(byte7, 5);
  const ptoAccelerateSwitch = extract2Bits(byte7, 7);

  return {
    [parameter]: powerTakeoffOilTemperature,
    powerTakeoffSpeed,
    powerTakeoffSetSpeed,
    PtoEnableSwitch,
    remotePtoPreprogrammedSpeedControlSwitch,
    remotePtoVariableSpeedControlSwitch,
    ptoSetSwitch,
    ptoCoastSwitch,
    ptoResumeSwitch,
    ptoAccelerateSwitch,
  };
}

function processBarometricPressure(data, parameter) {
  const byte1 = parseInt(data.substring(0, 2), 16);
  const byte2 = parseInt(data.substring(2, 4), 16);
  const byte3 = parseInt(data.substring(4, 6), 16);
  const byte4 = parseInt(data.substring(6, 8), 16);
  const byte5 = parseInt(data.substring(8, 10), 16);
  const byte6 = parseInt(data.substring(10, 12), 16);
  const byte7 = parseInt(data.substring(12, 14), 16);
  const byte8 = parseInt(data.substring(14, 16), 16);

  const barometricPressure = byte1 * 0.5;
  const cabInteriorTemperature = (byte3 * 256 + byte2) * 0.3125 - 273;
  const ambientAirTemperature = (byte5 * 256 + byte4) * 0.3125 - 273;
  const airInletTemperature = byte6 - 40;
  const roadSurfaceTemperature = (byte8 * 256 + byte7) * 0.3125 - 273;
  return {
    [parameter]: barometricPressure,
    cabInteriorTemperature,
    ambientAirTemperature,
    airInletTemperature,
    roadSurfaceTemperature,
  };
}
