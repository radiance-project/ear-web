var ctx = document.getElementById("myChart").getContext("2d");

var gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgb(255,0,0, 20%)');
gradient.addColorStop(1, 'rgba(95,100,106, 0%)');


var options;
var chart;

//---------------------------------------------------------------------------------//

//VALUES FOR CUSTOM EQ (IDK WHAT YOU NEED BUT MY SCALE GOERS FROM 0-10), goes like this: [Bass, Treble, Medium]
var custom_values = [0, 0, 0];

//TYPE OF SELECTED EQ (0 = Balanced, 1 = More Bass, 2 = More Treble, 3 = More Voice, 4 = Custom) 
var current_eq;

//TO SET THE EQ, SIMPLY USE ONE OF THESE FUNCTIONS
//setBalanced()
//setBass()
//setTreble()
//setVoice()

//TO SET CUSTOM EQ, USE THIS FUNCTION
// setCustom()
//AND OVERWRITE custom_values WITH YOUR VALUES

//---------------------------------------------------------------------------------//

function EQButtonPress(level) {
    if (level == 6) {
        setAdvancedEQenabled(true);
    }
    else {
        setAdvancedEQenabled(false);
        setEQ(level);
    }
    if (level == 5) {
        getCustomEQ();
        document.getElementById("custom_eq_indicator").style.display = "grid";
        updateIndicator();
    }else document.getElementById("custom_eq_indicator").style.display = "none";
    setEQfromRead(level);
}

function setEQfromRead(level) {
    console.log("eqlevel: " + level);
    if (level == 0) {
        setBalanced(document.getElementById("buttonEQBalanced"));
        document.querySelector("#chart").style.display = "grid";
        document.querySelector("#advancedEQmsg").style.display = "none";
    } else if (level == 1) {
        setVoice(document.getElementById("buttonEQVoice"));
        document.querySelector("#chart").style.display = "grid";
        document.querySelector("#advancedEQmsg").style.display = "none";
    } else if (level == 2) {
        setTreble(document.getElementById("buttonEQTreble"));
        document.querySelector("#chart").style.display = "grid";
        document.querySelector("#advancedEQmsg").style.display = "none";
    } else if (level == 3) {
        setBass(document.getElementById("buttonEQBass"));
        document.querySelector("#chart").style.display = "grid";
        document.querySelector("#advancedEQmsg").style.display = "none";
    } else if (level == 5) {
        getCustomEQ();
        document.getElementById("custom_eq_indicator").style.display = "grid";
        document.querySelector("#chart").style.display = "grid";
        document.querySelector("#advancedEQmsg").style.display = "none";
        setCustom(document.getElementById("buttonEQCustom"));
        updateIndicator();
    } else if (level == 6) {
        setAdvanced(document.getElementById("buttonEQAdvanced"));
        document.querySelector("#advancedEQmsg").style.display = "grid";
        document.querySelector("#chart").style.display = "none";
    }
}

resetOptions()

function setAdvanced(e) {
    data = {
        labels: ["", "", ""],
        datasets: [{
            backgroundColor: gradient,
            label: '# of Votes',
            data: [3, 10, 3],
            borderWidth: 1,
        },
        ]
    }
    resetOptions();
    drawChart(data);
    clearButtons()
    var buttons = document.getElementsByClassName("eq-button")
    buttons[5].style.backgroundColor = "#ffffff";
    buttons[5].style.color = "#000000";
    current_eq = 5;
}

async function drawChart(data) {
    if (chart) {
        chart.destroy();
      }

      var extra_options = { responsive: true, maintainAspectRatio: false}

    chart = new Chart("myChart", {
        type: 'line',
        data: data,
        options: {...options, ...extra_options},
    });
}

