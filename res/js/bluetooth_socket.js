let SPPsocket = null;
let writeQueue = Promise.resolve();



let modelSpecs = {};
let modelBase = "";

let firmwareVersion = "";
let firmwareConfig = {};

let operationID = 0;
let operationList = {};

let debug = new URLSearchParams(window.location.search).get("debug");
if (!debug) {
    console.log = function () { };
}



async function sendString(command, payload = "", operation = "") {
    // payload will be a string representing a hex string
    let payloadBytes = [];
    if (payload !== "") {
        payloadBytes = payload.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    }
    await send(command, payloadBytes, operation);
}

async function send(command, payload = [], operation = "") {
    let header = [0x55, 0x60, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00];
    operationID++;
    header[7] = operationID;
    let commandBytes = new Uint8Array(new Uint16Array([command]).buffer);
    header[3] = commandBytes[0];
    header[4] = commandBytes[1];
    let payloadLength = payload.length;
    header[5] = payloadLength;
    header.push(...payload);
    let byteArray = new Uint8Array(header);
    let crc = crc16(byteArray);
    byteArray = [...byteArray, crc & 0xFF, crc >> 8];
    if (operation !== "") {
        operationList[operationID] = operation;
    }
    console.log("sending " + byteArray.map(byte => byte.toString(16).padStart(2, '0')).join(''));
    writeQueue = writeQueue.then(async () => {
        let writer = null;
        try {
            writer = await SPPsocket.writable.getWriter();
            console.log("Writing to SPPsocket: " + byteArray.map(byte => byte.toString(16).padStart(2, '0')).join(''));
            await writer.write(new Uint8Array(byteArray));
        } catch (error) {
            console.error('Write failed:', error);
        } finally {
            if (writer) {
                await writer.close();
            }
        }
    });
}

function crc16(buffer) {
    let crc = 0xFFFF;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? ((crc >> 1) ^ 0xA001) : (crc >> 1);
        }
    }
    return crc;
}

async function initDevice() {
    sendBattery();
    await new Promise(resolve => setTimeout(resolve, 100));
    getEQ();
    await new Promise(resolve => setTimeout(resolve, 100));
    getListeningMode();
    await new Promise(resolve => setTimeout(resolve, 100));
    getFirmware();
    await new Promise(resolve => setTimeout(resolve, 100));
    sendUTCtime();
    await new Promise(resolve => setTimeout(resolve, 100));
    sendInEarRead();
    await new Promise(resolve => setTimeout(resolve, 100));
    sendLatencyModeRead();
    await new Promise(resolve => setTimeout(resolve, 100));
    getPersonalizedANCStatus();
    await new Promise(resolve => setTimeout(resolve, 100));
    sendGetGesture();
    await new Promise(resolve => setTimeout(resolve, 100));
    sendANCread();
    await new Promise(resolve => setTimeout(resolve, 100));
    getAdvancedEQ();
    await new Promise(resolve => setTimeout(resolve, 100));
    get_enhanced_bass();
    await new Promise(resolve => setTimeout(resolve, 100));
}


function setModelBase() {
    modelSpecs = localStorage.getItem("model");
    //modelBase is a json string, so we need to parse it
    modelBase = JSON.parse(modelSpecs);
    modelBase = modelBase.base;
}

async function connectSPP(sppPort=null) {
    const SPP_UUID = "aeac4a03-dff5-498f-843a-34487cf133eb";
    const FASTPAIR_UUID = "df21fe2c-2515-4fdb-8886-f12c4d67927c";
    if (sppPort === null) {
        sppPort = await navigator.serial.requestPort({
            allowedBluetoothServiceClassIds: [SPP_UUID],
            filters: [{ bluetoothServiceClassId: SPP_UUID }],
        });
    }
    if (sppPort) {
        console.log('connected to a Bluetooth Serial Port Profile port', sppPort.getInfo());

        await sppPort.open({ baudRate: 9600, bufferSize: 2048 });
        //on disconnect serial
        setModelBase();
        SPPsocket = sppPort;
        //read from the serial port
        const reader = sppPort.readable.getReader();
        initDevice();
        while (sppPort.readable) {
            const { value, done } = await reader.read();
            //console.log(value);
            //print hex string of the received data
            var string = "";
            for (let i = 0; i < value.length; i++) {
                //fill the string with leading zero if needed
                string += (value[i] < 16 ? "0" : "") + value[i].toString(16);
            }
            let rawData = new Uint8Array(value.buffer);
            //check if first byte is 0x55, else continue
            if (rawData[0] !== 85 || rawData.length < 8) {
                continue;
            }
            //header is 8 bytes long
            let header = rawData.slice(0, 6);
            let command = getCommand(header);
            console.log(command);
            if (command === 57345 || command===16391) {
                readBattery(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 57347) {
                readANC(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16452) {
                readCustomEQ(rawData);
            }
            if (command === 16415 || command === 16464) {
                readEQ(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16450) {
                readFirmware(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 57357) {
                readEarFitTestResult(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16416) {
                readPersonalizedANC(rawData);
            }
            if (command === 16398) {
                readInEar(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16449) {
                readLatency(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16407) {
                readLEDCaseColor(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16408) {
                readGesture(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16414) {
                readANC(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16460) {
                read_advanced_eq_status( rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }
            if (command === 16462) {
                read_enhanced_bass(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
            }

            if (operationID >= 250) {
                operationID = 1;
                operationList = {};
            }
            console.log(string);
            if (done) {
                // Allow the serial port to be closed later.
                reader.releaseLock();
                break;
            }
            console.log(value);

        }
    }
}

function sendBattery() {
    send(49159, [], "readBattery");
}
function readBattery(hexString) {
    let connectedDevices = 0;
    let batteryStatus = { "left": "DISCONNECTED", "right": "DISCONNECTED", "case": "DISCONNECTED", "stereo": "DISCONNECTED" };
    let deviceIdToKey = { 0x02: "left", 0x03: "right", 0x04: "case", 0x06: "stereo" };
    let BATTERY_MASK = 127;
    let RECHARGING_MASK = 128;

    let hexArray = hexString.match(/.{2}/g).map(byte => parseInt(byte, 16));

    connectedDevices = hexArray[8];
    for (let i = 0; i < connectedDevices; i++) {
        let deviceId = hexArray[9 + (i * 2)];
        let key = deviceIdToKey[deviceId] || "DISCONNECTED";
        let batteryLevel = hexArray[10 + (i * 2)] & BATTERY_MASK;
        let isCharging = (hexArray[10 + (i * 2)] & RECHARGING_MASK) === RECHARGING_MASK;
        batteryStatus[key] = {
            "batteryLevel": batteryLevel,
            "isCharging": isCharging
        };
    }

    let batteryLeft = batteryStatus["left"]["batteryLevel"];
    let batteryRight = batteryStatus["right"]["batteryLevel"];
    let batteryCase = batteryStatus["case"]["batteryLevel"];
    let batteryStereo = batteryStatus["stereo"]["batteryLevel"];
    console.log(batteryLeft);
    if (batteryStatus["stereo"] !== "DISCONNECTED") {
        setBattery("s", batteryStereo)
    }
    else {
        setBattery("l", batteryLeft)
        setBattery("r", batteryRight)
        setBattery("c", batteryCase)
    }
}
function getCommand(header) {
    console.log("header " + header)
    let commandBytes = new Uint8Array(header.slice(3, 5));
    console.log( "commandBytes: " + commandBytes)
    let commandInt = new Uint16Array(commandBytes.buffer)[0];
    console.log ("commandInt: " + commandInt);
    return commandInt;
}

function readANC(hexString) {
    console.log("readANC called");
    let hexArray = hexString.match(/.{2}/g).map(byte => parseInt(byte, 16));
    let ancStatus = hexArray[9];
    let level = 0;

    if (ancStatus === 5) {
        level = 1;
    } else if (ancStatus === 7) {
        level = 2;
    } else if (ancStatus === 3) {
        level = 3;
    } else if (ancStatus === 1) {
        level = 4;
    } else if (ancStatus === 2) {
        level = 5;
    } else if (ancStatus === 4) {
        level = 6;
    }
    console.log("level " + level);
    setANCStatus(level);
}

function setANCDisplay(level) {
    if (level === 1) {
        setANCStatus(1);
    } else if (level === 2) {
        setANCStatus(2);
    } else if (level === 3) {
        setANCStatus(3);
    } else if (level === 4) {
        setANCStatus(4);
    } else if (level === 5) {
        setANCStatus(5);
    } else if (level === 6) {
        setANCStatus(6);
    }
}

function sendANCread() {
    var isAnc = firmwareVersion.split(".");
    if (modelBase === "B157" && isAnc[2] !== "2")
        return;
    send(49182, [], "readANC");
}

function setANC_BT(level) {
    let byteArray = [0x01, 0x01, 0x00];
    if (level === 1) {
        byteArray[1] = 0x05;
    } else if (level === 2) {
        byteArray[1] = 0x07;
    } else if (level === 3) {
        byteArray[1] = 0x03;
    } else if (level === 4) {
        byteArray[1] = 0x01;
    } else if (level === 5) {
        byteArray[1] = 0x02;
    } else if (level === 6) {
        byteArray[1] = 0x04;
    }
    console.log(byteArray);
    send(61455, byteArray, "setANC");
}

function read_advanced_eq_status(hexString)
{
    console.log("read_advanced_eq_status called");
    let hexArray = hexString.match(/.{2}/g).map(byte => parseInt(byte, 16));
    let advancedStatus = hexArray[8];
    console.log("advancedEQ " + advancedStatus);
    if (modelBase === "B157" || modelBase === "B155" || modelBase === "B171" || modelBase === "B174" || modelBase === "B170") { 
        if (advancedStatus === 1) {
            setEQfromRead(6);
        }
    }
}

function getEQ() {
    if (modelBase !== "B172" && modelBase !== "B168" && modelBase !== "B179" && modelBase !== "B184" && modelBase !== "B185") {
        send(49183, [], "readEQ");
    }
}

function getListeningMode() {
    if (modelBase === "B172" || modelBase === "B168" || modelBase === "B179" || modelBase === "B184" || modelBase === "B185") {
        send(49232, [], "readListeningMode");
    }
}

function readEQ(hexString) {
    console.log("readEQ called");
    let hexArray = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    let eqMode = hexArray[8];
    console.log("eqMode " + eqMode);
    setEQfromRead(eqMode);
}

function setEQ(level) {
    let byteArray = [0x00, 0x00];
    byteArray[0] = level;
    send(61456, byteArray, "setEQ");
}

function setListeningMode(level) {
    if (modelBase !== "B172" && modelBase !== "B168" && modelBase !== "B179" && modelBase !== "B184" && modelBase !== "B185") {
        return;
    }
    let byteArray = [0x00, 0x00];
    byteArray[0] = level;
    send(61469, byteArray, "setListeningMode");
}

function set_enhanced_bass(enabled, level) {
    if (modelBase === "B171" || modelBase === "B172" || modelBase === "B168" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B170" || modelBase === "B164") {
        level *= 2;
        let byteArray = [0x00, 0x00];
        if (enabled) {
            byteArray[0] = 0x01;
        }
        byteArray[1] = level;
        send(61521, byteArray);
    }
}

function get_enhanced_bass() {
    if (modelBase === "B171" || modelBase === "B172" || modelBase === "B168" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B170" || modelBase === "B185" || modelBase === "B164") {
        send(49230, [], "readEnhancedBass");
    }
}

function read_enhanced_bass(hexString) {
    if (modelBase === "B171" || modelBase === "B172" || modelBase === "B168" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B170" || modelBase === "B185" || modelBase === "B164") {
        let hexArray = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
        let enabled = hexArray[8];
        let level = hexArray[9];
        setBassEnhance(enabled);
        setBassLevel(level / 2);
    }
}

function getAdvancedEQ()
{
    send(49228, [], "readAdvancedEQ");
}

function setAdvancedEQenabled(enabled) {
    let byteArray = [0x00, 0x00];
    if (enabled) {
        byteArray[0] = 0x01;
    }
    send(61519, byteArray);
}

function formatFloatForEQ(f, total) {
    var array = new ArrayBuffer(4);
    var view = new DataView(array);
    view.setFloat32(0, f, false);
    array = new Uint8Array(array);
    if (f !== 0.0 && array[0] === 0 && array[1] === 0 && array[2] === 0) {
        array[3] = (array[3] | 0x80) & 0xff;
    }
    for (var i = 0; i < array.length / 2; i++) {
        var j = array.length - i - 1;
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    if (total) {
        if (f >= 0) {
            array = new Uint8Array([0x00, 0x00, 0x00, 0x80]);
        }
    }
    return array;
}

function floatToReversedBytes(value) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, value, false); // big-endian
    
    // Reverse the byte order
    const bytes = new Uint8Array(buffer);
    return new Uint8Array([bytes[3], bytes[2], bytes[1], bytes[0]]);
}

function createEQPacket(eqBands) {
    if (!eqBands || eqBands.length === 0) {
        throw new Error("At least one EQ band is required");
    }
    
    if (eqBands.length > 255) {
        throw new Error("Too many EQ bands (max 255)");
    }

    let maxGain = 0.0;
    for (const band of eqBands) {
        if (band.gain > maxGain) {
            maxGain = band.gain;
        }
    }

    const totalGain = -maxGain;
    
    const packetSize = 1 + 4 + (eqBands.length * 16);
    const packet = new Uint8Array(packetSize);
    let offset = 0;
    
    packet[offset++] = eqBands.length;
    
    packet.set(floatToReversedBytes(totalGain), offset);
    offset += 4;
    
    for (const band of eqBands) {
        // Filter type (1 byte)
        packet[offset++] = band.filterType;
        
        packet.set(floatToReversedBytes(band.gain), offset);
        offset += 4;
        
        packet.set(floatToReversedBytes(band.frequency), offset);
        offset += 4;
        
        packet.set(floatToReversedBytes(band.quality), offset);
        offset += 4;
    }

    for (let i = 0; i < eqBands.length; i++) {
        packet[offset++] = 0x00; 
        packet[offset++] = 0x00;
        packet[offset++] = 0x00;
    }
    //print all details of the band
    console.log("EQ Packet Details:");
    console.log("Number of Bands: " + eqBands.length);
    console.log("Total Gain: " + totalGain);
    for (let i = 0; i < eqBands.length; i++) {
        console.log(`Band ${i + 1}:`);
        console.log("  Filter Type: " + eqBands[i].filterType);
        console.log("  Gain: " + eqBands[i].gain);
        console.log("  Frequency: " + eqBands[i].frequency);
        console.log("  Quality: " + eqBands[i].quality);
    }


    console.log("EQ Packet: " + Array.from(packet, byte => byte.toString(16).padStart(2, '0')).join(''));
    return packet;
}

function setCustomEQ_BT(level) {
    if (modelBase !== "B181" && modelSpecs.customEQ) {
        let customEQ = modelSpecs.customEQ;

        const LOW_SHELF = 0;
        const PEAK = 1;
        const HIGH_SHELF = 2;
    
        const eqBands = [
            {filterType: PEAK, gain: level[0], frequency: customEQ.freqPeak, quality: customEQ.qPeak},
            {filterType: HIGH_SHELF, gain: level[1], frequency: customEQ.freqHigh, quality: customEQ.qHigh},
            {filterType: LOW_SHELF, gain: level[2], frequency: customEQ.freqLow, quality: customEQ.qLow}
        ];
        const byteArray = createEQPacket(eqBands);
        send(61505, byteArray, "setCustomEQ");
    }
}

function getCustomEQ() {
    if (modelBase !== "B181") {
        send(49220, [], "readCustomEQ");
    }
}

function fromFormatFloatForEQ(array) {
    for (let i = 0; i < Math.floor(array.length / 2); i++) {
        let j = array.length - i - 1;
        [array[i], array[j]] = [array[j], array[i]];
    }
    if (array[0] === 0 && array[1] === 0 && array[2] === 0 && (array[3] & 0x80)) {
        array[3] = array[3] & 0x7f;
        let buffer = new ArrayBuffer(array.length);
        let view = new Uint8Array(buffer);
        for (let i = 0; i < array.length; i++) {
            view[i] = array[i];
        }
        let f = new DataView(buffer).getFloat32(0, false);
        return -f;
    } else {
        let buffer = new ArrayBuffer(array.length);
        let view = new Uint8Array(buffer);
        for (let i = 0; i < array.length; i++) {
            view[i] = array[i];
        }
        let f = new DataView(buffer).getFloat32(0, false);
        return f;
    }
}

function readLEDCaseColor(hexString) {
    if (modelBase === "B181") {
        console.log("readLEDCaseColor called");
        const hexArray = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const numberOfLed = hexArray[8];
        console.log(hexArray.map(byte => byte.toString(16).padStart(2, '0')).join(''));
        const ledArray = [];
        for (let i = 0; i < numberOfLed; i++) {
            ledArray.push([
                hexArray[10 + (i * 4)],
                hexArray[11 + (i * 4)],
                hexArray[12 + (i * 4)]
            ]);
        }
        const ledArrayString = ledArray.map(led => `#${led.map(value => value.toString(16).padStart(2, '0')).join('')}`);
        getCaseColor([ledArrayString[2], ledArrayString[1], ledArrayString[0], ledArrayString[3], ledArrayString[4]]);
    }
}

function sendLEDCaseColor(colorArray) {
    console.log("sendLEDCaseColor called");
    console.log(colorArray);
    if (modelBase === "B181") {
        let bytearray = [0x05, 0x01, 0xff, 0xff, 0xff, 0x02, 0xff, 0xff, 0xff, 0x03, 0xff, 0xff, 0xff, 0x04, 0xff, 0xff, 0xff, 0x05, 0xff, 0xff, 0xff];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                bytearray[2 + (i * 4) + j] = colorArray[i][j];
            }
        }
        send(61453, bytearray);
    }
}

function readCustomEQ(hexString) {
    console.log("readCustomEQ called");
    if (modelBase !== "B181") {
        console.log(hexString);
        var level = [];
        for (var i = 0; i < 3; i++) {
            var array = [];
            for (var j = 0; j < 4; j++) {
                array.push(hexString[14 + (i * 13) + j]);
            }
            level.push(fromFormatFloatForEQ(array));
        }
        level.forEach(function (element) {
            console.log(element);
        });
        var formatedArray = [level[2], level[0], level[1]];
        setCustomEQ(formatedArray);
    }
}

function ringBuds(isRing, isLeft = false) {
    let byteArray = [0x00];
    if (modelBase === "B181") {
        if (isRing) {
            byteArray[0] = 0x01;
        } else {
            byteArray[0] = 0x00;
        }
    } else if (modelBase === "B170" || modelBase === "B164") {
        byteArray = [0x06, 0x00];
        if (isRing) {
            byteArray[1] = 0x01;
        } else {
            byteArray[1] = 0x00;
        }
    } else if (modelBase !== "B181") {
        byteArray = [0x00, 0x00];
        if (isLeft) {
            byteArray[0] = 0x02;
        } else {
            byteArray[0] = 0x03;
        }
        if (isRing) {
            byteArray[1] = 0x01;
        }
    }
    send(61442, byteArray);
}

function getFirmware() {
    send(49218, [], "readFirmware");
}

function getLEDCaseColor() {
    if (modelBase === "B181") {
        send(49175, [], "readLEDCaseColor");
    }
}

function readFirmware(hexstring) {
    firmwareVersion = "";
    let hexArray = new Uint8Array(hexstring.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    let size = hexArray[5];
    for (let i = 0; i < size; i++) {
        firmwareVersion += String.fromCharCode(hexArray[8 + i]);
    }
    setFirmwareText(firmwareVersion);
    getConfigForFirmware();
}

async function getConfigForFirmware() {
    // Input validation
    if (!modelBase?.trim() || !firmwareVersion?.trim()) {
        console.error("Model base or firmware version is not set. Cannot get config.");
        return false;
    }
    
    console.log(`Getting config for model: ${modelBase}, firmware: ${firmwareVersion}`);
    
    try {
        // Load configuration data
        const response = await fetch("/js/ear_config_file.json");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        if (!Array.isArray(jsonData)) {
            throw new Error("Invalid config format: expected array");
        }
        
        console.log("Config data loaded successfully");
        firmwareConfig = jsonData;
        
        // Find matching model configuration
        modelSpecs = firmwareConfig.find(config => config.id === modelBase);
        
        if (!modelSpecs) {
            console.warn(`No configuration found for model: ${modelBase}`);
            return false;
        }
        
        console.log(`Found config for modelBase: ${modelBase}`);
        console.log(modelSpecs);
        
        // Handle configuration selection
        const configs = modelSpecs.configs;
        
        if (!Array.isArray(configs) || configs.length === 0) {
            console.warn("No configs array found in model configuration");
            return false;
        }
        
        // If only one config, use it directly
        if (configs.length === 1) {
            console.log("Single config found, using default configuration");
            modelSpecs = configs[0];
            console.log(modelSpecs);
            return true;
        }
        
        // Find config matching firmware version
        let configFound = false;
        
        for (const config of configs) {
            
            try {
                const isCompatible = VersionUtils.isInVersion(
                    firmwareVersion, 
                    config.minFirmware, 
                    config.maxFirmware
                );
                
                if (isCompatible) {
                    console.log(`Found compatible config for firmware version: ${firmwareVersion}`);
                    modelSpecs = config;
                    console.log(modelSpecs);
                    configFound = true;
                    break;
                }
            } catch (versionError) {
                console.error("Error checking version compatibility:", versionError);
            }
        }
        
        if (!configFound) {
            console.warn(`No compatible firmware config found for version: ${firmwareVersion}`);
            return false;
        }
        
        console.log("Configuration loaded successfully");
        return true;
        
    } catch (error) {
        console.error("Failed to get config for firmware:", error);
        return false;
    }
}


function launchEarFitTest() {
    if (modelBase === "B155" || modelBase === "B171" || modelBase === "B172" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179") {
        send(61460, [0x01]);
    }
}

function readEarFitTestResult(hexstring) {
    hexstring = new Uint8Array(hexstring.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    let LeftearFitTestResult = hexstring[8];
    let RightearFitTestResult = hexstring[9];
    earTipStateStatus(LeftearFitTestResult, RightearFitTestResult);
} 

function sendInEarRead() {
    if (modelBase !== "B174" && modelBase !== "B185") {
        send(49166, [], "readInEar");
    }
}

function sendLatencyModeRead() {
    send(49217, [], "readLatency");
}

function readInEar(hexString) {
    if (modelBase === "B164") {
        return;
    }
    console.log("readInEar called");
    hexString = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    inEarStatus = hexString[10];
    setInEarCheckbox(inEarStatus);
}

function readLatency(hexString) {
    console.log("readLatency called");
    hexString = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    latencyStatus = hexString[8];
    setLatencyModeCheckbox(latencyStatus);
}

function setInEar_BT(status) {
    var byteArray = [0x01, 0x01, 0x00];
    if (status == 1) {
        byteArray[2] = 0x01;
    } else if (status == 0) {
        byteArray[2] = 0x00;
    }
    send(61444, byteArray);
}

function setLatency(status) {
    var byteArray = [0x02, 0x00];
    if (status == 1) {
        byteArray[0] = 0x01;
    } else if (status == 0) {
        byteArray[0] = 0x02;
    }
    send(61504, byteArray);
}

function getPersonalizedANCStatus() {
    if (modelBase === "B155") {
        send(49184, [], "readPersonalizedANC");
    }
}

function readPersonalizedANC(hexString) {
    personalizedANCStatus = hexString[8];
    setPersonalAncCheckbox(personalizedANCStatus);
}

function setPersonalizedANC(enabled) {
    if (modelBase === "B155") {
        var byteArray = [0x00];
        if (enabled == 1) {
           setPersonalAncCheckbox(1);
            byteArray[0] = 0x01;
        } else if (enabled == 0) {
            setPersonalAncCheckbox(0);
        }
        send(61457, byteArray, "");
    }
}

function sendUTCtime() {
    if (modelBase === "B181") {
        return;
    }
    var date = new Date();
    var secEpoch = Math.floor(date.getTime() / 1000);
    var byteArray = new Uint8Array(4);
    byteArray[0] = (secEpoch >> 24) & 0xFF;
    byteArray[1] = (secEpoch >> 16) & 0xFF;
    byteArray[2] = (secEpoch >> 8) & 0xFF;
    byteArray[3] = secEpoch & 0xFF;
    console.log("Sending UTC time: " + byteArray.map(byte => byte.toString(16).padStart(2, '0')).join(''));
    send(61450, byteArray, "setUTCtime");
}

function sendGetGesture() {
    send(49176, [], "getGesture");
}

function readGesture(hexString) {
    console.log("readGesture called");
    hexString = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    console.log(Array.from(hexString, byte => byte.toString(16)).join(""));
    var gestureCount = hexString[8];

    var gestureArray = [];
    for (var i = 0; i < gestureCount; i++) {
        var gesture = {};
        gesture["gestureDevice"] = hexString[9 + i * 4];
        gesture["gestureCommon"] = hexString[10 + i * 4];
        gesture["gestureType"] = hexString[11 + i * 4];
        gesture["gestureAction"] = hexString[12 + i * 4];
        gestureArray.push(gesture);
    }
    console.log(gestureArray);
    updateGesturesFromArray(gestureArray);
}

function sendGestures(device, typeog, action, typebutton=0x01) {
    var byteArray = [0x01, 0x02, 0x01, 0x03, 0x0b];
    byteArray[1] = parseInt(device);
    byteArray[2] = parseInt(typebutton);
    byteArray[3] = parseInt(typeog);
    byteArray[4] = parseInt(action);
    send(61443, byteArray);
}
