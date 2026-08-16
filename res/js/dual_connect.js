// Dual connection (multipoint) management UI.
// Injects a settings toggle into the existing QUICK SETTINGS panel (anchored on the
// #seperator element present on every model page). The "Manage devices" submenu is reached
// from that same row rather than a separate one - tapping the label (as opposed to the
// switch itself) opens the management popup (see transitions.js: showWarningPopup /
// closePopUp), and a right-arrow only appears once the toggle is on to signal there's more
// to tap into.
// Only activated for models flagged "dualConnection" in ear_config_file.json, via
// initDualConnectionIfSupported() in bluetooth_socket.js.

function injectDualConnectUI() {
    if (document.getElementById("dual_connect_switch_container")) {
        return; // already injected
    }
    let seperator = document.getElementById("seperator");
    if (!seperator) {
        return;
    }
    let toggleHtml = `
        <div id="dual_connect_switch_container" class="settings-switch-container overflow-hidden" style="margin-left: -10px;">
            <div class="settings-switch-button" style="margin-left: 10px;">
                <div class="settings-switch-indicator">
                    <input type="checkbox" id="dual_connect_enable" class="settings-switch-checkbox" onclick="toggleDualConnect()"
                           style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; flex: 1; position: relative; z-index: 1; cursor: pointer;" onclick="openDualConnectManagerIfEnabled()">
                <div class="settings-switch-label">Dual Connection</div>
                <img id="dual_connect_arrow" src="../assets/arrow_right.svg" alt="arrow-right" style="width: 20px; height: 20px; display: none;">
            </div>
        </div>`;

    insertBeforeAnchorRow('[onclick*="showEarTipTestDialog"]', toggleHtml, seperator);
}

function openDualConnectManagerIfEnabled() {
    if (dualConnectEnabled) {
        openDualConnectManager();
    }
}

function setDualEnableCheckbox(enabled) {
    let checkbox = document.getElementById("dual_connect_enable");
    if (checkbox) {
        checkbox.checked = enabled;
    }
    let arrow = document.getElementById("dual_connect_arrow");
    if (arrow) {
        arrow.style.display = enabled ? "inline" : "none";
    }
    closeRebootPopupIfShown();
}

function toggleDualConnect() {
    let enabled = document.getElementById("dual_connect_enable").checked;
    if (modelSpecs && modelSpecs.dualConnectionReboot) {
        setDualEnableCheckbox(!enabled);
        showWarningPopup(`
            <div class="w-fit flex m-auto text-md mb-2 mt-2 text-white text-center">Earbuds reboot required</div>
            <div class="text-gray-400 text-sm text-center mb-4" style="width: 250px;">Turning on/off dual connection requires rebooting the earbuds</div>
            <div class="flex justify-center mt-4">
                <button class="p-2 pl-6 pr-6 mr-2 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="applyDualConnectToggle(${enabled})">Reboot</button>
                <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Cancel</button>
            </div>`);
    } else {
        applyDualConnectToggle(enabled);
    }
}

function applyDualConnectToggle(enabled) {
    closePopUp();
    let requiresReboot = modelSpecs && modelSpecs.dualConnectionReboot;
    if (requiresReboot) {
        prepareForReboot();
    }
    setDualEnable_BT(enabled);
    setDualEnableCheckbox(enabled);
    if (requiresReboot) {
        showRebootingPopup();
    }
    if (enabled) {
        setTimeout(getDualList, 300);
    }
}

const DUAL_CONNECT_MAX_DEVICES = 2;

function dualDeviceRowHTML(device, connectedCount) {
    let label = device.isSelf ? "This device" : (device.name || "Unknown device");
    let statusText = device.isConnected ? "Connected" : "Not connected";
    let atCapacity = connectedCount >= DUAL_CONNECT_MAX_DEVICES;
    let disabled = !device.isConnected && atCapacity;
    let checkbox = `
        <div style="overflow: hidden; width: 40px; height: 20px; flex-shrink: 0; ${disabled ? "opacity: 0.4;" : ""}">
            <div class="settings-switch-button">
                <div class="settings-switch-indicator">
                    <input type="checkbox" class="settings-switch-checkbox" ${device.isConnected ? "checked" : ""} ${disabled ? "disabled" : ""}
                           onclick="toggleDualDeviceConnect('${device.mac}', this.checked)"
                           style="opacity: 0; width: 300px; height:300px; cursor: ${disabled ? "not-allowed" : "pointer"}; margin-top: -6px; margin-left: -35px" />
                </div>
            </div>
        </div>`;
    return `
        <div class="flex justify-between items-center mb-2 pb-2" style="border-bottom: 1px solid #333333;">
            <div class="text-left">
                <div class="text-white text-sm">${label}</div>
                <div class="text-gray-500 text-xs">${statusText}</div>
            </div>
            ${checkbox}
        </div>`;
}

function toggleDualDeviceConnect(mac, connect) {
    if (connect) {
        connectDualDevice(mac);
    } else {
        disconnectDualDevice(mac);
    }
}

function renderDualConnectList() {
    let container = document.getElementById("dual_connect_list_container");
    if (!container) {
        return;
    }
    let connectedCount = dualConnectList.filter(device => device.isConnected).length;
    let header = document.getElementById("dual_connect_status_header");
    if (header) {
        header.innerText = `${connectedCount} of ${DUAL_CONNECT_MAX_DEVICES} devices connected`;
    }
    if (dualConnectList.length === 0) {
        container.innerHTML = `<div class="text-gray-500 text-sm text-center p-2">No remembered devices found.</div>`;
        return;
    }
    container.innerHTML = dualConnectList.map(device => dualDeviceRowHTML(device, connectedCount)).join("");
}

function openDualConnectManager() {
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = `
        <div class="w-fit flex m-auto text-md mb-2 mt-2">Dual Connection</div>
        <div id="dual_connect_status_header" class="text-gray-500 text-xs text-center mb-4"></div>
        <div id="dual_connect_list_container" style="width: 300px; max-height: 300px; overflow-y: auto;"></div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Close</button>
        </div>`;
    renderDualConnectList();
    getDualList();
}

function connectDualDevice(mac) {
    setDualConnect_BT(mac, true);
    setTimeout(getDualList, 300);
}

function disconnectDualDevice(mac) {
    setDualConnect_BT(mac, false);
    setTimeout(getDualList, 300);
}
