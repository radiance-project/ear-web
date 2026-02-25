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

function getModelFromFastpair(fastpairID) {

    var models = {
        "31D53D": {
            name: "Nothing Ear (1)",
            base: "B181",
            leftImg: "../assets/ear_one_white_left.webp",
            caseImg: "../assets/ear_one_white_case.webp",
            rightImg: "../assets/ear_one_white_right.webp",
            duoImg: "../assets/ear_one_white_duo.webp",
            isANC: true
        },
        "624011": {
            name: "Nothing Ear (1)",
            base: "B181",
            leftImg: "../assets/ear_one_black_left.webp",
            caseImg: "../assets/ear_one_black_case.webp",
            rightImg: "../assets/ear_one_black_right.webp",
            duoImg: "../assets/ear_one_black_duo.webp",
            isANC: true
        },
        "1016DD": {
            name: "Nothing Ear (stick)",
            base: "B157",
            leftImg: "../assets/ear_stick_left.webp",
            caseImg: "../assets/ear_stick_case_none.webp",
            rightImg: "../assets/ear_stick_right.webp",
            duoImg: "../assets/ear_stick_white_duo.webp",
            isANC: false
        },
        "DEE8C0": {
            name: "Nothing Ear (2)",
            base: "B155",
            leftImg: "../assets/ear_two_white_left.webp",
            caseImg: "../assets/ear_two_white_case.webp",
            rightImg: "../assets/ear_two_white_right.webp",
            duoImg: "../assets/ear_two_white_duo.webp",
            isANC: true
        },
        "ACC520": {
            name: "Nothing Ear (2)",
            base: "B155",
            leftImg: "../assets/ear_two_black_left.webp",
            caseImg: "../assets/ear_two_black_case.webp",
            rightImg: "../assets/ear_two_black_right.webp",
            duoImg: "../assets/ear_two_black_duo.webp",
            isANC: true
        },
        "5F8F82": {
            name: "CMF Buds Pro",
            base: "B163",
            leftImg: "../assets/ear_corsola_orange_left.webp",
            caseImg: "../assets/ear_corsola_orange_case.webp",
            rightImg: "../assets/ear_corsola_orange_right.webp",
            duoImg: "",
            isANC: true
        },
        "ADD2C4": {
            name: "CMF Buds Pro",
            base: "B163",
            leftImg: "../assets/ear_corsola_black_left.webp",
            caseImg: "../assets/ear_corsola_black_case.webp",
            rightImg: "../assets/ear_corsola_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "2EB1CA": {
            name: "CMF Buds Pro",
            base: "B163",
            leftImg: "../assets/ear_corsola_white_left.webp",
            caseImg: "../assets/ear_corsola_white_case.webp",
            rightImg: "../assets/ear_corsola_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "A20444": {
            name: "Nothing Ear",
            base: "B171",
            leftImg: "../assets/ear_twos_black_left.webp",
            caseImg: "../assets/ear_twos_black_case.webp",
            rightImg: "../assets/ear_twos_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "FEB1C7": {
            name: "Nothing Ear",
            base: "B171",
            leftImg: "../assets/ear_twos_white_left.webp",
            caseImg: "../assets/ear_twos_white_case.webp",
            rightImg: "../assets/ear_twos_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "03464E": {
            name: "Nothing Ear (a)",
            base: "B162",
            leftImg: "../assets/ear_color_black_left.webp",
            caseImg: "../assets/ear_color_black_case.webp",
            rightImg: "../assets/ear_color_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "5E3FBC": {
            name: "Nothing Ear (a)",
            base: "B162",
            leftImg: "../assets/ear_color_white_left.webp",
            caseImg: "../assets/ear_color_white_case.webp",
            rightImg: "../assets/ear_color_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "8B6380": {
            name: "Nothing Ear (a)",
            base: "B162",
            leftImg: "../assets/ear_color_yellow_left.webp",
            caseImg: "../assets/ear_color_yellow_case.webp",
            rightImg: "../assets/ear_color_yellow_right.webp",
            duoImg: "",
            isANC: true
        },
        "4DFC4A": {
            name: "CMF Neckband Pro",
            base: "B164",
            leftImg: "../assets/crobat_orange.webp",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_orange.webp",
            isANC: true
        },
        "26C190": {
            name: "CMF Neckband Pro",
            base: "B164",
            leftImg: "../assets/crobat_white.webp",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_white.webp",
            isANC: true
        },
        "AE35FD": {
            name: "CMF Neckband Pro",
            base: "B164",
            leftImg: "../assets/crobat_black.webp",
            caseImg: "",
            rightImg: "",
            duoImg: "../assets/crobat_black.webp",
            isANC: true
        },
        "150A27": {
            name: "CMF Buds",
            base: "B168",
            leftImg: "../assets/donphan_black_left.webp",
            caseImg: "../assets/donphan_black_case.webp",
            rightImg: "../assets/donphan_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "ACCE54": {
            name: "CMF Buds",
            base: "B168",
            leftImg: "../assets/donphan_white_left.webp",
            caseImg: "../assets/donphan_white_case.webp",
            rightImg: "../assets/donphan_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "D35E18": {
            name: "CMF Buds",
            base: "B168",
            leftImg: "../assets/donphan_orange_left.webp",
            caseImg: "../assets/donphan_orange_case.webp",
            rightImg: "../assets/donphan_orange_right.webp",
            duoImg: "",
            isANC: true
        },
        "F29566": {
            name: "CMF Buds Pro 2",
            base: "B172",
            leftImg: "../assets/espeon_black_left.webp",
            caseImg: "../assets/espeon_black_case.webp",
            rightImg: "../assets/espeon_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "CA36A6": {
            name: "CMF Buds Pro 2",
            base: "B172",
            leftImg: "../assets/espeon_white_left.webp",
            caseImg: "../assets/espeon_white_case.webp",
            rightImg: "../assets/espeon_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "A7B220": {
            name: "CMF Buds Pro 2",
            base: "B172",
            leftImg: "../assets/espeon_orange_left.webp",
            caseImg: "../assets/espeon_orange_case.webp",
            rightImg: "../assets/espeon_orange_right.webp",
            duoImg: "",
            isANC: true
        },
        "2B353E": {
            name: "CMF Buds Pro 2",
            base: "B172",
            leftImg: "../assets/espeon_blue_left.webp",
            caseImg: "../assets/espeon_blue_case.webp",
            rightImg: "../assets/espeon_blue_right.webp",
            duoImg: "",
            isANC: true
        },
        "FC3AAF": {
            name: "Nothing Ear (open)",
            base: "B174",
            leftImg: "../assets/flaffy_white_left.webp",
            caseImg: "../assets/flaffy_white_case.webp",
            rightImg: "../assets/flaffy_white_right.webp",
            duoImg: "",
            isANC: false
        },
        "4AEB6E": {
            name: "CMF Buds 2 Plus",
            base: "B184",
            leftImg: "../assets/b184_white_left.webp",
            caseImg: "../assets/b184_white_case.webp",
            rightImg: "../assets/b184_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "5C587F": {
            name: "CMF Buds 2 Plus",
            base: "B184",
            leftImg: "../assets/b184_blue_left.webp",
            caseImg: "../assets/b184_blue_case.webp",
            rightImg: "../assets/b184_blue_right.webp",
            duoImg: "",
            isANC: true
        },
        "19EF24": {
            name: "CMF Buds 2",
            base: "B179",
            leftImg: "../assets/b179_black_left.webp",
            caseImg: "../assets/b179_black_case.webp",
            rightImg: "../assets/b179_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "FF2AB0": {
            name: "CMF Buds 2",
            base: "B179",
            leftImg: "../assets/b179_green_left.webp",
            caseImg: "../assets/b179_green_case.webp",
            rightImg: "../assets/b179_green_right.webp",
            duoImg: "",
            isANC: true
        },
        "D9AB5D": {
            name: "CMF Buds 2",
            base: "B179",
            leftImg: "../assets/b179_orange_left.webp",
            caseImg: "../assets/b179_orange_case.webp",
            rightImg: "../assets/b179_orange_right.webp",
            duoImg: "",
            isANC: true
        },
        "70F8E3": {
            name: "CMF Buds 2a",
            base: "B185",
            leftImg: "../assets/b185_black_left.webp",
            caseImg: "../assets/b185_black_case.webp",
            rightImg: "../assets/b185_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "ED5412": {
            name: "CMF Buds 2a",
            base: "B185",
            leftImg: "../assets/b185_white_left.webp",
            caseImg: "../assets/b185_white_case.webp",
            rightImg: "../assets/b185_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "509CAE": {
            name: "CMF Buds 2a",
            base: "B185",
            leftImg: "../assets/b185_orange_left.webp",
            caseImg: "../assets/b185_orange_case.webp",
            rightImg: "../assets/b185_orange_right.webp",
            duoImg: "",
            isANC: true
        },
        "C19ECD": {
            name: "Nothing Headphone (1)",
            base: "B170",
            leftImg: "../assets/b170_black_left.webp",
            caseImg: "",
            rightImg: "",
            duoImg: "",
            isANC: true
        },
        "2D6FDA": {
            name: "Nothing Headphone (1)",
            base: "B170",
            leftImg: "../assets/b170_grey_left.webp",
            caseImg: "",
            rightImg: "",
            duoImg: "",
            isANC: true
        },
        "C34F3B": {
            name: "Nothing Ear (a)",
            base: "B162",
            altBase: "B183",
            leftImg: "../assets/ear_color_black_left.webp",
            caseImg: "../assets/ear_color_black_case.webp",
            rightImg: "../assets/ear_color_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "404D6D": {
            name: "Nothing Ear (a)",
            base: "B162",
            altBase: "B183",
            leftImg: "../assets/ear_color_white_left.webp",
            caseImg: "../assets/ear_color_white_case.webp",
            rightImg: "../assets/ear_color_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "839E9A": {
            name: "Nothing Ear (a)",
            base: "B162",
            altBase: "B183",
            leftImg: "../assets/ear_color_yellow_left.webp",
            caseImg: "../assets/ear_color_yellow_case.webp",
            rightImg: "../assets/ear_color_yellow_right.webp",
            duoImg: "",
            isANC: true
        },
        "2F45F5": {
            name: "CMF Buds Pro 2",
            base: "B172",
            altBase: "B187",
            leftImg: "../assets/espeon_black_left.webp",
            caseImg: "../assets/espeon_black_case.webp",
            rightImg: "../assets/espeon_black_right.webp",
            duoImg: "",
            isANC: true
        },
        "E1BE45": {
            name: "CMF Buds Pro 2",
            base: "B172",
            altBase: "B187",
            leftImg: "../assets/espeon_white_left.webp",
            caseImg: "../assets/espeon_white_case.webp",
            rightImg: "../assets/espeon_white_right.webp",
            duoImg: "",
            isANC: true
        },
        "1253C0": {
            name: "CMF Buds Pro 2",
            base: "B172",
            altBase: "B187",
            leftImg: "../assets/espeon_orange_left.webp",
            caseImg: "../assets/espeon_orange_case.webp",
            rightImg: "../assets/espeon_orange_right.webp",
            duoImg: "",
            isANC: true
        },
        "0F1A4F": {
            name: "CMF Buds Pro 2",
            base: "B172",
            altBase: "B187",
            leftImg: "../assets/espeon_blue_left.webp",
            caseImg: "../assets/espeon_blue_case.webp",
            rightImg: "../assets/espeon_blue_right.webp",
            duoImg: "",
            isANC: true
        },
    };

    return models[fastpairID];
}

function getImageForModel(modelID) {
    var modelInfo = getModelInfo(modelID);
    return modelInfo.rightImg;
}

async function updateBudsInfo(imageOnly=false, isHeadphone=false) {
    //get sku from local storage
    var modelID = localStorage.getItem("sku");
    var modelInfo = localStorage.getItem("model");
    if (modelInfo) {
        modelInfo = JSON.parse(modelInfo);
    }
    else {
        return;
    }
    var leftBudImg = document.querySelector("#left_ear_peace");
    if (!isHeadphone) {
        var caseImg = document.querySelector("#case-img");
        var rightBudImg = document.querySelector("#right_ear_peace");
    }
    
    leftBudImg.src = modelInfo.leftImg;
    if (!isHeadphone)
    {
        if (caseImg != null) {
            caseImg.src = modelInfo.caseImg;
        }
        rightBudImg.src = modelInfo.rightImg;
    }

    if (!imageOnly) {
        var portsOpened = await navigator.serial.getPorts();
        for (const port of portsOpened) {
            console.log(port.getInfo());
            if (port.getInfo().bluetoothServiceClassId === "aeac4a03-dff5-498f-843a-34487cf133eb") {
                try {
                    await connectSPP(port);
                    console.log("Connected to Bluetooth device successfully.");
                    return;
                } catch (error) {
                    window.location.href = "index.html";
                }
            }
        }
    }
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
    if (modelBase === "B157") {
        if (firmware[2] == "2") {
            displayANC(true);
        }
        else {
            displayANC(false);
        }
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

function setLatencyModeCheckbox(status) {
    if (status == 1) {
        document.getElementById("low_latency").checked = true;
    } else if (status == 2) {
        document.getElementById("low_latency").checked = false;
    }
}

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
