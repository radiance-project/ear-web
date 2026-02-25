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

function updateIndicator(){
    document.getElementById("eq_label_bass").innerText = custom_values[0];
    document.getElementById("eq_label_mid").innerText = custom_values[1];
    document.getElementById("eq_label_treble").innerText = custom_values[2];
}

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

function setCustomEQ(array) {
    custom_values = array;
    setCustom();
    updateIndicator();
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

function resetOptions() {
    options = {
        tooltips: { enabled: false },
        onClick: null,
        elements: {
            point: {
                radius: 0
            }
        },
        legend: {
            display: false
        },
        responsive: true,
        scales: {
            xAxes: [{
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    display: false,
                    min: 0,
                    max: 10,
                }
            }],
            x: {
                ticks: {
                    callback: () => ('')
                }
            },
            y: {
                display: false,
                title: {
                    display: false,
                    text: 'Value'
                },
                suggestedMin: 0,
                suggestedMax: 200,

            },
            events: []
        }
    }
}
resetOptions()


function setBalanced(e) {
    data = {
        labels: ["", "", ""],
        datasets: [{
            backgroundColor: gradient,
            label: '# of Votes',
            data: [6, 5, 6],
            borderWidth: 1,
        },
        ]
    }
    resetOptions();
    drawChart(data);
    clearButtons()
    var buttons = document.getElementsByClassName("eq-button")
    buttons[0].style.backgroundColor = "#ffffff";
    buttons[0].style.color = "#000000";
    current_eq = 0;
}

function setBass(e) {

    data = {
        labels: ["", "", ""],
        datasets: [{
            backgroundColor: gradient,
            label: '# of Votes',
            data: [10, 3, 4],
            borderWidth: 1,
        },
        ]
    }
    resetOptions();
    drawChart(data);
    clearButtons()
    var buttons = document.getElementsByClassName("eq-button")
    buttons[1].style.backgroundColor = "#ffffff";
    buttons[1].style.color = "#000000";
    current_eq = 1;
}

function setTreble(e) {
    data = {
        labels: ["", "", ""],
        datasets: [{
            backgroundColor: gradient,
            label: '# of Votes',
            data: [3, 3, 10],
            borderWidth: 1,
        },
        ]
    }
    resetOptions();
    drawChart(data);
    clearButtons()
    var buttons = document.getElementsByClassName("eq-button")
    buttons[2].style.backgroundColor = "#ffffff";
    buttons[2].style.color = "#000000";
    current_eq = 2;
}
function setVoice(e) {
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
    buttons[3].style.backgroundColor = "#ffffff";
    buttons[3].style.color = "#000000";
    current_eq = 3;
}

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


function setCustom(e) {
    data = {
        labels: ["Bass", "Medium", "Treble"],
        datasets: [{
            backgroundColor: gradient,
            label: '# of Votes',
            data: custom_values,
            borderWidth: 1,
        },
        ]
    }
    resetOptions();
    options = {
        tooltips: { enabled: false },
        onClick: (e) => {

        },
        legend: {
            display: false
        },
        responsive: true,
        scales: {
            xAxes: [{
                gridLines: {
                    // display: false
                }
            }],
            yAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    display: false,
                    min: 6,
                    max: -6,
                }
            }],
            x: {
                ticks: {
                    callback: () => ('')
                }
            },
            y: {
                display: false,
                title: {
                    display: false,
                    text: 'Value'
                },
                suggestedMin: 0,
                suggestedMax: 200,

            },
            events: []
        },
        dragData: true,
        dragX: false,
        dragDataRound: 1,
        dragOptions: {
            round: 0, 
            showTooltip: false,
        },
        onDragEnd: function (e, datasetIndex, index, value) {
            const canvasPosition = Chart.helpers.getRelativePosition(e, chart);
            // Substitute the appropriate scale IDs
            var dataY = chart.scales[Object.keys(chart.scales)[1]].getValueForPixel(canvasPosition.y)
            var dataX = chart.scales[Object.keys(chart.scales)[0]].getValueForPixel(canvasPosition.x)
            if (dataY > 6) dataY = 6;
            if (dataY < -6) dataY = -6;
            chart.data.datasets[0].data[dataX] = dataY;
            chart.update();
            custom_values = chart.data.datasets[0].data;
            //round all values in custom_values to 1 decimal place
            custom_values = [Math.round(custom_values[0]), Math.round(custom_values[1]), Math.round(custom_values[2])]
            setCustomEQ_BT([custom_values[1], custom_values[2], custom_values[0]]);
            updateIndicator();
        },
        hover: {
            onHover: function (e) {
                // indicate that a datapoint is draggable by showing the 'grab' cursor when hovered
                const point = this.getElementAtEvent(e)
                if (point.length) e.target.style.cursor = 'grab'
                else e.target.style.cursor = 'default'
            }
        }
    }
    drawChart(data);
    clearButtons()
    var buttons = document.getElementsByClassName("eq-button");
    buttons[4].style.backgroundColor = "#ffffff";
    buttons[4].style.color = "#000000";
    current_eq = 4;
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

function clearButtons() {
    var buttons = document.getElementsByClassName("eq-button");
    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        button.style.backgroundColor = "#000000";
        button.style.color = "#ffffff";
    }
}

// EQ Manager Integration
const MODEL_ID_TWO = "B155"; // Ear (2) Base ID

// Implement helpers required by eq_presets.js
function getCurrentEQData() {
    return custom_values;
}

function applyPresetData(data) {
    custom_values = data;
    setCustomEQ(custom_values);
    // Force UI update to "Custom" mode if not already
    EQButtonPress(5);
    setCustomEQ_BT([custom_values[1], custom_values[2], custom_values[0]]);
}

// Initialize
renderPresetsUI(MODEL_ID_TWO);