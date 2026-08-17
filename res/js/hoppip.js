// Nothing Headphone (a), base B186

var button_press = ["Channel Hop", "Voice AI", "News Reporter", "Noise control", "Camera Shutter", "Mic mute", "EQ preset", "No action"];
var button_hold = ["Channel Hop", "Voice AI", "News Reporter", "Noise control", "Essential Space", "Mic mute", "EQ preset", "No action"];
var roller_hold = ["Noise control", "No action"];

var anc_selector_button_press = [1, 1, 0]
var anc_selector_button_hold = [1, 1, 0]

var anc_selector_roller = [1, 1, 0]
let bass_enhance = [0, 0]

//---------------------------------------------------------------------------------//

//CURRENTLY SELLECTED BUD ON THE SETTINGS PAGE
var current_side;

var button_press_current = button_press[0];
var button_hold_current = button_hold[0];
var roller_hold_current = roller_hold[0];


// 0 = On, 1 = transparent, 2 = Off
var ANC_type = 1;
// 0 = Strong, 1 = low
var ANC_strength = 0;


//---------------------------------------------------------------------------------//


leftEarPeace = document.getElementById("left_ear_peace")

leftEarBattery = document.getElementById("left_ear_battery")

prod_name = document.getElementById("prod_name")
pages_container = document.getElementById("pages_container")
settings_icon = document.getElementById("settings_icon")

ringButton = document.getElementById("ring_button")


var intro_timeout;
var intro_timeout2;


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
        actionToIndex: { 32: 0, 11: 1, 31: 2, 10: 3, 20: 3, 21: 3, 22: 3, 24: 4, 29: 5, 34: 6, 1: 7 },
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
        actionToIndex: { 32: 0, 11: 1, 31: 2, 10: 3, 20: 3, 21: 3, 22: 3, 33: 4, 29: 5, 34: 6, 1: 7 },
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



const BASS_STAGE_DOT_IDS = ["stage_one_button_bass", "stage_two_button_bass", "stage_three_button_bass"];

function currentPageScale() {
    let container = document.getElementById("container_one");
    if (!container) {
        return 1;
    }
    let match = /scale\(([^)]+)\)/.exec(container.style.transform || "");
    let scale = match ? parseFloat(match[1]) : 1;
    return scale > 0 && isFinite(scale) ? scale : 1;
}

function bassLevelSelectorWidth(level) {
    let track = document.querySelector("#bass_strength_selector .grid");
    let bar = document.getElementById("bass_strength_length_selector");
    if (!track || !bar) {
        return "12px";
    }
    let scale = currentPageScale();
    let barLeft = bar.getBoundingClientRect().left;
    let targetRight;
    if (level >= BASS_STAGE_DOT_IDS.length - 1) {
        targetRight = track.getBoundingClientRect().right;
    } else {
        let dot = document.getElementById(BASS_STAGE_DOT_IDS[level]);
        if (!dot) {
            return "12px";
        }
        let dotRect = dot.getBoundingClientRect();
        targetRight = dotRect.right;
    }
    return (Math.max(0, targetRight - barLeft) / scale) + "px";
}

// Override of device_common.js's default setBassEnhance(): same as the shared version
// (including hiding bass_strength_selector while off).
function setBassEnhance(state, is_send = false) {
    console.log("setBassEnhance", state);
    if (state === 1) {
        bass_enhance[0] = 1;
        document.getElementById("selector_bass").style.marginLeft = "65px";
        document.getElementById("bass_on").style.fill = "black";
        document.getElementById("bass_on").style.stroke = "black";
        document.getElementById("bass_off").style.fill = "white";
        document.getElementById("bass_strength_selector").style.opacity = "100";
    } else {
        bass_enhance[0] = 0;
        document.getElementById("selector_bass").style.marginLeft = "160px";
        document.getElementById("bass_on").style.fill = "white";
        document.getElementById("bass_on").style.stroke = "white";
        document.getElementById("bass_off").style.fill = "black";
        document.getElementById("bass_strength_selector").style.opacity = "0";
    }
    if (is_send) {
        set_enhanced_bass(bass_enhance[0], bass_enhance[1]);
    }
}

function setBassLevel(new_level, is_send = false) {
    if (new_level !== undefined) level = new_level;
    bass_enhance[1] = level;
    console.log("setBassLevel", level);
    if (level >= 0 && level < BASS_STAGE_DOT_IDS.length) {
        document.getElementById("bass_strength_length_selector").style.width = bassLevelSelectorWidth(level);
        document.getElementById("bass_level_label").innerHTML = "Level " + level;
    }
    if (is_send) {
        setBassEnhance(level === 0 ? 0 : 1, false);
        set_enhanced_bass(bass_enhance[0], bass_enhance[1]);
    }
}
