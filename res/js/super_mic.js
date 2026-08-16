function injectSuperMicUI() {
    if (document.getElementById("super_mic_switch_container")) {
        return;
    }
    let seperator = document.getElementById("seperator");
    if (!seperator) {
        return;
    }
    let toggleHtml = `
        <div id="super_mic_switch_container" class="settings-switch-container overflow-hidden" style="margin-left: -10px;">
            <div class="settings-switch-button" style="margin-left: 10px;">
                <div class="settings-switch-indicator">
                    <input type="checkbox" id="super_mic_enable" class="settings-switch-checkbox" onclick="toggleSuperMic()"
                           style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; flex: 1; position: relative; z-index: 1; cursor: pointer;" onclick="openSuperMicSettingsIfEnabled()">
                <div class="settings-switch-label">Super Mic</div>
                <img id="super_mic_arrow" src="../assets/arrow_right.svg" alt="arrow-right" style="width: 20px; height: 20px; display: none;">
            </div>
        </div>`;
    insertBeforeAnchorRow('[onclick*="showEarTipTestDialog"]', toggleHtml, seperator);
}

function openSuperMicSettingsIfEnabled() {
    if (superMicEnabled) {
        openSuperMicSettings();
    }
}

function setSuperMicCheckbox(enabled) {
    let checkbox = document.getElementById("super_mic_enable");
    if (checkbox) {
        checkbox.checked = enabled;
    }
    let arrow = document.getElementById("super_mic_arrow");
    if (arrow) {
        arrow.style.display = enabled ? "inline" : "none";
    }
    let popupCheckbox = document.getElementById("super_mic_popup_enable");
    if (popupCheckbox) {
        popupCheckbox.checked = enabled;
    }
}

function toggleSuperMic() {
    let enabled = document.getElementById("super_mic_enable").checked;
    setSuperMicEnable_BT(enabled);
    setSuperMicCheckbox(enabled);
}

function togglePopupSuperMic() {
    let enabled = document.getElementById("super_mic_popup_enable").checked;
    setSuperMicEnable_BT(enabled);
    setSuperMicCheckbox(enabled);
}

function openSuperMicSettings() {
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = `
        <div class="w-fit flex m-auto text-md mb-4 mt-2 text-white text-center">Super Mic</div>
        <div style="width: 300px;">
            <div class="settings-switch-container overflow-hidden">
                <div class="settings-switch-button">
                    <div class="settings-switch-indicator">
                        <input type="checkbox" id="super_mic_popup_enable" class="settings-switch-checkbox" onclick="togglePopupSuperMic()" ${superMicEnabled ? "checked" : ""}
                               style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                    </div>
                </div>
                <div class="settings-switch-label">Enable</div>
            </div>
            <div class="h-[2px] bg-gray-500 w-full rounded-xl mt-2 mb-2" style="opacity: 0.5;"></div>
            <div id="super_mic_mic_mode_container"></div>
            <div class="h-[2px] bg-gray-500 w-full rounded-xl mt-2 mb-2" style="opacity: 0.5;"></div>
            ${walkieTalkieRowHTML()}
        </div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Close</button>
        </div>`;
    renderMicModeRow();
}
