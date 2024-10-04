var SPPsocket = null;

let operationID = 0;
let operationList = {};
async function switchViewFromModelID(model, sku) {
    localStorage.setItem("model", JSON.stringify(model));
    localStorage.setItem("sku", sku);
    if (sku === null || sku === "") {
        document.getElementById("scan_button-c").innerText = "Incompatible Device";
        return;
    }
    console.log("Switching view from model ID " + model.base);
    if (model.base == "B181") {
        window.location.href = "MainControl_one";
    } else if (model.base == "B157") {
        window.location.href = "MainControl_sticks";
    } else if (model.base == "B155") {
        window.location.href = "MainControl_two";
    } else if (model.base == "B163") {
        window.location.href = "MainControl_corsola";
    } else if (model.base == "B171") {
        window.location.href = "MainControl_twos";
    } else if (model.base == "B172") {
        window.location.href = "MainControl_espeon";
    } else if (model.base == "B168") {
        window.location.href = "MainControl_donphan";
    } else if (model.base == "B174") {
        window.location.href = "MainControl_flaaffy";
    } else if (model.base == "B162") {
        window.location.href = "MainControl_cleffa";
    } else {
        document.getElementById("scan_button-c").innerText = "Incompatible Device";
    }
}
async function loadDevicePage(device) {
    console.log("Loading device page for " + device);
    connectDeviceFromList(device);   
}

async function scanNewDevices() {
    document.getElementById("device_container").innerHTML = '<img src="../assets/loading.svg" alt="loading_animation" class="h-[80px] w-[80px] m-auto" id="loading_animation" />';
    document.getElementById("scan_button").style.display = "none";
    const SPP_UUID = "aeac4a03-dff5-498f-843a-34487cf133eb";
    const FASTPAIR_UUID = "df21fe2c-2515-4fdb-8886-f12c4d67927c";
    sppPort = await navigator.serial.requestPort({
        allowedBluetoothServiceClassIds: [FASTPAIR_UUID],
        filters: [{ bluetoothServiceClassId: FASTPAIR_UUID }],
    });

    if (sppPort) {
        console.log('connected to a Bluetooth Serial Port Profile port', sppPort.getInfo());
        //print mac address of the connected device
        console.log(sppPort);
        await sppPort.open({ baudRate: 9600 });
        //read from the serial port
        const reader = sppPort.readable.getReader();
        while (true) {
            const { value, done } = await reader.read();
            //console.log(value);
            //print hex string of the received data
            var string = "";
            for (let i = 0; i < value.length; i++) {
                //fill the string with leading zero if needed
                string += (value[i] < 16 ? "0" : "") + value[i].toString(16);
            }
            console.log(string);
            if (done) {
                // Allow the serial port to be closed later.
                reader.releaseLock();
                break;
            }
            console.log(value);
            //if received data is 7 bytes long, disconnect
            if (value.length > 1) {
                reader.releaseLock();
                await sppPort.close();
                var modelID = string.substring(8, 14);
                console.log(modelID);
                switchViewFromModelID(modelID);
                break;
            }
        }
    }
    setTimeout(function(){
        window.location.reload();
    }, 3000);
}
function getCommand(header) {
    console.log("header " + header)
    let commandBytes = new Uint8Array(header.slice(3, 5));
    console.log("commandBytes: " + commandBytes)
    let commandInt = new Uint16Array(commandBytes.buffer)[0];
    console.log("commandInt: " + commandInt);
    return commandInt;
}

function readFirmwareFromData(hexstring) {
    let firmwareVersion = "";
    let hexArray = new Uint8Array(hexstring.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    let size = hexArray[5];
    for (let i = 0; i < size; i++) {
        firmwareVersion += String.fromCharCode(hexArray[8 + i]);
    }
    return firmwareVersion;
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
function send(command, payload = [], operation = "") {
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
    var tempSock = SPPsocket.writable.getWriter();
    byteArray = new Uint8Array(byteArray).buffer;

    tempSock.write(byteArray);
    tempSock.releaseLock();
}
async function requestSerialNumber() {
    send(0xc006);
}

async function requestFirmwareEarOne() {
    send(49218);
}
function hexStringToUint8Array(hexString) {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string");
    }
    const uint8Array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        uint8Array[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return uint8Array;
}

function getSerialNumber(hexPayload) {
    const payload = hexStringToUint8Array(hexPayload);

    // Decode the payload
    const E = payload[0]; 
    const s02 = new TextDecoder().decode(payload.subarray(1, 7)); 
    const configurations = [];

    const lines = new TextDecoder().decode(payload.subarray(7)).split('\n');

    lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length === 3) {
            const device = parseInt(parts[0], 10);
            const type = parseInt(parts[1], 10);
            const value = parts[2];

            if (!isNaN(device) && !isNaN(type) && value) {
                configurations.push({ device, type, value });
            }
        }
    });

    // Filter configurations to find the serial number
    const serialConfigs = configurations.filter(config => config.type === 4 && config.value.length > 0);

    // Return the serial number if found, otherwise return null
    if (serialConfigs.length > 0) {
        return serialConfigs[0].value;
    } else {
        return null;
    }
}

function processSerial(serial) {
    if (serial === null) {
        //could be ear (1)
        requestFirmwareEarOne();
        return;
    }
    let headSerial = serial.substring(0, 2);
    let SKU = ""
    if (serial === "12345678901234567") {
        let modelEarOne = getModelFromSKU("01");
        switchViewFromModelID(modelEarOne, "01");
        return;
    }
    if (headSerial === "MA") {
        //document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Device Found</p><p>Serial Number: ' + serial + '</p></div>';
        let year = serial.substring(6, 8);
        if (year === "22" || year === "23") {
            //Ear (stick)
            SKU = "14";
        } else if (year === "24") {
            //Ear (open) TODO: Find a better way to identify both
            SKU = "11200005";
        }
    }
    else if (headSerial === "SH") {
        //document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Device Found</p><p>Serial Number: ' + serial + '</p></div>';
        SKU = serial.substring(4, 6);
    }
    else if (headSerial === "13") {
        //document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Device Found</p><p>Serial Number: ' + serial + '</p></div>';
        SKU = serial.substring(4, 6);
    }
    else {
        //document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Incompatible Device</p><p>Serial Number: ' + serial + '</p></div>';
        return;
    }
    let model = getModelFromSKU(SKU);
    console.log(model);

    if (model) {
       // document.getElementById("device_container").innerHTML += '<div class="device-info"><p>Model: ' + model.name + '</p></div>';
        if (model.leftImg === "") {
            /*document.getElementById("device_container").innerHTML += `<div class="image-row">
                    <div class="image-container"><img src="${model.duoImg}" alt="duo" class="responsive-img" /></div>
                   </div>`;*/
            return;
        }
        else {
           /* document.getElementById("device_container").innerHTML += `
                <div class="image-row">
                    <div class="image-container"><img src="${model.leftImg}" alt="left_earbud" class="responsive-img" /></div>
                    <div class="image-container"><img src="${model.caseImg}" alt="case" class="responsive-img" /></div>
                    <div class="image-container"><img src="${model.rightImg}" alt="right_earbud" class="responsive-img" /></div>
                </div>`;*/
        }
    }
    switchViewFromModelID(model, SKU);
}


async function scanNewDevicesSerial() {
    const SPP_UUID = "aeac4a03-dff5-498f-843a-34487cf133eb";
    const FASTPAIR_UUID = "df21fe2c-2515-4fdb-8886-f12c4d67927c";
    try {
        sppPort = await navigator.serial.requestPort({
            allowedBluetoothServiceClassIds: [SPP_UUID],
            filters: [{ bluetoothServiceClassId: SPP_UUID }],
        });
    }
    catch (error) {
        console.error('Connection failed', error);
        document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Device not selected</p></div>';
        setTimeout(function () {
            window.location.reload();
        }, 3000);
        return;
    }



    if (sppPort) {
        console.log('connected to a Bluetooth Serial Port Profile port', sppPort.getInfo());
        //print mac address of the connected device
        console.log(sppPort);
        await sppPort.open({ baudRate: 9600 });
        //store sppPort in local storage
        localStorage.setItem("sppPort", sppPort);
        SPPsocket = sppPort;
        //read from the serial port
        const reader = sppPort.readable.getReader();
        requestSerialNumber();
        while (true) {
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
            if (rawData[0] !== 85 || rawData.length < 10) {
                continue;
            }
            //header is 8 bytes long
            let header = rawData.slice(0, 6);
            let command = getCommand(header);
            console.log(command);
            //print rawData hex string
            console.log(string);
            if (command === 16390) {
                let serialNum = getSerialNumber(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
                console.log(serialNum);
                processSerial(serialNum);
                //document.getElementById("device_container").innerHTML = '<div class="flex flex-col items-center justify-center"><p class="text-center text-lg font-bold">Device Found</p><p class="text-center text-lg font-bold">Serial Number: ' + serialNum + '</p></div>';
            }
            if (command === 16450) {
let             firmwareVersion = readFirmwareFromData(string);
                //document.getElementById("device_container").innerHTML += '<div class="device-info"><p>Firmware Version: ' + firmwareVersion + '</p></div>';
                //split the firmware version string with "."
                let firmwareArray = firmwareVersion.split(".");
                if (firmwareArray[1] === "6700") {
                    let modelEarOne = getModelFromSKU("01");
                    switchViewFromModelID(modelEarOne, "01");
                }
            }

            if (done) {
                // Allow the serial port to be closed later.
                reader.releaseLock();
                break;
            }
            console.log(value);
        }
    }
    setTimeout(function () {
        window.location.reload();
    }, 3000);
}