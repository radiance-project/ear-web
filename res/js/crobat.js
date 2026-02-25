var double_press = ["Skip Back", "Skip Forward", "Voice Assistant"];
var triple_press = ["Skip Back", "Skip Forward", "Voice Assistant"];
var press_and_hold = ["Noise control"];
var anc_selector_hold = [1, 1, 0]
let bass_enhance = [0, 0]

//---------------------------------------------------------------------------------//

//CURRENTLY SELLECTED BUD ON THE SETTINGS PAGE
var current_side;

//VARS FOR GESTURE SETTINGS, OVERWRITING THHESE WITH EEL WILL MAKE THE TEXT APRPEAR IN THE SETTINGS PAGE ON INITIAL LOAD.
//IF YOU CLICK A BUTTON, IT WILL OVERWRITE THIS VARS AGAIN AND YOU CAN READ THE CONTEXT WITH EEL. YOU JUST NEED TO CHECK 
//IF THESE VARS ARE BEEING UPDATED OR NOT. IF THEY ARE, THEN YOU KNOW THAT THE USER HAS CHANGED THE SETTINGS AND YOU CAN
//READ THE CONTEXT FROM THESE VARS. IF THEY ARE NOT, THEN YOU KNOW THAT THE USER HAS NOT CHANGED THE SETTINGS AND YOU CAN
//READ THE CONTEXT FROM THE EEL VARIABLES. (OR YOU PUT YOUR CODE DIRECTY INTO THE FUNCTIIONS DOWN, MADE YOU SOME HINTS WHERE)
//
//IM JUST PICKING THE FIRST ELEMENT OF THE ARRAY TO INITIALIZE THE VARS AND TO DISPLAY SOMETHING OTHER THAN UNDEFINED ON THE
//SETTINGS PAGE ON INITIAL LOAD. YOU NEED TO REPLACE THIS WITH THE STUFF YOU READ FROM THE BUDS.
var left_double_press = double_press[0];
var left_triple_press = triple_press[0];
var left_press_and_hold = press_and_hold[0];

// 0 = On, 1 = transparent, 2 = Off
var ANC_type = 1;
// 0 = Strong, 1 = low
var ANC_strength = 0;


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

//---------------------------------------------------------------------------------//


leftEarPeace = document.getElementById("left_ear_peace")

leftEarBattery = document.getElementById("left_ear_battery")

prod_name = document.getElementById("prod_name")
pages_container = document.getElementById("pages_container")
settings_icon = document.getElementById("settings_icon")

ringButton = document.getElementById("ring_button")


var intro_timeout;
var intro_timeout2;

/*intro_timeout = setTimeout(() => {
    leftEarPeace.style.marginTop = "0px"
    rightEarPeace.style.marginTop = "0px"

    intro_timeout2 = setTimeout(() => {
        leftEarBattery.style.opacity = "100"
        rightEarBattery.style.opacity = "100"
        prod_name.style.opacity = "100"
        pages_container.style.opacity = "100"
        // settings_icon.style.opacity = "100"
    }, 2000)
}, 500)
*/

function updateGesturesFromArray(array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].gestureDevice == 6) {
            if (array[i].gestureType == 2) {
                if (array[i].gestureAction == 8) {
                    left_double_press = double_press[0];
                } else if (array[i].gestureAction == 9) {
                    left_double_press = double_press[1];
                } else if (array[i].gestureAction == 11) {
                    left_double_press = double_press[2];
                }
            } else if (array[i].gestureType == 3) {
                //triple tap
                if (array[i].gestureAction == 8) {
                    left_triple_press = triple_press[0];
                } else if (array[i].gestureAction == 9) {
                    left_triple_press = triple_press[1];
                } else if (array[i].gestureAction == 11) {
                    left_triple_press = triple_press[2];
                }
            } else if (array[i].gestureType == 7) {
                //tap and hold
                if (array[i].gestureAction == 10 || array[i].gestureAction == 20 || array[i].gestureAction == 21 || array[i].gestureAction == 22) {
                    left_press_and_hold = press_and_hold[0];
                    if (array[i].gestureAction == 10) {
                        anc_selector_hold = [1, 1, 1]
                    } else if (array[i].gestureAction == 20) {
                        anc_selector_hold = [0, 1, 1]
                    } else if (array[i].gestureAction == 21) {
                        anc_selector_hold = [1, 0, 1]
                    } else if (array[i].gestureAction == 22) {
                        anc_selector_hold = [1, 1, 0]
                    }
                }
            }
        } 
    }
    loadCurrentGestures(current_side, false);
}

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


function loadCurrentGestures(side, refresh = true) {
    if (refresh) {
        sendGetGesture();
    }
    current_side = side;
    //LOAD ALL VALUES BASED ON CURRENT SIDE
    if (side == "l") {
        document.getElementById("settings_subtitle_double").innerHTML = left_double_press + "<br />Decline incoming calls</div>";
        document.getElementById("settings_subtitle_triple").innerHTML = left_triple_press;
        document.getElementById("settings_subtitle_press_and_hold").innerHTML = left_press_and_hold;
    }

}

function changeGesture(type) {
    if (type == "double") {
        var show_popup = "";
        for (var i = 0; i < double_press.length; i++) {
            show_popup += `
            <option id="${double_press[i]}" ${left_double_press == double_press[i] ? "selected" : ""}>
                ${double_press[i]}
            </option>
           `
        }
        displayPopUp(show_popup)
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_double").innerHTML = document.getElementById("list_container").value + "<br />Decline incoming call"
            if (current_side == "l") {
                left_double_press = document.getElementById("list_container").value;
                var index = double_press.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 8;
                else if (index == 1) operation = 9;
                else if (index == 2) operation = 11;
                sendGestures(6, 2, operation)
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            closePopUp()
        })
    } else if (type == "triple") {
        var show_popup = "";
        for (var i = 0; i < triple_press.length; i++) {
            show_popup += `
            <option id="${triple_press[i]}" ${left_triple_press == triple_press[i] ? "selected" : ""}>
                ${triple_press[i]}
            </option>
           `
        }
        displayPopUp(show_popup)
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_triple").innerHTML = document.getElementById("list_container").value
            if (current_side == "l") {
                left_triple_press = document.getElementById("list_container").value;
                var index = triple_press.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 8;
                else if (index == 1) operation = 9;
                else if (index == 2) operation = 11;
                sendGestures(6, 3, operation)
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            closePopUp()
        })
    } else if (type == "press_and_hold") {
        var show_popup = "";
        for (var i = 0; i < press_and_hold.length; i++) {
            show_popup += `
            <option id="${press_and_hold[i]}" ${left_press_and_hold == press_and_hold[i] ? "selected" : ""}>
                ${press_and_hold[i]}
            </option>
           `
        }

        document.getElementById("popup_container").style.opacity = "100"
        document.getElementById("popup_container").style.zIndex = "1000"
        document.getElementById("popup_content").style.zIndex = "1001"

        document.getElementById("popup_content").innerHTML = ` <div class="w-fit flex m-auto text-md mb-5 mt-2">
        Change gesture
            </div>
                <div id="anc_pinch_settings" style="display: none; margin-bottom: 40px;"> 
                <label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_selector_hold[0] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_selector_hold');">Transparency</label><br />
                <label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_selector_hold[1] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_selector_hold');">Noise cancellation</label><br />
                <label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_selector_hold[2] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_selector_hold');">Off</label>
            </div>
            <select id="list_container" class="flex flex-col w-fit m-auto bg-[#1B1D1F] w-[300px] outline-none p-3 border-[#333333] border-[1px] rounded-md" style="width: 300px; padding: 12px; border: #333333 1px solid; background-color: #1B1D1F; outline: none;">
            ${show_popup}</select>`
        if (current_side == "l") if (left_press_and_hold == "Noise control") document.getElementById("anc_pinch_settings").style.display = "grid";
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_press_and_hold").innerHTML = document.getElementById("list_container").value
            if (document.getElementById("list_container").value == "Noise control") document.getElementById("anc_pinch_settings").style.display = "grid";
            else document.getElementById("anc_pinch_settings").style.display = "none";
            if (current_side == "l") {
                left_press_and_hold = document.getElementById("list_container").value;
                var index = press_and_hold.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = getANCtoggleFunction(anc_selector_hold);
                sendGestures(6, 7, operation)
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            if (document.getElementById("list_container").value != "Noise control") closePopUp()
        })
    } 
}

function checkboxCheck(evt, selected_gesture) {
    var checkboxes = document.querySelectorAll('[id=checkbox]')
    var checkboxesChecked = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checkboxesChecked.push(checkboxes[i]);
        }
    }
    if (checkboxesChecked.length < 2) {
        return event.target.checked = !event.target.checked
    } else {
        event.target.checked = event.target.checked
        if (selected_gesture == "anc_selector_hold") {
            var index = Array.prototype.indexOf.call(checkboxes, evt.target);
            anc_selector_hold[index] = anc_selector_hold[index] == 1 ? 0 : 1;
            sendGestures(2, 7, getANCtoggleFunction(anc_selector_hold))
            sendGestures(3, 7, getANCtoggleFunction(anc_selector_hold))
        }
    }
}

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

function setAncToNC() {
    document.getElementById("selector").style.marginLeft = "16px"
    document.getElementById("ANC_on").style.fill = "black"
    document.getElementById("trans_on").style.fill = "white"
    document.getElementById("anc_off").style.fill = "white"
    document.getElementById("anc_strength_selector").style.opacity = "100"

    ANC_type = 0;
}

function setAncToTransparent() {
    document.getElementById("selector").style.marginLeft = "112px"
    document.getElementById("trans_on").style.fill = "black"
    document.getElementById("ANC_on").style.fill = "white"
    document.getElementById("anc_off").style.fill = "white"
    document.getElementById("anc_strength_selector").style.opacity = "0"

    ANC_type = 1;
}

function setAncToOff() {
    document.getElementById("selector").style.marginLeft = "209px"
    document.getElementById("anc_off").style.fill = "black"
    document.getElementById("ANC_on").style.fill = "white"
    document.getElementById("trans_on").style.fill = "white"
    document.getElementById("anc_strength_selector").style.opacity = "0"

    ANC_type = 2;
}



function setAncStrengthHigh() {
    if (!document.getElementById("stage_one_button")) return;
    document.getElementById("stage_one_button").style = "height: 0.75rem !important; width: 0.75rem !important; margin-left: -0.25rem !important; margin-top: -0.25rem !important;"
    document.getElementById("stage_two_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"
    document.getElementById("stage_three_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"
    document.getElementById("stage_four_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"

    ANC_strength = 0;
}

function setAncStrengthMid() {
    if (!document.getElementById("stage_one_button")) return;
    document.getElementById("stage_one_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_two_button").style = "height: 0.75rem !important; width: 0.75rem !important; margin-right: -0.25rem !important; margin-top: -0.25rem !important;"
    document.getElementById("stage_three_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"
    document.getElementById("stage_four_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"


    ANC_strength = 2;
}

function displayANC(display) { }

function setAncStrengthLow() {
    if (!document.getElementById("stage_one_button")) return;
    document.getElementById("stage_one_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_two_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_three_button").style = "height: 0.75rem !important; width: 0.75rem !important; margin-right: -0.25rem !important; margin-top: -0.25rem !important;"
    document.getElementById("stage_four_button").style = "height: 0.25rem; width: 0.25rem; margin-left: 0px; margin-top: 0px;"

    ANC_strength = 1;
}

function setAncStrengthAdaptive() {
    if (!document.getElementById("stage_one_button")) return;
    document.getElementById("stage_one_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_two_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_three_button").style = "height: 0.25rem !important; width: 0.25rem !important; margin-left: 0px !important; margin-top: 0px !important;"
    document.getElementById("stage_four_button").style = "height: 0.75rem !important; width: 0.75rem !important; margin-right: -0.25rem !important; margin-top: -0.25rem !important;"

    ANC_strength = 3;
}






function setBattery(side, percentage) {
    if (typeof percentage == "undefined") {
        percentage = "DISCONNECTED";
    }
    if (side == "s") {
        document.getElementById("left_ear").style.opacity = percentage == "DISCONNECTED" ? "0.5" : "1";
        document.getElementById("left_ear").style.zIndex = percentage == "DISCONNECTED" ? "-1" : "1";
        document.getElementById("battery-l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery_bar_l").style.opacity = percentage == "DISCONNECTED" ? "0" : "1";
        document.getElementById("battery-l").innerHTML = percentage + "%";
        document.getElementById("battery_bar_fill_l").style.width = percentage + "%";
    }
}

function setBassEnhance(state, is_send=false) {
    console.log("setBassEnhance", state)
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



function setBassLevel(new_level, is_send=false) {
    if (new_level) level = new_level
    bass_enhance[1] = level
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