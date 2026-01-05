var button_single_press = ["Essential News", "Voice AI", "Noise control", "Spatial audio", "Mic on/off", "No action"];
var button_press_hold = ["Essential News", "Voice AI", "Noise control", "Spatial audio", "Essential Space", "Mic on/off", "No action"];
var slider = ["Bass Tuning", "Treble Tuning"];
var roller_hold = ["Noise control"];

var anc_button_single_press = [1, 1, 0];
var anc_button_press_hold = [1, 1, 0];
var anc_roller_hold = [1, 1, 0];

var button_single_press_current = button_single_press[0];
var button_press_hold_current = button_press_hold[0];
var slider_current = slider[0];
var roller_hold_current = roller_hold[0];


var current_side;


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
            if (array[i].gestureCommon == 10) {
                if (array[i].gestureType == 1) {
                    if (array[i].gestureAction == 31) {
                        button_single_press_current = button_single_press[0];
                    } else if (array[i].gestureAction == 11) {
                        button_single_press_current = button_single_press[1];
                    } else if (array[i].gestureAction == 10 || array[i].gestureAction == 20 || array[i].gestureAction == 21 || array[i].gestureAction == 22) {
                        button_single_press_current = button_single_press[2];
                        if (array[i].gestureAction == 10) {
                            anc_button_single_press = [1, 1, 1]
                        } else if (array[i].gestureAction == 20) {
                            anc_button_single_press = [0, 1, 1]
                        } else if (array[i].gestureAction == 21) {
                            anc_button_single_press = [1, 0, 1]
                        } else if (array[i].gestureAction == 22) {
                            anc_button_single_press = [1, 1, 0]
                        }
                    } else if (array[i].gestureAction == 27) {
                        button_single_press_current = button_single_press[3];
                    } else if (array[i].gestureAction == 29) {
                        button_single_press_current = button_single_press[4];
                    } else if (array[i].gestureAction == 1) {
                        button_single_press_current = button_single_press[5];
                    }
                } else if (array[i].gestureType == 7) {
                    if (array[i].gestureAction == 31) {
                        button_press_hold_current = button_press_hold[0];
                    } else if (array[i].gestureAction == 11) {
                        button_press_hold_current = button_press_hold[1];
                    } else if (array[i].gestureAction == 10 || array[i].gestureAction == 20 || array[i].gestureAction == 21 || array[i].gestureAction == 22) {
                        button_press_hold_current = button_press_hold[2];
                        if (array[i].gestureAction == 10) {
                            anc_button_press_hold = [1, 1, 1]
                        } else if (array[i].gestureAction == 20) {
                            anc_button_press_hold = [0, 1, 1]
                        } else if (array[i].gestureAction == 21) {
                            anc_button_press_hold = [1, 0, 1]
                        } else if (array[i].gestureAction == 22) {
                            anc_button_press_hold = [1, 1, 0]
                        }
                    } else if (array[i].gestureAction == 27) {
                        button_press_hold_current = button_press_hold[3];
                    } else if (array[i].gestureAction == 33) {
                        button_press_hold_current = button_press_hold[4];
                    } else if (array[i].gestureAction == 29) {
                        button_press_hold_current = button_press_hold[5];
                    } else if (array[i].gestureAction == 1) {
                        button_press_hold_current = button_press_hold[6];
                    }
                }
            } else if (array[i].gestureCommon == 5) {
                if (array[i].gestureType == 1) {
                    if (array[i].gestureAction == 35) {
                        slider_current = slider[0];
                    } else if (array[i].gestureAction == 36) {
                        slider_current = slider[1];
                    }
                }
            } else if (array[i].gestureCommon == 1) {
                if (array[i].gestureType == 7) {
                    if (array[i].gestureAction == 10 || array[i].gestureAction == 20 || array[i].gestureAction == 21 || array[i].gestureAction == 22) {
                        roller_hold_current = roller_hold[0];
                        if (array[i].gestureAction == 10) {
                            anc_roller_hold = [1, 1, 1]
                        } else if (array[i].gestureAction == 20) {
                            anc_roller_hold = [0, 1, 1]
                        } else if (array[i].gestureAction == 21) {
                            anc_roller_hold = [1, 0, 1]
                        } else if (array[i].gestureAction == 22) {
                            anc_roller_hold = [1, 1, 0]
                        }
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
    current_side = side
    //LOAD ALL VALUES BASED ON CURRENT SIDE
    if (side == "l") {
        document.getElementById("settings_subtitle_single_press").innerHTML = button_single_press_current;
        document.getElementById("settings_subtitle_press_hold").innerHTML = button_press_hold_current;
        document.getElementById("settings_subtitle_slider").innerHTML = slider_current;
        document.getElementById("settings_subtitle_roller_hold").innerHTML = roller_hold_current;
    }

}

function changeGesture(type) {
    console.log("changeGesture", type);
    if (type == "single_press") {
        var show_popup = "";
        for (var i = 0; i < button_single_press.length; i++) {
            show_popup += `
			<option id="${button_single_press[i]}" ${button_single_press[i] == button_single_press_current ? "selected" : ""}>
				${button_single_press[i]}
			</option>
		   `
        }
        document.getElementById("popup_container").style.opacity = "100"
        document.getElementById("popup_container").style.zIndex = "1000"
        document.getElementById("popup_content").style.zIndex = "1001"

        document.getElementById("popup_content").innerHTML = ` <div class="w-fit flex m-auto text-md mb-5 mt-2">
		Change gesture
			</div>
				<div id="anc_tap_settings" style="display: none; margin-bottom: 40px;"> 
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_button_single_press[0] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_button_single_press');">Transparency</label><br />
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_button_single_press[1] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_button_single_press');">Noise cancellation</label><br />
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_button_single_press[2] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_button_single_press');">Off</label>
			</div>
			<select id="list_container" class="flex flex-col w-fit m-auto bg-[#1B1D1F] w-[300px] outline-none p-3 border-[#333333] border-[1px] rounded-md" style="width: 300px; padding: 12px; border: #333333 1px solid; background-color: #1B1D1F; outline: none;">
			${show_popup}</select>`
        if (current_side == "l") if (button_single_press_current == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
        document.getElementById("list_container").addEventListener("change", function (e) {
            if (document.getElementById("list_container").value == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
            else document.getElementById("anc_tap_settings").style.display = "none";
            document.getElementById("settings_subtitle_single_press").innerHTML = document.getElementById("list_container").value;
            if (current_side == "l") {
                button_single_press_current = document.getElementById("list_container").value;
                var index = button_single_press.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 31;
                else if (index == 1) operation = 11;
                else if (index == 2) operation = getANCtoggleFunction(anc_button_single_press);
                else if (index == 3) operation = 27;
                else if (index == 4) operation = 29;
                else if (index == 5) operation = 1;
                sendGestures(6, 1, operation, 10);
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            closePopUp()
        })
    } else if (type == "press_hold") {
        var show_popup = "";
        for (var i = 0; i < button_press_hold.length; i++) {
            show_popup += `
			<option id="${button_press_hold[i]}" ${button_press_hold_current == button_press_hold[i] ? "selected" : "" }>
				${button_press_hold[i]}
			</option>
		   `
        }
        document.getElementById("popup_container").style.opacity = "100"
        document.getElementById("popup_container").style.zIndex = "1000"
        document.getElementById("popup_content").style.zIndex = "1001"

        document.getElementById("popup_content").innerHTML = ` <div class="w-fit flex m-auto text-md mb-5 mt-2">
		Change gesture
			</div>
				<div id="anc_tap_settings" style="display: none; margin-bottom: 40px;"> 
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_button_press_hold[0] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_button_press_hold');">Transparency</label><br />
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_button_press_hold[1] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_button_press_hold');">Noise cancellation</label><br />
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_button_press_hold[2] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_button_press_hold');">Off</label>
			</div>
			<select id="list_container" class="flex flex-col w-fit m-auto bg-[#1B1D1F] w-[300px] outline-none p-3 border-[#333333] border-[1px] rounded-md" style="width: 300px; padding: 12px; border: #333333 1px solid; background-color: #1B1D1F; outline: none;">
			${show_popup}</select>`
        if (current_side == "l") if (button_press_hold_current == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
        document.getElementById("list_container").addEventListener("change", function (e) {
            if (document.getElementById("list_container").value == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
            else document.getElementById("anc_tap_settings").style.display = "none";
            document.getElementById("settings_subtitle_press_hold").innerHTML = document.getElementById("list_container").value
            if (current_side == "l") {
                button_press_hold_current = document.getElementById("list_container").value;
                var index = button_press_hold.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 31;
                else if (index == 1) operation = 11;
                else if (index == 2) operation = getANCtoggleFunction(anc_button_press_hold);
                else if (index == 3) operation = 27;
                else if (index == 4) operation = 33;
                else if (index == 5) operation = 29;
                else if (index == 6) operation = 1;
                sendGestures(6, 7, operation, 10);
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            closePopUp()
        })
    } else if (type == "slider") {
        var show_popup = "";
        for (var i = 0; i < slider.length; i++) {
            show_popup += `
			<option id="${slider[i]}" ${slider_current == slider[i] ? "selected" : ""}>
				${slider[i]}
			</option>
		   `
        }
        displayPopUp(show_popup)
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_slider").innerHTML = document.getElementById("list_container").value
            if (current_side == "l") {
                slider_current = document.getElementById("list_container").value;
                var index = slider.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 35;
                else if (index == 1) operation = 36;
                sendGestures(6, 1, operation, 5);
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            if (document.getElementById("list_container").value != "Noise control") closePopUp()
        })
    } else if (type == "roller_hold") {
        var show_popup = "";
        for (var i = 0; i < roller_hold.length; i++) {
            show_popup += `
			<option id="${roller_hold[i]}" ${roller_hold_current == roller_hold[i] ? "selected" : ""}>
				${roller_hold[i]}
			</option>
		   `
        }

        document.getElementById("popup_container").style.opacity = "100"
        document.getElementById("popup_container").style.zIndex = "1000"
        document.getElementById("popup_content").style.zIndex = "1001"

        document.getElementById("popup_content").innerHTML = ` <div class="w-fit flex m-auto text-md mb-5 mt-2">
		Change gesture
			</div>
				<div id="anc_tap_settings" style="display: none; margin-bottom: 40px;"> 
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_roller_hold[0] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_roller_hold');">Transparency</label><br />
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_roller_hold[1] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_roller_hold');">Noise cancellation</label><br />
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_roller_hold[2] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_roller_hold');">Off</label>
			</div>
			<select id="list_container" class="flex flex-col w-fit m-auto bg-[#1B1D1F] w-[300px] outline-none p-3 border-[#333333] border-[1px] rounded-md" style="width: 300px; padding: 12px; border: #333333 1px solid; background-color: #1B1D1F; outline: none;">
			${show_popup}</select>`
        if (current_side == "l") if (roller_hold_current == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_roller_hold").innerHTML = document.getElementById("list_container").value
            if (document.getElementById("list_container").value == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
            else document.getElementById("anc_tap_settings").style.display = "none";
            if (current_side == "l") {
                roller_hold_current = document.getElementById("list_container").value;
                var index = roller_hold.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = getANCtoggleFunction(anc_selector_tap)
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
        if (selected_gesture == "anc_button_single_press") {
            var index = Array.prototype.indexOf.call(checkboxes, evt.target);
            anc_button_single_press[index] = anc_button_single_press[index] == 1 ? 0 : 1;
            sendGestures(6, 1, getANCtoggleFunction(anc_button_single_press), 10)
        } else if (selected_gesture == "anc_button_press_hold") {
            var index = Array.prototype.indexOf.call(checkboxes, evt.target);
            anc_button_press_hold[index] = anc_button_press_hold[index] == 1 ? 0 : 1;
            sendGestures(6, 7, getANCtoggleFunction(anc_button_press_hold), 10)
        } else if (selected_gesture == "anc_roller_hold") {
            var index = Array.prototype.indexOf.call(checkboxes, evt.target);
            anc_roller_hold[index] = anc_roller_hold[index] == 1 ? 0 : 1;
            sendGestures(6, 7, getANCtoggleFunction(anc_roller_hold), 1)
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