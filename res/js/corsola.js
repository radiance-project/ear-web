var double_tap = ["Play/Pause", "Skip Back", "Skip Forward", "Voice Assistant"];
var triple_tap = ["Skip Back", "Skip Forward", "Voice Assistant"];
var tap_and_hold = ["Noise control", "Voice Assistant"];
var double_tap_and_hold = ["Volume UP", "Volume Down", "Voice Assistant", "No action"];
var anc_selector_tap = [1, 1, 0]

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
        actionToIndex: { 2: 0, 8: 1, 9: 2, 11: 3 },
        subtitleId: "settings_subtitle_double",
        loadSuffix: "<br />Answer / Hang up calls</div>",
        changeSuffix: "<br />Decline incoming call",
    },
    {
        key: "triple_tap",
        type: "triple",
        sendType: 3,
        options: triple_tap,
        actionToIndex: { 8: 0, 9: 1, 11: 2 },
        subtitleId: "settings_subtitle_triple",
        loadSuffix: "<br />Decline Incoming call</div>",
    },
    {
        key: "tap_and_hold",
        type: "tap_and_hold",
        sendType: 7,
        options: tap_and_hold,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 11: 1 },
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

function setANC(typeANC) {
    console.log("typeANC", typeANC);
    if (typeANC == 0) {
        setAncToNC();
    } else if (typeANC == 1) {
        setAncToTransparent();
    } else if (typeANC == 2) {
        setAncToOff();
    } else if (typeANC == 3) {
        setAncStrengthHigh();
    } else if (typeANC == 4) {
        setAncStrengthMid();
    } else if (typeANC == 5) {
        setAncStrengthLow();
    }

    var type = 0;
    if (ANC_type == 1) {
        type = 2;
    } else if (ANC_type == 2) {
        type = 1;
    } else if (ANC_type == 0) {
        if (ANC_strength == 1) {
            type = 3;
        } else if (ANC_strength == 0) {
            type = 4;
        } else if (ANC_strength == 2) {
            type = 5;
        } else if (ANC_strength == 3) {
            type = 6;
        }
    }
    setANCDisplay(type);
    setANC_BT(type);
}

