var double_tap = ["Play/Pause", "Skip Back", "Skip Forward", "Voice Assistant", "No action"];
var triple_tap = ["Skip Back", "Skip Forward", "Voice Assistant", "No action"];
var tap_and_hold = ["Noise control", "Voice Assistant", "No action"];
var double_tap_and_hold = ["Volume up", "Volume down", "Voice Assistant", "No action"];

var anc_selector_tap = [1, 1, 0]
var left_triple_tap_current = triple_tap[0];
var left_tap_and_hold_current = tap_and_hold[0];
var right_triple_tap_current = triple_tap[0];
var right_tap_and_hold_current = tap_and_hold[0];
var right_double_tap_and_hold_current = double_tap_and_hold[0];
var left_double_tap_and_hold_current = double_tap_and_hold[0];
var right_double_tap_current = double_tap[0];
var left_double_tap_current = double_tap[0];
var anc_selector_tap_l = anc_selector_tap[0];
var anc_selector_tap_r = anc_selector_tap[0];

let bass_enhance = [0, 0]

var current_side;


// 0 = On, 1 = transparent, 2 = Off
var ANC_type = 1;


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
    if (e.contains("ringing-l")) {
        e.remove("ringing-l")
        document.getElementById("ring_button-r").style.backgroundColor = ""
        document.getElementById("ring_button-r").style.color = ""
        document.getElementById("ring_button-r").innerText = "Ring"
        ringBuds(0, false)
    } else {
        e.add("ringing-l")
        document.getElementById("ring_button-r").style.backgroundColor = "#7f1d1d"
        document.getElementById("ring_button-r").style.color = "#ffffff"
        document.getElementById("ring_button-r").innerText = "STOP"
        ringBuds(1, false)
    }
}


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
        if (array[i].gestureDevice == 2) {
            //LEFT
            if (array[i].gestureType == 2) {
                if (array[i].gestureAction == 2) {
                    left_double_tap_current = double_tap[0];
                } else if (array[i].gestureAction == 8) {
                    left_double_tap_current = double_tap[1];
                } else if (array[i].gestureAction == 9) {
                    left_double_tap_current = double_tap[2];
                } else if (array[i].gestureAction == 11) {
                    left_double_tap_current = double_tap[3];
                } else if (array[i].gestureAction == 1) {
                    left_double_tap_current = double_tap[4];
                }
            } else if (array[i].gestureType == 3) {
                //triple tap
                if (array[i].gestureAction == 8) {
                    left_triple_tap_current = triple_tap[0];
                } else if (array[i].gestureAction == 9) {
                    left_triple_tap_current = triple_tap[1];
                } else if (array[i].gestureAction == 11) {
                    left_triple_tap_current = triple_tap[2];
                } else if (array[i].gestureAction == 1) {
                    left_triple_tap_current = triple_tap[3];
                }
            } else if (array[i].gestureType == 7) {
                //tap and hold
                if (array[i].gestureAction == 10 || array[i].gestureAction == 20 || array[i].gestureAction == 21 || array[i].gestureAction == 22) {
                    left_tap_and_hold_current = tap_and_hold[0];
                    if (array[i].gestureAction == 10) {
                        anc_selector_tap = [1, 1, 1]
                    } else if (array[i].gestureAction == 20) {
                        anc_selector_tap = [0, 1, 1]
                    } else if (array[i].gestureAction == 21) {
                        anc_selector_tap = [1, 0, 1]
                    } else if (array[i].gestureAction == 22) {
                        anc_selector_tap = [1, 1, 0]
                    }
                } else if (array[i].gestureAction == 11) {
                    left_tap_and_hold_current = tap_and_hold[1];
                } else if (array[i].gestureAction == 1) {
                    left_tap_and_hold_current = tap_and_hold[2];
                }

            } else if (array[i].gestureType == 9) {
                if (array[i].gestureAction == 18) {
                    left_double_tap_and_hold_current = double_tap_and_hold[0];
                } else if (array[i].gestureAction == 19) {
                    left_double_tap_and_hold_current = double_tap_and_hold[1];
                } else if (array[i].gestureAction == 11) {
                    left_double_tap_and_hold_current = double_tap_and_hold[2];
                } else if (array[i].gestureAction == 1) {
                    left_double_tap_and_hold_current = double_tap_and_hold[3];
                }
            }
        } else if (array[i].gestureDevice == 3) {
            //RIGHT
            if (array[i].gestureType == 2) {
                if (array[i].gestureAction == 2) {
                    right_double_tap_current = double_tap[0];
                } else if (array[i].gestureAction == 8) {
                    right_double_tap_current = double_tap[1];
                } else if (array[i].gestureAction == 9) {
                    right_double_tap_current = double_tap[2];
                } else if (array[i].gestureAction == 11) {
                    right_double_tap_current = double_tap[3];
                } else if (array[i].gestureAction == 1) {
                    right_double_tap_current = double_tap[4];
                }
            } else if (array[i].gestureType == 3) {
                //triple tap
                if (array[i].gestureAction == 8) {
                    right_triple_tap_current = triple_tap[0];
                } else if (array[i].gestureAction == 9) {
                    right_triple_tap_current = triple_tap[1];
                } else if (array[i].gestureAction == 11) {
                    right_triple_tap_current = triple_tap[2];
                } else if (array[i].gestureAction == 1) {
                    right_triple_tap_current = triple_tap[3];
                }
            } else if (array[i].gestureType == 7) {
                //tap and hold
                if (array[i].gestureAction == 10 || array[i].gestureAction == 20 || array[i].gestureAction == 21 || array[i].gestureAction == 22) {
                    right_tap_and_hold_current = tap_and_hold[0];
                    if (array[i].gestureAction == 10) {
                        anc_selector_tap = [1, 1, 1]
                    } else if (array[i].gestureAction == 20) {
                        anc_selector_tap = [0, 1, 1]
                    } else if (array[i].gestureAction == 21) {
                        anc_selector_tap = [1, 0, 1]
                    } else if (array[i].gestureAction == 22) {
                        anc_selector_tap = [1, 1, 0]
                    }
                } else if (array[i].gestureAction == 11) {
                    right_tap_and_hold_current = tap_and_hold[1];
                } else if (array[i].gestureAction == 1) {
                    right_tap_and_hold_current = tap_and_hold[2];
                }
            } else if (array[i].gestureType == 9) {
                if (array[i].gestureAction == 18) {
                    right_double_tap_and_hold_current = double_tap_and_hold[0];
                } else if (array[i].gestureAction == 19) {
                    right_double_tap_and_hold_current = double_tap_and_hold[1];
                } else if (array[i].gestureAction == 11) {
                    right_double_tap_and_hold_current = double_tap_and_hold[2];
                } else if (array[i].gestureAction == 1) {
                    right_double_tap_and_hold_current = double_tap_and_hold[3];
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
        document.getElementById("settings_subtitle_triple").innerHTML = left_triple_tap_current + "<br />Decline Incoming call</div>";
        document.getElementById("settings_subtitle_tap_and_hold").innerHTML = left_tap_and_hold_current;
        document.getElementById("settings_subtitle_double_tap_and_hold").innerHTML = left_double_tap_and_hold_current;
        document.getElementById("settings_subtitle_double").innerHTML = left_double_tap_current + "<br />Answer / Hang up calls</div>";
    } else if (side == "r") {
        document.getElementById("settings_subtitle_triple").innerHTML = right_triple_tap_current + "<br />Decline Incoming call</div>";
        document.getElementById("settings_subtitle_tap_and_hold").innerHTML = right_tap_and_hold_current;
        document.getElementById("settings_subtitle_double_tap_and_hold").innerHTML = right_double_tap_and_hold_current;
        document.getElementById("settings_subtitle_double").innerHTML = right_double_tap_current + "<br />Answer / Hang up calls</div>";
    }

}

function changeGesture(type) {
    console.log("changeGesture", type);
    if (type == "double") {
        var show_popup = "";
        for (var i = 0; i < double_tap.length; i++) {
            show_popup += `
			<option id="${double_tap[i]}" ${current_site == "l" ? left_double_tap_current == double_tap[i] ? "selected" : "" : right_double_tap_current == double_tap[i] ? "selected" : ""}>
				${double_tap[i]}
			</option>
		   `
        }
        displayPopUp(show_popup)
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_double").innerHTML = document.getElementById("list_container").value + "<br />Decline incoming call"
            if (current_site == "l") {
                left_double_tap_current = document.getElementById("list_container").value;
                var index = double_tap.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 2;
                else if (index == 1) operation = 8;
                else if (index == 2) operation = 9;
                else if (index == 3) operation = 11;
                else if (index == 4) operation = 1;
                sendGestures(2, 2, operation)
            }
            if (current_site == "r") {
                right_double_tap_current = document.getElementById("list_container").value;
                var index = double_tap.indexOf(document.getElementById("list_container").value);
                var operation = 0;

                if (index == 0) operation = 2;
                else if (index == 1) operation = 8;
                else if (index == 2) operation = 9;
                else if (index == 3) operation = 11;
                else if (index == 4) operation = 1;
                sendGestures(3, 2, operation)
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            closePopUp()
        })
    } else if (type == "triple") {
        var show_popup = "";
        for (var i = 0; i < triple_tap.length; i++) {
            show_popup += `
			<option id="${triple_tap[i]}" ${current_site == "l" ? left_triple_tap_current == triple_tap[i] ? "selected" : "" : right_triple_tap_current == triple_tap[i] ? "selected" : ""}>
				${triple_tap[i]}
			</option>
		   `
        }
        displayPopUp(show_popup)
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_triple").innerHTML = document.getElementById("list_container").value
            if (current_site == "l") {
                left_triple_tap_current = document.getElementById("list_container").value;
                var index = triple_tap.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 8;
                else if (index == 1) operation = 9;
                else if (index == 2) operation = 11;
                else if (index == 3) operation = 1;
                sendGestures(2, 3, operation)
            }
            if (current_site == "r") {
                right_triple_tap_current = document.getElementById("list_container").value;
                var index = triple_tap.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 8;
                else if (index == 1) operation = 9;
                else if (index == 2) operation = 11;
                else if (index == 3) operation = 1;
                sendGestures(3, 3, operation)
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            closePopUp()
        })
    } else if (type == "double_tap_and_hold") {
        var show_popup = "";
        for (var i = 0; i < double_tap_and_hold.length; i++) {
            show_popup += `
			<option id="${double_tap_and_hold[i]}" ${current_site == "l" ? left_double_tap_and_hold_current == double_tap_and_hold[i] ? "selected" : "" : right_double_tap_and_hold_current == double_tap_and_hold[i] ? "selected" : ""}>
				${double_tap_and_hold[i]}
			</option>
		   `
        }
        displayPopUp(show_popup)
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_double_tap_and_hold").innerHTML = document.getElementById("list_container").value
            if (current_site == "l") {
                left_double_tap_and_hold_current = document.getElementById("list_container").value;
                var index = double_tap_and_hold.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 18;
                else if (index == 1) operation = 19;
                else if (index == 2) operation = 11;
                else if (index == 3) operation = 1;
                sendGestures(2, 9, operation)
            }
            if (current_site == "r") {
                right_double_tap_and_hold_current = document.getElementById("list_container").value;
                var index = double_tap_and_hold.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = 18;
                else if (index == 1) operation = 19;
                else if (index == 2) operation = 11;
                else if (index == 3) operation = 1;
                sendGestures(3, 9, operation)
            }
            document.getElementById("list_container").removeEventListener("change", () => { })
            if (document.getElementById("list_container").value != "Noise control") closePopUp()
        })
    } else if (type == "tap_and_hold") {
        var show_popup = "";
        for (var i = 0; i < tap_and_hold.length; i++) {
            show_popup += `
			<option id="${tap_and_hold[i]}" ${current_site == "l" ? left_tap_and_hold_current == tap_and_hold[i] ? "selected" : "" : right_tap_and_hold_current == tap_and_hold[i] ? "selected" : ""}>
				${tap_and_hold[i]}
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
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_selector_tap[0] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_selector_tap');">Transparency</label><br />
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_selector_tap[1] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_selector_tap');">Noise cancellation</label><br />
				<label class="text-sm" style="height: 13px;"><input type="checkbox" ${anc_selector_tap[2] == 1 ? "checked" : ""} id="checkbox" class="m-auto mb-5" onclick="checkboxCheck(event, 'anc_selector_tap');">Off</label>
			</div>
			<select id="list_container" class="flex flex-col w-fit m-auto bg-[#1B1D1F] w-[300px] outline-none p-3 border-[#333333] border-[1px] rounded-md" style="width: 300px; padding: 12px; border: #333333 1px solid; background-color: #1B1D1F; outline: none;">
			${show_popup}</select>`
        if (current_site == "l") if (left_tap_and_hold_current == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
        if (current_site == "r") if (right_tap_and_hold_current == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
        document.getElementById("list_container").addEventListener("change", function (e) {
            document.getElementById("settings_subtitle_tap_and_hold").innerHTML = document.getElementById("list_container").value
            if (document.getElementById("list_container").value == "Noise control") document.getElementById("anc_tap_settings").style.display = "grid";
            else document.getElementById("anc_tap_settings").style.display = "none";
            if (current_site == "l") {
                left_tap_and_hold_current = document.getElementById("list_container").value;
                var index = tap_and_hold.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = getANCtoggleFunction(anc_selector_tap)
                else if (index == 1) operation = 11;
                else if (index == 2) operation = 1;
                sendGestures(2, 7, operation)
            }
            if (current_site == "r") {
                right_tap_and_hold_current = document.getElementById("list_container").value;
                var index = tap_and_hold.indexOf(document.getElementById("list_container").value);
                var operation = 0;
                if (index == 0) operation = getANCtoggleFunction(anc_selector_tap)
                else if (index == 1) operation = 11;
                else if (index == 2) operation = 1;
                sendGestures(3, 7, operation)
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
        if (selected_gesture == "anc_selector_tap") {
            var index = Array.prototype.indexOf.call(checkboxes, evt.target);
            anc_selector_tap[index] = anc_selector_tap[index] == 1 ? 0 : 1;
            sendGestures(2, 7, getANCtoggleFunction(anc_selector_tap))
            sendGestures(3, 7, getANCtoggleFunction(anc_selector_tap))
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
    } 

    var type = 0;
    if (ANC_type == 1) {
        type = 2;
    } else if (ANC_type == 2) {
        type = 1;
    } else if (ANC_type == 0) {
        type = 4;
    }
    setANCDisplay(type);
    setANC_BT(type);
}

function setAncToNC() {
    document.getElementById("selector").style.marginLeft = "16px"
    document.getElementById("ANC_on").style.fill = "black"
    document.getElementById("trans_on").style.fill = "white"
    document.getElementById("anc_off").style.fill = "white"

    ANC_type = 0;
}

function setAncToTransparent() {
    document.getElementById("selector").style.marginLeft = "112px"
    document.getElementById("trans_on").style.fill = "black"
    document.getElementById("ANC_on").style.fill = "white"
    document.getElementById("anc_off").style.fill = "white"

    ANC_type = 1;
}

function setAncToOff() {
    document.getElementById("selector").style.marginLeft = "209px"
    document.getElementById("anc_off").style.fill = "black"
    document.getElementById("ANC_on").style.fill = "white"
    document.getElementById("trans_on").style.fill = "white"

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