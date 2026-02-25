// EQ Presets Manager

/**
 * structure of saved presets in localStorage (key: "ear_web_eq_presets"):
 * {
 *   "MODEL_ID": [
 *     { "name": "My Preset 1", "data": [0, 0, 0] }, // For custom EQ devices (data is [Bass, Mid, Treble])
 *     { "name": "Gym Mode", "data": 3 }             // For fixed EQ devices (data is preset ID)
 *   ]
 * }
 */

function getPresets(modelID) {
    let allPresets = JSON.parse(localStorage.getItem("ear_web_eq_presets") || "{}");
    return allPresets[modelID] || [];
}

function savePresetToStorage(modelID, name, data) {
    let allPresets = JSON.parse(localStorage.getItem("ear_web_eq_presets") || "{}");
    if (!allPresets[modelID]) {
        allPresets[modelID] = [];
    }
    allPresets[modelID].push({ name: name, data: data });
    localStorage.setItem("ear_web_eq_presets", JSON.stringify(allPresets));
    renderPresetsUI(modelID);
}

function deletePresetFromStorage(modelID, index) {
    let allPresets = JSON.parse(localStorage.getItem("ear_web_eq_presets") || "{}");
    if (allPresets[modelID]) {
        allPresets[modelID].splice(index, 1);
        localStorage.setItem("ear_web_eq_presets", JSON.stringify(allPresets));
        renderPresetsUI(modelID);
    }
}

function renderPresetsUI(modelID) {
    const container = document.getElementById("eq_presets_container");
    if (!container) return;

    // Clear existing
    container.innerHTML = "";

    const presets = getPresets(modelID);

    // Create UI elements
    const select = document.createElement("select");
    select.className = "p-2 bg-black text-white border border-gray-600 rounded-md w-full mb-2";
    select.id = "preset_selector";

    const defaultOption = document.createElement("option");
    defaultOption.text = "-- Load Preset --";
    defaultOption.value = -1;
    select.appendChild(defaultOption);

    presets.forEach((preset, index) => {
        const option = document.createElement("option");
        option.text = preset.name;
        option.value = index;
        select.appendChild(option);
    });

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "grid grid-cols-2 gap-2";

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save Current";
    saveButton.className = "p-2 bg-white text-black rounded-md hover:bg-gray-200 transition";
    saveButton.onclick = () => {
        const name = prompt("Enter preset name:");
        if (name) {
            // This function needs to be defined in the specific device's JS or passed in
            const currentData = getCurrentEQData();
            savePresetToStorage(modelID, name, currentData);
        }
    };

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete Selected";
    deleteButton.className = "p-2 bg-red-900 text-white rounded-md hover:bg-red-800 transition";
    deleteButton.onclick = () => {
        const selectedIndex = select.value;
        if (selectedIndex >= 0) {
            if (confirm("Delete this preset?")) {
                deletePresetFromStorage(modelID, selectedIndex);
            }
        } else {
            alert("Please select a preset to delete.");
        }
    };

    // Apply button
    const loadButton = document.createElement("button");
    loadButton.innerText = "Load";
    loadButton.className = "p-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition col-span-2 mt-2";
    loadButton.onclick = () => {
         const selectedIndex = select.value;
        if (selectedIndex >= 0) {
            const preset = presets[selectedIndex];
            applyPresetData(preset.data);
        }
    };

    // Auto-load on select change? No, let's use a Load button or just change listener.
    // Change listener is smoother.
    select.onchange = () => {
         const selectedIndex = select.value;
        if (selectedIndex >= 0) {
            const preset = presets[selectedIndex];
            applyPresetData(preset.data);
        }
    }

    container.appendChild(select);
    container.appendChild(buttonsContainer);
    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(deleteButton);
    // container.appendChild(loadButton); // Optional if onchange works
}
