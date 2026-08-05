// "Personal Sound Profile" toggle UI.
// Injects a settings switch into the existing QUICK SETTINGS panel (anchored on the
// #seperator element present on every model page), matching the style of the Dual
// Connection / Spatial Audio toggle rows.
// Backed by whichever personalization technology the model actually supports (Mimi or
// Audiodo - see personalSoundProfileBackend() in bluetooth_socket.js); both are presented
// under the same "Personal Sound Profile" label since they're mutually exclusive per model.
// Only activated for models with a "mimi" or "audiodo" flag in ear_config_file.json, via
// initPersonalSoundProfileIfSupported() in bluetooth_socket.js.

function injectPersonalSoundProfileUI() {
    if (document.getElementById("personal_sound_switch_container")) {
        return; // already injected
    }
    let seperator = document.getElementById("seperator");
    if (!seperator) {
        return;
    }
    let toggleHtml = `
        <div id="personal_sound_switch_container" class="settings-switch-container overflow-hidden">
            <div class="settings-switch-button">
                <div class="settings-switch-indicator">
                    <input type="checkbox" id="personal_sound_enable" class="settings-switch-checkbox" onclick="togglePersonalSoundProfile()"
                           style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                </div>
            </div>
            <div class="settings-switch-label">Personal Sound Profile</div>
        </div>`;

    // Anchor before the first nav-style row (Ear tip test / Manage devices / Audio Quality /
    // Spatial Audio - whichever exists) so this toggle groups with the other checkbox rows
    // instead of landing after them when the page has no Ear tip test row to anchor on.
    insertBeforeAnchorRow(
        '[onclick*="showEarTipTestDialog"], #dual_connect_manage_row, #audio_codec_row, #spatial_audio_row',
        toggleHtml,
        seperator
    );
}

function setPersonalSoundProfileCheckbox(enabled) {
    let checkbox = document.getElementById("personal_sound_enable");
    if (checkbox) {
        checkbox.checked = enabled;
    }
}

// On Mimi-backed models (two/twos), Personal Sound Profile can't be enabled while LDAC
// is the active codec (confirmed: the codec page's own LDAC-selection warning already
// references "Personal Sound Profile is not available when LDAC is activated" for two,
// and twos independently blocks it via its own LDAC status check).
function isPersonalSoundLdacExclusive() {
    return personalSoundProfileBackend() === "mimi" && typeof currentAudioCodec !== "undefined" && currentAudioCodec === 2;
}

function togglePersonalSoundProfile() {
    let enabled = document.getElementById("personal_sound_enable").checked;
    if (enabled && isPersonalSoundLdacExclusive()) {
        setPersonalSoundProfileCheckbox(false);
        showMutuallyExclusiveWarning("Personal Sound Profile", "LDAC");
        return;
    }
    setPersonalSoundProfile_BT(enabled);
}
