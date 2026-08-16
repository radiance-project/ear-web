var CASE_TOPOLOGY = {
    sides: ["case"],
    deviceCodes: { case: 4 },
    sidePrefixes: null,
    varPrefix: false,
};

var case_hold_options = ["Essential Space", "Voice Assistant", "No action"];
var case_hold_current = case_hold_options[0];

var CASE_SLOTS = [
    {
        key: "case_hold",
        type: "case_hold",
        sendType: 7,
        options: case_hold_options,
        actionToIndex: { 33: 0, 11: 1, 1: 2 },
        subtitleId: "settings_subtitle_case_hold",
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
    setTimeout(() => {
        document.getElementById("test").style.opacity = "100";
        document.getElementById("test").style.zIndex = "100";
        document.getElementById("back").style.opacity = "100";
    }, 500);
}

function injectCaseButtonUI() {
    if (modelBase !== "B173") {
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
