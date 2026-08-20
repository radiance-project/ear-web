// Nothing Ear (3a) / B190 - codename "Jumpluff" (matches the vendor's own onboarding asset
// name "Jumpluff_onboarding" in ear_config_file.json's guideInfos, confirmed by the user).
// Closest sibling is feraligator.js (Ear (3)/B173) - same ancLevel(63)/advancedEq/spatialAudio/
// eq(31)/dualConnection profile - but with no Bass Enhance (ultraBass:0), no Super Mic/Call
// Transparency/Walkie Talkie (all absent/0), and no case controls at all (no deviceType 4
// entries anywhere in the JSON - unlike B173's case Talk button or B172/B189's smart knob/dial).
//
// Two features genuinely new to this codebase, both confirmed via the decompiled app:
//   - "News" (protocol action 31, supportPlatform-gated in the JSON but included here
//     unconditionally since this app has no platform concept) - just another selectable
//     gesture action value, no dedicated wire command.
//   - "pinch both buds" (protocol gesture type 11, action 37="Voice Recording") - a gesture
//     that isn't tied to either ear. Confirmed via headphone_control_operation_page.dart's
//     "isBothBudsGesture" handling: when this slot changes, the app builds Operation entries
//     for BOTH device codes (2 and 3) and sends them together (setGestures, plural), instead
//     of only the currently-viewed side like every other slot. Implemented below via the
//     pinch_both_buds slot's syncBothSides:true flag - see gestures_common.js's
//     renderGestureChangePopup, which writes to every topology side unconditionally when that
//     flag is set (same "write to all sides" shape checkboxCheckGeneric already used for the
//     ANC toggle, just applied outside of that specific panel).
var double_press_options = ["Skip Forward", "Skip Back", "Voice Assistant", "News"];
var left_double_press_current = double_press_options[0];
var right_double_press_current = double_press_options[0];

var triple_press_options = ["Skip Forward", "Skip Back", "Voice Assistant", "News", "No action"];
var left_triple_press_current = triple_press_options[0];
var right_triple_press_current = triple_press_options[0];

var press_hold_options = ["Noise control", "Volume UP", "Volume Down", "Voice Recording", "Voice Assistant", "News", "Mic mute", "No action"];
var left_press_hold_current = press_hold_options[0];
var right_press_hold_current = press_hold_options[0];

var double_press_hold_options = ["Noise control", "Volume UP", "Volume Down", "Voice Recording", "Voice Assistant", "News", "No action"];
var left_double_press_hold_current = double_press_hold_options[0];
var right_double_press_hold_current = double_press_hold_options[0];

var pinch_both_buds_options = ["Voice Recording", "No action"];
var left_pinch_both_buds_current = pinch_both_buds_options[0];
var right_pinch_both_buds_current = pinch_both_buds_options[0];

var anc_selector_press_hold = [1, 1, 0];
var anc_selector_double_press_hold = [1, 1, 0];

let leftStateEarTipTest = undefined
let rightStateEarTipTest = undefined

var current_side;

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

var GESTURE_TOPOLOGY = {
    sides: ["l", "r"],
    deviceCodes: { l: 2, r: 3 },
    sidePrefixes: { l: "left", r: "right" },
    varPrefix: true,
};

var GESTURE_SLOTS = [
    {
        key: "double_press",
        type: "double",
        sendType: 2,
        options: double_press_options,
        actionToIndex: { 9: 0, 8: 1, 11: 2, 31: 3 },
        subtitleId: "settings_subtitle_double",
        // JSON's 2nd "gesture_not_customisation" group for double_press is a fixed op 29
        // ("decline_incoming_calls") - informational only, same treatment as feraligator.js's
        // own double_pinch slot.
        loadSuffix: "<br />Decline incoming calls</div>",
        changeSuffix: "<br />Decline incoming call",
    },
    {
        key: "triple_press",
        type: "triple",
        sendType: 3,
        options: triple_press_options,
        actionToIndex: { 9: 0, 8: 1, 11: 2, 31: 3, 1: 4 },
        subtitleId: "settings_subtitle_triple",
    },
    {
        key: "press_hold",
        type: "press_hold",
        sendType: 7,
        options: press_hold_options,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 18: 1, 19: 2, 37: 3, 11: 4, 31: 5, 29: 6, 1: 7 },
        ancToggle: { selectorName: "anc_selector_press_hold", panelId: "anc_pinch_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_press_hold",
    },
    {
        key: "double_press_hold",
        type: "double_press_hold",
        sendType: 9,
        options: double_press_hold_options,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 18: 1, 19: 2, 37: 3, 11: 4, 31: 5, 1: 6 },
        ancToggle: { selectorName: "anc_selector_double_press_hold", panelId: "anc_pinch_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_double_press_hold",
    },
    {
        key: "pinch_both_buds",
        type: "pinch_both_buds",
        sendType: 11,
        options: pinch_both_buds_options,
        actionToIndex: { 37: 0, 1: 1 },
        subtitleId: "settings_subtitle_pinch_both_buds",
        syncBothSides: true,
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
