let micModeOptions = ["Natural", "Voice Focus"];
let currentMicMode = 0;

function renderMicModeRow() {
    let container = document.getElementById("super_mic_mic_mode_container");
    if (!container) {
        return;
    }
    if (!micModeOptions) {
        container.innerHTML = `
            <div class="settings-switch-label" style="opacity: 0.5;">Mic Mode (not yet available)</div>`;
        return;
    }
    container.innerHTML = `
        <div class="grid grid-cols-2 grid-rows-1" style="cursor: pointer;" onclick="openMicModePicker()">
            <div class="settings-switch-label" style="margin-top: 3px;">Mic Mode</div>
            <div class="text-gray-500 text-sm flex" style="justify-content: right; margin-top: 3px;">${micModeOptions[currentMicMode] || ""}</div>
        </div>`;
}

function openMicModePicker() {
    if (!micModeOptions) {
        return;
    }
    let showPopup = "";
    for (let i = 0; i < micModeOptions.length; i++) {
        showPopup += `<option id="${micModeOptions[i]}" ${i === currentMicMode ? "selected" : ""}>${micModeOptions[i]}</option>`;
    }
    displayPopUp(showPopup);
    document.getElementById("list_container").addEventListener("change", function () {
        let value = document.getElementById("list_container").value;
        let index = micModeOptions.indexOf(value);
        if (index !== -1) {
            setMicMode_BT(index);
        }
        closePopUp();
        openSuperMicSettings();
    });
}
