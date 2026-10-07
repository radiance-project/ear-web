var button_press = ["Voice AI", "News Reporter", "Noise control", "Camera Shutter", "Mic mute", "No action"];
var button_hold = ["Voice AI", "Noise control", "Mic mute", "No action"];
var roller_hold = ["Noise control", "No action"];

var anc_selector_button_press = [1, 1, 0]
var anc_selector_button_hold = [1, 1, 0]

var anc_selector_roller = [1, 1, 0]

//---------------------------------------------------------------------------------//

//CURRENTLY SELLECTED BUD ON THE SETTINGS PAGE
var current_side;

var button_press_current = button_press[0];
var button_hold_current = button_hold[3];
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
        actionToIndex: { 11: 0, 31: 1, 10: 2, 20: 2, 21: 2, 22: 2, 24: 3, 29: 4, 1: 5 },
        ancToggle: { selectorName: "anc_selector_button_press", panelId: "anc_pinch_settings", mergedIndex: 2 },
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
        actionToIndex: { 11: 0, 10: 1, 20: 1, 21: 1, 22: 1, 29: 2, 31: 3, 1: 3 },
        ancToggle: { selectorName: "anc_selector_button_hold", panelId: "anc_pinch_settings", mergedIndex: 1 },
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


var LANTURN_HOLD_NEWS = { device: 6, button: 10, gesture: 7, news: 31, replacement: 1 };

function disableLongPressNewsIfNeeded(records) {
    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.gestureDevice == LANTURN_HOLD_NEWS.device && r.gestureCommon == LANTURN_HOLD_NEWS.button
            && r.gestureType == LANTURN_HOLD_NEWS.gesture && r.gestureAction == LANTURN_HOLD_NEWS.news) {
            sendGestures(LANTURN_HOLD_NEWS.device, LANTURN_HOLD_NEWS.gesture, LANTURN_HOLD_NEWS.replacement, LANTURN_HOLD_NEWS.button);
        }
    }
}

function updateGesturesFromArray(records) {
    disableLongPressNewsIfNeeded(records);
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


const EQ_LEVEL_MORE_DETAIL = 7;

function setDetail(e) {
    data = {
        labels: ["", "", ""],
        datasets: [{
            backgroundColor: gradient,
            label: '# of Votes',
            data: [4, 6, 10],
            borderWidth: 1,
        },
        ]
    }
    resetOptions();
    drawChart(data);
    clearButtons()
    var button = document.getElementById("eq_button_detail");
    button.style.backgroundColor = "#ffffff";
    button.style.color = "#000000";
    current_eq = EQ_LEVEL_MORE_DETAIL;
}

(function () {
    var baseSetEQfromRead = window.setEQfromRead;
    window.setEQfromRead = function (level) {
        if (level == EQ_LEVEL_MORE_DETAIL) {
            setDetail(document.getElementById("eq_button_detail"));
            document.querySelector("#chart").style.display = "grid";
            document.querySelector("#advancedEQmsg").style.display = "none";
            return;
        }
        baseSetEQfromRead(level);
    };
})();
