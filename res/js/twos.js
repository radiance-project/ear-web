var double_pinch = ["Skip Back", "Skip Forward", "Voice Assistant"];
var triple_pinch = ["Skip Back", "Skip Forward", "Voice Assistant"];
var pinch_and_hold = ["Noise control", "Volume UP", "Volume Down", "Voice Assistant"];
var double_pinch_and_hold = ["Noise control", "Volume UP", "Volume Down", "Voice Assistant", "No action"];
var anc_selector_pinch = [1, 1, 0]
var anc_selector_pinch_double = [1, 1, 0]
let leftStateEarTipTest = undefined
let rightStateEarTipTest = undefined
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
var left_triple_pinch_current = triple_pinch[0];
var left_pinch_and_hold_current = pinch_and_hold[0];
var right_triple_pinch_current = triple_pinch[0];
var right_pinch_and_hold_current = pinch_and_hold[0];
var right_double_pinch_and_hold_current = double_pinch_and_hold[0];
var left_double_pinch_and_hold_current = double_pinch_and_hold[0];
var right_double_pinch_current = double_pinch[0];
var left_double_pinch_current = double_pinch[0];
var anc_selector_pinch_double_l = anc_selector_pinch_double[0];
var anc_selector_pinch_double_r = anc_selector_pinch_double[0];
var anc_selector_pinch_l = anc_selector_pinch[0];
var anc_selector_pinch_r = anc_selector_pinch[0];

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
            class='h-44 ml-[40px] duration-500 ease-in-out relative cursor-pointer'
            id="left_ear_peace"
            style="z-Index:100; margin: 0 0 0 40px; transform: scale(0.85);" />
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

    setInterval(function () {

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
            clearInterval()
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

var GESTURE_TOPOLOGY = {
    sides: ["l", "r"],
    deviceCodes: { l: 2, r: 3 },
    sidePrefixes: { l: "left", r: "right" },
    varPrefix: true,
};

var GESTURE_SLOTS = [
    {
        key: "double_pinch",
        type: "double",
        sendType: 2,
        options: double_pinch,
        actionToIndex: { 8: 0, 9: 1, 11: 2 },
        subtitleId: "settings_subtitle_double",
        loadSuffix: "<br />Decline incoming calls</div>",
        changeSuffix: "<br />Decline incoming call",
    },
    {
        key: "triple_pinch",
        type: "triple",
        sendType: 3,
        options: triple_pinch,
        actionToIndex: { 8: 0, 9: 1, 11: 2 },
        subtitleId: "settings_subtitle_triple",
    },
    {
        key: "pinch_and_hold",
        type: "pinch_and_hold",
        sendType: 7,
        options: pinch_and_hold,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 18: 1, 19: 2, 11: 3 },
        ancToggle: { selectorName: "anc_selector_pinch", panelId: "anc_pinch_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_pinch_and_hold",
    },
    {
        key: "double_pinch_and_hold",
        type: "double_pinch_and_hold",
        sendType: 9,
        options: double_pinch_and_hold,
        actionToIndex: { 10: 0, 20: 0, 21: 0, 22: 0, 18: 1, 19: 2, 11: 3, 1: 4 },
        ancToggle: { selectorName: "anc_selector_pinch_double", panelId: "anc_pinch_settings", mergedIndex: 0 },
        subtitleId: "settings_subtitle_double_pinch_and_hold",
    },
];

function updateGesturesFromArray(records) {
    applyGestureRecords(records, GESTURE_TOPOLOGY, GESTURE_SLOTS);
    loadCurrentGestures(current_side, false);
}

function loadCurrentGestures(side, refresh = true) {
    if (refresh) {
        sendGetGesture();
    }
    current_side = side;
    loadCurrentGesturesGeneric(side, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}

function changeGesture(type) {
    renderGestureChangePopup(type, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}

function checkboxCheck(evt, slotKey) {
    checkboxCheckGeneric(evt, slotKey, GESTURE_TOPOLOGY, GESTURE_SLOTS);
}

