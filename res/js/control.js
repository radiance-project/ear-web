
async function getDevicesJS() {
    let n = await eel.getDevices()();
    document.getElementById('list').innerText = n;
}

function updateBattery(leftText, caseText, rightText) {
    const containerLeft = document.getElementById('container-left');
    const containerCase = document.getElementById('container-case');
    const containerRight = document.getElementById('container-right');
    const batteryLeft = document.getElementById('battery-left');
    const batteryCase = document.getElementById('battery-case');
    const batteryRight = document.getElementById('battery-right');

    // hide/show containers based on the text
    containerLeft.style.display = leftText === 'DISCONNECTED' ? 'none' : 'block';
    containerCase.style.display = caseText === 'DISCONNECTED' ? 'none' : 'block';
    containerRight.style.display = rightText === 'DISCONNECTED' ? 'none' : 'block';

    // set the battery text
    batteryLeft.innerText = leftText;
    batteryCase.innerText = caseText;
    batteryRight.innerText = rightText;
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
            base: "B181",
            leftImg: "../assets/ear_one_white_left.png",
            caseImg: "../assets/ear_one_white_case.png",
            rightImg: "../assets/ear_one_white_right.png",
            duoImg: "../assets/ear_one_white_duo.png",
            isANC: true
        },
        "ear_1_black": {
            name: "Nothing Ear (1)",
            base: "B181",
            leftImg: "../assets/ear_one_black_left.png",
            caseImg: "../assets/ear_one_black_case.png",
            rightImg: "../assets/ear_one_black_right.png",
            duoImg: "../assets/ear_one_black_duo.png",
            isANC: true
        },
        "ear_stick": {
            name: "Nothing Ear (stick)",
            base: "B157",
            leftImg: "../assets/ear_stick_left.png",
            caseImg: "../assets/ear_stick_case_none.png",
            rightImg: "../assets/ear_stick_right.png",
            duoImg: "../assets/ear_stick_white_duo.png",
            isANC: false
        },
        "ear_2_white": {
            name: "Nothing Ear (2)",
            base: "B155",
            leftImg: "../assets/ear_two_white_left.png",
            caseImg: "../assets/ear_two_white_case.png",
            rightImg: "../assets/ear_two_white_right.png",
            duoImg: "../assets/ear_two_white_duo.png",
            isANC: true
        },
        "ear_2_black": {
            name: "Nothing Ear (2)",
            base: "B155",
            leftImg: "../assets/ear_two_black_left.png",
            caseImg: "../assets/ear_two_black_case.png",
            rightImg: "../assets/ear_two_black_right.png",
            duoImg: "../assets/ear_two_black_duo.png",
            isANC: true
        },
        "corsola_orange": {
            name: "CMF Buds Pro",
            base: "B163",
            leftImg: "../assets/ear_corsola_orange_left.png",
            caseImg: "../assets/ear_corsola_orange_case.png",
            rightImg: "../assets/ear_corsola_orange_right.png",
            duoImg: "",
            isANC: true
        },
        "corsola_black": {
            name: "CMF Buds Pro",
            base: "B163",
            leftImg: "../assets/ear_corsola_black_left.png",
            caseImg: "../assets/ear_corsola_black_case.png",
            rightImg: "../assets/ear_corsola_black_right.png",
            duoImg: "",
            isANC: true
        },
        "corsola_white": {
            name: "CMF Buds Pro",
            base: "B163",
            leftImg: "../assets/ear_corsola_white_left.png",
            caseImg: "../assets/ear_corsola_white_case.png",
            rightImg: "../assets/ear_corsola_white_right.png",
            duoImg: "",
            isANC: true
        },
        "entei_black": {
            name: "Nothing Ear",
            base: "B171",
            leftImg: "../assets/ear_twos_black_left.png",
            caseImg: "../assets/ear_twos_black_case.png",
            rightImg: "../assets/ear_twos_black_right.png",
            duoImg: "",
            isANC: true
        },
        "entei_white": {
            name: "Nothing Ear",
            base: "B171",
            leftImg: "../assets/ear_twos_white_left.png",
            caseImg: "../assets/ear_twos_white_case.png",
            rightImg: "../assets/ear_twos_white_right.png",
            duoImg: "",
            isANC: true
        },
        "cleffa_black": {
            name: "Nothing Ear (a)",
            base: "B162",
            leftImg: "../assets/ear_color_black_left.png",
            caseImg: "../assets/ear_color_black_case.png",
            rightImg: "../assets/ear_color_black_right.png",
            duoImg: "",
            isANC: true
        },
        "cleffa_white": {
            name: "Nothing Ear (a)",
            base: "B162",
            leftImg: "../assets/ear_color_white_left.png",
            caseImg: "../assets/ear_color_white_case.png",
            rightImg: "../assets/ear_color_white_right.png",
            duoImg: "",
            isANC: true
        },
        "cleffa_yellow": {
            name: "Nothing Ear (a)",
            base: "B162",
            leftImg: "../assets/ear_color_yellow_left.png",
            caseImg: "../assets/ear_color_yellow_case.png",
            rightImg: "../assets/ear_color_yellow_right.png",
            duoImg: "",
            isANC: true
        },
        "crobat_orange": {
            name: "CMF Neckband Pro",
            base: "B164",
            leftImg: "",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_orange.png",
            isANC: true
        },
        "crobat_white": {
            name: "CMF Neckband Pro",
            base: "B164",
            leftImg: "",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_white.png",
            isANC: true
        },
        "crobat_black": {
            name: "CMF Neckband Pro",
            base: "B164",
            leftImg: "",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_black.png",
            isANC: true
        },
        "donphan_black": {
            name: "CMF Buds",
            base: "B168",
            leftImg: "donphan_black_left.png",
            caseImg: "donphan_black_case.png",
            rightImg: "donphan_black_right.png",
            duoImg: "",
            isANC: true
        },
        "donphan_white": {
            name: "CMF Buds",
            base: "B168",
            leftImg: "donphan_white_left.png",
            caseImg: "donphan_white_case.png",
            rightImg: "donphan_white_right.png",
            duoImg: "",
            isANC: true
        },
        "donphan_orange": {
            name: "CMF Buds",
            base: "B168",
            leftImg: "donphan_orange_left.png",
            caseImg: "donphan_orange_case.png",
            rightImg: "donphan_orange_right.png",
            duoImg: "",
            isANC: true
        },
        "espeon_black": {
            name: "CMF Buds Pro 2",
            base: "B172",
            leftImg: "../assets/espeon_black_left.png",
            caseImg: "../assets/espeon_black_case.png",
            rightImg: "../assets/espeon_black_right.png",
            duoImg: "",
            isANC: true
        },
        "espeon_white": {
            name: "CMF Buds Pro 2",
            base: "B172",
            leftImg: "../assets/espeon_white_left.png",
            caseImg: "../assets/espeon_white_case.png",
            rightImg: "../assets/espeon_white_right.png",
            duoImg: "",
            isANC: true
        },
        "espeon_orange": {
            name: "CMF Buds Pro 2",
            base: "B172",
            leftImg: "../assets/espeon_orange_left.png",
            caseImg: "../assets/espeon_orange_case.png",
            rightImg: "../assets/espeon_orange_right.png",
            duoImg: "",
            isANC: true
        },
        "espeon_blue": {
            name: "CMF Buds Pro 2",
            base: "B172",
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


function getImageForModel(modelID) {
    var modelInfo = getModelInfo(modelID);
    return modelInfo.rightImg;
}

async function updateBudsInfo(imageOnly=false) {
    //get sku from local storage

    var modelID = localStorage.getItem("sku");
    var modelInfo = getModelFromSKU(modelID);
    var leftBudImg = document.querySelector("#left_ear_peace");
    var caseImg = document.querySelector("#case-img");
    var rightBudImg = document.querySelector("#right_ear_peace");
    
    leftBudImg.src = modelInfo.leftImg;
    if (caseImg != null) {
        caseImg.src = modelInfo.caseImg;
    }
    rightBudImg.src = modelInfo.rightImg;

    if (!imageOnly) {
        var portsOpened = await navigator.serial.getPorts();
        for (const port of portsOpened) {
            console.log(port.getInfo());
            if (port.getInfo().bluetoothServiceClassId == "aeac4a03-dff5-498f-843a-34487cf133eb") {
                //port.open({ baudRate: 9600 });
                connectSPP(port);
                return;
            }
        }
    }
}

function getModelInfo(modelID) {
    var models = {
        "31d53d": {
            name: "Nothing Ear (1)",
            leftImg: "../assets/ear_one_white_left.png",
            caseImg: "../assets/ear_one_white_case.png",
            rightImg: "../assets/ear_one_white_right.png",
            duoImg: "../assets/ear_one_white_duo.png",
            isANC: true
        },
        "624011": {
            name: "Nothing Ear (1)",
            leftImg: "../assets/ear_one_black_left.png",
            caseImg: "../assets/ear_one_black_case.png",
            rightImg: "../assets/ear_one_black_right.png",
            duoImg: "../assets/ear_one_black_duo.png",
            isANC: true
        },
        "1016dd": {
            name: "Nothing Ear (stick)",
            leftImg: "../assets/ear_stick_left.png",
            caseImg: "../assets/ear_stick_case_none.png",
            rightImg: "../assets/ear_stick_right.png",
            duoImg: "../assets/ear_stick_white_duo.png",
            isANC: false
        },
        "dee8c0": {
            name: "Nothing Ear (2)",
            leftImg: "../assets/ear_two_white_left.png",
            caseImg: "../assets/ear_two_white_case.png",
            rightImg: "../assets/ear_two_white_right.png",
            duoImg: "../assets/ear_two_white_duo.png",
            isANC: true
        },
        "acc520": {
            name: "Nothing Ear (2)",
            leftImg: "../assets/ear_two_black_left.png",
            caseImg: "../assets/ear_two_black_case.png",
            rightImg: "../assets/ear_two_black_right.png",
            duoImg: "../assets/ear_two_black_duo.png",
            isANC: true
        },
        "5f8f82": {
            name: "CMF Buds Pro",
            leftImg: "../assets/ear_corsola_orange_left.png",
            caseImg: "../assets/ear_corsola_orange_case.png",
            rightImg: "../assets/ear_corsola_orange_right.png",
            duoImg: "",
            isANC: true
        },
        "add2c4": {
            name: "CMF Buds Pro",
            leftImg: "../assets/ear_corsola_black_left.png",
            caseImg: "../assets/ear_corsola_black_case.png",
            rightImg: "../assets/ear_corsola_black_right.png",
            duoImg: "",
            isANC: true
        },
        "2eb1ca": {
            name: "CMF Buds Pro",
            leftImg: "../assets/ear_corsola_white_left.png",
            caseImg: "../assets/ear_corsola_white_case.png",
            rightImg: "../assets/ear_corsola_white_right.png",
            duoImg: "",
            isANC: true
        },
        "a20444": {
            name: "Nothing Ear",
            leftImg: "../assets/ear_twos_black_left.png",
            caseImg: "../assets/ear_twos_black_case.png",
            rightImg: "../assets/ear_twos_black_right.png",
            duoImg: "",
            isANC: true
        },
        "feb1c7": {
            name: "Nothing Ear",
            leftImg: "../assets/ear_twos_white_left.png",
            caseImg: "../assets/ear_twos_white_case.png",
            rightImg: "../assets/ear_twos_white_right.png",
            duoImg: "",
            isANC: true
        }
    };
    return models[modelID];
}

function getDevicesForList(devices) {
    var list = document.querySelector("#device_container");
    for (var i = 0; i < devices.length; i++) {
        var container = document.createElement("div");
        container.id = "device_container_child";
        container.className = "inline-grid p-2 pl-5 pr-5 cursor-pointer border-[1px] border-black rounded-xl mt-2 hover:scale-[105%] duration-200 ease-in-out";
        container.style.display = "inline-grid";
        container.style.width = "280px";
        container.style.gridTemplateColumns = "auto auto";
        var image = getImageForModel(devices[i][3]);
        var name = getModelInfo(devices[i][3]).name;
        var mac = devices[i][1];
        container.setAttribute("onclick", `loadDevicePage('${mac}')`);
        container.innerHTML = `
            <img src="${image}" alt="" id="device_image" class="h-12 w-fit">
            <section class="mt-3 ml-5">${name}</section>
        `;
        list.appendChild(container);
    }
}

function setFirmwareText(firmware_text) {
    document.getElementById("settings_subtitle_firmware").innerHTML = firmware_text;
    var firmware = firmware_text.split(".");
    if (firmware[2] == "2") {
        displayANC(true);
    }
    else {
        displayANC(false);
    }
}

function setMacAdressText(mac_adress_text) {
    document.getElementById("settings_subtitle_mac").innerHTML = mac_adress_text;
}

function setInEarCheckbox(status) {
    if (status == 1) {
        document.getElementById("in_ear").checked = true;
    } else {
        document.getElementById("in_ear").checked = false;
    }
}

function setInEar() {
    if (document.getElementById("in_ear").checked) {
        setInEar_BT(1);
    } else {
        setInEar_BT(0);
    }
}

//set latency mode check 
function setLatencyModeCheckbox(status) {
    if (status == 1) {
        document.getElementById("low_latency").checked = true;
    } else if (status == 2) {
        document.getElementById("low_latency").checked = false;
    }
}

//set latency mode
function setLatencyMode() {
    if (document.getElementById("low_latency").checked) {
        setLatency(1);
    } else {
        setLatency(0);
    }
}

function connectDeviceFromList(mac) {
    eel.stopReceivingData();
    eel.connectToDevice(mac);
}

function showErrorPopup(message) {
    // Get the error popup container and message element
    var errorPopupContainer = document.querySelector(".error-popup-container");
    var errorPopupMessage = document.querySelector(".error-popup-message");

    // Set the message text
    errorPopupMessage.textContent = message;

    // Show the error popup container
    errorPopupContainer.style.bottom = "0"; /* Show the error popup */

    // Hide the error popup after 10 seconds
    setTimeout(function () {
        errorPopupContainer.style.bottom = "-70px"; /* Hide the error popup */
    }, 10000);
}

/*async function switchViewFromModelID(modelID) {
    if (modelID == "31d53d" || modelID == "624011") {
        window.location.href = "MainControl_one.html?modelID=" + modelID;
    } else if (modelID == "1016dd") {
        window.location.href = "MainControl_sticks.html?modelID=" + modelID;
    } else if (modelID == "dee8c0" || modelID == "acc520") {
        window.location.href = "MainControl_two.html?modelID=" + modelID;
    } else if (modelID == "5f8f82" || modelID == "add2c4" || modelID == "2eb1ca") {
        window.location.href = "MainControl_corsola.html?modelID=" + modelID;
    }
}*/

function toggleConnectionOverlay(show, model, isTray) {
    var tray;
    var bigWindow;
    console.log("toggleConnectionOverlay");

  
    width = window.screen.width;
    height = window.screen.height - 40;
    if (show) {
        window.ipcRenderer.send('tray-resize', 2, 650, 300);
        window.ipcRenderer.send('tray-position', 2, width - 650, height - 300);
        window.ipcRenderer.send('load-url', 1, 'http://localhost:17079/MainControl/MainControl_nothing_connected.html');
        window.ipcRenderer.send('load-url', 2, 'http://localhost:17079/tray/nothing_connected.html');
    } else {
        if (model == "31d53d" || model == "624011") {
            window.ipcRenderer.send('tray-resize', 2, 650, 300);
            window.ipcRenderer.send('tray-position', 2, width - 650, height - 300);
            window.ipcRenderer.send('load-url', 1, 'http://localhost:17079/MainControl/MainControl_one.html');
            window.ipcRenderer.send('load-url', 2, 'http://localhost:17079/tray/one.html');
        } else if (model == "1016dd") {
            window.ipcRenderer.send('tray-resize', 2, 300, 300);
            window.ipcRenderer.send('tray-position', 2, width - 300, height - 300);
            window.ipcRenderer.send('load-url', 1, 'http://localhost:17079/MainControl/MainControl_sticks.html');
            window.ipcRenderer.send('load-url', 2, 'http://localhost:17079/tray/sticks.html');
        } else if (model == "dee8c0") {
            window.ipcRenderer.send('tray-resize', 2, 650, 300);
            window.ipcRenderer.send('tray-position', 2, width - 650, height - 300);
            window.ipcRenderer.send('load-url', 1, 'http://localhost:17079/MainControl/MainControl_two.html');
            window.ipcRenderer.send('load-url', 2, 'http://localhost:17079/tray/two.html');
        } else if (model == "acc520") {
            window.ipcRenderer.send('tray-resize', 2, 650, 300);
            window.ipcRenderer.send('tray-position', 2, width - 650, height - 300);
            window.ipcRenderer.send('load-url', 1, 'http://localhost:17079/MainControl/MainControl_two.html');
            window.ipcRenderer.send('load-url', 2, 'http://localhost:17079/tray/two.html');
        }
    }
}

function closeElectronInstance() {
    window.ipcRenderer.send('close-app');
}

function getANCStatus() {
    const options = document.querySelectorAll('.anc-option');
    const switchIndicator = document.querySelector('.switch-indicator');
    let level = 0;
    //get selected option id in options, check classList for selected
    let selectedOption;
    options.forEach(option => {
        if (option.classList.contains('selected')) {
            selectedOption = option.id;
        }
    });
    let switchStatus = switchIndicator.classList.contains('high');
    if (selectedOption === "anc-off") {
        level = 1;
    } else if (selectedOption === "anc-transparent") {
        level = 2;
    } else if (selectedOption === "anc-on") {
        if (switchStatus) {
            level = 4;
        } else {
            level = 3;
        }
    }
    return level;
}

function setANCStatus(status) {
    if (status === 1) {
        setAncToOff();
    } else if (status === 2) {
        setAncToTransparent();
    } else if (status === 3) {
        setAncToNC();
        setAncStrengthLow();
    } else if (status === 4) {
        setAncToNC();
        setAncStrengthHigh();
    } else if (status === 5) {
        setAncToNC();
        setAncStrengthMid();
    } else if (status === 6) {
        setAncToNC();
        setAncStrengthAdaptive();
    }
}
