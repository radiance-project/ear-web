var double_pinch = ["Skip Back", "Skip Forward", "Voice Assistant"];
var triple_pinch = ["Skip Back", "Skip Forward", "Voice Assistant", "No action"];
var pinch_and_hold = ["Noise control", "Volume UP", "Volume Down", "Voice Assistant", "Mic On/Off", "No action"];
var double_pinch_and_hold = ["Noise control", "Volume UP", "Volume Down", "Voice Assistant", "No action"];
var anc_selector_pinch = [1, 1, 0]
var anc_selector_pinch_double = [1, 1, 0]
let leftStateEarTipTest = undefined
let rightStateEarTipTest = undefined
let bass_enhance = [0, 0]

//---------------------------------------------------------------------------------//

//CURRENTLY SELLECTED BUD ON THE SETTINGS PAGE
var current_side;

var left_triple_pinch_current = triple_pinch[0];
var left_pinch_and_hold_current = pinch_and_hold[0];
var right_triple_pinch_current = triple_pinch[0];
var right_pinch_and_hold_current = pinch_and_hold[0];
var right_double_pinch_and_hold_current = double_pinch_and_hold[0];
var left_double_pinch_and_hold_current = double_pinch_and_hold[0];
var right_double_pinch_current = double_pinch[0];
var left_double_pinch_current = double_pinch[0];
var anc_selector_pinch_double_l = anc_selector_pinch_double[0];
var anc_selector_pinch_double_r = anc_selector_pinch_double[0];
var anc_selector_pinch_l = anc_selector_pinch[0];
var anc_selector_pinch_r = anc_selector_pinch[0];

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

// Per-ear gesture topology/slots - matches the "deviceType": 2 (earbud button) gesture
// groups in ear_config_file.json's B173 entry. Triple press and pinch-and-hold each gained
// a "No action" option over twos/two, and pinch-and-hold also gained "Mic On/Off" (protocol
// action 29 reused in this slot's context; the same code means "decline call" as the fixed,
// non-customisable single-press action elsewhere - see loadSuffix/changeSuffix below).
// The case's own "Talk" button (deviceType 4 in the JSON - Super Mic latch / Essential Space /
// Voice Assistant) is wired in as a third gesture "side" too, via its own CASE_TOPOLOGY/
// CASE_SLOTS in case_button.js (kept separate from GESTURE_TOPOLOGY since it has no left/
// right and a different, smaller slot list) - see updateGesturesFromArray/loadCurrentGestures/
// changeGesture below, which dispatch to whichever topology matches the current side.
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
        actionToIndex: { 8: 0, 9: 1, 11: 2, 1: 3 },
        subtitleId: "settings_subtitle_triple",
    },
    {
        key: "pinch_and_hold",
        type: "pinch_and_hold",
        sendType: 7,
        options: pinch_and_hold,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 18: 1, 19: 2, 11: 3, 29: 4, 1: 5 },
        ancToggle: { selectorName: "anc_selector_pinch", panelId: "anc_pinch_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_pinch_and_hold",
    },
    {
        key: "double_pinch_and_hold",
        type: "double_pinch_and_hold",
        sendType: 9,
        options: double_pinch_and_hold,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 18: 1, 19: 2, 11: 3, 1: 4 },
        ancToggle: { selectorName: "anc_selector_pinch_double", panelId: "anc_pinch_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_double_pinch_and_hold",
    },
];

function updateGesturesFromArray(records) {
    applyGestureRecords(records, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    if (typeof CASE_TOPOLOGY !== "undefined") {
        applyGestureRecords(records, CASE_TOPOLOGY, CASE_SLOTS);
    }
    loadCurrentGestures(current_side, false);
}

function loadCurrentGestures(side, refresh = true) {
    if (refresh) {
        sendGetGesture();
    }
    current_side = side;
    loadCurrentGesturesGeneric(side, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    if (typeof CASE_TOPOLOGY !== "undefined") {
        loadCurrentGesturesGeneric(side, CASE_TOPOLOGY, CASE_SLOTS);
    }
    if (typeof toggleCaseGestureRows === "function") {
        toggleCaseGestureRows(side === "case");
    }
}

function changeGesture(type) {
    if (current_side === "case") {
        renderGestureChangePopup(type, CASE_TOPOLOGY, CASE_SLOTS);
    } else {
        renderGestureChangePopup(type, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    }
}

function checkboxCheck(evt, slotKey) {
    checkboxCheckGeneric(evt, slotKey, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}
