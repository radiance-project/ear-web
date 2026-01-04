//TYPE OF SELECTED EQ (1 = Rock, 2 = Electronic, 3 = Pop, 4 = Enhance Vocals, 5 = Classical, 6 = Custom)
var current_eq;

var custom_values = [2, 2, 2];

function updateIndicator() {
  document.getElementById("eq_label_bass").innerText = custom_values[0];
  document.getElementById("eq_label_mid").innerText = custom_values[1];
  document.getElementById("eq_label_treble").innerText = custom_values[2];
}

var baseOptions = {
  tooltips: { enabled: false },
  onClick: null,
  elements: {
    point: {
      radius: 0,
    },
  },
  legend: {
    display: false,
  },
  responsive: true,
  scales: {
    xAxes: [
      {
        gridLines: {
          display: false,
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    ],
  },
};

var options = baseOptions;

var myChart;
var gradient;
var data;

var chartElement = document.getElementById("myChart");
if (chartElement) {
  var ctx = chartElement.getContext("2d");
  gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  data = {
    labels: ["", "", ""],
    datasets: [
      {
        backgroundColor: gradient,
        label: "# of Votes",
        data: custom_values,
        borderWidth: 1,
      },
    ],
  };

  myChart = new Chart(ctx, {
    type: "line",
    data: data,
    options: options,
  });

  const eqButtons = document.querySelectorAll(".eq-button");
  if (eqButtons[0]) {
    eqButtons[0].style.backgroundColor = "white";
    eqButtons[0].style.color = "black";
  }
  if (document.getElementById("custom_eq_indicator")) {
    document.getElementById("custom_eq_indicator").style.display = "none";
  }
}

function drawChart(newData) {
  if (myChart) {
    myChart.destroy();
  }

  var extra_options = { responsive: true, maintainAspectRatio: false };

  myChart = new Chart(chartElement.getContext("2d"), {
    type: "line",
    data: newData,
    options: { ...options, ...extra_options },
  });
}

function setCustomEQ(array) {
  custom_values = array;
  setCustom();
  updateIndicator();
}

function EQButtonPress(level) {
  if (level == 6) {
    setListeningMode(6);
    getCustomEQ();
    document.getElementById("custom_eq_indicator").style.display = "grid";
    setCustom();
    updateIndicator();
  } else {
    document.getElementById("custom_eq_indicator").style.display = "none";
    setListeningMode(level);
  }
  setEQfromRead(level);
}

function setEQfromRead(level) {
  const eqButtons = document.querySelectorAll(".eq-button");

  eqButtons.forEach((btn) => {
    btn.style.backgroundColor = "black";
    btn.style.color = "white";
  });

  let buttonIndex = level;
  if (level === 0) {
    buttonIndex = 6;
    document.getElementById("custom_eq_indicator").style.display = "grid";
    getCustomEQ();
    setCustom();
    updateIndicator();
  } else if (level === 6) {
    buttonIndex = 0;
    document.getElementById("custom_eq_indicator").style.display = "grid";
    getCustomEQ();
    setCustom();
    updateIndicator();
  } else {
    document.getElementById("custom_eq_indicator").style.display = "none";
    if (level === 1) buttonIndex = 2;
    else if (level === 2) buttonIndex = 4;
    else if (level === 3) buttonIndex = 1;
    else if (level === 4) buttonIndex = 5;
    else if (level === 5) buttonIndex = 3;
  }

  if (eqButtons[buttonIndex]) {
    eqButtons[buttonIndex].style.backgroundColor = "white";
    eqButtons[buttonIndex].style.color = "black";
  }

  if (level == 6) {
    return;
  } else if (level == 1) {
    // Rock
    data = {
      labels: ["", "", ""],
      datasets: [
        {
          backgroundColor: gradient,
          label: "Rock",
          data: [7, 4, 7],
          borderWidth: 1,
        },
      ],
    };
  } else if (level == 2) {
    // Electronic
    data = {
      labels: ["", "", ""],
      datasets: [
        {
          backgroundColor: gradient,
          label: "Electronic",
          data: [7, 5, 8],
          borderWidth: 1,
        },
      ],
    };
  } else if (level == 3) {
    // Pop
    data = {
      labels: ["", "", ""],
      datasets: [
        {
          backgroundColor: gradient,
          label: "Pop",
          data: [6, 6, 7],
          borderWidth: 1,
        },
      ],
    };
  } else if (level == 4) {
    // Enhance Vocals
    data = {
      labels: ["", "", ""],
      datasets: [
        {
          backgroundColor: gradient,
          label: "Enhance Vocals",
          data: [5, 7, 5],
          borderWidth: 1,
        },
      ],
    };
  } else if (level == 5) {
    // Classical
    data = {
      labels: ["", "", ""],
      datasets: [
        {
          backgroundColor: gradient,
          label: "Classical",
          data: [6, 6, 5],
          borderWidth: 1,
        },
      ],
    };
  } else if (level == 6) {
    // Standard
    data = {
      labels: ["", "", ""],
      datasets: [
        {
          backgroundColor: gradient,
          label: "Standard",
          data: [2, 2, 2],
          borderWidth: 1,
        },
      ],
    };
  }
  options = baseOptions;
  myChart.destroy();
  drawChart(data);
}

function setCustom() {
  data = {
    labels: ["Bass", "Medium", "Treble"],
    datasets: [
      {
        backgroundColor: gradient,
        label: "Custom EQ",
        data: custom_values,
        borderWidth: 1,
      },
    ],
  };

  options = {
    tooltips: { enabled: false },
    onClick: (e) => {},
    legend: {
      display: false,
    },
    responsive: true,
    scales: {
      xAxes: [
        {
          gridLines: {
            display: true,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            display: false,
            min: 6,
            max: -6,
          },
        },
      ],
      x: {
        ticks: {
          callback: () => "",
        },
      },
      y: {
        display: false,
        title: {
          display: false,
          text: "Value",
        },
        suggestedMin: 0,
        suggestedMax: 200,
      },
      events: [],
    },
    dragData: true,
    dragX: false,
    dragDataRound: 1,
    dragOptions: {
      round: 0,
      showTooltip: false,
    },
    onDragEnd: function (e, datasetIndex, index, value) {
      const canvasPosition = Chart.helpers.getRelativePosition(e, myChart);
      var dataY = myChart.scales[
        Object.keys(myChart.scales)[1]
      ].getValueForPixel(canvasPosition.y);
      var dataX = myChart.scales[
        Object.keys(myChart.scales)[0]
      ].getValueForPixel(canvasPosition.x);

      if (dataY > 6) dataY = 6;
      if (dataY < -6) dataY = -6;

      myChart.data.datasets[0].data[dataX] = dataY;
      myChart.update();
      custom_values = myChart.data.datasets[0].data;

      custom_values = [
        Math.round(custom_values[0]),
        Math.round(custom_values[1]),
        Math.round(custom_values[2]),
      ];

      setCustomEQ_BT([custom_values[1], custom_values[2], custom_values[0]]);
      updateIndicator();
    },
    hover: {
      onHover: function (e) {
        const point = this.getElementAtEvent(e);
        if (point.length) e.target.style.cursor = "grab";
        else e.target.style.cursor = "default";
      },
    },
  };

  drawChart(data);
}
