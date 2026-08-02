var button_single_press = ["Essential News", "Voice AI", "Noise control", "Spatial audio", "Mic on/off", "No action"];
var button_press_hold = ["Essential News", "Voice AI", "Noise control", "Spatial audio", "Essential Space", "Mic on/off", "No action"];
var slider = ["Bass Tuning", "Treble Tuning"];
var roller_hold = ["Noise control"];

var anc_button_single_press = [1, 1, 0];
var anc_button_press_hold = [1, 1, 0];
var anc_roller_hold = [1, 1, 0];

var button_single_press_current = button_single_press[0];
var button_press_hold_current = button_press_hold[0];
var slider_current = slider[0];
var roller_hold_current = roller_hold[0];


var current_side;


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
        key: "button_single_press",
        type: "single_press",
        sendType: 1,
        gestureCommon: 10,
        sendExtra: 10,
        options: button_single_press,
        actionToIndex: { 31: 0, 11: 1, 10: 2, 20: 2, 21: 2, 22: 2, 27: 3, 29: 4, 1: 5 },
        ancToggle: { selectorName: "anc_button_single_press", panelId: "anc_tap_settings", mergedIndex: 2 },
        subtitleId: "settings_subtitle_single_press",
        alwaysCloseOnChange: true,
    },
    {
        key: "button_press_hold",
        type: "press_hold",
        sendType: 7,
        gestureCommon: 10,
        sendExtra: 10,
        options: button_press_hold,
        actionToIndex: { 31: 0, 11: 1, 10: 2, 20: 2, 21: 2, 22: 2, 27: 3, 33: 4, 29: 5, 1: 6 },
        ancToggle: { selectorName: "anc_button_press_hold", panelId: "anc_tap_settings", mergedIndex: 2 },
        subtitleId: "settings_subtitle_press_hold",
        alwaysCloseOnChange: true,
    },
    {
        key: "slider",
        type: "slider",
        sendType: 1,
        gestureCommon: 5,
        sendExtra: 5,
        options: slider,
        actionToIndex: { 35: 0, 36: 1 },
        subtitleId: "settings_subtitle_slider",
    },
    {
        // NOTE: the original changeGesture("roller_hold") referenced the undefined
        // `anc_selector_tap` here (a copy-paste leftover) instead of `anc_roller_hold`,
        // which threw a ReferenceError if a user tried to enable Noise control on this
        // slot. Fixed here to use the slot's own selector, per explicit approval.
        key: "roller_hold",
        type: "roller_hold",
        sendType: 7,
        gestureCommon: 1,
        sendExtra: 1,
        options: roller_hold,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0 },
        ancToggle: { selectorName: "anc_roller_hold", panelId: "anc_tap_settings", mergedIndex: 0 },
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