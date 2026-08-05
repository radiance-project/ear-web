var double_pinch = ["Skip Back", "Skip Forward", "Voice Assistant"];
var triple_pinch = ["Skip Back", "Skip Forward", "Voice Assistant"];
var pinch_and_hold = ["Volume UP", "Volume Down", "Voice Assistant", "Noise Control"];
var double_pinch_and_hold = ["No action", "Volume UP", "Volume Down", "Voice Assistant", "Noise Control"];


//---------------------------------------------------------------------------------//

//CURRENTLY SELLECTED BUD ON THE SETTINGS PAGE
var current_side;

var ANC_type = 1;

//VARS FOR GESTURE SETTINGS, OVERWRITING THHESE WITH EEL WILL MAKE THE TEXT APRPEAR IN THE SETTINGS PAGE ON INITIAL LOAD.
//IF YOU CLICK A BUTTON, IT WILL OVERWRITE THIS VARS AGAIN AND YOU CAN READ THE CONTEXT WITH EEL. YOU JUST NEED TO CHECK 
//IF THESE VARS ARE BEEING UPDATED OR NOT. IF THEY ARE, THEN YOU KNOW THAT THE USER HAS CHANGED THE SETTINGS AND YOU CAN
//READ THE CONTEXT FROM THESE VARS. IF THEY ARE NOT, THEN YOU KNOW THAT THE USER HAS NOT CHANGED THE SETTINGS AND YOU CAN
//READ THE CONTEXT FROM THE EEL VARIABLES. (OR YOU PUT YOUR CODE DIRECTY INTO THE FUNCTIIONS DOWN, MADE YOU SOME HINTS WHERE)
//
//IM JUST PICKING THE FIRST ELEMENT OF THE ARRAY TO INITIALIZE THE VARS AND TO DISPLAY SOMETHING OTHER THAN UNDEFINED ON THE
//SETTINGS PAGE ON INITIAL LOAD. YOU NEED TO REPLACE THIS WITH THE STUFF YOU READ FROM THE BUDS.
var left_triple_pinch_current = triple_pinch[0];
var left_pinch_and_hold_current = pinch_and_hold[0];
var right_triple_pinch_current = triple_pinch[0];
var right_pinch_and_hold_current = pinch_and_hold[0];
var right_double_pinch_and_hold_current = double_pinch_and_hold[0];
var left_double_pinch_and_hold_current = double_pinch_and_hold[0];
var right_double_pinch_current = double_pinch[0];
var left_double_pinch_current = double_pinch[0];

//---------------------------------------------------------------------------------//

 leftEarPeace = document.getElementById("left_ear_peace")
 rightEarPeace = document.getElementById("right_ear_peace")

 leftEarBattery = document.getElementById("left_ear_battery")
 rightEarBattery = document.getElementById("right_ear_battery")

 prod_name = document.getElementById("prod_name")
 pages_container = document.getElementById("pages_container")
 settings_icon = document.getElementById("settings_icon")

 ringButton = document.getElementById("ring_button")

var intro_timeout;
var intro_timeout2;


intro_timeout = setTimeout(() => {
    leftEarPeace.style.marginTop = "0px"
    rightEarPeace.style.marginTop = "0px"

    intro_timeout2 = setTimeout(() => {
        leftEarBattery.style.opacity = "100"
        rightEarBattery.style.opacity = "100"
        prod_name.style.opacity = "100"
        pages_container.style.opacity = "100"
        // settings_icon.style.opacity = "100"
    }, 2000)
}, 500)

var GESTURE_TOPOLOGY = {
    sides: ["l", "r"],
    deviceCodes: { l: 2, r: 3 },
    sidePrefixes: { l: "left", r: "right" },
    varPrefix: true,
};

var GESTURE_SLOTS = [
    {
        key: "double_pinch",
        type: "double",
        sendType: 2,
        options: double_pinch,
        actionToIndex: { 8: 0, 9: 1, 11: 2 },
        subtitleId: "settings_subtitle_double",
        loadSuffix: "<br />Decline incoming calls</div>",
        changeSuffix: "<br />Decline incoming call",
    },
    {
        key: "triple_pinch",
        type: "triple",
        sendType: 3,
        options: triple_pinch,
        actionToIndex: { 8: 0, 9: 1, 11: 2 },
        subtitleId: "settings_subtitle_triple",
    },
    {
        key: "pinch_and_hold",
        type: "pinch_and_hold",
        sendType: 7,
        options: pinch_and_hold,
        actionToIndex: { 18: 0, 19: 1, 11: 2, 10: 3 },
        subtitleId: "settings_subtitle_pinch_and_hold",
    },
    {
        key: "double_pinch_and_hold",
        type: "double_pinch_and_hold",
        sendType: 9,
        options: double_pinch_and_hold,
        actionToIndex: { 1: 0, 18: 1, 19: 2, 11: 3, 10: 4 },
        subtitleId: "settings_subtitle_double_pinch_and_hold",
    },
];

function updateGesturesFromArray(records) {
    applyGestureRecords(records, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}

function loadCurrentGestures(side) {
    sendGetGesture();
    current_side = side;
    loadCurrentGesturesGeneric(side, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}

function changeGesture(type) {
    renderGestureChangePopup(type, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}

function setANC(typeANC) {
    switch (typeANC) {
        case 0:
            setAncToNC();
            break;
        case 2:
            setAncToOff();
            break;
        default:
            break;
    }

    let type = 0;
    if (typeANC === 2) type = 1;
    else if (typeANC === 0) type = 4;

    setANCDisplay(type);
    setANC_BT(type);
}

function displayANC(display) {
    if (display == true) {
        switchPage(0, true);
        document.querySelector("#page_selector").style.display = "grid";
    }
    else {
        switchPage(1, true);
        document.querySelector("#page_selector").style.display = "none";
    }
}



function setBattery(side, percentage) {
    if (typeof percentage == "undefined") {
        percentage = "DISCONNECTED";
    }
    if (side == "l") {
        document.getElementById("left_ear").style.opacity = percentage == "DISCONNECTED" ? "0.5" : "1";
        document.getElementById("left_ear").style.zIndex = percentage == "DISCONNECTED" ? "-1" : "1";
        document.getElementById("battery-l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery_bar_l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("ring_button_l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery-l").innerHTML = percentage + "% L";
        document.getElementById("battery_bar_fill_l").style.width = percentage +"%";
    } else if (side == "r") {
        document.getElementById("right_ear").style.opacity = percentage == "DISCONNECTED" ? "0.5" : "1";
        document.getElementById("right_ear").style.zIndex = percentage == "DISCONNECTED" ? "-1" : "1";
        document.getElementById("battery-r").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery_bar_r").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";3
        document.getElementById("ring_button_r").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery-r").innerHTML = percentage + "% R";
        document.getElementById("battery_bar_fill_r").style.width = percentage +"%";
    }else if(side == "c"){
        document.getElementById("battery-c").innerHTML = percentage == "DISCONNECTED" ? percentage : percentage + "% CASE";
        document.getElementById("case_ear").style.opacity = percentage == "DISCONNECTED" ? "0.5" : "1";
        document.getElementById("battery_bar_fill_c").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery_bar_fill_c").style.width = percentage +"%";
    }
}