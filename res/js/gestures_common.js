// Generic engine for the gesture read/write/UI logic used by every device's
// settings page. Each device file declares:
//   - GESTURE_TOPOLOGY: { sides: ["l","r"] or ["l"], deviceCodes: {l:2, r:3} or {l:6},
//                         sidePrefixes: {l:"left", r:"right"} or null, varPrefix: true|false,
//                         varSuffix: "_current" (default) or "" (crobat has no _current suffix) }
//     varPrefix controls whether the "current value" variable for a slot is named
//     "<sidePrefix>_<key><varSuffix>" (most models) or bare "<key><varSuffix>" (elekid, forretress).
//   - GESTURE_SLOTS: one entry per physical gesture control, e.g.
//     {
//       key: "tap_and_hold",            // matches the "<key>_current" variable(s)
//       type: "tap_and_hold",           // the literal string changeGesture(type) is called with
//                                       // from the existing (untouched) HTML onclick attributes;
//                                       // NOT always the same as `key` (e.g. key "double_pinch"
//                                       // but type "double" for cleffa/corsola/etc.)
//       sendType: 7,                    // gestureType code, also 2nd arg to sendGestures
//       gestureCommon: 10,              // optional 3rd discriminator (elekid/forretress only)
//       sendExtra: 10,                  // optional 4th arg to sendGestures (elekid/forretress only)
//       options: tap_and_hold,          // reference to the option-label array
//       actionToIndex: {10:0, 20:0, 21:0, 22:0, 11:1},  // protocol action code -> option index
//       ancToggle: { selectorName: "anc_selector_tap", panelId: "anc_tap_settings", mergedIndex: 0 },
//       subtitleId: "settings_subtitle_tap_and_hold",
//       loadSuffix: "",                 // literal HTML appended in loadCurrentGestures
//       changeSuffix: "",               // literal HTML appended live, in changeGesture's listener
//       neverCloseOnChange: false,      // true only for flaaffy's double_pinch_and_hold quirk
//       alwaysCloseOnChange: false,     // true for elekid's button_press/button_hold, which close
//                                       // even when the new value is "Noise control"
//       syncBothSides: false,           // true only for jumpluff's pinch_both_buds slot - a
//                                       // gesture that isn't tied to either ear (confirmed via
//                                       // the decompiled app sending it to both device codes
//                                       // together); writes/updates every topology side on
//                                       // change instead of just the currently-viewed one.
//     }
// and then delegates its own updateGesturesFromArray/loadCurrentGestures/changeGesture/
// checkboxCheck into the generic functions below.

function decodeAncSelectorAction(action) {
    if (action == 10) return [1, 1, 1];
    if (action == 20) return [0, 1, 1];
    if (action == 21) return [1, 0, 1];
    if (action == 22) return [1, 1, 0];
    return null;
}

function gestureCurrentVarName(topology, side, slot) {
    var prefix = topology.varPrefix ? (topology.sidePrefixes ? topology.sidePrefixes[side] : side) + "_" : "";
    var suffix = topology.varSuffix !== undefined ? topology.varSuffix : "_current";
    return prefix + slot.key + suffix;
}

function findGestureSlot(slots, gestureType, gestureCommon) {
    for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        if (slot.sendType != gestureType) continue;
        if (slot.gestureCommon !== undefined && slot.gestureCommon != gestureCommon) continue;
        return slot;
    }
    return undefined;
}

function findGestureSlotByType(slots, type) {
    for (var i = 0; i < slots.length; i++) {
        if (slots[i].type === type) return slots[i];
    }
    return undefined;
}

function findGestureSlotByKey(slots, key) {
    for (var i = 0; i < slots.length; i++) {
        if (slots[i].key === key) return slots[i];
    }
    return undefined;
}

function sideForGestureDevice(topology, gestureDevice) {
    for (var side in topology.deviceCodes) {
        if (topology.deviceCodes[side] == gestureDevice) return side;
    }
    return undefined;
}

function reverseLookupAction(actionToIndex, index) {
    for (var action in actionToIndex) {
        if (actionToIndex[action] === index) return Number(action);
    }
    return 0;
}

function applyGestureRecords(records, topology, slots) {
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var side = sideForGestureDevice(topology, record.gestureDevice);
        if (side === undefined) continue;
        var slot = findGestureSlot(slots, record.gestureType, record.gestureCommon);
        if (!slot) continue;
        var index = slot.actionToIndex[record.gestureAction];
        if (index === undefined) continue;
        window[gestureCurrentVarName(topology, side, slot)] = slot.options[index];
        if (slot.ancToggle) {
            var decoded = decodeAncSelectorAction(record.gestureAction);
            if (decoded) window[slot.ancToggle.selectorName] = decoded;
        }
    }
}

function loadCurrentGesturesGeneric(side, topology, slots) {
    if (topology.sides.indexOf(side) === -1) return;
    for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        var el = document.getElementById(slot.subtitleId);
        if (!el) continue;
        el.innerHTML = window[gestureCurrentVarName(topology, side, slot)] + (slot.loadSuffix || "");
    }
}

function renderGestureChangePopup(type, topology, slots) {
    var slot = findGestureSlotByType(slots, type);
    var options = slot.options;

    var showPopup = "";
    for (var i = 0; i < options.length; i++) {
        var selected = window[gestureCurrentVarName(topology, current_side, slot)] == options[i] ? "selected" : "";
        showPopup += `
            <option id="${options[i]}" ${selected}>
                ${options[i]}
            </option>
           `;
    }

    if (slot.ancToggle) {
        var sel = window[slot.ancToggle.selectorName];
        document.getElementById("popup_container").style.opacity = "100";
        document.getElementById("popup_container").style.zIndex = "1000";
        document.getElementById("popup_content").style.zIndex = "1001";

        document.getElementById("popup_content").innerHTML = ` <div class="w-fit flex m-auto text-md mb-5 mt-2">
        Change gesture
            </div>
                <div id="${slot.ancToggle.panelId}" style="display: none; margin-bottom: 40px;">
                <label class="text-sm" style="height: 13px;"><input type="checkbox" ${sel[0] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, '${slot.key}');">Transparency</label><br />
                <label class="text-sm" style="height: 13px;"><input type="checkbox" ${sel[1] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, '${slot.key}');">Noise cancellation</label><br />
                <label class="text-sm" style="height: 13px;"><input type="checkbox" ${sel[2] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, '${slot.key}');">Off</label>
            </div>
            <select id="list_container" class="flex flex-col w-fit m-auto bg-[#1B1D1F] w-[300px] outline-none p-3 border-[#333333] border-[1px] rounded-md" style="width: 300px; padding: 12px; border: #333333 1px solid; background-color: #1B1D1F; outline: none;">
            ${showPopup}</select>`;
        if (window[gestureCurrentVarName(topology, current_side, slot)] == "Noise control") {
            document.getElementById(slot.ancToggle.panelId).style.display = "grid";
        }
    } else {
        displayPopUp(showPopup);
    }

    document.getElementById("list_container").addEventListener("change", function (e) {
        var value = document.getElementById("list_container").value;
        document.getElementById(slot.subtitleId).innerHTML = value + (slot.changeSuffix || "");
        if (slot.ancToggle) {
            if (value == "Noise control") {
                document.getElementById(slot.ancToggle.panelId).style.display = "grid";
            } else {
                document.getElementById(slot.ancToggle.panelId).style.display = "none";
            }
        }
        for (var s = 0; s < topology.sides.length; s++) {
            var side = topology.sides[s];
            if (!slot.syncBothSides && current_side != side) continue;
            window[gestureCurrentVarName(topology, side, slot)] = value;
            var index = options.indexOf(value);
            var operation = 0;
            if (slot.ancToggle && index === slot.ancToggle.mergedIndex) {
                operation = getANCtoggleFunction(window[slot.ancToggle.selectorName]);
            } else {
                operation = reverseLookupAction(slot.actionToIndex, index);
            }
            sendGestures(topology.deviceCodes[side], slot.sendType, operation, slot.sendExtra);
        }
        document.getElementById("list_container").removeEventListener("change", () => { });
        if (!slot.neverCloseOnChange && (slot.alwaysCloseOnChange || value != "Noise control")) {
            closePopUp();
        }
    });
}

function checkboxCheckGeneric(evt, slotKey, topology, slots) {
    var slot = findGestureSlotByKey(slots, slotKey);
    var checkboxes = document.querySelectorAll('[id=checkbox]');
    var checkboxesChecked = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checkboxesChecked.push(checkboxes[i]);
        }
    }
    if (checkboxesChecked.length < 2) {
        return event.target.checked = !event.target.checked;
    } else {
        event.target.checked = event.target.checked;
        var index = Array.prototype.indexOf.call(checkboxes, evt.target);
        var selector = window[slot.ancToggle.selectorName];
        selector[index] = selector[index] == 1 ? 0 : 1;
        for (var s = 0; s < topology.sides.length; s++) {
            var side = topology.sides[s];
            sendGestures(topology.deviceCodes[side], slot.sendType, getANCtoggleFunction(selector), slot.sendExtra);
        }
    }
}
