var SPPsocket = null;

let operationID = 0;
let operationList = {};
async function switchViewFromModelID(modelID) {
    if (modelID == "31d53d" || modelID == "624011") {
        window.location.href = "MainControl_one.html?modelID=" + modelID;
    } else if (modelID == "1016dd") {
        window.location.href = "MainControl_sticks.html?modelID=" + modelID;
    } else if (modelID == "dee8c0" || modelID == "acc520") {
        window.location.href = "MainControl_two.html?modelID=" + modelID;
    } else if (modelID == "5f8f82" || modelID == "add2c4" || modelID == "2eb1ca") {
        window.location.href = "MainControl_corsola.html?modelID=" + modelID;
    } else if (modelID == "a20444" || modelID == "feb1c7") {
        window.location.href = "MainControl_twos.html?modelID=" + modelID;
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
    // Assuming sock is a valid socket object
    var tempSock = SPPsocket.writable.getWriter();
    //byteArray to ArrayBuffer
    byteArray = new Uint8Array(byteArray).buffer;

    tempSock.write(byteArray);
    tempSock.releaseLock();
}
async function requestSerialNumber() {
    send(0xc006);
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
    // Convert hex string to Uint8Array
    const payload = hexStringToUint8Array(hexPayload);

    // Decode the payload
    const E = payload[0]; // Assuming the first byte is the integer 'E'
    const s02 = new TextDecoder().decode(payload.subarray(1, 7)); // Assuming the next 6 bytes are the string 's02'
    const configurations = [];

    // Split the payload into lines (assuming newline character '\n' separates lines)
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

function getModelFromSKU(SKU) {

    var sku_to_model = {
        "01": "ear_1_white",
        "02": "ear_1_black",
        "03": "ear_1_white",
        "04": "ear_1_black",
        "06": "ear_1_black",
        "07": "ear_1_white",
        "08": "ear_1_black",
        "10": "ear_1_black",
        "14": "ear_stick",
        "15": "ear_stick",
        "16": "ear_stick",
        "17": "ear_2_white",
        "18": "ear_2_white",
        "19": "ear_2_white",
        "27": "ear_2_black",
        "28": "ear_2_black",
        "29": "ear_2_black",
        "30": "corsola_dark_grey",
        "31": "corsola_black",
        "32": "corsola_white",
        "33": "corsola_white",
        "34": "corsola_orange",
        "35": "corsola_orange",
        "48": "crobat_orange",
        "49": "crobat_white",
        "50": "crobat_black",
        "51": "crobat_black",
        "52": "crobat_white",
        "53": "crobat_orange",
        "54": "donphan_black",
        "55": "donphan_black",
        "56": "donphan_white",
        "57": "donphan_white",
        "58": "donphan_orqnge",
        "59": "donphan_orange",
        "61": "entei_black",
        "62": "entei_white",
        "63": "cleffa_black",
        "64": "cleffa_white",
        "65": "cleffa_yellow",
        "66": "cleffa_black",
        "67": "cleffa_white",
        "68": "cleffa_yellow",
        "69": "entei_black",
        "70": "entei_white",
        "71": "cleffa_black",
        "72": "cleffa_white",
        "73": "cleffa_yellow",
        "74": "entei_black",
        "75": "entei_white",
        "76": "espeon_black",
        "77": "espeon_white",
        "78": "espeon_orange",
        "79": "espeon_blue",
    }


    var models = {
        "ear_1_white": {
            name: "Nothing Ear (1)",
            leftImg: "../assets/ear_one_white_left.png",
            caseImg: "../assets/ear_one_white_case.png",
            rightImg: "../assets/ear_one_white_right.png",
            duoImg: "../assets/ear_one_white_duo.png",
            isANC: true
        },
        "ear_1_black": {
            name: "Nothing Ear (1)",
            leftImg: "../assets/ear_one_black_left.png",
            caseImg: "../assets/ear_one_black_case.png",
            rightImg: "../assets/ear_one_black_right.png",
            duoImg: "../assets/ear_one_black_duo.png",
            isANC: true
        },
        "ear_stick": {
            name: "Nothing Ear (stick)",
            leftImg: "../assets/ear_stick_left.png",
            caseImg: "../assets/ear_stick_case_none.png",
            rightImg: "../assets/ear_stick_right.png",
            duoImg: "../assets/ear_stick_white_duo.png",
            isANC: false
        },
        "ear_2_white": {
            name: "Nothing Ear (2)",
            leftImg: "../assets/ear_two_white_left.png",
            caseImg: "../assets/ear_two_white_case.png",
            rightImg: "../assets/ear_two_white_right.png",
            duoImg: "../assets/ear_two_white_duo.png",
            isANC: true
        },
        "ear_2_black": {
            name: "Nothing Ear (2)",
            leftImg: "../assets/ear_two_black_left.png",
            caseImg: "../assets/ear_two_black_case.png",
            rightImg: "../assets/ear_two_black_right.png",
            duoImg: "../assets/ear_two_black_duo.png",
            isANC: true
        },
        "corsola_orange": {
            name: "CMF Buds Pro",
            leftImg: "../assets/ear_corsola_orange_left.png",
            caseImg: "../assets/ear_corsola_orange_case.png",
            rightImg: "../assets/ear_corsola_orange_right.png",
            duoImg: "",
            isANC: true
        },
        "corsola_black": {
            name: "CMF Buds Pro",
            leftImg: "../assets/ear_corsola_black_left.png",
            caseImg: "../assets/ear_corsola_black_case.png",
            rightImg: "../assets/ear_corsola_black_right.png",
            duoImg: "",
            isANC: true
        },
        "corsola_white": {
            name: "CMF Buds Pro",
            leftImg: "../assets/ear_corsola_white_left.png",
            caseImg: "../assets/ear_corsola_white_case.png",
            rightImg: "../assets/ear_corsola_white_right.png",
            duoImg: "",
            isANC: true
        },
        "entei_black": {
            name: "Nothing Ear",
            leftImg: "../assets/ear_twos_black_left.png",
            caseImg: "../assets/ear_twos_black_case.png",
            rightImg: "../assets/ear_twos_black_right.png",
            duoImg: "",
            isANC: true
        },
        "entei_white": {
            name: "Nothing Ear",
            leftImg: "../assets/ear_twos_white_left.png",
            caseImg: "../assets/ear_twos_white_case.png",
            rightImg: "../assets/ear_twos_white_right.png",
            duoImg: "",
            isANC: true
        },
        "cleffa_black": {
            name: "Nothing Ear (a)",
            leftImg: "../assets/ear_color_black_left.png",
            caseImg: "../assets/ear_color_black_case.png",
            rightImg: "../assets/ear_color_black_right.png",
            duoImg: "",
            isANC: true
        },
        "cleffa_white": {
            name: "Nothing Ear (a)",
            leftImg: "../assets/ear_color_white_left.png",
            caseImg: "../assets/ear_color_white_case.png",
            rightImg: "../assets/ear_color_white_right.png",
            duoImg: "",
            isANC: true
        },
        "cleffa_yellow": {
            name: "Nothing Ear (a)",
            leftImg: "../assets/ear_color_yellow_left.png",
            caseImg: "../assets/ear_color_yellow_case.png",
            rightImg: "../assets/ear_color_yellow_right.png",
            duoImg: "",
            isANC: true
        },
        "espeon_black": {
            name: "CMF Buds Pro 2",
            leftImg: "../assets/espeon_black_left.png",
            caseImg: "../assets/espeon_black_case.png",
            rightImg: "../assets/espeon_black_right.png",
            duoImg: "",
            isANC: true
        },
        "crobat_orange": {
            name: "CMF Neckband Pro",
            leftImg: "",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_orange.png",
            isANC: true
        },
        "crobat_white": {
            name: "CMF Neckband Pro",
            leftImg: "",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_white.png",
            isANC: true
        },
        "crobat_black": {
            name: "CMF Neckband Pro",
            leftImg: "",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_black.png",
            isANC: true
        },
        "donphan_black": {
            name: "CMF Buds",
            leftImg: "donphan_black_left.png",
            caseImg: "donphan_black_case.png",
            rightImg: "donphan_black_right.png",
            duoImg: "",
            isANC: true
        },
        "donphan_white": {
            name: "CMF Buds",
            leftImg: "donphan_white_left.png",
            caseImg: "donphan_white_case.png",
            rightImg: "donphan_white_right.png",
            duoImg: "",
            isANC: true
        },
        "donphan_orange": {
            name: "CMF Buds",
            leftImg: "donphan_orange_left.png",
            caseImg: "donphan_orange_case.png",
            rightImg: "donphan_orange_right.png",
            duoImg: "",
            isANC: true
        },
        "espeon_white": {
            name: "CMF Buds Pro 2",
            leftImg: "../assets/espeon_white_left.png",
            caseImg: "../assets/espeon_white_case.png",
            rightImg: "../assets/espeon_white_right.png",
            duoImg: "",
            isANC: true
        },
        "espeon_orange": {
            name: "CMF Buds Pro 2",
            leftImg: "../assets/espeon_orange_left.png",
            caseImg: "../assets/espeon_orange_case.png",
            rightImg: "../assets/espeon_orange_right.png",
            duoImg: "",
            isANC: true
        },
        "espeon_blue": {
            name: "CMF Buds Pro 2",
            leftImg: "../assets/espeon_blue_left.png",
            caseImg: "../assets/espeon_blue_case.png",
            rightImg: "../assets/espeon_blue_right.png",
            duoImg: "",
            isANC: true
        },
            
    };
    model = sku_to_model[SKU];
    return models[model];
}

function processSerial(serial) {
    // Get the first 2 characters of the serial number and compare
    let headSerial = serial.substring(0, 2);
    let SKU = ""
    if (headSerial === "MA") {
        document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Device Found</p><p>Serial Number: ' + serial + '</p></div>';
        SKU = "14";
    }
    else if (headSerial === "SH") {
        document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Device Found</p><p>Serial Number: ' + serial + '</p></div>';
        SKU = serial.substring(4, 6);
    }
    else if (headSerial === "13") {
        document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Device Found</p><p>Serial Number: ' + serial + '</p></div>';
        SKU = serial.substring(4, 6);
    }
    else {
        document.getElementById("device_container").innerHTML = '<div class="device-info"><p>Device Not Found</p><p>Serial Number: ' + serial + '</p></div>';
        return;
    }

    let model = getModelFromSKU(SKU);
    console.log(model);

    if (model) {
        document.getElementById("device_container").innerHTML += '<div class="device-info"><p>Model: ' + model.name + '</p></div>';
        if (model.leftImg === "") {
            document.getElementById("device_container").innerHTML += `<div class="image-row">
                    <div class="image-container"><img src="${model.duoImg}" alt="duo" class="responsive-img" /></div>
                   </div>`;
            return;
        }
        else {
            document.getElementById("device_container").innerHTML += `
                <div class="image-row">
                    <div class="image-container"><img src="${model.leftImg}" alt="left_earbud" class="responsive-img" /></div>
                    <div class="image-container"><img src="${model.caseImg}" alt="case" class="responsive-img" /></div>
                    <div class="image-container"><img src="${model.rightImg}" alt="right_earbud" class="responsive-img" /></div>
                </div>`;
        }
    }
}


async function scanNewDevicesSerial() {
    document.getElementById("device_container").innerHTML = '<img src="../assets/loading.svg" alt="loading_animation" class="h-[80px] w-[80px] m-auto" id="loading_animation" />';
    document.getElementById("scan_button").style.display = "none";
    const SPP_UUID = "aeac4a03-dff5-498f-843a-34487cf133eb";
    const FASTPAIR_UUID = "df21fe2c-2515-4fdb-8886-f12c4d67927c";
    sppPort = await navigator.serial.requestPort({
        allowedBluetoothServiceClassIds: [SPP_UUID],
        filters: [{ bluetoothServiceClassId: SPP_UUID }],
    });

    if (sppPort) {
        console.log('connected to a Bluetooth Serial Port Profile port', sppPort.getInfo());
        //print mac address of the connected device
        console.log(sppPort);
        await sppPort.open({ baudRate: 9600 });
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
            if (command === 16390) {
                let serialNum = getSerialNumber(rawData.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''));
                console.log(serialNum);
                processSerial(serialNum);
                //document.getElementById("device_container").innerHTML = '<div class="flex flex-col items-center justify-center"><p class="text-center text-lg font-bold">Device Found</p><p class="text-center text-lg font-bold">Serial Number: ' + serialNum + '</p></div>';
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