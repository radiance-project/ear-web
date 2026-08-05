// Spatial Audio mode picker UI.
// Injects a settings row into the existing QUICK SETTINGS panel (anchored on the
// #seperator element present on every model page) showing the current mode, opening
// a picker popup built on top of the app's existing #popup_container mechanism
// (see transitions.js: showWarningPopup / closePopUp), matching audio_codec.js's pattern.
// Only activated for models with a "spatialAudio" bitmask in ear_config_file.json, via
// initSpatialAudioIfSupported() in bluetooth_socket.js.
// Mode availability is gated per-bit (see SPATIAL_AUDIO_MODES in bluetooth_socket.js);
// "Off" is always available.

function availableSpatialAudioIndexes() {
    let indexes = [0];
    for (let i = 1; i < SPATIAL_AUDIO_MODES.length; i++) {
        let bit = SPATIAL_AUDIO_MODES[i].bit;
        if (modelSpecs && bit !== null && (modelSpecs.spatialAudio & bit)) {
            indexes.push(i);
        }
    }
    return indexes;
}

function injectSpatialAudioUI() {
    if (document.getElementById("spatial_audio_row")) {
        return; // already injected
    }
    let seperator = document.getElementById("seperator");
    if (!seperator) {
        return;
    }
    let rowHtml = `
        <div id="spatial_audio_row" class="grid grid-cols-2 grid-rows-1" style="margin-left: -10px; cursor: pointer;" onclick="openSpatialAudioPicker()">
            <div class="settings-switch-label" style="margin-top: 3px;">Spatial Audio</div>
            <div style="display: flex; align-items: center; justify-content: flex-end;">
                <div id="spatial_audio_current_label" class="text-gray-500 text-xs" style="margin-right: 6px;"></div>
                <img src="../assets/arrow_right.svg" alt="arrow-right" style="width: 20px; height: 20px;">
            </div>
        </div>`;

    insertBeforeAnchorRow('[onclick*="showEarTipTestDialog"]', rowHtml, seperator);
    renderSpatialAudioUI();
}

function renderSpatialAudioUI() {
    let label = document.getElementById("spatial_audio_current_label");
    if (label) {
        label.innerText = (SPATIAL_AUDIO_MODES[currentSpatialAudioMode] || SPATIAL_AUDIO_MODES[0]).name;
    }
    let list = document.getElementById("spatial_audio_list_container");
    if (list) {
        renderSpatialAudioList();
    }
}

function spatialAudioRowHTML(index) {
    let selected = index === currentSpatialAudioMode;
    return `
        <div class="flex justify-between items-center mb-2 pb-2" style="border-bottom: 1px solid #333333; cursor: pointer;" onclick="selectSpatialAudioMode(${index})">
            <div class="text-white text-sm">${SPATIAL_AUDIO_MODES[index].name}</div>
            <div class="text-white text-sm" style="visibility: ${selected ? "visible" : "hidden"};">&#10003;</div>
        </div>`;
}

function renderSpatialAudioList() {
    let container = document.getElementById("spatial_audio_list_container");
    if (!container) {
        return;
    }
    container.innerHTML = availableSpatialAudioIndexes().map(spatialAudioRowHTML).join("");
}

function selectSpatialAudioMode(index) {
    closePopUp();
    if (index === currentSpatialAudioMode) {
        return;
    }
    if (index !== 0 && isSpatialAudioEqExclusive() && (bassEnhanceEnabled || advancedEQEnabled)) {
        showMutuallyExclusiveWarning("Spatial Audio", advancedEQEnabled ? "Advanced EQ" : "Bass Enhance");
        return;
    }
    setSpatialAudio_BT(index);
}

function openSpatialAudioPicker() {
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = `
        <div class="w-fit flex m-auto text-md mb-2 mt-2">Spatial Audio</div>
        <div id="spatial_audio_list_container" style="width: 250px; max-height: 300px; overflow-y: auto;"></div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Close</button>
        </div>`;
    renderSpatialAudioList();
}
