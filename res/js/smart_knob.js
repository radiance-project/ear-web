var CASE_TOPOLOGY = {
    sides: ["case"],
    deviceCodes: { case: 4 },
    sidePrefixes: null,
    varPrefix: false,
};

var case_single_press_options = ["Play/Pause", "Skip Forward", "Skip Back", "Voice Assistant", "Low lag mode on/off", "No action"];
var case_single_press_current = case_single_press_options[0];

var case_double_press_options = ["Play/Pause", "Skip Forward", "Skip Back", "Voice Assistant", "Low lag mode on/off", "No action"];
var case_double_press_current = case_double_press_options[0];

var case_double_press_call_options = ["Answer calls", "Answer calls<br>During calls: Mute / unmute Mic", "No action"];
var case_double_press_call_current = case_double_press_call_options[0];

var case_triple_press_options = ["Play/Pause", "Skip Forward", "Skip Back", "Voice Assistant", "Low lag mode on/off", "No action"];
var case_triple_press_current = case_triple_press_options[0];

var case_triple_press_call_options = ["Hang up calls / Decline incoming calls", "No action"];
var case_triple_press_call_current = case_triple_press_call_options[0];

var case_press_hold_options = ["Noise control", "Voice Assistant", "Low lag mode on/off", "No action"];
var case_press_hold_current = case_press_hold_options[0];
var anc_selector_case_press_hold = [1, 1, 0];

var case_rotate_options = ["Volume control", "No action"];
var case_rotate_current = case_rotate_options[0];

var CASE_SLOTS = [
    {
        key: "case_single_press",
        type: "case_single_press",
        sendType: 1,
        gestureCommon: 1,
        sendExtra: 1,
        options: case_single_press_options,
        actionToIndex: { 2: 0, 9: 1, 8: 2, 11: 3, 17: 4, 1: 5 },
        subtitleId: "settings_subtitle_case_single_press",
    },
    {
        key: "case_double_press",
        type: "case_double_press",
        sendType: 2,
        gestureCommon: 1,
        sendExtra: 1,
        options: case_double_press_options,
        actionToIndex: { 2: 0, 9: 1, 8: 2, 11: 3, 17: 4, 1: 5 },
        subtitleId: "settings_subtitle_case_double_press",
    },
    {
        key: "case_double_press_call",
        type: "case_double_press_call",
        sendType: 2,
        gestureCommon: 9,
        sendExtra: 9,
        options: case_double_press_call_options,
        actionToIndex: { 3: 0, 25: 1, 1: 2 },
        subtitleId: "settings_subtitle_case_double_press_call",
    },
    {
        key: "case_triple_press",
        type: "case_triple_press",
        sendType: 3,
        gestureCommon: 1,
        sendExtra: 1,
        options: case_triple_press_options,
        actionToIndex: { 2: 0, 9: 1, 8: 2, 11: 3, 17: 4, 1: 5 },
        subtitleId: "settings_subtitle_case_triple_press",
    },
    {
        key: "case_triple_press_call",
        type: "case_triple_press_call",
        sendType: 3,
        gestureCommon: 9, 
        sendExtra: 9,
        options: case_triple_press_call_options,
        actionToIndex: { 26: 0, 1: 1 },
        subtitleId: "settings_subtitle_case_triple_press_call",
    },
    {
        key: "case_press_hold",
        type: "case_press_hold",
        sendType: 7,
        gestureCommon: 1,
        sendExtra: 1,
        options: case_press_hold_options,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 11: 1, 17: 2, 1: 3 },
        ancToggle: { selectorName: "anc_selector_case_press_hold", panelId: "anc_pinch_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_case_press_hold",
    },
    {
        key: "case_rotate",
        type: "case_rotate",
        sendType: 10,
        gestureCommon: 1,
        sendExtra: 1,
        options: case_rotate_options,
        actionToIndex: { 23: 0, 1: 1 },
        subtitleId: "settings_subtitle_case_rotate",
    },
];

function toggleCaseGestureRows(showCase) {
    let earRows = document.getElementById("test_ear_rows");
    let caseRows = document.getElementById("test_case_rows");
    if (earRows) {
        earRows.style.display = showCase ? "none" : "block";
    }
    if (caseRows) {
        caseRows.style.display = showCase ? "block" : "none";
    }
    let caseGestureImg = document.getElementById("case_gesture_img");
    if (caseGestureImg) {
        caseGestureImg.style.opacity = showCase ? "100" : "0";
        caseGestureImg.style.zIndex = showCase ? "100" : "-10";
    }
}

function transToCaseGest() {
    current_side = "case";
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

function caseCombinedPressPanelHTML(title, mediaSlotKey, mediaLabel, callSlotKey) {
    return `
        <div class="w-fit flex m-auto text-md mb-4 mt-2 text-white text-center">${title}</div>
        <div style="width: 300px;">
            <div class="bg-[#1B1D1F] rounded-xl pt-5 pb-5 mt-2" style="cursor: pointer;" onclick="pickCaseSlotValue('${mediaSlotKey}')">
                <div class="text-sm ml-5 text-gray-200">${mediaLabel}</div>
                <div class="text-sm ml-5 text-gray-500">${window[mediaSlotKey + "_current"]}</div>
            </div>
            <div class="bg-[#1B1D1F] rounded-xl pt-5 pb-5 mt-2" style="cursor: pointer;" onclick="pickCaseSlotValue('${callSlotKey}')">
                <div class="text-sm ml-5 text-gray-200">Call controls</div>
                <div class="text-sm ml-5 text-gray-500">${window[callSlotKey + "_current"]}</div>
            </div>
        </div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Close</button>
        </div>`;
}

function openCaseDoublePressPanel() {
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = caseCombinedPressPanelHTML(
        "Double Press", "case_double_press", "Media", "case_double_press_call"
    );
}

function openCaseTriplePressPanel() {
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = caseCombinedPressPanelHTML(
        "Triple Press", "case_triple_press", "Media", "case_triple_press_call"
    );
}

function pickCaseSlotValue(slotKey) {
    let slot = findGestureSlotByKey(CASE_SLOTS, slotKey);
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
        sendGestures(CASE_TOPOLOGY.deviceCodes["case"], slot.sendType, action, slot.sendExtra);
        closePopUp();
        if (slotKey === "case_double_press" || slotKey === "case_double_press_call") {
            openCaseDoublePressPanel();
        } else if (slotKey === "case_triple_press" || slotKey === "case_triple_press_call") {
            openCaseTriplePressPanel();
        }
    });
}

function injectSmartKnobUI() {
    if (!(modelSpecs && modelSpecs.smartKnob)) {
        return;
    }
    let caseImg = document.getElementById("case-img");
    if (caseImg && !caseImg.dataset.caseGestureBound) {
        caseImg.dataset.caseGestureBound = "1";
        caseImg.style.cursor = "pointer";
        caseImg.addEventListener("click", function () {
            transToCaseGest();
            loadCurrentGestures("case");
        });
    }
}
