var button_press = ["Channel Hop", "Voice AI", "News Reporter", "Noise control", "Spatial Audio", "Mic mute", "EQ preset", "No action"];
var button_hold = ["Channel Hop", "Voice AI", "News Reporter", "Noise control", "Spatial Audio", "Essential Space", "Mic mute", "EQ preset", "No action"];
var roller_hold = ["Noise control", "No action"];

var anc_selector_button_press = [1, 1, 0]
var anc_selector_button_hold = [1, 1, 0]

var anc_selector_roller = [1, 1, 0]
let bass_enhance = [0, 0]

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
var button_press_current = button_press[0];
var button_hold_current = button_hold[0];
var roller_hold_current = roller_hold[0];


// 0 = On, 1 = transparent, 2 = Off
var ANC_type = 1;
// 0 = Strong, 1 = low
var ANC_strength = 0;


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

//---------------------------------------------------------------------------------//


leftEarPeace = document.getElementById("left_ear_peace")

leftEarBattery = document.getElementById("left_ear_battery")

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
    sides: ["l"],
    deviceCodes: { l: 6 },
    varPrefix: false,
};

var GESTURE_SLOTS = [
    {
        key: "button_press",
        type: "button_press",
        sendType: 1,
        gestureCommon: 10,
        sendExtra: 10,
        options: button_press,
        actionToIndex: { 32: 0, 11: 1, 31: 2, 10: 3, 20: 3, 21: 3, 22: 3, 27: 4, 29: 5, 34: 6, 1: 7 },
        ancToggle: { selectorName: "anc_selector_button_press", panelId: "anc_pinch_settings", mergedIndex: 3 },
        subtitleId: "settings_subtitle_button_press",
        alwaysCloseOnChange: true,
    },
    {
        key: "button_hold",
        type: "button_hold",
        sendType: 7,
        gestureCommon: 10,
        sendExtra: 10,
        options: button_hold,
        actionToIndex: { 32: 0, 11: 1, 31: 2, 10: 3, 20: 3, 21: 3, 22: 3, 27: 4, 33: 5, 29: 6, 34: 7, 1: 8 },
        ancToggle: { selectorName: "anc_selector_button_hold", panelId: "anc_pinch_settings", mergedIndex: 3 },
        subtitleId: "settings_subtitle_button_hold",
        alwaysCloseOnChange: true,
    },
    {
        key: "roller_hold",
        type: "roller_hold",
        sendType: 7,
        gestureCommon: 1,
        sendExtra: 1,
        options: roller_hold,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 1: 1 },
        ancToggle: { selectorName: "anc_selector_roller", panelId: "anc_pinch_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_roller_hold",
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

function checkboxCheck(evt, slotKey) {
    checkboxCheckGeneric(evt, slotKey, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}

function setBattery(side, percentage) {
    if (typeof percentage == "undefined") {
        percentage = "DISCONNECTED";
    }
    if (side == "s") {
        document.getElementById("left_ear").style.opacity = percentage == "DISCONNECTED" ? "0.5" : "1";
        document.getElementById("left_ear").style.zIndex = percentage == "DISCONNECTED" ? "-1" : "1";
        document.getElementById("battery-l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery_bar_l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery-l").innerHTML = percentage + "%";
        document.getElementById("battery_bar_fill_l").style.width = percentage + "%";
    }
}

