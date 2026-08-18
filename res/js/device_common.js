// Shared ANC / battery / bass-enhance / ear-tip-test helpers used by most device control pages.
// Loaded before the per-model <model>.js file, which may redefine any of these for devices
// with different UI (e.g. no ANC-strength selector, extra ring button, no bass enhance, etc.).

const ANC_LEVEL_TRANSPARENCY = 0x10;
const ANC_LEVEL_STRENGTH_BASE = 0x04;     // unlocks High + Low (2-stage selector)
const ANC_LEVEL_STRENGTH_MID = 0x02;      // + Mid (3-stage selector)
const ANC_LEVEL_STRENGTH_ADAPTIVE = 0x08; // + Adaptive (4-stage selector)

function ancSupported() {
    return !!(modelSpecs && modelSpecs.ancLevel != null);
}
function ancHasTransparency() {
    return !!(modelSpecs && modelSpecs.ancLevel & ANC_LEVEL_TRANSPARENCY);
}
function ancHasStrengthControl() {
    return !!(modelSpecs && modelSpecs.ancLevel & ANC_LEVEL_STRENGTH_BASE);
}
function ancHasMidStrength() {
    return !!(modelSpecs && modelSpecs.ancLevel & ANC_LEVEL_STRENGTH_MID);
}
function ancHasAdaptiveStrength() {
    return !!(modelSpecs && modelSpecs.ancLevel & ANC_LEVEL_STRENGTH_ADAPTIVE);
}

const ANC_WIDGET_FULL_HTML = `                                        <div class="w-fit flex m-auto text-md mb-5 mt-2">
                                            NOISE CONTROL
                                        </div>
                                        <div id="selector"
                                             class="w-20 p-2 bg-white rounded-full h-[38px] -mb-[58px] ml-4 z-1 relative ease-in-out duration-200">
                                        </div>
                                        <div class="w-fit grid grid-cols-3 grid-rows-1 bg-black gap-4 m-auto mt-5 rounded-full ml">
                                            <div id="one"
                                                 class="p-2 text-center w-20 ease-in-out duration-150 z-[10] relative text-white cursor-pointer"
                                                 onclick="setANC(0)">
                                                <svg class="h-[23px] mt-[1px] ml-[20px] relative" id="ANC_on" style="width: 23px; fill: white !important;">
                                                    <use xlink:href="../assets/anc_on_icon.svg#load"></use>
                                                </svg>
                                            </div>
                                            <div id="two"
                                                 class="p-2 text-center w-20 ease-in-out duration-150 z-[10] relative text-white cursor-pointer"
                                                 onclick="setANC(1)">
                                                <svg class="h-[23px] mt-[1px] ml-[20px] relative" id="trans_on" style="width: 23px; fill: white !important;">
                                                    <use xlink:href="../assets/anc_transparent_icon.svg#load"></use>
                                                </svg>
                                            </div>
                                            <div id="three"
                                                 class="p-2 text-center w-20 ease-in-out duration-150 z-[10] relative text-white cursor-pointer"
                                                 onclick="setANC(2)">
                                                <svg class="h-[23px] mt-[1px] ml-[20px] relative" id="anc_off" style="width:23px; fill: white !important;">
                                                    <use xlink:href="../assets/anc_off_icon.svg#load"></use>
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="w-fit grid grid-cols-3 grid-rows-1 gap-4 m-auto text-[10px] mt-2">
                                            <div id="desc_one" class=" text-center w-20">NOISE<br />CANCELLATION</div>
                                            <div id="desc_two" class="text-center w-20">TRANSPARENCY</div>
                                            <div id="desc_three" class=" text-center w-20">Off</div>
                                        </div>
                                        <div id="anc_strength_selector" class="ease-in-out duration-300">
                                            <div class="grid ease-out duration-200 grid-cols-4 grid-rows-1 bg-black m-auto mt-2 rounded-full h-5 opacity-100" style="gap: 2rem; width: 190px;">
                                                <div id="stage_one"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setANC(3)">
                                                    <div id="stage_one_button"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full"></div>
                                                </div>
                                                <div id="stage_two"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setANC(4)">
                                                    <div id="stage_two_button"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full ">
                                                    </div>
                                                </div>
                                                <div id="stage_three"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setANC(5)">
                                                    <div id="stage_three_button"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full ">
                                                    </div>
                                                </div>
                                                <div id="stage_four"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setANC(6)">
                                                    <div id="stage_four_button"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="grid grid-cols-4 grid-rows-1 ease-out duration-200 m-auto text-[10px] opacity-100" style="margin-left: 45px; width: 190px; gap: 40px;">
                                                <div id="desc_one" class="p-2 text-center ">HIGH</div>
                                                <div id="desc_two" class="p-2 text-center " style="margin-left: 4px;">MID</div>
                                                <div id="desc_two" class="p-2 text-center " style="margin-left: 3px;">LOW</div>
                                                <div id="desc_two" class="p-2 text-left" style="margin-left: -13px">ADAPTIVE</div>
                                            </div>

                                        </div>`;

const ANC_WIDGET_BASIC_HTML = `                                        <div class="w-fit flex m-auto text-md mb-5 mt-2">
                                            NOISE CONTROL
                                        </div>
                                        <div id="selector"
                                             class="w-20 p-2 bg-white rounded-full h-[38px] -mb-[58px] ml-4 z-1 relative ease-in-out duration-200">
                                        </div>
                                        <div class="w-fit grid grid-cols-3 grid-rows-1 bg-black gap-4 m-auto mt-5 rounded-full ml">
                                            <div id="one"
                                                 class="p-2 text-center w-20 ease-in-out duration-150 z-[10] relative text-white cursor-pointer"
                                                 onclick="setANC(0)">
                                                <svg class="h-[23px] mt-[1px] ml-[20px] relative" id="ANC_on" style="width: 23px; fill: white !important;">
                                                    <use xlink:href="../assets/anc_on_icon.svg#load"></use>
                                                </svg>
                                            </div>
                                            <div id="two"
                                                 class="p-2 text-center w-20 ease-in-out duration-150 z-[10] relative text-white cursor-pointer"
                                                 onclick="setANC(1)">
                                                <svg class="h-[23px] mt-[1px] ml-[20px] relative" id="trans_on" style="width: 23px; fill: white !important;">
                                                    <use xlink:href="../assets/anc_transparent_icon.svg#load"></use>
                                                </svg>
                                            </div>
                                            <div id="three"
                                                 class="p-2 text-center w-20 ease-in-out duration-150 z-[10] relative text-white cursor-pointer"
                                                 onclick="setANC(2)">
                                                <svg class="h-[23px] mt-[1px] ml-[20px] relative" id="anc_off" style="width:23px; fill: white !important;">
                                                    <use xlink:href="../assets/anc_off_icon.svg#load"></use>
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="w-fit grid grid-cols-3 grid-rows-1 gap-4 m-auto text-[10px] mt-2">
                                            <div id="desc_one" class=" text-center w-20">NOISE<br />CANCELLATION</div>
                                            <div id="desc_two" class="text-center w-20">TRANSPARENCY</div>
                                            <div id="desc_three" class=" text-center w-20">Off</div>
                                        </div>`;

function injectAncUI() {
    let container = document.getElementById("anc_widget_container");
    if (!container) return;
    let variant = container.dataset.ancVariant;
    if (variant === "full") {
        container.innerHTML = ANC_WIDGET_FULL_HTML;
    } else if (variant === "basic") {
        container.innerHTML = ANC_WIDGET_BASIC_HTML;
    }
}

// Verified byte-identical copies of shared static markup, extracted from the original
// MainControl_*.html files before this change.
//
// POPUP_SCAFFOLD_HTML: the popup_container/popup_background/popup_content shell used by
// showWarningPopup/closePopUp/displayPopUp/showEarTipTestDialog (see transitions.js,
// device_common.js). Identical across all 15 device pages.
//
// QUICK_SETTINGS_*_HTML: the PAGE 2/3 "QUICK SETTINGS" panel content (In Ear Detection,
// Low Latency Mode, Ear tip test row, firmware version, case battery). FULL was shared
// identically by two, cleffa, twos, espeon, girafarig, gligar. HEADPHONE (no case battery)
// was shared identically by crobat, forretress. BASIC (no case battery, no in-ear toggle)
// was shared identically by sticks, one. donphan, corsola, elekid, hoothoot each have a
// small real difference (extra toggle, spacing, wrapper class) so are left as static HTML.
const POPUP_SCAFFOLD_HTML = `            <div id="popup_container" class="h-screen w-full absolute z-[-10] opacity-0 ease-in-out duration-300">
                <div id="popup_background" class="h-screen w-full bg-black opacity-[0.5]" onclick="closePopUp()"></div>
                <div id="popup_content" class="z-[-10]">
                    ERROR: There was an error displaying this popup. Please report it to the developers with steps to reproduce the error
                </div>
            </div>`;

const QUICK_SETTINGS_FULL_HTML = `                                        <div id="settings_title" class="w-fit flex m-auto text-md mb-5 mt-2">
                                            QUICK SETTINGS
                                        </div>
                                        <div class="p-5 -mt-5 flex flex-col gap-2">
                                            <div class="settings-switch-container overflow-hidden">
                                                <div id="inearswitchbutton" class="settings-switch-button">
                                                    <div id="inearswitchindicator" class="settings-switch-indicator">
                                                        <input type="checkbox" id="in_ear" class="settings-switch-checkbox" onclick="setInEar()"
                                                               style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                                                    </div>
                                                </div>
                                                <div class="settings-switch-label">In Ear Detection</div>
                                            </div>
                                            <div class="settings-switch-container overflow-hidde">
                                                <div id="lowlatencyswitchbutton" class="settings-switch-button">
                                                    <div id="lowlatencyswitchindicator" class="settings-switch-indicator">
                                                        <input type="checkbox" id="low_latency" class="settings-switch-checkbox" onclick="setLatencyMode()"
                                                               style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                                                    </div>
                                                </div>
                                                <div class="settings-switch-label">Low Latency Mode</div>
                                            </div>
                                            <div class="grid grid-cols-2 grid-rows-1" style="margin-left: -10px; cursor: pointer;" onclick="showEarTipTestDialog()">
                                                <div id="settinjgs-switch-label" class="settings-switch-label" style="margin-top: 3px;">Ear tip test</div>
                                                <div id="arrow-icon">
                                                    <img src="../assets/arrow_right.svg" alt="arrow-right" style="width: 20px; height: 20px; float: right;">
                                                </div>
                                            </div>
                                            <div id="seperator" class="">
                                                <div class="h-[2px] bg-gray-500 w-full rounded-xl mt-2" style="opacity: 0.5;">
                                                </div>
                                            </div>
                                            <div class="grid grid-cols-2 grid-rows-2 -ml-5 mt-2">
                                                <div id="setting_title" class="text-[12px] ml-5 text-gray-200 w-max">
                                                    Firmware Version
                                                </div>
                                                <div id="settings_subtitle_firmware" class="text-[12px] ml-5 text-gray-500 flex" style="justify-content: right;">
                                                    1.0.0
                                                </div>
                                            </div>
                                            <div class="rounded-xl pt-5 pb-5 mt-1 grid grid-cols-2 grid-rows-1 -ml-16" id="case_ear">
                                                <div id="setting_title" class=" text-sm ml-5 text-gray-200">
                                                    <img id="case-img" src="../assets/ear_one_white_case.webp" class='mr-2 h-20 -mt-5 -mb-5 float-right' />
                                                </div>
                                                <div id="settings_subtitle" class="text-sm ml-5 text-white">
                                                    <div id="battery-c" class='text-center'>
                                                        40% CASE
                                                    </div>
                                                    <div id="battery_bar" class='w-20 m-auto mt-2 rounded-md bg-gray-600'>
                                                        <div id="battery_bar_fill_c" class="bg-white h-2 w-1/2 rounded-md"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;

const QUICK_SETTINGS_HEADPHONE_HTML = `                                        <div id="settings_title" class="w-fit flex m-auto text-md mb-5 mt-2">
                                            QUICK SETTINGS
                                        </div>
                                        <div class="p-5 -mt-5 flex flex-col gap-2">
                                            <div class="settings-switch-container overflow-hidde">
                                                <div id="lowlatencyswitchbutton" class="settings-switch-button">
                                                    <div id="lowlatencyswitchindicator" class="settings-switch-indicator">
                                                        <input type="checkbox" id="low_latency" class="settings-switch-checkbox" onclick="setLatencyMode()"
                                                               style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                                                    </div>
                                                </div>
                                                <div class="settings-switch-label">Low Latency Mode</div>
                                            </div>
                                            <div id="seperator" class="">
                                                <div class="h-[2px] bg-gray-500 w-full rounded-xl mt-2" style="opacity: 0.5;">
                                                </div>
                                            </div>
                                            <div class="grid grid-cols-2 grid-rows-2 -ml-5 mt-2">
                                                <div id="setting_title" class="text-[12px] ml-5 text-gray-200 w-max">
                                                    Firmware Version
                                                </div>
                                                <div id="settings_subtitle_firmware" class="text-[12px] ml-5 text-gray-500 flex" style="justify-content: right;">
                                                    1.0.0
                                                </div>
                                            </div>
                                        </div>`;

const QUICK_SETTINGS_BASIC_HTML = `                                        <div id="settings_title" class="w-fit flex m-auto text-md mb-5 mt-2">
                                            QUICK SETTINGS
                                        </div>
                                        <div class="p-5 -mt-5">
                                            <div class="settings-switch-container overflow-hidden">
                                                <div id="inearswitchbutton" class="settings-switch-button">
                                                    <div id="inearswitchindicator" class="settings-switch-indicator">
                                                        <input type="checkbox" id="in_ear" class="settings-switch-checkbox" onclick="setInEar()"
                                                               style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                                                    </div>
                                                </div>
                                                <div class="settings-switch-label">In Ear Detection</div>
                                            </div>
                                            <div class="settings-switch-container overflow-hidde">
                                                <div id="lowlatencyswitchbutton" class="settings-switch-button">
                                                    <div id="lowlatencyswitchindicator" class="settings-switch-indicator">
                                                        <input type="checkbox" id="low_latency" class="settings-switch-checkbox" onclick="setLatencyMode()"
                                                               style="opacity: 0; width: 300px; height:300px; cursor: pointer; margin-top: -6px; margin-left: -35px" />
                                                    </div>
                                                </div>
                                                <div class="settings-switch-label">Low Latency Mode</div>
                                            </div>
                                            <div id="seperator" class="">
                                                <div class="h-[2px] bg-gray-500 w-full rounded-xl mt-5" style="opacity: 0.5;">
                                                </div>
                                            </div>
                                            <div class="grid grid-cols-2 grid-rows-2 -ml-5 mt-5">
                                                <div id="setting_title" class="text-[12px] ml-5 text-gray-200 w-max">
                                                    Firmware Version
                                                </div>
                                                <div id="settings_subtitle_firmware" class="text-[12px] ml-5 text-gray-500 flex" style="justify-content: right;">
                                                    1.0.0
                                                </div>
                                            </div>
                                        </div>`;

const BASS_PANEL_HTML = `
                                        <div class="w-fit flex m-auto text-md mb-5 mt-2">

                                            %%BASS_TITLE%%

                                        </div>

                                        <div id="selector_bass"
                                             class="w-20 p-2 bg-white rounded-full h-[38px] -mb-[59px] ml-[65px] z-1 relative ease-in-out duration-200">

                                        </div>

                                        <div class="w-fit grid grid-cols-2 grid-rows-1 bg-black gap-4 m-auto mt-5 rounded-full ml">

                                            <div id="one"
                                                 class="p-2 text-center w-20 ease-in-out duration-150 z-[10] relative text-white cursor-pointer"
                                                 onclick="setBassEnhance(1, 1)">

                                                <svg class="h-[23px] mt-[1px] ml-[20px] relative" id="bass_on" style="width: 23px; stroke: black !important; fill:black !important;">

                                                    <use xlink:href="../assets/ear_bass_enhance_on.svg#load"></use>

                                                </svg>

                                            </div>

                                            <div id="two"
                                                 class="p-2 text-center w-20 ease-in-out duration-150 z-[10] relative text-white cursor-pointer"
                                                 onclick="setBassEnhance(0, 1)">

                                                <svg class="h-[23px] mt-[1px] ml-[20px] relative" id="bass_off" style="width: 23px; fill: white !important;">

                                                    <use xlink:href="../assets/ear_bass_enhance_off.svg#load"></use>

                                                </svg>

                                            </div>

                                        </div>

                                        <div class="w-fit grid grid-cols-2 grid-rows-1 gap-4 m-auto text-[10px] mt-2">

                                            <div id="desc_one" class=" text-center w-20">ON</div>

                                            <div id="desc_two" class=" text-center w-20">Off</div>

                                        </div>

                                        <div id="bass_strength_selector" class="ease-in-out duration-300 mt-[30px] m-auto mt-2 w-fit ">

                                            <div id="bass_strength_length_selector" class="h-[12px] rounded-xl ml-[5px] ease-in-out duration-200 bg-white -mb-[16px] relative" style="width: 12px;"></div>

                                            <div class="grid ease-out duration-200 grid-cols-5 grid-rows-1 bg-black rounded-full opacity-100 pr-[10px]" style="gap: 2rem; width: 190px;">

                                                <div id="stage_one"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setBassLevel(1, 1)">

                                                    <div id="stage_one_button_bass"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full"></div>

                                                </div>

                                                <div id="stage_two"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setBassLevel(2, 1)">

                                                    <div id="stage_two_button_bass"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full ">

                                                    </div>

                                                </div>

                                                <div id="stage_three"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setBassLevel(3, 1)">

                                                    <div id="stage_three_button_bass"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full ">

                                                    </div>

                                                </div>

                                                <div id="stage_four"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setBassLevel(4, 1)">

                                                    <div id="stage_four_button_bass"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full">

                                                    </div>

                                                </div>

                                                <div id="stage_five"
                                                     class="p-2 text-center ease-in-out duration-150 z-[10] relative cursor-pointer"
                                                     onclick="setBassLevel(5, 1)">

                                                    <div id="stage_five_button_bass"
                                                         class="w-1 h-1 bg-white ease-in-out duration-200 rounded-full">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="m-auto w-full text-[13px] text-center mt-2 opacity-100" id="bass_level_label">
                                                Level 1
                                            </div>
                                        </div>`;


// default implementation (no per-model overrides)
const HEADER_EARBUD_HTML = `                        <div id="image-container"
                             class='justify-center items-center flex relative ease-in-out duration-300'>
                            <div id="left_ear" class='w-52 ease-in-out duration-300'>
                                <img src="../assets/nothing_connected2.webp"
                                     class='h-44 duration-500 ease-in-out relative cursor-pointer'
                                     onclick="transToLeftGest('l'); loadCurrentGestures('l')" id="left_ear_peace"
                                     style="z-Index:100; margin: auto; transform: scale(0.85);" />
                                <div id="left_ear_battery" class="ease-in-out duration-300" style="opacity: 100; margin-top: -10px;">
                                    <div id="battery-l" class='text-center'>
                                        L
                                    </div>
                                    <div id="battery_bar_l" class='w-20 m-auto mt-2 rounded-md bg-gray-600'>
                                        <div id="battery_bar_fill_l" class="bg-white h-2 w-1/2 rounded-md"></div>
                                    </div>
                                    <div id="ring_button_l" class="text-center m-auto w-fit -mb-8 mt-3 ease-in-out duration-300" onclick="ringBudLeft()">
                                        <div id="ring_button-l" class="p-1 pl-7 -mr-32 pr-7 border-red-900 border-[2px] text-red-900 cursor-pointer font-bold  rounded-full mr-3 text-sm hover:bg-red-900 hover:text-white ease-in-out duration-300" style="margin-right: 0px;">Ring</div>
                                    </div>
                                </div>
                            </div>
                            <div id="right_ear" class='w-52 w-34 ease-in-out duration-300'>
                                <img src="../assets/nothing_connected.webp"
                                     class='h-44 w-34 margin-auto duration-[2s] ease-in-out cursor-pointer'
                                     onclick="transToLeftGest('r'); loadCurrentGestures('r')" id="right_ear_peace" style="margin: auto; transform: scale(0.85);" />
                                <div id="right_ear_battery" class="ease-in-out duration-300" style="opacity: 100; margin-top: -10px;">
                                    <div id="battery-r" class='text-center'>
                                        R
                                    </div>
                                    <div id="battery_bar_r" class='w-20 m-auto mt-2 rounded-md bg-gray-600'>
                                        <div id="battery_bar_fill_r" class="bg-white h-2 w-1/2 rounded-md"></div>
                                    </div>
                                    <div id="ring_button_r" class="text-center m-auto ml-14 w-fit -mb-8 mt-3 ease-in-out duration-300" onclick="ringBudRight()">
                                        <div id="ring_button-r" class="p-1 pl-7 -mr-32 pr-7 border-red-900 border-[2px] text-red-900 cursor-pointer font-bold rounded-full text-sm hover:bg-red-900 hover:text-white ease-in-out duration-300" style="margin-right: 0px;">Ring</div>
                                    </div>
                                </div>
                            </div>
                        </div>`;

const HEADER_HEADPHONE_HTML = `                        <div id="image-container"
                             class='justify-center items-center flex relative ease-in-out duration-300'>
                            <div id="left_ear" class='w-52 ease-in-out duration-300 flex flex-col items-center'>
                                <img src="../assets/nothing_connected2.webp"
                                     class='h-44 duration-500 ease-in-out relative cursor-pointer'
                                     onclick="transToLeftGest('l'); loadCurrentGestures('l')" id="left_ear_peace"
                                     style="z-Index:100; transform: scale(0.85);" />
                                <div id="left_ear_battery" class="ease-in-out duration-300" style="opacity: 100; margin-top: -10px;">
                                    <div id="battery-l" class='text-center'>
                                        L
                                    </div>
                                    <div id="battery_bar_l" class='w-20 m-auto mt-2 rounded-md bg-gray-600'>
                                        <div id="battery_bar_fill_l" class="bg-white h-2 w-1/2 rounded-md"></div>
                                    </div>
                                    <div id="ring_button_l" class="text-center m-auto w-fit -mb-8 mt-3 ease-in-out duration-300" onclick="ringBudLeft()">
                                        <div id="ring_button-l" class="p-1 pl-7 -mr-32 pr-7 border-red-900 border-[2px] text-red-900 cursor-pointer font-bold  rounded-full mr-3 text-sm hover:bg-red-900 hover:text-white ease-in-out duration-300" style="margin-right: 0px;">Ring</div>
                                    </div>
                                </div>
                            </div>
                        </div>`;

function injectSharedStaticUI() {
    let popup = document.getElementById("popup_container_placeholder");
    if (popup) popup.outerHTML = POPUP_SCAFFOLD_HTML;

    let ancContainer = document.getElementById("anc_widget_container");
    if (ancContainer) injectAncUI();

    let qs = document.getElementById("quick_settings_container");
    if (qs) {
        let variant = qs.dataset.qsVariant;
        if (variant === "full") {
            qs.innerHTML = QUICK_SETTINGS_FULL_HTML;
        } else if (variant === "headphone") {
            qs.innerHTML = QUICK_SETTINGS_HEADPHONE_HTML;
        } else if (variant === "basic") {
            qs.innerHTML = QUICK_SETTINGS_BASIC_HTML;
        }
    }

    let bass = document.getElementById("bass_enhance_container");
    if (bass) {
        let title = bass.dataset.bassVariant === "ultra" ? "ULTRA BASS" : "BASS ENHANCE";
        bass.innerHTML = BASS_PANEL_HTML.replace("%%BASS_TITLE%%", title);
    }

    let header = document.getElementById("header_images_placeholder");
    if (header) {
        header.outerHTML = header.dataset.headerVariant === "headphone" ? HEADER_HEADPHONE_HTML : HEADER_EARBUD_HTML;
    }
}

function hideDeviceLoadingOverlay() {
    let overlay = document.getElementById("device_loading_overlay");
    if (overlay) overlay.style.display = "none";
}

// Runs immediately (not gated on Bluetooth/modelSpecs): all of the above is static markup
// selected purely by which placeholders exist on this page, not by device config data.
injectSharedStaticUI();

setTimeout(hideDeviceLoadingOverlay, 10000);

function setBattery(side, percentage) {
    if (typeof percentage == "undefined") {
        percentage = "DISCONNECTED";
    }
    if (side == "l") {
        document.getElementById("left_ear").style.opacity = percentage == "DISCONNECTED" ? "0.5" : "1";
        document.getElementById("left_ear").style.zIndex = percentage == "DISCONNECTED" ? "-1" : "1";
        document.getElementById("battery-l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery_bar_l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery-l").innerHTML = percentage + "% L";
        document.getElementById("battery_bar_fill_l").style.width = percentage + "%";
    } else if (side == "r") {
        document.getElementById("right_ear").style.opacity = percentage == "DISCONNECTED" ? "0.5" : "1";
        document.getElementById("right_ear").style.zIndex = percentage == "DISCONNECTED" ? "-1" : "1";
        document.getElementById("battery-r").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery_bar_r").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery-r").innerHTML = percentage + "% R";
        document.getElementById("battery_bar_fill_r").style.width = percentage + "%";
    } else if (side == "c") {
        document.getElementById("battery-c").innerHTML = percentage == "DISCONNECTED" ? percentage : percentage + "% CASE";
        document.getElementById("case_ear").style.opacity = percentage == "DISCONNECTED" ? "0.5" : "1";
        document.getElementById("battery_bar_fill_c").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery_bar_fill_c").style.width = percentage + "%";
    }
}

function setAncToOff() {
    if (!ancSupported()) return; 
    document.getElementById("selector").style.marginLeft = ancHasTransparency() ? "209px" : "159px"
    document.getElementById("anc_off").style.fill = "black"
    document.getElementById("ANC_on").style.fill = "white"
    if (ancHasTransparency()) document.getElementById("trans_on").style.fill = "white"
    if (ancHasStrengthControl()) document.getElementById("anc_strength_selector").style.opacity = "0"

    ANC_type = 2;
}

function setAncToNC() {
    if (!ancSupported()) return;
    document.getElementById("selector").style.marginLeft = ancHasTransparency() ? "16px" : "64px"
    document.getElementById("ANC_on").style.fill = "black"
    if (ancHasTransparency()) document.getElementById("trans_on").style.fill = "white"
    document.getElementById("anc_off").style.fill = "white"
    if (ancHasStrengthControl()) document.getElementById("anc_strength_selector").style.opacity = "100"

    ANC_type = 0;
}

function setAncToTransparent() {
    if (!ancHasTransparency()) return;
    document.getElementById("selector").style.marginLeft = "112px"
    document.getElementById("trans_on").style.fill = "black"
    document.getElementById("ANC_on").style.fill = "white"
    document.getElementById("anc_off").style.fill = "white"
    if (ancHasStrengthControl()) document.getElementById("anc_strength_selector").style.opacity = "0"

    ANC_type = 1;
}

function setAncStrengthHigh() {
    if (!ancHasStrengthControl()) return;
    document.getElementById("stage_one_button").style = "height: 0.75rem !important; width: 0.75rem !important; margin-left: -0.25rem !important; margin-top: -0.25rem !important;"
    document.getElementById("stage_two_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"
    document.getElementById("stage_three_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"
    if (ancHasAdaptiveStrength()) document.getElementById("stage_four_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"

    ANC_strength = 0;
}

function setAncStrengthMid() {
    if (!ancHasMidStrength()) return;
    document.getElementById("stage_one_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_two_button").style = "height: 0.75rem !important; width: 0.75rem !important; margin-right: -0.25rem !important; margin-top: -0.25rem !important;"
    document.getElementById("stage_three_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"
    if (ancHasAdaptiveStrength()) document.getElementById("stage_four_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"

    ANC_strength = 2;
}

function setAncStrengthLow() {
    if (!ancHasStrengthControl()) return;
    document.getElementById("stage_one_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_two_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_three_button").style = "height: 0.75rem !important; width: 0.75rem !important; margin-right: -0.25rem !important; margin-top: -0.25rem !important;"
    if (ancHasAdaptiveStrength()) document.getElementById("stage_four_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"

    ANC_strength = 1;
}

function setAncStrengthAdaptive() {
    if (!ancHasAdaptiveStrength()) return;
    document.getElementById("stage_one_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_two_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_three_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_four_button").style = "height: 0.75rem !important; width: 0.75rem !important; margin-right: -0.25rem !important; margin-top: -0.25rem !important;"

    ANC_strength = 3;
}

// default implementation; overridden in: corsola, donphan, one, sticks
function setANC(typeANC) {
    if (typeANC == 0) {
        setAncToNC();
    } else if (typeANC == 1) {
        setAncToTransparent();
    } else if (typeANC == 2) {
        setAncToOff();
    } else if (typeANC == 3) {
        setAncStrengthHigh();
    } else if (typeANC == 4) {
        setAncStrengthMid();
    } else if (typeANC == 5) {
        setAncStrengthLow();
    } else if (typeANC == 6) {
        setAncStrengthAdaptive();
    }

    var type = 0;
    if (ANC_type == 1) {
        type = 2;
    } else if (ANC_type == 2) {
        type = 1;
    } else if (ANC_type == 0) {
        if (ANC_strength == 1) {
            type = 3;
        } else if (ANC_strength == 0) {
            type = 4;
        } else if (ANC_strength == 2) {
            type = 5;
        } else if (ANC_strength == 3) {
            type = 6;
        }
    }
    setANCDisplay(type);
    setANC_BT(type);
}

// default implementation; overridden in: sticks
function displayANC(display) { }

// default implementation (no per-model overrides)
function getANCtoggleFunction(ancList) {
    if (JSON.stringify(ancList) === JSON.stringify([1, 1, 1])) {
        return 10;
    } else if (JSON.stringify(ancList) === JSON.stringify([0, 1, 1])) {
        return 20;
    } else if (JSON.stringify(ancList) === JSON.stringify([1, 0, 1])) {
        return 21;
    } else if (JSON.stringify(ancList) === JSON.stringify([1, 1, 0])) {
        return 22;
    }
}

// default implementation (no per-model overrides)
function setBassEnhance(state, is_send=false) {
    console.log("setBassEnhance", state)
    if (is_send && state === 1 && typeof isSpatialAudioEqExclusive === "function" && isSpatialAudioEqExclusive()
        && typeof currentSpatialAudioMode !== "undefined" && currentSpatialAudioMode !== 0) {
        showMutuallyExclusiveWarning("Bass Enhance", "Spatial Audio");
        return;
    }
    switch (state) {

        case 1:
            bass_enhance[0] = 1
            document.getElementById("selector_bass").style.marginLeft = "65px"

            document.getElementById("bass_on").style.fill = "black"

            document.getElementById("bass_on").style.stroke = "black"

            document.getElementById("bass_off").style.fill = "white"

            document.getElementById("bass_strength_selector").style.opacity = "100"

            break

        case 0:
            bass_enhance[0] = 0
            document.getElementById("selector_bass").style.marginLeft = "160px"

            document.getElementById("bass_on").style.fill = "white"

            document.getElementById("bass_on").style.stroke = "white"

            document.getElementById("bass_off").style.fill = "black"

            document.getElementById("bass_strength_selector").style.opacity = "0"

            break
    }
    if (is_send)
        set_enhanced_bass(bass_enhance[0], bass_enhance[1]);
}

// default implementation (no per-model overrides)
function setBassLevel(new_level, is_send=false) {
    if (new_level) level = new_level
    bass_enhance[1] = level
    console.log("setBassLevel", level)
    switch (level) {
        case 1:
            document.getElementById("bass_strength_length_selector").style.width = "12px"
            document.getElementById("bass_level_label").innerHTML = "Level 1"
            break
        case 2:
            document.getElementById("bass_strength_length_selector").style.width = "55px"
            document.getElementById("bass_level_label").innerHTML = "Level 2"
            break
        case 3:
            document.getElementById("bass_strength_length_selector").style.width = "98px"
            document.getElementById("bass_level_label").innerHTML = "Level 3"
            break
        case 4:
            document.getElementById("bass_strength_length_selector").style.width = "138px"
            document.getElementById("bass_level_label").innerHTML = "Level 4"
            break
        case 5:
            document.getElementById("bass_strength_length_selector").style.width = "180px"
            document.getElementById("bass_level_label").innerHTML = "Level 5"
            break
    }
    if (is_send)
        set_enhanced_bass(bass_enhance[0], bass_enhance[1]);
}

// default implementation (no per-model overrides)
function earTipStateStatus(left, right) {
    leftStateEarTipTest = left
    rightStateEarTipTest = right
}

// default implementation (no per-model overrides)
function setPersonalAnc() {
    if (document.getElementById("personalizedANC").checked) {
        setPersonalizedANC(1);
    } else {
        setPersonalizedANC(0);
    }
}

// default implementation (no per-model overrides)
function setPersonalAncCheckbox(isEnabled) {
    if (isEnabled) {
        document.getElementById("personalizedANC").checked = true;
    } else {
        document.getElementById("personalizedANC").checked = false;
    }
}

function insertBeforeAnchorRow(anchorSelector, html, seperator) {
    let anchorRow = document.querySelector(anchorSelector);
    if (anchorRow) {
        anchorRow.insertAdjacentHTML("beforebegin", html);
    } else {
        seperator.insertAdjacentHTML("beforebegin", html);
    }
}

function showEarTipTestDialog() {
    document.getElementById("popup_container").style.opacity = "100"
    document.getElementById("popup_container").style.zIndex = "1000"
    document.getElementById("popup_content").style.zIndex = "1001"
    var popUpContent = ` <div class="w-fit flex m-auto text-md mb-5 mt-2">
    <div style="width: 300px;">
    <div id="image-container"
    class='justify-center items-center flex relative ease-in-out duration-300' style="margin-left: -28px;">
<div id="left_ear" class='w-52 ease-in-out duration-300'>
    <img src="../assets/ear_two_white_left.webp"
            class='h-44 duration-500 ease-in-out relative cursor-pointer'
            id="left_ear_peace"
            style="z-Index:100; margin: auto; transform: scale(0.85);" />
    <div id="not_left_ear_battery" class="ease-in-out duration-300" style="opacity: 100; margin-top: -10px;">
        <div id="not-battery-l" class='text-center' style="margin-left: 45px">
            L <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="gray"/></svg>
        </div>
    </div>
</div>
<div id="right_ear" class='w-52 w-34 ease-in-out duration-300'>
    <img src="../assets/ear_two_white_right.webp"
            class='h-44 w-34 margin-auto duration-[2s] ease-in-out cursor-pointer'
            id="right_ear_peace" style="margin: auto; transform: scale(0.85);" />
    <div id="not_right_ear_battery" class="ease-in-out duration-300" style="opacity: 100; margin-top: -10px;">
        <div id="not-battery-r" class='text-center'>
            R <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="gray"/></svg>
        </div>
    </div>
</div>
</div>
<div id="subtext" class="text-white m-auto text-center" style="width: 250px; margin-top: 45px; margin-bottom: 45px;">
    <img src="../assets/loading.svg" alt="loading_animation" class="h-[80px] w-[80px] m-auto" id="loading_animation" />
    <center>
        Don't remove your earbuds.
    </center>
</div>
<div id="button_done_anc_test" style="display: none">
    <div id="doneTestTip" class="p-2 pl-4 pr-4 m-auto bg-black border-none border-[1px] rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300 w-full text-center cursor-pointer" onclick="closePopUp()">Done</div>
    <section class="text-sm text-white w-fit m-auto mt-2 cursor-pointer" id='again'>Launch Test</section>
</div>
</div></div>
`


    document.getElementById("popup_content").innerHTML = popUpContent
    updateBudsInfo(true);
    if (leftStateEarTipTest == undefined) {
        document.getElementById("subtext").innerText = "Put both earbuds in your ears and launch the test"
        document.getElementById("button_done_anc_test").style.display = "block"
    }

    let earTipTestInterval = setInterval(function () {
        if (!document.getElementById("button_done_anc_test")) {
            clearInterval(earTipTestInterval);
            return;
        }

        if (leftStateEarTipTest == undefined) {
            document.getElementById("button_done_anc_test").style.display = "block"
            document.getElementById("subtext").style.display = "block"
            document.getElementById("subtext").innerText = "Put both earbuds in your ears and launch the test"
        } else if (leftStateEarTipTest == 2) {
            document.getElementById("button_done_anc_test").style.display = "block"
            document.getElementById("subtext").style.display = "block"
            document.getElementById("subtext").innerText = "Make sure both earbuds are connected and in your ears"
            document.getElementById("not-battery-l").innerHTML = `L <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#c9202e"/></svg>`
            document.getElementById("not-battery-r").innerHTML = `R <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#c9202e"/></svg>`
        } else if (leftStateEarTipTest == 1 && rightStateEarTipTest == 1) {
            document.getElementById("button_done_anc_test").style.display = "block"
            document.getElementById("subtext").style.display = "block"
            document.getElementById("subtext").innerText = "Adjust left and right earbuds or try another tip size and try again"
            document.getElementById("not-battery-l").innerHTML = `L <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#ffc700"/></svg>`
            document.getElementById("not-battery-r").innerHTML = `R <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#ffc700"/></svg>`
        } else if (leftStateEarTipTest == 1 && rightStateEarTipTest == 0) {
            document.getElementById("button_done_anc_test").style.display = "block"
            document.getElementById("subtext").style.display = "block"
            document.getElementById("subtext").innerText = "Adjust left earbud or try another tip size and try again"
            document.getElementById("not-battery-l").innerHTML = `L <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#ffc700"/></svg>`
            document.getElementById("not-battery-r").innerHTML = `R <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#1db159"/></svg>`
        } else if (leftStateEarTipTest == 0 && rightStateEarTipTest == 1) {
            document.getElementById("button_done_anc_test").style.display = "block"
            document.getElementById("subtext").style.display = "block"
            document.getElementById("subtext").innerText = "Adjust right earbud or try another tip size and try again"
            document.getElementById("not-battery-r").innerHTML = `R <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#ffc700"/></svg>`
            document.getElementById("not-battery-l").innerHTML = `L <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#1db159"/></svg>`
        } else if (leftStateEarTipTest == 0 && rightStateEarTipTest == 0) {
            document.getElementById("button_done_anc_test").style.display = "block"
            document.getElementById("subtext").style.display = "block"
            document.getElementById("subtext").innerText = "Perfect! you're ready!"
            document.getElementById("not-battery-l").innerHTML = `L <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#1db159"/></svg>`
            document.getElementById("not-battery-r").innerHTML = `R <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"><path d="M9.5,0C6.9804,0 4.5641,1.0008 2.7824,2.7824C1.0008,4.564 0,6.9805 0,9.4999C0,12.0193 1.0008,14.4357 2.7824,16.2174C4.5641,17.999 6.9806,18.9998 9.5,18.9998C12.0194,18.9998 14.4359,17.999 16.2175,16.2174C17.9991,14.4358 19,12.0193 19,9.4999C19,7.8324 18.5611,6.1941 17.7273,4.7498C16.8935,3.3056 15.6941,2.1063 14.25,1.2725C12.8058,0.4388 11.1676,0 9.5,0ZM14.8923,7.8253L9.1922,13.0502C9.0117,13.2158 8.7742,13.3052 8.5295,13.2999C8.2847,13.2945 8.0514,13.195 7.8784,13.0218L5.0283,10.1717C4.845,9.9947 4.7405,9.7516 4.7382,9.4968C4.736,9.2418 4.8364,8.9969 5.0164,8.8167C5.1966,8.6365 5.4417,8.5363 5.6965,8.5384C5.9512,8.5406 6.1946,8.6451 6.3716,8.8285L8.5785,11.0353L13.608,6.4248C13.8581,6.1955 14.2115,6.1169 14.5353,6.2189C14.8591,6.3207 15.1039,6.5875 15.1775,6.919C15.2512,7.2502 15.1423,7.5958 14.8923,7.8253Z" fill="#1db159"/></svg>`
            clearInterval(earTipTestInterval)
        }

    }, 1000)

    document.getElementById("again").onclick = function () {
        leftStateEarTipTest = "launch"
        rightStateEarTipTest = "launch"
        launchEarFitTest()
        showEarTipTestDialog()
    }
    document.getElementById("doneTestTip").onclick = function () {
        leftStateEarTipTest = undefined
        rightStateEarTipTest = undefined
        closePopUp()
    }

}

async function ringBudLeft(e) {
    var e = document.getElementById("ring_button-l").classList
    if (e.contains("ringing-l")) {
        e.remove("ringing-l")
        document.getElementById("ring_button-l").style.backgroundColor = ""
        document.getElementById("ring_button-l").style.color = ""
        document.getElementById("ring_button-l").innerText = "Ring"
        ringBuds(0, true)
    } else {
        e.add("ringing-l")
        document.getElementById("ring_button-l").style.backgroundColor = "#7f1d1d"
        document.getElementById("ring_button-l").style.color = "#ffffff"
        document.getElementById("ring_button-l").innerText = "STOP"
        ringBuds(1, true)
    }
}

async function ringBudRight(e) {
    var e = document.getElementById("ring_button-r").classList
    if (e.contains("ringing-r")) {
        e.remove("ringing-r")
        document.getElementById("ring_button-r").style.backgroundColor = ""
        document.getElementById("ring_button-r").style.color = ""
        document.getElementById("ring_button-r").innerText = "Ring"
        ringBuds(0, false)
    } else {
        e.add("ringing-r")
        document.getElementById("ring_button-r").style.backgroundColor = "#7f1d1d"
        document.getElementById("ring_button-r").style.color = "#ffffff"
        document.getElementById("ring_button-r").innerText = "STOP"
        ringBuds(1, false)
    }
}
