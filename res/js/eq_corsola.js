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
    setEQ(level);
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
    } else if (level == 1) {
        setVoice(document.getElementById("buttonEQVoice"));
    } else if (level == 2) {
        setTreble(document.getElementById("buttonEQTreble"));
    } else if (level == 3) {
        setBass(document.getElementById("buttonEQBass"));
    } else if (level == 5) {
        getCustomEQ();
        document.getElementById("custom_eq_indicator").style.display = "grid";
        setCustom(document.getElementById("buttonEQCustom"));
        updateIndicator();
    }
}

resetOptions()

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

