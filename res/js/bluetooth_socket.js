let SPPsocket = null;
let writeQueue = Promise.resolve();



let modelSpecs = {};
let modelBase = "";
let modelConfigID = "";

let firmwareVersion = "";
let firmwareConfig = {};

let operationID = 0;

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

function bytesToHex(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
        out += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
    }
    return out;
}

async function send(command, payload = [], operation = "") {
    let header = [0x55, 0x60, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00];
    // op id is one byte, wraps 1..255
    operationID = operationID >= 255 ? 1 : operationID + 1;
    header[7] = operationID;
    let commandBytes = new Uint8Array(new Uint16Array([command]).buffer);
    header[3] = commandBytes[0];
    header[4] = commandBytes[1];
    let payloadLength = payload.length;
    header[5] = payloadLength & 0xFF;
    header[6] = (payloadLength >> 8) & 0xFF;
    header.push(...payload);
    let byteArray = new Uint8Array(header);
    let crc = crc16(byteArray);
    let frame = new Uint8Array(byteArray.length + 2);
    frame.set(byteArray, 0);
    frame[byteArray.length] = crc & 0xFF;
    frame[byteArray.length + 1] = crc >> 8;
    if (isSetCommand(command)) {
        setQueue.push({ command, op: operationID, frame });
        pumpSets();
    } else {
        writeFrame(frame);
    }
}

function stamp() {
    return "[" + Math.round(performance.now()) + "ms] ";
}

// 0xF0xx only: 0xFCxx (debug / file transfer) is not a plain request and ack
function isSetCommand(command) {
    return (command & 0xFF00) === 0xF000;
}

// a response has bit 15 clear (a push does not): 0xF041 is acked by 0x7041, 0xC007 by 0x4007
function isAckFor(received, requested) {
    return (received & 0x8000) === 0 && (received & 0x7FFF) === (requested & 0x7FFF);
}

// sets go out one at a time: the next waits for the previous ack (cmd & 0x7FFF, same op id)
const SET_ACK_TIMEOUT_MS = 2000;
let setQueue = [];
let inflightSet = null;

function pumpSets() {
    if (inflightSet || setQueue.length === 0) {
        return;
    }
    const entry = setQueue.shift();
    entry.sentAt = performance.now();
    entry.timer = setTimeout(() => {
        console.error("No ack for set 0x" + entry.command.toString(16) + " op " + entry.op);
        inflightSet = null;
        pumpSets();
    }, SET_ACK_TIMEOUT_MS);
    inflightSet = entry;
    writeFrame(entry.frame);
}

function onSetAck(command, op) {
    if (!inflightSet || !isAckFor(command, inflightSet.command) || op !== inflightSet.op) {
        return;
    }
    clearTimeout(inflightSet.timer);
    if (debug) {
        console.log(stamp() + "ack 0x" + command.toString(16) + " op " + op + " in " + Math.round(performance.now() - inflightSet.sentAt) + "ms");
    }
    inflightSet = null;
    pumpSets();
}

function resetSets() {
    if (inflightSet) {
        clearTimeout(inflightSet.timer);
    }
    inflightSet = null;
    setQueue = [];
}

function writeFrame(frame) {
    if (debug) {
        console.log(stamp() + "sending " + bytesToHex(frame));
    }
    writeQueue = writeQueue.then(async () => {
        if (!SPPsocket || !SPPsocket.writable) {
            return;
        }
        // close() drains and the next getWriter() gets a fresh pipe, so a frame never straddles a buffer wrap
        let writer = null;
        try {
            writer = SPPsocket.writable.getWriter();
            await writer.write(frame);
        } catch (error) {
            console.error('Write failed:', error);
        } finally {
            if (writer) {
                try {
                    await writer.close();
                } catch (closeError) {
                    console.error('Writer close failed:', closeError);
                }
            }
        }
    });
}

// buffers reads until a whole frame is available (a read can hold several frames or part of one)
const FRAME_SYNC_BYTE = 0x55;
const FRAME_HEADER_LENGTH = 8;
const FRAME_CRC_FLAG_MASK = 0x20; // control bit 5, as in the official parser
const FRAME_MAX_PAYLOAD = 4096;

function frameCrcMatches(frame) {
    const end = frame.length - 2;
    return crc16(frame.subarray(0, end)) === (frame[end] | (frame[end + 1] << 8));
}

function createFrameReassembler(onFrame) {
    let buffer = new Uint8Array(0);
    return {
        push(chunk) {
            if (!chunk || chunk.length === 0) {
                return;
            }
            if (buffer.length === 0) {
                buffer = chunk.slice();
            } else {
                const merged = new Uint8Array(buffer.length + chunk.length);
                merged.set(buffer, 0);
                merged.set(chunk, buffer.length);
                buffer = merged;
            }
            let offset = 0;
            while (offset < buffer.length) {
                if (buffer[offset] !== FRAME_SYNC_BYTE) {
                    offset++;
                    continue;
                }
                if (buffer.length - offset < FRAME_HEADER_LENGTH) {
                    break;
                }
                const payloadLength = buffer[offset + 5] | (buffer[offset + 6] << 8);
                if (payloadLength > FRAME_MAX_PAYLOAD) {
                    // bad length, resync
                    offset++;
                    continue;
                }
                const crcLength = (buffer[offset + 1] & FRAME_CRC_FLAG_MASK) ? 2 : 0;
                const total = FRAME_HEADER_LENGTH + payloadLength + crcLength;
                if (buffer.length - offset < total) {
                    break;
                }
                const frame = buffer.slice(offset, offset + total);
                if (crcLength && !frameCrcMatches(frame)) {
                    console.warn("CRC mismatch, frame dropped (command 0x" + (frame[3] | (frame[4] << 8)).toString(16) + ")");
                    offset++;
                    continue;
                }
                offset += total;
                try {
                    onFrame(frame);
                } catch (frameError) {
                    console.error("Error handling frame:", frameError);
                }
            }
            buffer = offset === 0 ? buffer : buffer.slice(offset);
        },
    };
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
    // abort if the connection changes mid-sequence
    const socket = SPPsocket;
    const steps = [
        sendBattery,
        getEQ,
        getListeningMode,
        getFirmware,
        sendUTCtime,
        sendInEarRead,
        sendLatencyModeRead,
        getPersonalizedANCStatus,
        sendGetGesture,
        sendANCread,
        getAdvancedEQ,
        get_enhanced_bass,
    ];
    for (const step of steps) {
        if (SPPsocket !== socket) {
            return;
        }
        step();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (SPPsocket !== socket) {
        return;
    }
    hideDeviceLoadingOverlay();
    ensureFirmware(socket);
}

// the feature UI is built from the firmware reply, so ask again if it never came
async function ensureFirmware(socket) {
    for (let attempt = 0; attempt < 3; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (SPPsocket !== socket || firmwareVersion !== "") {
            return;
        }
        getFirmware();
    }
}


function setModelBase() {
    modelSpecs = localStorage.getItem("model");
    //modelBase is a json string, so we need to parse it
    let model = JSON.parse(modelSpecs);
    modelBase = model.base;
    modelConfigID = model.altBase || model.base;
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
        const reassembler = createFrameReassembler(handleFrame);
        try {
            while (sppPort.readable) {
                const { value, done } = await reader.read();
                if (done) {
                    // Allow the serial port to be closed later.
                    break;
                }
                if (!value) {
                    continue;
                }
                if (debug) {
                    console.log(stamp() + "RX chunk " + bytesToHex(value));
                }
                reassembler.push(value);
            }
        } catch (error) {
            console.error("Serial connection lost:", error);
        } finally {
            try {
                reader.releaseLock();
            } catch (releaseError) {
                console.error("Failed to release serial reader lock:", releaseError);
            }
            resetSets();
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

// keyed by cmd | 0x8000: responses (0x40xx) and pushes (0x60xx, 0xE0xx) share one handler
const FRAME_HANDLERS = {
    0xC002: readFindState,
    0xC007: readBattery,
    0xC00E: readInEar,
    0xC017: readLEDCaseColor,
    0xC018: readGesture,
    0xC01E: readANC,
    0xC01F: readEQ,
    0xC020: readPersonalizedANC,
    0xC022: readMimiEnable,
    0xC027: readDualEnable,
    0xC028: readDualList,
    0xC029: readHighQualityAudio,
    0xC041: readLatency,
    0xC042: readFirmware,
    0xC044: readCustomEQ,
    0xC04C: read_advanced_eq_status,
    0xC04D: readAdvancedEQValue,
    0xC04E: read_enhanced_bass,
    0xC04F: readSpatialAudio,
    0xC050: readEQ,
    0xC05A: readAudiodoProfileOn,
    0xC05E: readSuperMicEnable,
    0xC05F: readCallTransparencyEnable,
    0xC060: readWalkieTalkieMode,
    0xC064: readMicMode,
    0xC067: readLongPowerMode,
    0xC068: readFlatEq,
    0xC06C: readThirdDriverEQMode,
    0xC06D: readThirdDriverEQValue,
    0xC071: readAntiLeakageMode,
    0xE001: readBattery,
    0xE003: readANC,
    0xE00D: readEarFitTestResult,
    0xE00E: readDualDeviceEvent,
    0xE019: readAudiodoStatusPush,
    0xE01C: readFlatEq,
    0xE029: readAudiodoSpatialPush,
};

const warnedCommands = new Set();

// notifications we skip on purpose: the official app has no handler for most; 0xE002 (device status) is not used yet
const IGNORED_COMMANDS = new Set([0xE002, 0xE005, 0xE006, 0xE009, 0xE00B, 0xE00F, 0xE010, 0xE011, 0xE016, 0xE018]);

// set acks (0x7xxx) have no handler by design; any other command is reported once per id
function warnUnhandled(command, payload) {
    if (IGNORED_COMMANDS.has(command | 0x8000)) {
        console.log("Ignored notification 0x" + command.toString(16) + ": " + bytesToHex(payload));
        return;
    }
    if ((command & 0xF000) === 0x7000 || warnedCommands.has(command)) {
        return;
    }
    warnedCommands.add(command);
    const shown = bytesToHex(payload.subarray(0, 32)).replace(/../g, "$& ").trim();
    console.warn("No handler for command 0x" + command.toString(16) + " (payload " + payload.length + " bytes: " + shown + (payload.length > 32 ? " ..." : "") + ")");
}

function handleFrame(frame) {
    const command = frame[3] | (frame[4] << 8);
    onSetAck(command, frame[7]);
    const handler = FRAME_HANDLERS[command | 0x8000];
    const length = frame[5] | (frame[6] << 8);
    if (!handler) {
        warnUnhandled(command, frame.subarray(8, 8 + length));
        return;
    }
    try {
        handler(frame.subarray(8, 8 + length));
    } catch (packetError) {
        console.error("Error handling packet for command " + command + ":", packetError);
    }
}

function sendBattery() {
    send(49159, [], "readBattery");
}
function readBattery(payload) {
    let connectedDevices = 0;
    let batteryStatus = { "left": "DISCONNECTED", "right": "DISCONNECTED", "case": "DISCONNECTED", "stereo": "DISCONNECTED" };
    let deviceIdToKey = { 0x02: "left", 0x03: "right", 0x04: "case", 0x06: "stereo" };
    let BATTERY_MASK = 127;
    let RECHARGING_MASK = 128;

    connectedDevices = payload[0];
    for (let i = 0; i < connectedDevices; i++) {
        let deviceId = payload[1 + (i * 2)];
        let key = deviceIdToKey[deviceId] || "DISCONNECTED";
        let batteryLevel = payload[2 + (i * 2)] & BATTERY_MASK;
        let isCharging = (payload[2 + (i * 2)] & RECHARGING_MASK) === RECHARGING_MASK;
        batteryStatus[key] = {
            "batteryLevel": batteryLevel,
            "isCharging": isCharging
        };
    }

    let batteryLeft = batteryStatus["left"]["batteryLevel"];
    let batteryRight = batteryStatus["right"]["batteryLevel"];
    let batteryCase = batteryStatus["case"]["batteryLevel"];
    let batteryStereo = batteryStatus["stereo"]["batteryLevel"];
    if (batteryStatus["stereo"] !== "DISCONNECTED") {
        setBattery("s", batteryStereo)
    }
    else {
        setBattery("l", batteryLeft)
        setBattery("r", batteryRight)
        setBattery("c", batteryCase)
    }
}
let lastAncMode = null;
let lastAncStrength = 1;

// payload is a list of [type, value, unused] entries: type 1 sets the mode, type 2 only the strength
// payload is [count] followed by count x [position, ring]; position 2 = left, 3 = right, 6 = single body
function readFindState(payload) {
    if (payload.length === 0 || payload.length !== 1 + 2 * payload[0]) {
        console.warn("Unexpected find-device state layout: " + bytesToHex(payload));
        return;
    }
    const entries = [];
    for (let i = 1; i + 1 < payload.length; i += 2) {
        entries.push({ position: payload[i], ringing: payload[i + 1] === 1 });
    }
    if (typeof applyRingState === "function") {
        applyRingState(entries);
    }
}

function readANC(payload) {
    for (let i = 0; i + 1 < payload.length; i += 3) {
        const type = payload[i];
        const value = payload[i + 1];
        if (type === 0x01) {
            if (value >= 1 && value <= 4) {
                lastAncMode = "on";
                lastAncStrength = value;
            } else if (value === 0 || value === 5) {
                lastAncMode = "off";
            } else if (value === 7 || value === 0xFE) {
                lastAncMode = "transparency";
            }
        } else if (type === 0x02 && value >= 1 && value <= 4) {
            lastAncStrength = value;
        }
    }
    if (lastAncMode === "off") {
        setANCStatus(1);
    } else if (lastAncMode === "transparency") {
        setANCStatus(2);
    } else if (lastAncMode === "on") {
        setANCStatus({ 1: 4, 2: 5, 3: 3, 4: 6 }[lastAncStrength]);
    }
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
    send(61455, byteArray, "setANC");
}

function read_advanced_eq_status(payload)
{
    let advancedStatus = payload[0];
    advancedEQEnabled = advancedStatus === 1;
    if (modelBase === "B157" || modelBase === "B155" || modelBase === "B171" || modelBase === "B174" || modelBase === "B170" || modelBase === "B186" || modelBase === "B192" || modelBase === "B173" || modelBase === "B190") {
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

function readEQ(payload) {
    let eqMode = payload[0];
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

function readFlatEq(payload) {
    if (!(modelSpecs && modelSpecs.supportStudio)) {
        return;
    }
    flatEqEnabled = payload.length > 0 && payload[0] === 1;
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
    if (modelBase === "B171" || modelBase === "B172" || modelBase === "B195" || modelBase === "B168" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B197" || modelBase === "B170" || modelBase === "B185" || modelBase === "B164" || modelBase === "B173" || modelBase === "B189" || modelBase === "B186") {
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

function read_enhanced_bass(payload) {
    if (modelBase === "B171" || modelBase === "B172" || modelBase === "B195" || modelBase === "B168" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B197" || modelBase === "B170" || modelBase === "B185" || modelBase === "B164" || modelBase === "B173" || modelBase === "B189" || modelBase === "B186") {
        let enabled = payload[0];
        let level = payload[1];
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
function parseAdvancedEQBandsPayload(payload) {
    let offset = 0;
    if (payload.length < offset + 6) {
        return null;
    }
    let bandCount = payload[offset + 1];
    offset += 6; // profileIndex(1) + bandCount(1) + totalGain(4)
    let bands = [];
    for (let i = 0; i < bandCount && offset + 13 <= payload.length; i++) {
        bands.push({
            filterType: payload[offset],
            gain: fromFormatFloatForEQ(payload.slice(offset + 1, offset + 5)),
            frequency: fromFormatFloatForEQ(payload.slice(offset + 5, offset + 9)),
            quality: fromFormatFloatForEQ(payload.slice(offset + 9, offset + 13)),
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

function readAdvancedEQValue(payload) {
    let bands = parseAdvancedEQBandsPayload(payload);
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

function readThirdDriverEQMode(payload) {
    let enabled = payload.length > 0 && payload[0] === 1;
    if (!enabled && supportsThirdDriverEQ() && !thirdDriverEQModeEnableSent) {
        thirdDriverEQModeEnableSent = true;
        send(61548, [1], "setThirdDriverEQMode");
    }
}

function readThirdDriverEQValue(payload) {
    let bands = parseAdvancedEQBandsPayload(payload);
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

function readLEDCaseColor(payload) {
    if (modelBase === "B181") {
        const numberOfLed = payload[0];
        const ledArray = [];
        for (let i = 0; i < numberOfLed; i++) {
            ledArray.push([
                payload[2 + (i * 4)],
                payload[3 + (i * 4)],
                payload[4 + (i * 4)]
            ]);
        }
        const ledArrayString = ledArray.map(led => `#${led.map(value => value.toString(16).padStart(2, '0')).join('')}`);
        getCaseColor([ledArrayString[2], ledArrayString[1], ledArrayString[0], ledArrayString[3], ledArrayString[4]]);
    }
}

function sendLEDCaseColor(colorArray) {
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

function readCustomEQ(payload) {
    if (modelBase !== "B181") {
        var level = [];
        for (var i = 0; i < 3; i++) {
            var array = [];
            for (var j = 0; j < 4; j++) {
                array.push(payload[6 + (i * 13) + j]);
            }
            level.push(fromFormatFloatForEQ(array));
        }
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
    } else if (modelBase === "B170" || modelBase === "B164" || modelBase === "B175" || modelBase === "B186" || modelBase === "B192") {
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

function readFirmware(payload) {
    firmwareVersion = "";
    for (let i = 0; i < payload.length; i++) {
        firmwareVersion += String.fromCharCode(payload[i]);
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
        
        firmwareConfig = jsonData;
        
        // Find matching model configuration
        let configID = modelConfigID || modelBase;
        modelSpecs = firmwareConfig.find(config => config.id === configID);
        if (!modelSpecs && configID !== modelBase) {
            console.warn(`No configuration found for ${configID}, falling back to ${modelBase}`);
            configID = modelBase;
            modelSpecs = firmwareConfig.find(config => config.id === configID);
        }

        if (!modelSpecs) {
            console.warn(`No configuration found for model: ${modelBase}`);
            return false;
        }


        // Handle configuration selection
        const configs = modelSpecs.configs;

        if (!Array.isArray(configs) || configs.length === 0) {
            console.warn("No configs array found in model configuration");
            return false;
        }

        // If only one config, use it directly
        if (configs.length === 1) {
            modelSpecs = configs[0];
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
                    modelSpecs = config;
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
        
        return true;

    } catch (error) {
        console.error("Failed to get config for firmware:", error);
        return false;
    }
}


function launchEarFitTest() {
    if (modelBase === "B155" || modelBase === "B171" || modelBase === "B172" || modelBase === "B195" || modelBase === "B162" || modelBase === "B184" || modelBase === "B179" || modelBase === "B197" || modelBase === "B173" || modelBase === "B190") {
        send(61460, [0x01]);
    }
}

function readEarFitTestResult(payload) {
    let LeftearFitTestResult = payload[0];
    let RightearFitTestResult = payload[1];
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

function readInEar(payload) {
    if (modelBase === "B164") {
        return;
    }
    inEarStatus = payload[2];
    setInEarCheckbox(inEarStatus);
}

function readLatency(payload) {
    latencyStatus = payload[0];
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

function readPersonalizedANC(payload) {
    personalizedANCStatus = payload[0];
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
    send(61450, byteArray, "setUTCtime");
}

function sendGetGesture() {
    send(49176, [], "getGesture");
}

function readGesture(payload) {
    var gestureCount = payload[0];

    var gestureArray = [];
    for (var i = 0; i < gestureCount; i++) {
        var gesture = {};
        gesture["gestureDevice"] = payload[1 + i * 4];
        gesture["gestureCommon"] = payload[2 + i * 4];
        gesture["gestureType"] = payload[3 + i * 4];
        gesture["gestureAction"] = payload[4 + i * 4];
        gestureArray.push(gesture);
    }
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

function readDualEnable(payload) {
    dualConnectEnabled = payload[0] === 1;
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

function readDualList(payload) {
    if (payload.length < 3) {
        return;
    }
    let deviceCount = payload[2];
    let offset = 3;
    let addedNewDevice = false;
    for (let i = 0; i < deviceCount; i++) {
        if (offset + 8 > payload.length) {
            break;
        }
        let flags = payload[offset];
        let isSelf = (flags & 0xf0) !== 0;
        let isConnected = (flags & 0x0f) !== 0;
        let macBytes = payload.slice(offset + 1, offset + 7);
        let mac = macStringFromBytes(macBytes);
        let nameLength = payload[offset + 7] & 0x7f;
        let nameBytes = payload.slice(offset + 8, offset + 8 + nameLength);
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

function readDualDeviceEvent(payload) {
    if (payload.length < 8) {
        return;
    }
    let isConnected = payload[0] === 1;
    let macBytes = payload.slice(1, 7);
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

function readHighQualityAudio(payload) {
    let index = payload.length > 0 ? payload[0] : 0;
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

function readSpatialAudio(payload) {
    let mode = payload.length > 0 ? payload[0] : 0;
    let head = payload.length > 1 ? payload[1] : 0;
    currentSpatialAudioMode = spatialAudioIndexFromWire(mode, head);
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

function readAudiodoSpatialPush(payload) {
    if (!(modelSpecs && modelSpecs.useAudiodoSpatial) || payload.length < 2) {
        return;
    }
    let status = payload[0];
    let mode = payload[1];
    let statusName = AUDIODO_SPATIAL_STATUS_NAMES[status] || "Off";
    let scene = statusName !== "Off" ? (AUDIODO_SPATIAL_SCENE_NAMES[mode] || "unknown scene") : null;
}

function setSpatialAudio_BT(index) {
    currentSpatialAudioMode = index;
    let entry = SPATIAL_AUDIO_MODES[index];
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

function readMimiEnable(payload) {
    personalSoundProfileEnabled = payload.length > 0 && payload[0] === 1;
    if (typeof setPersonalSoundProfileCheckbox === "function") {
        setPersonalSoundProfileCheckbox(personalSoundProfileEnabled);
    }
}

function readAudiodoProfileOn(payload) {
    personalSoundProfileEnabled = payload.length > 0 && payload[0] === 1;
    if (typeof setPersonalSoundProfileCheckbox === "function") {
        setPersonalSoundProfileCheckbox(personalSoundProfileEnabled);
    }
}

function readAudiodoStatusPush(payload) {
    if (personalSoundProfileBackend() !== "audiodo") {
        return;
    }
    personalSoundProfileEnabled = payload.length > 0 && payload[0] === 1;
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

function readSuperMicEnable(payload) {
    superMicEnabled = payload.length > 0 && payload[0] === 1;
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

function readCallTransparencyEnable(payload) {
    callTransparencyEnabled = payload.length > 0 && payload[0] === 1;
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

function readWalkieTalkieMode(payload) {
    walkieTalkieModeEnabled = payload.length > 0 && payload[0] === 1;
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

function readLongPowerMode(payload) {
    longPowerModeEnabled = payload.length > 0 && payload[0] === 1;
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

function readAntiLeakageMode(payload) {
    if (payload.length > 0) {
        currentAntiLeakageMode = payload[0];
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

function readMicMode(payload) {
    if (payload.length > 0 && typeof micModeOptions !== "undefined" && micModeOptions) {
        currentMicMode = payload[0];
        if (typeof renderMicModeRow === "function") {
            renderMicModeRow();
        }
    }
}
