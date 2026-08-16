function injectCallTransparencyUI() {
    if (document.getElementById("call_transparency_switch_container")) {
        return;
    }
    let seperator = document.getElementById("seperator");
    if (!seperator) {
        return;
    }
    let toggleHtml = `
        <div id="call_transparency_switch_container" class="settings-switch-container overflow-hidden">
            <div class="settings-switch-button">
                <div class="settings-switch-indicator">
                    <input type="checkbox" id="call_transparency_enable" class="settings-switch-checkbox" onclick="toggleCallTransparency()"
                           style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                </div>
            </div>
            <div class="settings-switch-label">Auto-transparency mode</div>
        </div>`;
    insertBeforeAnchorRow('[onclick*="showEarTipTestDialog"]', toggleHtml, seperator);
}

function setCallTransparencyCheckbox(enabled) {
    let checkbox = document.getElementById("call_transparency_enable");
    if (checkbox) {
        checkbox.checked = enabled;
    }
}

function toggleCallTransparency() {
    let enabled = document.getElementById("call_transparency_enable").checked;
    setCallTransparencyEnable_BT(enabled);
}
