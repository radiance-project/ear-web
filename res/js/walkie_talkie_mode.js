function walkieTalkieRowHTML() {
    return `
        <div id="walkie_talkie_switch_container" class="settings-switch-container overflow-hidden">
            <div class="settings-switch-button">
                <div class="settings-switch-indicator">
                    <input type="checkbox" id="walkie_talkie_enable" class="settings-switch-checkbox" onclick="toggleWalkieTalkieMode()" ${walkieTalkieModeEnabled ? "checked" : ""}
                           style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                </div>
            </div>
            <div class="settings-switch-label">Walkie Talkie Mode</div>
        </div>`;
}

function setWalkieTalkieModeCheckbox(enabled) {
    let checkbox = document.getElementById("walkie_talkie_enable");
    if (checkbox) {
        checkbox.checked = enabled;
    }
}

function toggleWalkieTalkieMode() {
    let enabled = document.getElementById("walkie_talkie_enable").checked;
    setWalkieTalkieMode_BT(enabled);
}
