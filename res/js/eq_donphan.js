var ctx = document.getElementById("myChart").getContext("2d");

var gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgb(255,0,0, 20%)');
gradient.addColorStop(1, 'rgba(95,100,106, 0%)');


var options;
var chart;

var custom_values = [0, 0, 0];

var current_eq;

function updateIndicator(){
    document.getElementById("eq_label_bass").innerText = custom_values[0];
    document.getElementById("eq_label_mid").innerText = custom_values[1];
    document.getElementById("eq_label_treble").innerText = custom_values[2];
}

function EQButtonPress(level, pos) {
    setListeningMode(level);
    if (level == 6) {
        getCustomEQ();
        document.getElementById("custom_eq_indicator").style.display = "grid";
        updateIndicator();
    }else document.getElementById("custom_eq_indicator").style.display = "none";
    setEQfromRead(level, pos);
}

function setCustomEQ(array) {
    custom_values = array;
    setCustom();
    updateIndicator();
}

function setEQfromRead(level, pos) {
    console.log("eqlevel: " + level);
    var buttons = document.getElementsByClassName("eq-button")
    clearButtons();
    if (level == 0) {
        document.querySelector("#chart").style.display = "none";
        document.getElementById("custom_eq_indicator").style.display = "none";
        pos = 0;
    } else if (level == 1) {
        document.querySelector("#chart").style.display = "none";
        document.getElementById("custom_eq_indicator").style.display = "none";
        pos = 2;
    } else if (level == 2) {
        document.querySelector("#chart").style.display = "none";
        document.getElementById("custom_eq_indicator").style.display = "none";
        pos = 4;
    } else if (level == 3) {
        document.querySelector("#chart").style.display = "none";
        document.getElementById("custom_eq_indicator").style.display = "none";
        pos = 1;
    } else if (level == 4) {
        document.querySelector("#chart").style.display = "none";
        document.getElementById("custom_eq_indicator").style.display = "none";
        pos = 5;
    } else if (level == 5) {
        document.querySelector("#chart").style.display = "none";
        document.getElementById("custom_eq_indicator").style.display = "none";
        pos = 3;
    } else if (level == 6) {
        clearButtons();
        getCustomEQ();
        document.getElementById("custom_eq_indicator").style.display = "grid";
        document.querySelector("#chart").style.display = "grid";
        setCustom(document.getElementById("buttonEQCustom"));
        updateIndicator();
        pos = 6;
    }
    buttons[pos].style.backgroundColor = "#ffffff";
    buttons[pos].style.color = "#000000";
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
    buttons[6].style.backgroundColor = "#ffffff";
    buttons[6].style.color = "#000000";
    current_eq = 6;
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