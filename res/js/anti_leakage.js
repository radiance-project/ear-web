let antiLeakageOptions = ["Off", "Calls only", "Audio + Calls"];
let currentAntiLeakageMode = 0;

function injectAntiLeakageUI() {
    if (document.getElementById("anti_leakage_row")) {
        return;
    }
    let seperator = document.getElementById("seperator");
    if (!seperator) {
        return;
    }
    let rowHtml = `
        <div id="anti_leakage_row" class="grid grid-cols-2 grid-rows-1" style="margin-left: -10px; cursor: pointer;" onclick="openAntiLeakagePicker()">
            <div class="settings-switch-label" style="margin-top: 3px;">Anti-leakage Mode</div>
            <div style="display: flex; align-items: center; justify-content: flex-end;">
                <div id="anti_leakage_current_label" class="text-gray-500 text-xs" style="margin-right: 6px;"></div>
                <img src="../assets/arrow_right.svg" alt="arrow-right" style="width: 20px; height: 20px;">
            </div>
        </div>`;
    insertBeforeAnchorRow('[onclick*="showEarTipTestDialog"]', rowHtml, seperator);
    renderAntiLeakageRow();
}

function renderAntiLeakageRow() {
    let valueEl = document.getElementById("anti_leakage_current_label");
    if (valueEl) {
        valueEl.innerText = antiLeakageOptions[currentAntiLeakageMode] || "Off";
    }
}

function openAntiLeakagePicker() {
    let showPopup = "";
    for (let i = 0; i < antiLeakageOptions.length; i++) {
        showPopup += `<option id="${antiLeakageOptions[i]}" ${i === currentAntiLeakageMode ? "selected" : ""}>${antiLeakageOptions[i]}</option>`;
    }
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    document.getElementById("popup_content").style.zIndex = "1001";
    document.getElementById("popup_content").innerHTML = `
        <div class="w-fit flex m-auto text-md mb-5 mt-2">Anti-leakage mode</div>
        <select id="list_container" class="flex flex-col w-fit m-auto bg-[#1B1D1F] w-[300px] outline-none p-3 border-[#333333] border-[1px] rounded-md" style="width: 300px; padding: 12px; border: #333333 1px solid; background-color: #1B1D1F; outline: none;">
        ${showPopup}</select>`;
    document.getElementById("list_container").addEventListener("change", function () {
        let value = document.getElementById("list_container").value;
        let index = antiLeakageOptions.indexOf(value);
        if (index !== -1) {
            setAntiLeakageMode_BT(index);
        }
        closePopUp();
    });
}
