var double_tap = ["Play/Pause", "Skip Back", "Skip Forward", "Voice Assistant", "No action"];
var triple_tap = ["Skip Back", "Skip Forward", "Voice Assistant", "No action"];
var tap_and_hold = ["Noise control", "Voice Assistant", "No action"];
var double_tap_and_hold = ["Volume up", "Volume down", "Voice Assistant", "No action"];

var anc_selector_tap = [1, 1, 0]
var left_triple_tap_current = triple_tap[0];
var left_tap_and_hold_current = tap_and_hold[0];
var right_triple_tap_current = triple_tap[0];
var right_tap_and_hold_current = tap_and_hold[0];
var right_double_tap_and_hold_current = double_tap_and_hold[0];
var left_double_tap_and_hold_current = double_tap_and_hold[0];
var right_double_tap_current = double_tap[0];
var left_double_tap_current = double_tap[0];
var anc_selector_tap_l = anc_selector_tap[0];
var anc_selector_tap_r = anc_selector_tap[0];

let leftStateEarTipTest = undefined
let rightStateEarTipTest = undefined
let bass_enhance = [0, 0]

var current_side;


// 0 = On, 1 = transparent, 2 = Off
var ANC_type = 1;
// 0 = Strong, 1 = low
var ANC_strength = 0;



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
        key: "double_tap",
        type: "double",
        sendType: 2,
        options: double_tap,
        actionToIndex: { 2: 0, 8: 1, 9: 2, 11: 3, 1: 4 },
        subtitleId: "settings_subtitle_double",
        loadSuffix: "<br />Answer calls</div>",
        changeSuffix: "<br />Decline incoming call",
    },
    {
        key: "triple_tap",
        type: "triple",
        sendType: 3,
        options: triple_tap,
        actionToIndex: { 8: 0, 9: 1, 11: 2, 1: 3 },
        subtitleId: "settings_subtitle_triple",
        loadSuffix: "<br />Hang up calls / Decline Incoming call</div>",
    },
    {
        key: "tap_and_hold",
        type: "tap_and_hold",
        sendType: 7,
        options: tap_and_hold,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 11: 1, 1: 2 },
        ancToggle: { selectorName: "anc_selector_tap", panelId: "anc_tap_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_tap_and_hold",
    },
    {
        key: "double_tap_and_hold",
        type: "double_tap_and_hold",
        sendType: 9,
        options: double_tap_and_hold,
        actionToIndex: { 18: 0, 19: 1, 11: 2, 1: 3 },
        subtitleId: "settings_subtitle_double_tap_and_hold",
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

