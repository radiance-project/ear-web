var SMART_DIAL_TOPOLOGY = {
    sides: ["dial"],
    deviceCodes: { dial: 4 },
    sidePrefixes: null,
    varPrefix: false,
};

var dial_single_press_options = ["Play/Pause", "Skip Forward", "Skip Back", "Voice Assistant", "Low lag mode on/off", "No action"];
var dial_single_press_current = dial_single_press_options[0];

var dial_double_press_options = ["Play/Pause", "Skip Forward", "Skip Back", "Voice Assistant", "Low lag mode on/off", "No action"];
var dial_double_press_current = dial_double_press_options[0];

var dial_double_press_call_options = ["Answer calls", "Answer calls<br>During calls: Mute / unmute Mic", "No action"];
var dial_double_press_call_current = dial_double_press_call_options[0];

var dial_triple_press_options = ["Play/Pause", "Skip Forward", "Skip Back", "Voice Assistant", "Low lag mode on/off", "No action"];
var dial_triple_press_current = dial_triple_press_options[0];

var dial_triple_press_call_options = ["Hang up calls / Decline incoming calls", "No action"];
var dial_triple_press_call_current = dial_triple_press_call_options[0];

var dial_press_hold_options = ["Voice Assistant", "Low lag mode on/off", "No action"];
var dial_press_hold_current = dial_press_hold_options[0];

var dial_rotate_options = ["Volume control", "No action"];
var dial_rotate_current = dial_rotate_options[0];

var SMART_DIAL_SLOTS = [
    {
        key: "dial_single_press",
        type: "dial_single_press",
        sendType: 1,
        gestureCommon: 1,
        sendExtra: 1,
        options: dial_single_press_options,
        actionToIndex: { 2: 0, 9: 1, 8: 2, 11: 3, 17: 4, 1: 5 },
        subtitleId: "settings_subtitle_dial_single_press",
    },
    {
        key: "dial_double_press",
        type: "dial_double_press",
        sendType: 2,
        gestureCommon: 1,
        sendExtra: 1,
        options: dial_double_press_options,
        actionToIndex: { 2: 0, 9: 1, 8: 2, 11: 3, 17: 4, 1: 5 },
        subtitleId: "settings_subtitle_dial_double_press",
    },
    {
        key: "dial_double_press_call",
        type: "dial_double_press_call",
        sendType: 2,
        gestureCommon: 9, // JSON's "callControlsButton": 9 for double_press's call-controls group
        sendExtra: 9,
        options: dial_double_press_call_options,
        actionToIndex: { 3: 0, 25: 1, 1: 2 },
        subtitleId: "settings_subtitle_dial_double_press_call",
    },
    {
        key: "dial_triple_press",
        type: "dial_triple_press",
        sendType: 3,
        gestureCommon: 1,
        sendExtra: 1,
        options: dial_triple_press_options,
        actionToIndex: { 2: 0, 9: 1, 8: 2, 11: 3, 17: 4, 1: 5 },
        subtitleId: "settings_subtitle_dial_triple_press",
    },
    {
        key: "dial_triple_press_call",
        type: "dial_triple_press_call",
        sendType: 3,
        gestureCommon: 9, // JSON's "callControlsButton": 9 for triple_press's call-controls group
        sendExtra: 9,
        options: dial_triple_press_call_options,
        actionToIndex: { 26: 0, 1: 1 },
        subtitleId: "settings_subtitle_dial_triple_press_call",
    },
    {
        key: "dial_press_hold",
        type: "dial_press_hold",
        sendType: 7,
        gestureCommon: 1,
        sendExtra: 1,
        options: dial_press_hold_options,
        actionToIndex: { 11: 0, 17: 1, 1: 2 },
        subtitleId: "settings_subtitle_dial_press_hold",
    },
    {
        key: "dial_rotate",
        type: "dial_rotate",
        sendType: 10,
        gestureCommon: 1,
        sendExtra: 1,
        options: dial_rotate_options,
        actionToIndex: { 23: 0, 1: 1 },
        subtitleId: "settings_subtitle_dial_rotate",
    },
];

// Double/triple press each have a media action and a during-calls action (see
// SMART_DIAL_SLOTS above), and both belong in the same panel rather than as two separate
// top-level rows - mirrors smart_knob.js's caseCombinedPressPanelHTML/
// openCaseDoublePressPanel/openCaseTriplePressPanel/pickCaseSlotValue for the case knob.
function dialCombinedPressPanelHTML(title, mediaSlotKey, mediaLabel, callSlotKey) {
    return `
        <div class="w-fit flex m-auto text-md mb-4 mt-2 text-white text-center">${title}</div>
        <div style="width: 300px;">
            <div class="bg-[#1B1D1F] rounded-xl pt-5 pb-5 mt-2" style="cursor: pointer;" onclick="pickDialSlotValue('${mediaSlotKey}')">
                <div class="text-sm ml-5 text-gray-200">${mediaLabel}</div>
                <div class="text-sm ml-5 text-gray-500">${window[mediaSlotKey + "_current"]}</div>
            </div>
            <div class="bg-[#1B1D1F] rounded-xl pt-5 pb-5 mt-2" style="cursor: pointer;" onclick="pickDialSlotValue('${callSlotKey}')">
                <div class="text-sm ml-5 text-gray-200">Call controls</div>
                <div class="text-sm ml-5 text-gray-500">${window[callSlotKey + "_current"]}</div>
            </div>
        </div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Close</button>
        </div>`;
}

function openDialDoublePressPanel() {
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = dialCombinedPressPanelHTML(
        "Double Press", "dial_double_press", "Media", "dial_double_press_call"
    );
}

function openDialTriplePressPanel() {
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = dialCombinedPressPanelHTML(
        "Triple Press", "dial_triple_press", "Media", "dial_triple_press_call"
    );
}

// slotKey identifies both the SMART_DIAL_SLOTS entry (via findGestureSlotByKey) and the
// "<slotKey>_current" global var each option list above declares.
function pickDialSlotValue(slotKey) {
    let slot = findGestureSlotByKey(SMART_DIAL_SLOTS, slotKey);
    if (!slot) {
        return;
    }
    let current = window[slotKey + "_current"];
    let showPopup = "";
    for (let i = 0; i < slot.options.length; i++) {
        let selected = slot.options[i] === current ? "selected" : "";
        showPopup += `<option id="${slot.options[i]}" ${selected}>${slot.options[i]}</option>`;
    }
    displayPopUp(showPopup);
    document.getElementById("list_container").addEventListener("change", function () {
        let value = document.getElementById("list_container").value;
        window[slotKey + "_current"] = value;
        let index = slot.options.indexOf(value);
        let action = reverseLookupAction(slot.actionToIndex, index);
        sendGestures(SMART_DIAL_TOPOLOGY.deviceCodes["dial"], slot.sendType, action, slot.sendExtra);
        closePopUp();
        if (slotKey === "dial_double_press" || slotKey === "dial_double_press_call") {
            openDialDoublePressPanel();
        } else if (slotKey === "dial_triple_press" || slotKey === "dial_triple_press_call") {
            openDialTriplePressPanel();
        }
    });
}

function toggleDialGestureRows(showDial) {
    let earRows = document.getElementById("test_ear_rows");
    let dialRows = document.getElementById("test_dial_rows");
    if (earRows) {
        earRows.style.display = showDial ? "none" : "block";
    }
    if (dialRows) {
        dialRows.style.display = showDial ? "block" : "none";
    }
    // See smart_knob.js's toggleCaseGestureRows for why this lives here rather than in
    // transToDialGest/transToLeftGest/transBackToLeft: this runs on every
    // loadCurrentGestures() call regardless of entry point, so it's the one reliable place
    // to keep #case_gesture_img in sync with which row set is actually showing.
    let caseGestureImg = document.getElementById("case_gesture_img");
    if (caseGestureImg) {
        caseGestureImg.style.opacity = showDial ? "100" : "0";
        caseGestureImg.style.zIndex = showDial ? "100" : "-10";
    }
}

function transToDialGest() {
    current_side = "dial";
    // rightEarPeace's default class carries a 2s transition duration (only ever swapped to
    // the snappy 300ms one inside transToLeftGest, right before fading it out) - without this
    // same swap here it lingers mid-fade for ~2s instead of a clean 300ms fade.
    rightEarPeace.classList.remove("duration-[2s]");
    rightEarPeace.classList.add("duration-300");
    prod_name.style.opacity = "0";
    pages_container.style.opacity = "0";
    pages_container_two.style.opacity = "0";
    ringButton.style.opacity = "0";
    leftEarBattery.style.opacity = "0";
    rightEarBattery.style.opacity = "0";
    leftEarPeace.style.opacity = "0";
    leftEarPeace.style.zIndex = "-10";
    rightEarPeace.style.opacity = "0";
    rightEarPeace.style.zIndex = "-10";
    document.getElementById("ring_button").style.zIndex = "-10";
    document.getElementById("eq_container_t").style.zIndex = "-10";
    clearTimeout(intro_timeout);
    clearTimeout(intro_timeout2);
    // Refresh the case image beside the gesture list with case-img's current src - mirrors
    // smart_knob.js's transToCaseGest. Actual show/hide is handled by
    // toggleDialGestureRows (called right after this via loadCurrentGestures("dial")),
    // not here.
    let caseGestureImg = document.getElementById("case_gesture_img");
    if (caseGestureImg) {
        let sourceImg = document.getElementById("case-img");
        if (sourceImg) caseGestureImg.src = sourceImg.src;
    }
    setTimeout(() => {
        document.getElementById("test").style.opacity = "100";
        document.getElementById("test").style.zIndex = "100";
        document.getElementById("back").style.opacity = "100";
    }, 500);
}

function injectSmartDialUI() {
    if (modelBase !== "B189") {
        return;
    }
    let caseImg = document.getElementById("case-img");
    if (caseImg && !caseImg.dataset.dialGestureBound) {
        caseImg.dataset.dialGestureBound = "1";
        caseImg.style.cursor = "pointer";
        caseImg.addEventListener("click", function () {
            transToDialGest();
            loadCurrentGestures("dial");
        });
    }
}

// Override of bluetooth_socket.js's default spatialAudioIndexFromWire(): CMF Clip Pro only
// ever offers 2 spatial audio modes (Off / Fixed) - spatial_audio.js's
// availableSpatialAudioIndexes() already filters SPATIAL_AUDIO_MODES down to just those two
// via the spatialAudio=6 bitmask (only the 0x2 "Fixed" bit matches). But its "head" response
// byte isn't a clean 0/1 boolean on real hardware (observed values of 20 and 213 for two
// separate reads), unlike Nothing-brand devices with actual head-tracking hardware - the
// shared decoder's "head === 1 -> Head Tracked" check happened to not misfire on either of
// those samples, but nothing stops a future read from coincidentally landing on exactly 1,
// which would report an index (1) this device's own picker doesn't even offer. Resolve purely
// from the mode byte instead of trusting head at all. (Lives here rather than igglybuff.js
// since this file loads after bluetooth_socket.js in MainControl_igglybuff.html, so the
// override actually sticks - igglybuff.js loads before it.)
function spatialAudioIndexFromWire(mode, head) {
    return mode === 1 ? 2 : 0; // 2 = "Fixed" (this device's only non-Off mode), 0 = "Off"
}
