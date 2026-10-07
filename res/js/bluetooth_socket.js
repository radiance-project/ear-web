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
    hideDeviceLoadingOverlay();
}


function setModelBase() {
    modelSpecs = localStorage.getItem("model");
    //modelBase is a json string, so we need to parse it
    modelBase = JSON.parse(modelSpecs);
    modelBase = modelBase.base;
}

const REBOOT_RECONNECT_MAX_RETRIES = 6;

async function connectSPP(sppPort=null, isRebootRetry=false, retryCount=0) {
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

        try {
            await sppPort.open({ baudRate: 9600, bufferSize: 2048 });
        } catch (openError) {
            console.error("Failed to open serial port:", openError);
            if (isRebootRetry && retryCount < REBOOT_RECONNECT_MAX_RETRIES) {
                console.log(`Device not back yet after reboot, retrying (${retryCount + 1}/${REBOOT_RECONNECT_MAX_RETRIES}) in 5s`);
                try {
                    await sppPort.close();
                } catch (closeError) {
                    console.error("Failed to close serial port before retry:", closeError);
                }
                setTimeout(() => connectSPP(sppPort, true, retryCount + 1), 5000);
                return;
            }
            if (isRebootRetry) {
                console.error("Device did not come back after reboot, giving up");
                rebootPopupShown = false;
                window.location.href = "index.html";
                return;
            }
            throw openError;
        }
        //on disconnect serial
        setModelBase();
        SPPsocket = sppPort;
        //read from the serial port
        const reader = sppPort.readable.getReader();
        initDevice();
        try {
            while (sppPort.readable) {
                const { value, done } = await reader.read();
                if (done) {
                    // Allow the serial port to be closed later.
                    break;
                }
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
                try {
                if (command === 57345 || command===16391) {
                    readBattery(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
                }
                if (command === 57347 || command === 24579) {
                    readANC(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
                }
                if (command === 16452) {
                    readCustomEQ(rawData);
                }
                if (command === 16461) {
                    readAdvancedEQValue(rawData);
                }
                if (command === 16492) {
                    readThirdDriverEQMode(rawData);
                }
                if (command === 16493) {
                    readThirdDriverEQValue(rawData);
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
                if (command === 16423) {
                    readDualEnable(rawData);
                }
                if (command === 16424) {
                    readDualList(rawData);
                }
                if (command === 57358) {
                    readDualDeviceEvent(rawData);
                }
                if (command === 16425) {
                    readHighQualityAudio(rawData);
                }
                if (command === 16463) {
                    readSpatialAudio(rawData);
                }
                if (command === 16418) {
                    readMimiEnable(rawData);
                }
                if (command === 16474) {
                    readAudiodoProfileOn(rawData);
                }
                if (command === 57369 || command === 24601) {
                    readAudiodoStatusPush(rawData);
                }
                if (command === 57385 || command === 24617) {
                    readAudiodoSpatialPush(rawData);
                }
                if (command === 16488 || command === 57372 || command === 24604) {
                    readFlatEq(rawData);
                }
                if (command === 16478) {
                    readSuperMicEnable(rawData);
                }
                if (command === 16479) {
                    readCallTransparencyEnable(rawData);
                }
                if (command === 16480) {
                    readWalkieTalkieMode(rawData);
                }
                if (command === 16484) {
                    readMicMode(rawData);
                }
                if (command === 16487) {
                    readLongPowerMode(rawData);
                }
                if (command === 16497) {
                    readAntiLeakageMode(rawData);
                }
                } catch (packetError) {
                    console.error("Error handling packet for command " + command + ":", packetError);
                }

                if (operationID >= 250) {
                    operationID = 1;
                    operationList = {};
                }
                console.log(string);
                console.log(value);
            }
        } catch (error) {
            console.error("Serial connection lost:", error);
        } finally {
            try {
                reader.releaseLock();
            } catch (releaseError) {
                console.error("Failed to release serial reader lock:", releaseError);
            }
            try {
                await sppPort.close();
            } catch (closeError) {
                console.error("Failed to close serial port:", closeError);
            }
            SPPsocket = null;
            if (awaitingReboot) {
                awaitingReboot = false;
                console.log("Disconnected for reboot, reattempting in 10s");
                setTimeout(() => connectSPP(sppPort, true), 10000);
            } else {
                window.location.href = "index.html";
            }
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
    advancedEQEnabled = advancedStatus === 1;
    if (modelBase === "B157" || modelBase === "B155" || modelBase === "B171" || modelBase === "B174" || modelBase === "B170" || modelBase === "B186" || modelBase === "B192") {
        if (advancedStatus === 1) {
            setEQfromRead(6);
        }
    }
}

function getEQ() {
    if (modelBase !== "B172" && modelBase !== "B195" && modelBase !== "B168" && modelBase !== "B179" && modelBase !== "B197" && modelBase !== "B184" && modelBase !== "B185" && modelBase !== "B175" && modelBase !== "B189") {
        send(49183, [], "readEQ");
    }
}

function getListeningMode() {
    if (modelBase === "B172" || modelBase === "B195" || modelBase === "B168" || modelBase === "B179" || modelBase === "B197" || modelBase === "B184" || modelBase === "B185" || modelBase === "B175" || modelBase === "B189") {
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
    if (modelBase !== "B172" && modelBase !== "B195" && modelBase !== "B168" && modelBase !== "B179" && modelBase !== "B197" && modelBase !== "B184" && modelBase !== "B185" && modelBase !== "B175" && modelBase !== "B189") {
        return;
    }
    let byteArray = [0x00, 0x00];
    byteArray[0] = level;
    send(61469, byteArray, "setListeningMode");
}

// On models flagged "mutuallyExclusive", Spatial Audio and {Bass Enhance, Advanced EQ}
// can't be active at the same time (confirmed via the native app's eqMutuallyExclusive()/
// spaceEqExclusive() capability checks, gating a shared "mutuallyExclusive" BT command
// the EQ screen subscribes to). Enabling either side while the other is active is blocked.
let bassEnhanceEnabled = false;
let advancedEQEnabled = false;

function isSpatialAudioEqExclusive() {
    return !!(modelSpecs && modelSpecs.mutuallyExclusive);
}

function showMutuallyExclusiveWarning(blockedFeature, activeFeature) {
    showWarningPopup(`
        <div class="w-fit flex m-auto text-md mb-2 mt-2 text-white text-center">Attention</div>
        <div class="text-gray-400 text-sm text-center mb-4" style="width: 250px;">${blockedFeature} is not available when ${activeFeature} is activated.</div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Okay</button>
        </div>`);
}

let flatEqEnabled = false;

function initFlatEqIfSupported() {
    if (!(modelSpecs && modelSpecs.supportStudio)) {
        return;
    }
    send(49256, [], "getFlatEq");
}

function readFlatEq(hexArray) {
    if (!(modelSpecs && modelSpecs.supportStudio)) {
        return;
    }
    flatEqEnabled = hexArray.length > 8 && hexArray[8] === 1;
    console.log("readFlatEq: " + flatEqEnabled);
    if (typeof applyFlatEqUI === "function") {
        applyFlatEqUI();
    }
}

function isFlatEqBlocking() {
    return flatEqEnabled;
}

function showFlatEqBlockedPopup() {
    showWarningPopup(`
        <div class="w-fit flex m-auto text-md mb-2 mt-2 text-white text-center">Flat EQ is enabled</div>
        <div class="text-gray-400 text-sm text-center mb-4" style="width: 250px;">Other audio features (such as Equalizer, Spatial Audio, and Transparency mode) are disabled in this mode. To turn off Flat EQ, slide the switch on the left earcup.</div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Okay</button>
        </div>`);
}

const BASS_LEVEL_WIRE_B189 = [0, 5, 10]; // UI position -> wire byte

function usesThreeStageBass() {
    return modelBase === "B189" || modelBase === "B186" || modelBase === "B195" || modelBase === "B197";
}

function set_enhanced_bass(enabled, level) {
    console.log("set_enhanced_bass called with enabled: " + enabled + " and level: " + level);
    if (modelBase === "B171" || modelBase === "B172" || modelBase === "B195" || modelBase === "B168" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B197" || modelBase === "B170" || modelBase === "B164" || modelBase === "B173" || modelBase === "B189" || modelBase === "B186") {
        bassEnhanceEnabled = !!enabled;
        level = usesThreeStageBass() ? (BASS_LEVEL_WIRE_B189[level] ?? 0) : level * 2;
        let byteArray = [0x00, 0x00];
        if (enabled) {
            byteArray[0] = 0x01;
        }
        byteArray[1] = level;
        send(61521, byteArray);
    }
}

function get_enhanced_bass() {
    if (modelBase === "B171" || modelBase === "B172" || modelBase === "B195" || modelBase === "B168" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B197" || modelBase === "B170" || modelBase === "B185" || modelBase === "B164" || modelBase === "B173" || modelBase === "B189" || modelBase === "B186") {
        send(49230, [], "readEnhancedBass");
    }
}

function read_enhanced_bass(hexString) {
    if (modelBase === "B171" || modelBase === "B172" || modelBase === "B195" || modelBase === "B168" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B197" || modelBase === "B170" || modelBase === "B185" || modelBase === "B164" || modelBase === "B173" || modelBase === "B189" || modelBase === "B186") {
        let hexArray = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
        let enabled = hexArray[8];
        let level = hexArray[9];
        bassEnhanceEnabled = enabled === 1;
        setBassEnhance(enabled);
        setBassLevel(usesThreeStageBass() ? BASS_LEVEL_WIRE_B189.indexOf(level) : level / 2);
    }
}

function getAdvancedEQ()
{
    send(49228, [], "readAdvancedEQ");
}

function setAdvancedEQenabled(enabled) {
    advancedEQEnabled = !!enabled;
    let byteArray = [0x00, 0x00];
    if (enabled) {
        byteArray[0] = 0x01;
    }
    send(61519, byteArray);
}

// Advanced EQ band values (SET_ADVANCE_CUSTOM_EQ_VALUE/GET_ADVANCE_CUSTOM_EQ_VALUE,
// confirmed via the native app's EQEntity: [profileIndex(1)][bandCount(1)][totalGain(4 float)]
// then per band 13 bytes: [filterType(1)][gain(4 float)][frequency(4 float)][quality(4 float)]).
// Default center/min/max frequencies per band, per the native app's EQEntity.DEFAULT_FREQUENCY.
const ADVANCED_EQ_BAND_RANGES = [
    { center: 55, min: 20, max: 99 },
    { center: 110, min: 100, max: 199 },
    { center: 220, min: 200, max: 399 },
    { center: 440, min: 400, max: 999 },
    { center: 1320, min: 1000, max: 2999 },
    { center: 3300, min: 3000, max: 5999 },
    { center: 6600, min: 6000, max: 11999 },
    { center: 13200, min: 12000, max: 20000 },
];
const ADVANCED_EQ_BAND_FREQUENCIES = ADVANCED_EQ_BAND_RANGES.map(r => r.center);
let currentAdvancedEQBands = null;

function getAdvancedEQValue(profileIndex = 255) {
    send(49229, [profileIndex], "getAdvancedEQValue");
    if (supportsThirdDriverEQ()) {
        getThirdDriverEQ();
    }
}

// Shared by the main Advanced EQ and the Precision driver EQ: both payloads are
// [profileIndex(1)][bandCount(1)][totalGain(f32)] + per band [filterType(1)][gain][frequency][quality].
function parseAdvancedEQBandsPayload(hexArray) {
    let offset = 8;
    if (hexArray.length < offset + 6) {
        return null;
    }
    let bandCount = hexArray[offset + 1];
    offset += 6; // profileIndex(1) + bandCount(1) + totalGain(4)
    let bands = [];
    for (let i = 0; i < bandCount && offset + 13 <= hexArray.length; i++) {
        bands.push({
            filterType: hexArray[offset],
            gain: fromFormatFloatForEQ(hexArray.slice(offset + 1, offset + 5)),
            frequency: fromFormatFloatForEQ(hexArray.slice(offset + 5, offset + 9)),
            quality: fromFormatFloatForEQ(hexArray.slice(offset + 9, offset + 13)),
        });
        offset += 13;
    }
    return bands;
}

function buildAdvancedEQBandsPacket(bands, totalGain) {
    let packet = new Uint8Array(2 + 4 + bands.length * 13);
    let offset = 0;
    packet[offset++] = 0; // profileIndex
    packet[offset++] = bands.length;
    packet.set(floatToReversedBytes(totalGain), offset);
    offset += 4;
    for (const band of bands) {
        packet[offset++] = 1; // PEAK
        packet.set(floatToReversedBytes(band.gain), offset);
        offset += 4;
        packet.set(floatToReversedBytes(band.frequency), offset);
        offset += 4;
        packet.set(floatToReversedBytes(band.quality), offset);
        offset += 4;
    }
    return Array.from(packet);
}

function readAdvancedEQValue(hexArray) {
    let bands = parseAdvancedEQBandsPayload(hexArray);
    if (!bands) {
        return;
    }
    currentAdvancedEQBands = bands;
    if (typeof renderAdvancedEQUI === "function") {
        renderAdvancedEQUI();
    }
}

function setAdvancedEQValue_BT(bands) {
    // bands: array of {gain, frequency, quality}
    let maxGain = Math.max(0, ...bands.map(b => b.gain));
    let totalGain = -maxGain;
    currentAdvancedEQBands = bands.map(band => ({ filterType: 1, gain: band.gain, frequency: band.frequency, quality: band.quality }));
    send(61520, buildAdvancedEQBandsPacket(bands, totalGain), "setAdvancedEQValue");
}

// Precision driver ("third driver") EQ 
const THIRD_DRIVER_EQ_FREQ_MIN = 5000;
const THIRD_DRIVER_EQ_FREQ_MAX = 15000;
let currentThirdDriverEQBands = null;
let thirdDriverEQModeEnableSent = false;

function supportsThirdDriverEQ() {
    return !!(modelSpecs && modelSpecs.supportMiddleEq);
}

function getThirdDriverEQ() {
    send(49260, [], "getThirdDriverEQMode");
    send(49261, [255], "getThirdDriverEQValue");
}

function readThirdDriverEQMode(hexArray) {
    let enabled = hexArray.length > 8 && hexArray[8] === 1;
    console.log("readThirdDriverEQMode: " + enabled);
    if (!enabled && supportsThirdDriverEQ() && !thirdDriverEQModeEnableSent) {
        thirdDriverEQModeEnableSent = true;
        send(61548, [1], "setThirdDriverEQMode");
    }
}

function readThirdDriverEQValue(hexArray) {
    let bands = parseAdvancedEQBandsPayload(hexArray);
    if (!bands) {
        return;
    }
    currentThirdDriverEQBands = bands;
    if (typeof renderAdvancedEQUI === "function") {
        renderAdvancedEQUI();
    }
}

function dualWaveTotalGain(mainBands, driverBands) {
    let peak = Math.max(0, ...mainBands.map(b => b.gain), ...driverBands.map(b => b.gain));
    let useNative = true;
    if (firmwareVersion) {
        try {
            useNative = VersionUtils.compareVersion(firmwareVersion, "1.0.1.46") >= 0;
        } catch (e) {
            useNative = true;
        }
    }
    if (useNative) {
        let whole = Math.trunc(peak);
        return whole > 0 ? -whole : 0;
    }
    return Math.min(0, 6 - peak);
}

function setAdvancedAndThirdDriverEQ_BT(mainBands, driverBands) {
    let totalGain = dualWaveTotalGain(mainBands, driverBands);
    currentAdvancedEQBands = mainBands.map(band => ({ filterType: 1, gain: band.gain, frequency: band.frequency, quality: band.quality }));
    currentThirdDriverEQBands = driverBands.map(band => ({
        filterType: 1,
        gain: band.gain,
        frequency: Math.min(THIRD_DRIVER_EQ_FREQ_MAX, Math.max(THIRD_DRIVER_EQ_FREQ_MIN, band.frequency)),
        quality: band.quality,
    }));
    send(61520, buildAdvancedEQBandsPacket(currentAdvancedEQBands, totalGain), "setAdvancedEQValue");
    send(61549, buildAdvancedEQBandsPacket(currentThirdDriverEQBands, totalGain), "setThirdDriverEQValue");
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
    } else if (modelBase === "B170" || modelBase === "B164" || modelBase === "B186" || modelBase === "B192") {
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
            initDualConnectionIfSupported();
            initAudioCodecIfSupported();
            initSpatialAudioIfSupported();
            initPersonalSoundProfileIfSupported();
            initSuperMicIfSupported();
            initCallTransparencyIfSupported();
            initWalkieTalkieModeIfSupported();
            initLongPowerModeIfSupported();
            initAntiLeakageIfSupported();
            initFlatEqIfSupported();
            if (typeof injectCaseButtonUI === "function") {
                injectCaseButtonUI();
            }
            if (typeof injectSmartKnobUI === "function") {
                injectSmartKnobUI();
            }
            if (typeof injectSmartDialUI === "function") {
                injectSmartDialUI();
            }
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
                    initDualConnectionIfSupported();
                    initAudioCodecIfSupported();
                    initSpatialAudioIfSupported();
                    initPersonalSoundProfileIfSupported();
                    initSuperMicIfSupported();
                    initCallTransparencyIfSupported();
                    initWalkieTalkieModeIfSupported();
                    initLongPowerModeIfSupported();
                    initAntiLeakageIfSupported();
                    initFlatEqIfSupported();
                    if (typeof injectCaseButtonUI === "function") {
                        injectCaseButtonUI();
                    }
                    if (typeof injectSmartKnobUI === "function") {
                        injectSmartKnobUI();
                    }
                    if (typeof injectSmartDialUI === "function") {
                        injectSmartDialUI();
                    }
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
    if (modelBase === "B155" || modelBase === "B171" || modelBase === "B172" || modelBase === "B195" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B197" || modelBase === "B173") {
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
    if (modelBase !== "B174" && modelBase !== "B185" && modelBase !== "B175" && modelBase !== "B189" && modelBase !== "B186") {
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

let dualConnectEnabled = false;
let dualConnectList = [];

let awaitingReboot = false;
let rebootPopupShown = false;

function prepareForReboot() {
    awaitingReboot = true;
}

function showRebootingPopup() {
    rebootPopupShown = true;
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = `
        <div class="w-fit flex m-auto text-md mb-4 mt-2 text-white text-center">Rebooting...</div>
        <img src="../assets/loading.svg" alt="loading_animation" class="h-[60px] w-[60px] m-auto" />`;
}

function closeRebootPopupIfShown() {
    if (rebootPopupShown) {
        rebootPopupShown = false;
        closePopUp();
    }
}

function initDualConnectionIfSupported() {
    if (!(modelSpecs && modelSpecs.dualConnection)) {
        return;
    }
    if (typeof injectDualConnectUI === "function") {
        injectDualConnectUI();
    }
    getDualEnable();
    getDualList();
}

function macBytesFromString(macString) {
    return macString.split(/[-:]/).map(byte => parseInt(byte, 16));
}

function macStringFromBytes(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0').toUpperCase()).join('-');
}

function getDualEnable() {
    if (modelSpecs && modelSpecs.dualConnection) {
        send(49191, [], "readDualEnable");
    }
}

function readDualEnable(hexArray) {
    console.log("readDualEnable called");
    dualConnectEnabled = hexArray[8] === 1;
    if (typeof setDualEnableCheckbox === "function") {
        setDualEnableCheckbox(dualConnectEnabled);
    }
}

function setDualEnable_BT(enabled) {
    dualConnectEnabled = enabled;
    send(61466, [enabled ? 1 : 0], "setDualEnable");
}

const DUAL_LIST_MAX_PAGE_REQUESTS = 20;
let dualListPageRequests = 0;

function getDualList() {
    if (modelSpecs && modelSpecs.dualConnection) {
        dualConnectList = [];
        dualListPageRequests = 0;
        requestDualListPage();
    }
}

function requestDualListPage() {
    dualListPageRequests++;
    send(49192, [dualConnectList.length & 0xff], "readDualList");
}

function readDualList(hexArray) {
    console.log("readDualList called");
    if (hexArray.length < 11) {
        return;
    }
    let deviceCount = hexArray[10];
    let offset = 11;
    let addedNewDevice = false;
    for (let i = 0; i < deviceCount; i++) {
        if (offset + 8 > hexArray.length) {
            break;
        }
        let flags = hexArray[offset];
        let isSelf = (flags & 0xf0) !== 0;
        let isConnected = (flags & 0x0f) !== 0;
        let macBytes = hexArray.slice(offset + 1, offset + 7);
        let mac = macStringFromBytes(macBytes);
        let nameLength = hexArray[offset + 7] & 0x7f;
        let nameBytes = hexArray.slice(offset + 8, offset + 8 + nameLength);
        let name = new TextDecoder("utf-8").decode(new Uint8Array(nameBytes));
        let device = { mac, name, isSelf, isConnected };
        let existingIndex = dualConnectList.findIndex(item => item.mac === mac);
        if (existingIndex >= 0) {
            dualConnectList[existingIndex] = device;
        } else {
            dualConnectList.push(device);
            addedNewDevice = true;
        }
        offset += 8 + nameLength;
    }
    if (addedNewDevice && dualListPageRequests < DUAL_LIST_MAX_PAGE_REQUESTS) {
        requestDualListPage();
    }
    if (typeof renderDualConnectList === "function") {
        renderDualConnectList();
    }
}

function readDualDeviceEvent(hexArray) {
    console.log("readDualDeviceEvent called");
    if (hexArray.length < 16) {
        return;
    }
    let isConnected = hexArray[8] === 1;
    let macBytes = hexArray.slice(9, 15);
    let mac = macStringFromBytes(macBytes);
    let existingIndex = dualConnectList.findIndex(item => item.mac === mac);
    if (existingIndex >= 0) {
        dualConnectList[existingIndex].isConnected = isConnected;
        if (typeof renderDualConnectList === "function") {
            renderDualConnectList();
        }
    } else {
        getDualList();
    }
}

function setDualConnect_BT(mac, connect) {
    send(61467, [connect ? 1 : 0, ...macBytesFromString(mac)], "setDualConnect");
}

const AUDIO_CODEC_NAMES = ["AAC", "LHDC", "LDAC"];
let currentAudioCodec = 0;

function initAudioCodecIfSupported() {
    if (!(modelSpecs && modelSpecs.highQualityAudio)) {
        return;
    }
    if (typeof injectAudioCodecUI === "function") {
        injectAudioCodecUI();
    }
    getHighQualityAudio();
}

function getHighQualityAudio() {
    if (modelSpecs && modelSpecs.highQualityAudio) {
        send(49193, [], "getHighQualityAudio");
    }
}

function readHighQualityAudio(hexArray) {
    let index = hexArray.length > 8 ? hexArray[8] : 0;
    if (index < 0 || index >= AUDIO_CODEC_NAMES.length) {
        index = 0;
    }
    currentAudioCodec = index;
    if (typeof renderAudioCodecUI === "function") {
        renderAudioCodecUI();
    }
    closeRebootPopupIfShown();
}

function setHighQualityAudio_BT(index) {
    currentAudioCodec = index;
    send(61468, [index], "setHighQualityAudio");
    if (typeof renderAudioCodecUI === "function") {
        renderAudioCodecUI();
    }
}

const SPATIAL_AUDIO_MODES = [
    { name: "Off", bit: null, mode: 0, head: 0 },
    { name: "Head Tracked", bit: 0x1, mode: 1, head: 1 },
    { name: "Fixed", bit: 0x2, mode: 1, head: 0 },
    { name: "Concert", bit: 0x8, mode: 2, head: 0 },
    { name: "Theatre", bit: 0x10, mode: 3, head: 0 },
    { name: "Game", bit: 0x20, mode: 4, head: 0 },
];
let currentSpatialAudioMode = 0;

function initSpatialAudioIfSupported() {
    if (!(modelSpecs && modelSpecs.spatialAudio)) {
        return;
    }
    if (modelSpecs.useAudiodoSpatial) {
        //AudioDo Spatial audio require external SDK that can't be used 
        return;
    }
    if (typeof injectSpatialAudioUI === "function") {
        injectSpatialAudioUI();
    }
    getSpatialAudio();
}

function getSpatialAudio() {
    if (modelSpecs && modelSpecs.spatialAudio) {
        send(49231, [], "getSpatialAudio");
    }
}

function spatialAudioIndexFromWire(mode, head) {
    if (head === 1) {
        return 1; // Head Tracked
    }
    for (let i = 0; i < SPATIAL_AUDIO_MODES.length; i++) {
        if (SPATIAL_AUDIO_MODES[i].head === 0 && SPATIAL_AUDIO_MODES[i].mode === mode) {
            return i;
        }
    }
    return 0;
}

function readSpatialAudio(hexArray) {
    let mode = hexArray.length > 8 ? hexArray[8] : 0;
    let head = hexArray.length > 9 ? hexArray[9] : 0;
    console.log(`readSpatialAudio: mode=${mode}, head=${head}`);
    currentSpatialAudioMode = spatialAudioIndexFromWire(mode, head);
    console.log(`currentSpatialAudioMode index: ${currentSpatialAudioMode}`);
    if (typeof renderSpatialAudioUI === "function") {
        renderSpatialAudioUI();
    }
}


const AUDIODO_SPATIAL_STATUS_NAMES = { 1: "On", 2: "Head Tracked" };
const AUDIODO_SPATIAL_SCENE_NAMES = {
    1: "Standard",      // pop
    2: "Club",          // edm
    3: "Concert Hall",  // classical
    4: "Live House",    // rock
    5: "Studio B",      // surround
};

function readAudiodoSpatialPush(hexArray) {
    if (!(modelSpecs && modelSpecs.useAudiodoSpatial) || hexArray.length < 10) {
        return;
    }
    let status = hexArray[8];
    let mode = hexArray[9];
    let statusName = AUDIODO_SPATIAL_STATUS_NAMES[status] || "Off";
    let scene = statusName !== "Off" ? (AUDIODO_SPATIAL_SCENE_NAMES[mode] || "unknown scene") : null;
    console.log(`readAudiodoSpatialPush: status=${status}, mode=${mode} (${statusName}${scene ? ", " + scene : ""})`);
}

function setSpatialAudio_BT(index) {
    currentSpatialAudioMode = index;
    let entry = SPATIAL_AUDIO_MODES[index];
    console.log(`setSpatialAudio_BT: index=${index}, mode=${entry.mode}, head=${entry.head}`);
    send(61522, [entry.mode, entry.head], "setSpatialAudio");
    if (typeof renderSpatialAudioUI === "function") {
        renderSpatialAudioUI();
    }
}

let personalSoundProfileEnabled = false;

function personalSoundProfileBackend() {
    if (modelSpecs && modelSpecs.mimi) {
        return "mimi";
    }
    if (modelSpecs && modelSpecs.audiodo) {
        return "audiodo";
    }
    return null;
}

function initPersonalSoundProfileIfSupported() {
    let backend = personalSoundProfileBackend();
    if (!backend) {
        return;
    }
    if (typeof injectPersonalSoundProfileUI === "function") {
        injectPersonalSoundProfileUI();
    }
    getPersonalSoundProfile();
}

function getPersonalSoundProfile() {
    let backend = personalSoundProfileBackend();
    if (backend === "mimi") {
        send(49186, [], "getMimiEnable");
    } else if (backend === "audiodo") {
        send(49242, [], "getAudiodoProfileOn");
    }
}

function readMimiEnable(hexArray) {
    personalSoundProfileEnabled = hexArray.length > 8 && hexArray[8] === 1;
    if (typeof setPersonalSoundProfileCheckbox === "function") {
        setPersonalSoundProfileCheckbox(personalSoundProfileEnabled);
    }
}

function readAudiodoProfileOn(hexArray) {
    personalSoundProfileEnabled = hexArray.length > 8 && hexArray[8] === 1;
    if (typeof setPersonalSoundProfileCheckbox === "function") {
        setPersonalSoundProfileCheckbox(personalSoundProfileEnabled);
    }
}

function readAudiodoStatusPush(hexArray) {
    if (personalSoundProfileBackend() !== "audiodo") {
        return;
    }
    personalSoundProfileEnabled = hexArray.length > 8 && hexArray[8] === 1;
    if (typeof setPersonalSoundProfileCheckbox === "function") {
        setPersonalSoundProfileCheckbox(personalSoundProfileEnabled);
    }
}

function setPersonalSoundProfile_BT(enabled) {
    let backend = personalSoundProfileBackend();
    personalSoundProfileEnabled = enabled;
    if (backend === "mimi") {
        send(61461, [enabled ? 1 : 0], "setMimiEnable");
    } else if (backend === "audiodo") {
        send(61532, [enabled ? 1 : 0], "setAudiodoProfileOn");
    }
}

let superMicEnabled = false;
let callTransparencyEnabled = false;
let walkieTalkieModeEnabled = false;

function initSuperMicIfSupported() {
    if (!(modelSpecs && modelSpecs.superMic)) {
        return;
    }
    if (typeof injectSuperMicUI === "function") {
        injectSuperMicUI();
    }
    getSuperMicEnable();
    getMicMode();
}

function getSuperMicEnable() {
    if (modelSpecs && modelSpecs.superMic) {
        send(49246, [], "getSuperMicEnable");
    }
}

function readSuperMicEnable(hexArray) {
    superMicEnabled = hexArray.length > 8 && hexArray[8] === 1;
    if (typeof setSuperMicCheckbox === "function") {
        setSuperMicCheckbox(superMicEnabled);
    }
}

function setSuperMicEnable_BT(enabled) {
    superMicEnabled = enabled;
    send(61535, [enabled ? 1 : 0], "setSuperMicEnable");
}

function initCallTransparencyIfSupported() {
    if (!(modelSpecs && modelSpecs.callTransparency)) {
        return;
    }
    if (typeof injectCallTransparencyUI === "function") {
        injectCallTransparencyUI();
    }
    getCallTransparencyEnable();
}

function getCallTransparencyEnable() {
    if (modelSpecs && modelSpecs.callTransparency) {
        send(49247, [], "getCallTransparencyEnable");
    }
}

function readCallTransparencyEnable(hexArray) {
    callTransparencyEnabled = hexArray.length > 8 && hexArray[8] === 1;
    if (typeof setCallTransparencyCheckbox === "function") {
        setCallTransparencyCheckbox(callTransparencyEnabled);
    }
}

function setCallTransparencyEnable_BT(enabled) {
    callTransparencyEnabled = enabled;
    send(61536, [enabled ? 1 : 0], "setCallTransparencyEnable");
}

function initWalkieTalkieModeIfSupported() {
    if (!(modelSpecs && modelSpecs.walkieTalkieMode)) {
        return;
    }
    getWalkieTalkieMode();
}

function getWalkieTalkieMode() {
    if (modelSpecs && modelSpecs.walkieTalkieMode) {
        send(49248, [], "getWalkieTalkieMode");
    }
}

function readWalkieTalkieMode(hexArray) {
    walkieTalkieModeEnabled = hexArray.length > 8 && hexArray[8] === 1;
    if (typeof setWalkieTalkieModeCheckbox === "function") {
        setWalkieTalkieModeCheckbox(walkieTalkieModeEnabled);
    }
}

let longPowerModeEnabled = false;

function initLongPowerModeIfSupported() {
    if (!(modelSpecs && modelSpecs.longPowerMode)) {
        return;
    }
    if (typeof injectLongPowerModeUI === "function") {
        injectLongPowerModeUI();
    }
    getLongPowerMode();
}

function getLongPowerMode() {
    if (modelSpecs && modelSpecs.longPowerMode) {
        send(49255, [], "getLongPowerMode");
    }
}

function readLongPowerMode(hexArray) {
    longPowerModeEnabled = hexArray.length > 8 && hexArray[8] === 1;
    if (typeof setLongPowerModeCheckbox === "function") {
        setLongPowerModeCheckbox(longPowerModeEnabled);
    }
}

function setLongPowerMode_BT(enabled) {
    longPowerModeEnabled = enabled;
    send(61544, [enabled ? 1 : 0], "setLongPowerMode");
}

function initAntiLeakageIfSupported() {
    if (!(modelSpecs && modelSpecs.supportLeakageProtection)) {
        return;
    }
    if (typeof injectAntiLeakageUI === "function") {
        injectAntiLeakageUI();
    }
    getAntiLeakageMode();
}

function getAntiLeakageMode() {
    if (modelSpecs && modelSpecs.supportLeakageProtection) {
        send(49265, [], "getScenarioMode");
    }
}

function readAntiLeakageMode(hexArray) {
    if (hexArray.length > 8) {
        currentAntiLeakageMode = hexArray[8];
    }
    if (typeof renderAntiLeakageRow === "function") {
        renderAntiLeakageRow();
    }
}

function setAntiLeakageMode_BT(mode) {
    currentAntiLeakageMode = mode;
    send(61557, [mode], "setScenarioMode");
}

function setWalkieTalkieMode_BT(enabled) {
    walkieTalkieModeEnabled = enabled;
    send(61537, [enabled ? 1 : 0], "setWalkieTalkieMode");
}

function getMicMode() {
    if (modelSpecs && modelSpecs.superMic) {
        send(49252, [], "getMicMode");
    }
}

function setMicMode_BT(mode) {
    currentMicMode = mode;
    send(61541, [mode], "setMicMode");
}

function readMicMode(hexArray) {
    if (hexArray.length > 8 && typeof micModeOptions !== "undefined" && micModeOptions) {
        currentMicMode = hexArray[8];
        if (typeof renderMicModeRow === "function") {
            renderMicModeRow();
        }
    }
}
