var double_press_options = ["Skip Back", "Skip Forward", "Voice Assistant", "No action"];
var left_double_press_current = double_press_options[0];
var right_double_press_current = double_press_options[0];

var triple_press_options = ["Skip Back", "Skip Forward", "Voice Assistant", "No action"];
var left_triple_press_current = triple_press_options[0];
var right_triple_press_current = triple_press_options[0];

var press_hold_options = ["Volume up", "Volume down", "Voice Assistant", "No action"];
var left_press_hold_current = press_hold_options[0];
var right_press_hold_current = press_hold_options[0];

var double_press_hold_options = ["Volume up", "Volume down", "Voice Assistant", "No action"];
var left_double_press_hold_current = double_press_hold_options[0];
var right_double_press_hold_current = double_press_hold_options[0];

let leftStateEarTipTest = undefined
let rightStateEarTipTest = undefined
let bass_enhance = [0, 0]

var current_side;

//---------------------------------------------------------------------------------//

leftEarPeace = document.getElementById("left_ear_peace")
rightEarPeace = document.getElementById("right_ear_peace")

leftEarBattery = document.getElementById("left_ear_battery")
rightEarBattery = document.getElementById("right_ear_battery")

prod_name = document.getElementById("prod_name")
pages_container = document.getElementById("pages_container")
settings_icon = document.getElementById("settings_icon")

ringButton = document.getElementById("ring_button")

var intro_timeout;
var intro_timeout2;

var GESTURE_TOPOLOGY = {
    sides: ["l", "r"],
    deviceCodes: { l: 2, r: 3 },
    sidePrefixes: { l: "left", r: "right" },
    varPrefix: true,
};

var GESTURE_SLOTS = [
    {
        key: "double_press",
        type: "double",
        sendType: 2,
        options: double_press_options,
        actionToIndex: { 8: 0, 9: 1, 11: 2, 1: 3 },
        subtitleId: "settings_subtitle_double",
        // JSON's 2nd "gesture_not_customisation" group for double_press is a fixed op 29
        // ("decline_incoming_calls") - informational only, same treatment as espeon.js's own
        // ear-side double_tap slot.
        loadSuffix: "<br />Declines calls</div>",
        changeSuffix: "<br />Declines calls",
    },
    {
        key: "triple_press",
        type: "triple",
        sendType: 3,
        options: triple_press_options,
        actionToIndex: { 8: 0, 9: 1, 11: 2, 1: 3 },
        subtitleId: "settings_subtitle_triple",
    },
    {
        key: "press_hold",
        type: "press_hold",
        sendType: 7,
        options: press_hold_options,
        actionToIndex: { 18: 0, 19: 1, 11: 2, 1: 3 },
        subtitleId: "settings_subtitle_press_hold",
    },
    {
        key: "double_press_hold",
        type: "double_press_hold",
        sendType: 9,
        options: double_press_hold_options,
        actionToIndex: { 18: 0, 19: 1, 11: 2, 1: 3 },
        subtitleId: "settings_subtitle_double_press_hold",
    },
];

// SMART_DIAL_TOPOLOGY/SMART_DIAL_SLOTS (smart_dial.js) is a third gesture "side" for the
// case's dial, same pattern as feraligator.js's case_button.js / espeon.js's smart_knob.js.
function updateGesturesFromArray(records) {
    applyGestureRecords(records, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    if (typeof SMART_DIAL_TOPOLOGY !== "undefined") {
        applyGestureRecords(records, SMART_DIAL_TOPOLOGY, SMART_DIAL_SLOTS);
    }
    loadCurrentGestures(current_side, false);
}

function loadCurrentGestures(side, refresh = true) {
    if (refresh) {
        sendGetGesture();
    }
    current_side = side;
    loadCurrentGesturesGeneric(side, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    if (typeof SMART_DIAL_TOPOLOGY !== "undefined") {
        loadCurrentGesturesGeneric(side, SMART_DIAL_TOPOLOGY, SMART_DIAL_SLOTS);
    }
    if (typeof toggleDialGestureRows === "function") {
        toggleDialGestureRows(side === "dial");
    }
}

function changeGesture(type) {
    if (current_side === "dial" && typeof SMART_DIAL_TOPOLOGY !== "undefined") {
        renderGestureChangePopup(type, SMART_DIAL_TOPOLOGY, SMART_DIAL_SLOTS);
    } else {
        renderGestureChangePopup(type, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    }
}

function checkboxCheck(evt, slotKey) {
    if (current_side === "dial" && typeof SMART_DIAL_TOPOLOGY !== "undefined") {
        checkboxCheckGeneric(evt, slotKey, SMART_DIAL_TOPOLOGY, SMART_DIAL_SLOTS);
    } else {
        checkboxCheckGeneric(evt, slotKey, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    }
}

const BASS_STAGE_DOT_IDS_B189 = ["stage_one_button_bass", "stage_two_button_bass", "stage_three_button_bass"];

// viewport_scale.js applies a page-wide transform: scale(...) to #container_one (to fit the
// window), so getBoundingClientRect() values below are in post-transform (rendered) pixels -
// dividing by this factor converts back to the pre-transform (design/CSS) pixels that
// .style.width actually gets interpreted in, since it's applied *before* the ancestor
// transform. Skipping this would silently undershoot by (1 - scale) at any zoom level
// other than exactly 1.
function currentPageScale() {
    let container = document.getElementById("container_one");
    if (!container) {
        return 1;
    }
    let match = /scale\(([^)]+)\)/.exec(container.style.transform || "");
    let scale = match ? parseFloat(match[1]) : 1;
    return scale > 0 && isFinite(scale) ? scale : 1;
}

// Bar width is measured from the live DOM at call time rather than hardcoded per-level
// pixel constants - lines up with wherever the dots actually render (correct regardless of
// viewport_scale.js's zoom level, container width, etc.) instead of pixel values eyeballed
// against one screenshot at one scale. For every level except the last, the bar's right edge
// extends past that level's dot's own right edge, fully covering/hiding it (matching the
// shared 5-stage BASS_PANEL_HTML's look - "filled" dots disappear under the bar entirely, not
// just partially, while not-yet-reached ones stay fully visible ahead). The last level fills
// all the way to the track's actual right edge instead, since its dot sits short of the edge
// like every other dot does.
function bassLevelSelectorWidth(level) {
    let track = document.querySelector("#bass_strength_selector .grid");
    let bar = document.getElementById("bass_strength_length_selector");
    if (!track || !bar) {
        return "12px";
    }
    let scale = currentPageScale();
    let barLeft = bar.getBoundingClientRect().left;
    let targetRight;
    if (level >= BASS_STAGE_DOT_IDS_B189.length - 1) {
        targetRight = track.getBoundingClientRect().right;
    } else {
        let dot = document.getElementById(BASS_STAGE_DOT_IDS_B189[level]);
        if (!dot) {
            return "12px";
        }
        let dotRect = dot.getBoundingClientRect();
        targetRight = dotRect.right;
    }
    return (Math.max(0, targetRight - barLeft) / scale) + "px";
}

// Override of device_common.js's default setBassEnhance(): same as the shared version
// (including hiding bass_strength_selector while off) - the separate ON/OFF switch above the
// level picker still works independently to turn it back on and reveal the picker again, even
// though picking a level also flips this same state (see setBassLevel below). Also carries its
// own Long Battery Life Mode guard (device_common.js's shared version only guards against
// Spatial Audio) - same "bass boost will be turned off" relationship confirmed via the
// official app's "long_battery_life_mode_desc" string.
function setBassEnhance(state, is_send = false) {
    console.log("setBassEnhance", state);
    if (is_send && state === 1 && typeof longPowerModeEnabled !== "undefined" && longPowerModeEnabled) {
        showMutuallyExclusiveWarning("Bass Enhance", "Long Battery Life Mode");
        return;
    }
    if (state === 1) {
        bass_enhance[0] = 1;
        document.getElementById("selector_bass").style.marginLeft = "65px";
        document.getElementById("bass_on").style.fill = "black";
        document.getElementById("bass_on").style.stroke = "black";
        document.getElementById("bass_off").style.fill = "white";
        document.getElementById("bass_strength_selector").style.opacity = "100";
    } else {
        bass_enhance[0] = 0;
        document.getElementById("selector_bass").style.marginLeft = "160px";
        document.getElementById("bass_on").style.fill = "white";
        document.getElementById("bass_on").style.stroke = "white";
        document.getElementById("bass_off").style.fill = "black";
        document.getElementById("bass_strength_selector").style.opacity = "0";
    }
    if (is_send) {
        set_enhanced_bass(bass_enhance[0], bass_enhance[1]);
    }
}

// Override of device_common.js's default setBassLevel(): this device only has 3 Ultra Bass
// levels (real intensity 0/2.5/5), not the standard 5-level scheme - MainControl_igglybuff.html
// hand-codes its own 3-stage panel (stage_one/two/three_button_bass, positions 0/1/2) instead
// of injecting the shared 5-stage BASS_PANEL_HTML, so this needs its own label table and the
// measured-width logic above in place of the standard version's fixed per-level widths. Wire-
// level translation for the 0/1/2 UI positions happens in bluetooth_socket.js's
// set_enhanced_bass/read_enhanced_bass (BASS_LEVEL_WIRE_B189).
// Picking Level 0 (is_send=true, i.e. a real user click) turns the device off, matching the
// real hardware's 0/2.5/5 states - see setBassEnhance above. That sync is deliberately scoped
// to is_send only: on a passive read (is_send=false, called from bluetooth_socket.js's
// read_enhanced_bass, which already called setBassEnhance with the device's own reported
// enabled bit right before this), the device can genuinely report disabled with a non-zero
// level - it remembers the last intensity to resume at when re-enabled - and forcing enabled
// back on here would fight that real, independently-reported state instead of just displaying
// it (confirmed against real hardware: a disabled+level-1 report was getting flipped back to
// enabled right after being correctly read).
// Long Battery Life Mode toggle - MainControl_igglybuff.html hand-codes its own Quick Settings
// markup (see #long_power_mode row next to Low Latency Mode) rather than an injected panel like
// call_transparency.js's, so the checkbox setter/click-handler pair lives here instead of a
// separate long_power_mode.js. Gated in bluetooth_socket.js on ear_config_file.json's
// "longPowerMode" flag via initLongPowerModeIfSupported(). Switching it requires an earbud
// reboot (same as Audio Codec/Dual Connection), so it reuses the same confirm-then-
// prepareForReboot/showRebootingPopup flow as audio_codec.js's selectAudioCodec/
// applyAudioCodecSelection, instead of writing the value immediately on click.
function setLongPowerModeCheckbox(enabled) {
    let checkbox = document.getElementById("long_power_mode");
    if (checkbox) {
        checkbox.checked = enabled;
    }
}

function toggleLongPowerMode() {
    let enabled = document.getElementById("long_power_mode").checked;
    setLongPowerModeCheckbox(!enabled);
    showWarningPopup(`
        <div class="w-fit flex m-auto text-md mb-2 mt-2 text-white text-center">Earbuds reboot required</div>
        <div class="text-gray-400 text-sm text-center mb-4" style="width: 250px;">Turning on/off Long Battery Life Mode requires rebooting the earbuds</div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 mr-2 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="applyLongPowerModeToggle(${enabled})">Reboot</button>
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closePopUp()">Cancel</button>
        </div>`);
}

function applyLongPowerModeToggle(enabled) {
    closePopUp();
    prepareForReboot();
    setLongPowerMode_BT(enabled);
    setLongPowerModeCheckbox(enabled);
    showRebootingPopup();
}

function setBassLevel(new_level, is_send = false) {
    // Guarded separately from setBassEnhance's own Long Battery Life Mode check above - a
    // level pick calls setBassEnhance(..., false) below (is_send deliberately false, see the
    // read/write sync note above), so that check never fires for a real user level click.
    let effectiveLevel = new_level !== undefined ? new_level : level;
    if (is_send && effectiveLevel > 0 && typeof longPowerModeEnabled !== "undefined" && longPowerModeEnabled) {
        showMutuallyExclusiveWarning("Bass Enhance", "Long Battery Life Mode");
        return;
    }
    if (new_level !== undefined) level = new_level;
    bass_enhance[1] = level;
    console.log("setBassLevel", level);
    if (level >= 0 && level < BASS_STAGE_DOT_IDS_B189.length) {
        document.getElementById("bass_strength_length_selector").style.width = bassLevelSelectorWidth(level);
        document.getElementById("bass_level_label").innerHTML = "Level " + level;
    }
    if (is_send) {
        setBassEnhance(level === 0 ? 0 : 1, false);
        set_enhanced_bass(bass_enhance[0], bass_enhance[1]);
    }
}
