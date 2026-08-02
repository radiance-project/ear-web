var double_pinch = ["Skip Back", "Skip Forward", "Voice Assistant"];
var triple_pinch = ["Skip Back", "Skip Forward", "Voice Assistant"];
var pinch_and_hold = ["Volume UP", "Volume Down", "Voice Assistant"];
var double_pinch_and_hold = ["Volume UP", "Volume Down", "Voice Assistant", "No action"];

//---------------------------------------------------------------------------------//

//CURRENTLY SELLECTED BUD ON THE SETTINGS PAGE
var current_side;

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


async function ringBudLeft(e) {
    var e = document.getElementById("ring_button-l").classList
    if (e.contains("ringing-l")) {
        e.remove("ringing-l")
        document.getElementById("ring_button-l").style.backgroundColor = ""
        document.getElementById("ring_button-l").style.color = ""
        document.getElementById("ring_button-l").innerText = "Ring"
        ringBuds(0, true)
    } else {
        e.add("ringing-l")
        document.getElementById("ring_button-l").style.backgroundColor = "#7f1d1d"
        document.getElementById("ring_button-l").style.color = "#ffffff"
        document.getElementById("ring_button-l").innerText = "STOP"
        ringBuds(1, true)
    }
}

async function ringBudRight(e) {
    var e = document.getElementById("ring_button-r").classList
    if (e.contains("ringing-r")) {
        e.remove("ringing-r")
        document.getElementById("ring_button-r").style.backgroundColor = ""
        document.getElementById("ring_button-r").style.color = ""
        document.getElementById("ring_button-r").innerText = "Ring"
        ringBuds(0, false)
    } else {
        e.add("ringing-r")
        document.getElementById("ring_button-r").style.backgroundColor = "#7f1d1d"
        document.getElementById("ring_button-r").style.color = "#ffffff"
        document.getElementById("ring_button-r").innerText = "STOP"
        ringBuds(1, false)
    }
}


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

/*intro_timeout = setTimeout(() => {
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
*/

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
        actionToIndex: { 18: 0, 19: 1, 11: 2 },
        subtitleId: "settings_subtitle_pinch_and_hold",
        neverCloseOnChange: true,
    },
    {
        key: "double_pinch_and_hold",
        type: "double_pinch_and_hold",
        sendType: 9,
        options: double_pinch_and_hold,
        actionToIndex: { 18: 0, 19: 1, 11: 2, 1: 3 },
        subtitleId: "settings_subtitle_double_pinch_and_hold",
        neverCloseOnChange: true,
    },
];

function updateGesturesFromArray(records) {
    applyGestureRecords(records, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    loadCurrentGestures(current_side, false);
}

function loadCurrentGestures(side, refresh = true) {
    if (refresh) {
        sendGetGesture();
    }
    current_side = side;
    loadCurrentGesturesGeneric(side, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}

function changeGesture(type) {
    renderGestureChangePopup(type, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}


//left as stub for general calls.
function setAncToNC() {

}

function setAncToTransparent() {

}

function setAncToOff() {

}



function setAncStrengthHigh() {

}

function setAncStrengthMid() {

}

function setAncStrengthLow() {

}

function setAncStrengthAdaptive() {

}

