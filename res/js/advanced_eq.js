// Advanced EQ panel - full-screen 8-band parametric equalizer.
// Opened when the Advanced EQ preset is selected. 8 vertical gain sliders (graphic-EQ
// style, centered on 0dB) let you tune every band's level at a glance; tapping a band's
// frequency label selects it as "active" and reveals small Frequency/Q Factor sliders
// below for fine-tuning just that band. Built on top of the app's existing
// #popup_container mechanism but sized to fill most of the app's design canvas instead
// of the small centered card used by other popups.
// Protocol: SET/GET_ADVANCE_CUSTOM_EQ_VALUE (see bluetooth_socket.js).

const ADVANCED_EQ_GAIN_MIN = -6;
const ADVANCED_EQ_GAIN_MAX = 6;
const ADVANCED_EQ_QUALITY_MIN = 0.1;
const ADVANCED_EQ_QUALITY_MAX = 10;
const ADVANCED_EQ_SEND_DEBOUNCE_MS = 300;

let selectedAdvancedEQBandIndex = 0;
let advancedEQWorkingBands = null;

function formatAdvancedEQFrequencyLabel(frequency) {
    if (frequency >= 1000) {
        let khz = frequency / 1000;
        return (khz % 1 === 0 ? khz.toFixed(0) : khz.toFixed(1)) + "kHz";
    }
    return Math.round(frequency) + "Hz";
}

function currentAdvancedEQBandsOrDefault() {
    if (currentAdvancedEQBands && currentAdvancedEQBands.length === ADVANCED_EQ_BAND_RANGES.length) {
        return currentAdvancedEQBands;
    }
    return ADVANCED_EQ_BAND_RANGES.map(range => ({ filterType: 1, gain: 0, frequency: range.center, quality: 1.0 }));
}

function openAdvancedEQPanel() {
    let popupContent = document.getElementById("popup_content");
    document.getElementById("popup_container").style.opacity = "100";
    document.getElementById("popup_container").style.zIndex = "1000";
    popupContent.style.zIndex = "1001";
    popupContent.style.width = "700px";
    popupContent.style.maxWidth = "95%";
    popupContent.innerHTML = `
        <div class="w-fit flex m-auto text-md mb-4 mt-2">Advanced EQ</div>
        <div style="width: 100%; height: 110px;">
            <canvas id="advancedEQChart"></canvas>
        </div>
        <div id="advanced_eq_gain_row" style="display: flex; justify-content: center; align-items: flex-end; margin-top: 10px;"></div>
        <div id="advanced_eq_band_editor" style="width: 320px; margin: 20px auto 0;"></div>
        <div class="flex justify-center mt-4">
            <button class="p-2 pl-6 pr-6 bg-black border-none border-[1px] text-white rounded-full hover:bg-[#1B1D1F] ease-in-out duration-300" onclick="closeAdvancedEQPanel()">Close</button>
        </div>`;
    advancedEQWorkingBands = currentAdvancedEQBandsOrDefault().map(band => ({ ...band }));
    renderAdvancedEQGainRow();
    renderAdvancedEQBandEditor();
    renderAdvancedEQChart();
}

function closeAdvancedEQPanel() {
    let popupContent = document.getElementById("popup_content");
    popupContent.style.width = "";
    popupContent.style.maxWidth = "";
    if (advancedEQChartInstance) {
        advancedEQChartInstance.destroy();
        advancedEQChartInstance = null;
    }
    closePopUp();
}

let advancedEQChartInstance = null;

const ADVANCED_EQ_CHART_ACTIVE_COLOR = "#ef4444";
const ADVANCED_EQ_CHART_NICE_FREQUENCIES = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
// Assumed sample rate for the response-curve preview only (the device's actual DSP rate
// isn't known); this only affects the curve shape negligibly at audio frequencies.
const ADVANCED_EQ_CURVE_SAMPLE_RATE = 48000;
const ADVANCED_EQ_CURVE_POINT_COUNT = 120;

function advancedEQChartPointColors() {
    return advancedEQWorkingBands.map((band, i) => i === selectedAdvancedEQBandIndex ? ADVANCED_EQ_CHART_ACTIVE_COLOR : "#ffffff");
}

function advancedEQChartPointRadii() {
    return advancedEQWorkingBands.map((band, i) => i === selectedAdvancedEQBandIndex ? 5 : 3);
}

// Standard RBJ Audio EQ Cookbook peaking-filter magnitude response, in dB, for a single
// band at a given frequency - this is what makes Q Factor actually change the curve's
// shape (narrow/sharp for high Q, wide/gentle for low Q) instead of just connecting the
// 8 band points with straight lines.
function peakingFilterResponseDb(frequency, band, sampleRate) {
    if (band.gain === 0) {
        return 0;
    }
    let A = Math.pow(10, band.gain / 40);
    let w0 = 2 * Math.PI * band.frequency / sampleRate;
    let alpha = Math.sin(w0) / (2 * band.quality);
    let cosw0 = Math.cos(w0);

    let b0 = (1 + alpha * A) ;
    let b1 = -2 * cosw0;
    let b2 = (1 - alpha * A);
    let a0 = (1 + alpha / A);
    let a1 = -2 * cosw0;
    let a2 = (1 - alpha / A);
    b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;

    let w = 2 * Math.PI * frequency / sampleRate;
    let cos1 = Math.cos(w), sin1 = Math.sin(w);
    let cos2 = Math.cos(2 * w), sin2 = Math.sin(2 * w);

    let numRe = b0 + b1 * cos1 + b2 * cos2;
    let numIm = -(b1 * sin1 + b2 * sin2);
    let denRe = 1 + a1 * cos1 + a2 * cos2;
    let denIm = -(a1 * sin1 + a2 * sin2);

    let numMag = Math.sqrt(numRe * numRe + numIm * numIm);
    let denMag = Math.sqrt(denRe * denRe + denIm * denIm);
    if (numMag === 0 || denMag === 0) {
        return 0;
    }
    return 20 * Math.log10(numMag / denMag);
}

// Cascaded biquads combine multiplicatively, i.e. their dB responses simply add.
function computeAdvancedEQResponseCurve(bands) {
    let points = [];
    let logMin = Math.log10(20);
    let logMax = Math.log10(20000);
    for (let i = 0; i < ADVANCED_EQ_CURVE_POINT_COUNT; i++) {
        let logF = logMin + (logMax - logMin) * (i / (ADVANCED_EQ_CURVE_POINT_COUNT - 1));
        let frequency = Math.pow(10, logF);
        let totalDb = 0;
        for (const band of bands) {
            totalDb += peakingFilterResponseDb(frequency, band, ADVANCED_EQ_CURVE_SAMPLE_RATE);
        }
        points.push({ x: frequency, y: totalDb });
    }
    return points;
}

function renderAdvancedEQChart() {
    let canvas = document.getElementById("advancedEQChart");
    if (!canvas || !advancedEQWorkingBands) {
        return;
    }
    let curvePoints = computeAdvancedEQResponseCurve(advancedEQWorkingBands);
    // {x,y} band markers on the same numeric (logarithmic) frequency axis, so dragging a
    // band's frequency slider actually slides its dot horizontally instead of just
    // relabeling a fixed category slot.
    let bandPoints = advancedEQWorkingBands.map(band => ({ x: band.frequency, y: band.gain }));
    let colors = advancedEQChartPointColors();
    let radii = advancedEQChartPointRadii();

    if (advancedEQChartInstance) {
        let [curveDataset, bandDataset] = advancedEQChartInstance.data.datasets;
        curveDataset.data = curvePoints;
        bandDataset.data = bandPoints;
        bandDataset.pointBackgroundColor = colors;
        bandDataset.pointBorderColor = colors;
        bandDataset.pointRadius = radii;
        advancedEQChartInstance.update();
        return;
    }

    let ctx = canvas.getContext("2d");
    let gradient = ctx.createLinearGradient(0, 0, 0, 110);
    gradient.addColorStop(0, "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    advancedEQChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            datasets: [
                {
                    // computed response curve (accounts for Q/bandwidth per band)
                    data: curvePoints,
                    borderColor: "#ffffff",
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0,
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                },
                {
                    // draggable band markers, overlaid on top of the curve
                    data: bandPoints,
                    showLine: false,
                    fill: false,
                    pointRadius: radii,
                    pointBackgroundColor: colors,
                    pointBorderColor: colors,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: { enabled: false },
            legend: { display: false },
            scales: {
                yAxes: [{
                    ticks: {
                        min: ADVANCED_EQ_GAIN_MIN,
                        max: ADVANCED_EQ_GAIN_MAX,
                        fontColor: "#9ca3af",
                        fontSize: 9,
                    },
                    gridLines: { color: "rgba(255,255,255,0.08)" },
                }],
                xAxes: [{
                    type: "logarithmic",
                    ticks: {
                        min: 20,
                        max: 20000,
                        fontColor: "#9ca3af",
                        fontSize: 9,
                        callback: function (value) {
                            return ADVANCED_EQ_CHART_NICE_FREQUENCIES.includes(value) ? formatAdvancedEQFrequencyLabel(value) : null;
                        },
                    },
                    gridLines: { color: "rgba(255,255,255,0.08)" },
                }],
            },
        },
    });
}

function renderAdvancedEQGainRow() {
    let container = document.getElementById("advanced_eq_gain_row");
    if (!container) {
        return;
    }
    container.innerHTML = advancedEQWorkingBands.map((band, i) => `
        <div style="display: inline-flex; flex-direction: column; align-items: center; width: 34px; margin: 0 3px;">
            <input type="range" min="${ADVANCED_EQ_GAIN_MIN}" max="${ADVANCED_EQ_GAIN_MAX}" step="0.5" value="${band.gain}"
                   id="advanced_eq_gain_${i}" oninput="onAdvancedEQGainInput(${i})"
                   style="writing-mode: vertical-lr; direction: rtl; width: 20px; height: 140px; accent-color: #ffffff;" />
            <div id="advanced_eq_band_label_${i}" onclick="selectAdvancedEQBand(${i})"
                 style="font-size: 9px; margin-top: 6px; cursor: pointer; padding: 2px 4px; border-radius: 4px; ${bandLabelStyle(i)}">
                ${formatAdvancedEQFrequencyLabel(band.frequency)}
            </div>
        </div>`).join("");
}

function bandLabelStyle(i) {
    return i === selectedAdvancedEQBandIndex
        ? "background-color: #ffffff; color: #000000;"
        : "color: #9ca3af;";
}

function selectAdvancedEQBand(index) {
    selectedAdvancedEQBandIndex = index;
    for (let i = 0; i < advancedEQWorkingBands.length; i++) {
        let label = document.getElementById("advanced_eq_band_label_" + i);
        if (label) {
            label.style.backgroundColor = i === selectedAdvancedEQBandIndex ? "#ffffff" : "";
            label.style.color = i === selectedAdvancedEQBandIndex ? "#000000" : "#9ca3af";
        }
    }
    renderAdvancedEQBandEditor();
    if (advancedEQChartInstance) {
        let bandDataset = advancedEQChartInstance.data.datasets[1];
        bandDataset.pointBackgroundColor = advancedEQChartPointColors();
        bandDataset.pointBorderColor = advancedEQChartPointColors();
        bandDataset.pointRadius = advancedEQChartPointRadii();
        advancedEQChartInstance.update();
    }
}

function renderAdvancedEQBandEditor() {
    let container = document.getElementById("advanced_eq_band_editor");
    if (!container) {
        return;
    }
    let i = selectedAdvancedEQBandIndex;
    let band = advancedEQWorkingBands[i];
    let range = ADVANCED_EQ_BAND_RANGES[i];
    container.innerHTML = `
        <div class="text-white text-sm" style="margin-bottom: 10px; text-align: center;">Band ${i + 1}</div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div class="text-gray-500 text-xs" style="width: 90px;">Frequency <span id="advanced_eq_freq_label">${formatAdvancedEQFrequencyLabel(band.frequency)}</span></div>
            <input type="range" min="${range.min}" max="${range.max}" step="1" value="${band.frequency}"
                   id="advanced_eq_freq_input" oninput="onAdvancedEQFreqOrQInput()" style="flex: 1; accent-color: #ffffff;" />
        </div>
        <div style="display: flex; align-items: center;">
            <div class="text-gray-500 text-xs" style="width: 90px;">Q Factor <span id="advanced_eq_q_label">${band.quality.toFixed(1)}</span></div>
            <input type="range" min="${ADVANCED_EQ_QUALITY_MIN}" max="${ADVANCED_EQ_QUALITY_MAX}" step="0.1" value="${band.quality}"
                   id="advanced_eq_q_input" oninput="onAdvancedEQFreqOrQInput()" style="flex: 1; accent-color: #ffffff;" />
        </div>`;
}

let advancedEQSendTimer = null;

function scheduleAdvancedEQSend() {
    if (advancedEQSendTimer) {
        clearTimeout(advancedEQSendTimer);
    }
    advancedEQSendTimer = setTimeout(() => {
        setAdvancedEQValue_BT(advancedEQWorkingBands.map(band => ({ gain: band.gain, frequency: band.frequency, quality: band.quality })));
    }, ADVANCED_EQ_SEND_DEBOUNCE_MS);
}

function onAdvancedEQGainInput(index) {
    let input = document.getElementById("advanced_eq_gain_" + index);
    if (input) {
        advancedEQWorkingBands[index].gain = parseFloat(input.value);
    }
    if (index !== selectedAdvancedEQBandIndex) {
        selectAdvancedEQBand(index);
    }
    renderAdvancedEQChart();
    scheduleAdvancedEQSend();
}

function onAdvancedEQFreqOrQInput() {
    let i = selectedAdvancedEQBandIndex;
    let freqInput = document.getElementById("advanced_eq_freq_input");
    let qInput = document.getElementById("advanced_eq_q_input");
    if (freqInput) {
        advancedEQWorkingBands[i].frequency = parseFloat(freqInput.value);
        document.getElementById("advanced_eq_freq_label").innerText = formatAdvancedEQFrequencyLabel(advancedEQWorkingBands[i].frequency);
        let bandLabel = document.getElementById("advanced_eq_band_label_" + i);
        if (bandLabel) {
            bandLabel.innerText = formatAdvancedEQFrequencyLabel(advancedEQWorkingBands[i].frequency);
        }
    }
    if (qInput) {
        advancedEQWorkingBands[i].quality = parseFloat(qInput.value);
        document.getElementById("advanced_eq_q_label").innerText = advancedEQWorkingBands[i].quality.toFixed(1);
    }
    renderAdvancedEQChart();
    scheduleAdvancedEQSend();
}

// Called once the device responds with current values while the panel is open, so the
// sliders reflect the real device state instead of just what the user last dragged.
function renderAdvancedEQUI() {
    if (!document.getElementById("advanced_eq_gain_row")) {
        return;
    }
    advancedEQWorkingBands = currentAdvancedEQBandsOrDefault().map(band => ({ ...band }));
    renderAdvancedEQGainRow();
    renderAdvancedEQBandEditor();
    renderAdvancedEQChart();
}
