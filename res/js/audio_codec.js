function audioCodecSupportsLHDC() {
    return !!(modelSpecs && modelSpecs.highQualityAudio & 2);
}

// On models where diracOpteoSupport is tier 1, Dirac Opteo and LDAC are mutually exclusive
function isLdacOpteoExclusive() {
    return !!(modelSpecs && modelSpecs.diracOpteoSupport === 1 && currentAudioCodec === 2);
}

function audioCodecSupportsLDAC() {
    return !!(modelSpecs && modelSpecs.highQualityAudio & 4);
}

function availableAudioCodecIndexes() {
    let indexes = [0];
    if (audioCodecSupportsLHDC()) {
        indexes.push(1);
    }
    if (audioCodecSupportsLDAC()) {
        indexes.push(2);
    }
    return indexes;
}

function injectAudioCodecUI() {
    if (document.getElementById("audio_codec_row")) {
        return;
    }
    let seperator = document.getElementById("seperator");
    if (!seperator) {
        return;
    }
    let rowHtml = `
        <div id="audio_codec_row" class="grid grid-cols-2 grid-rows-1" style="margin-left: -10px; cursor: pointer;" onclick="openAudioCodecPicker()">
            <div class="settings-switch-label" style="margin-top: 3px;">Audio Quality</div>
            <div style="display: flex; align-items: center; justify-content: flex-end;">
                <div id="audio_codec_current_label" class="text-gray-500 text-xs" style="margin-right: 6px;"></div>
                <img src="../assets/arrow_right.svg" alt="arrow-right" style="width: 20px; height: 20px;">
            </div>
        </div>`;

    let dualConnectRow = document.getElementById("dual_connect_manage_row");
    if (dualConnectRow) {
        dualConnectRow.insertAdjacentHTML("afterend", rowHtml);
    } else {
        insertBeforeAnchorRow('[onclick*="showEarTipTestDialog"]', rowHtml, seperator);
    }
    renderAudioCodecUI();
}

function renderAudioCodecUI() {
    let label = document.getElementById("audio_codec_current_label");
    if (label) {
        label.innerText = AUDIO_CODEC_NAMES[currentAudioCodec] || "AAC";
    }
    let list = document.getElementById("audio_codec_list_container");
    if (list) {
        renderAudioCodecList();
    }
}

function audioCodecRowHTML(index) {
    let selected = index === currentAudioCodec;
    return `
        <div class="flex justify-between items-center mb-2 pb-2" style="border-bottom: 1px solid #333333; cursor: pointer;" onclick="selectAudioCodec(${index})">
            <div class="text-white text-sm">${AUDIO_CODEC_NAMES[index]}</div>
            <div class="text-white text-sm" style="visibility: ${selected ? "visible" : "hidden"};">&#10003;</div>
        </div>`;
}

function renderAudioCodecList() {
    let container = document.getElementById("audio_codec_list_container");
    if (!container) {
        return;
    }
    container.innerHTML = availableAudioCodecIndexes().map(audioCodecRowHTML).join("");
}

function selectAudioCodec(index) {
    if (index === currentAudioCodec) {
        closePopUp();
        return;
    }
    let warning = index === 2
        ? "This codec may reduce battery life. Interference and compatibility issues may occur, which could result in choppy audio."
        : "";
    showWarningPopup(`
        <div class="w-fit flex m-auto text-md mb-2 mt-2 text-white text-center">Earbuds reboot required</div>
        <div class="text-gray-400 text-sm text-center mb-4" style="width: 250px;">${warning ? warning + " " : ""}Turning on this audio codec requires rebooting the earbuds</div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 mr-2 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="applyAudioCodecSelection(${index})">Reboot</button>
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Cancel</button>
        </div>`);
}

function applyAudioCodecSelection(index) {
    closePopUp();
    prepareForReboot();
    setHighQualityAudio_BT(index);
    showRebootingPopup();
}

function openAudioCodecPicker() {
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = `
        <div class="w-fit flex m-auto text-md mb-2 mt-2">Audio Quality</div>
        <div id="audio_codec_list_container" style="width: 250px; max-height: 300px; overflow-y: auto;"></div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Close</button>
        </div>`;
    renderAudioCodecList();
}
