//---------------------------------------------------------------------------------//

//TYPE OF SELECTED EQ (0 = Balanced, 1 = More Voice, 2 = More Treble, 3 = More Bass) 
var current_eq;

//---------------------------------------------------------------------------------//

var options;
resetOptions();
var chart;

var ctx = document.getElementById("myChart").getContext("2d"); 

var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '	rgb(255,0,0, 20%)');   
    gradient.addColorStop(1, 'rgba(95,100,106, 0%)');

var data = {
    labels: ["", "", ""],
    datasets: [{
        backgroundColor: gradient,
        label: '# of Votes',
        data: [6, 5, 6],
        borderWidth: 1,
    },
    ]
}
drawChart(data);

function EQButtonPress(level) {
    setEQ(level);
    setEQfromRead(level);
}

function setEQfromRead(level) {
    if (level == 0) {
        setBalanced(document.getElementById("buttonEQBalanced"));
    } else if (level == 1) {
        setVoice(document.getElementById("buttonEQVoice"));
    } else if (level == 2) {
        setTreble(document.getElementById("buttonEQTreble"));
    } else if (level == 3) {
        setBass(document.getElementById("buttonEQBass"));
    }
}

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
    drawChart(data);
    clearButtons()
    e.style.backgroundColor = "#ffffff";
    e.style.color = "#000000";

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
    drawChart(data);
    clearButtons()
    e.style.backgroundColor = "#ffffff";
    e.style.color = "#000000";

    current_eq = 3;
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
    drawChart(data);
    clearButtons()
    e.style.backgroundColor = "#ffffff";
    e.style.color = "#000000";

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
    drawChart(data);
    clearButtons()
    e.style.backgroundColor = "#ffffff";
    e.style.color = "#000000";

    current_eq = 1;
}

async function drawChart(data) {
    if (chart) {
        chart.destroy();
    }

    var extra_options = { responsive: true, maintainAspectRatio: false }

    chart = new Chart("myChart", {
        type: 'line',
        data: data,
        options: { ...options, ...extra_options },
    });
}