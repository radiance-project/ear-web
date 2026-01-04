// CMF Headphone Pro device logic

var ANC_type = 0;
var ANC_strength = 0;
var current_eq = 0;
var low_latency_mode = false;

var headphoneImg = document.getElementById("headphone_img");
var prod_name = document.getElementById("prod_name");
var pages_container = document.getElementById("pages_container");

var intro_timeout;
var intro_timeout2;

intro_timeout = setTimeout(() => {
  if (prod_name) prod_name.style.opacity = "100";
  if (pages_container) pages_container.style.opacity = "100";
}, 500);

function setANC(typeANC) {
  switch (typeANC) {
    case 0:
      setAncToNC();
      break;
    case 1:
      setAncToTransparent();
      break;
    case 2:
      setAncToOff();
      break;
    case 3:
      setAncStrengthHigh();
      break;
    case 4:
      setAncStrengthMid();
      break;
    case 5:
      setAncStrengthLow();
      break;
    case 6:
      setAncStrengthAdaptive();
      break;
    default:
      break;
  }

  let type = 0;
  if (ANC_type === 1) type = 2;
  else if (ANC_type === 2) type = 1;
  else if (ANC_type === 0) {
    if (ANC_strength === 0) type = 4;
    else if (ANC_strength === 1) type = 5;
    else if (ANC_strength === 2) type = 3;
    else if (ANC_strength === 3) type = 6;
  }

  setANCDisplay(type);
  setANC_BT(type);
}

function setAncToNC() {
  const selector = document.getElementById("selector");
  const ancStrengthSelector = document.getElementById("anc_strength_selector");

  if (selector) selector.style.marginLeft = "16px";

  const icons = document.querySelectorAll("#one svg, #two svg, #three svg");
  icons.forEach((icon) => (icon.style.fill = "white"));
  const ancOn = document.getElementById("ANC_on");
  if (ancOn) ancOn.style.fill = "black";

  if (ancStrengthSelector) {
    ancStrengthSelector.style.opacity = "100";
    ancStrengthSelector.style.height = "auto";
  }

  ANC_type = 0;
  setANCStrengthUI(ANC_strength);
}

function setAncToTransparent() {
  const selector = document.getElementById("selector");
  const ancStrengthSelector = document.getElementById("anc_strength_selector");

  if (selector) selector.style.marginLeft = "112px";

  const icons = document.querySelectorAll("#one svg, #two svg, #three svg");
  icons.forEach((icon) => (icon.style.fill = "white"));
  const transOn = document.getElementById("trans_on");
  if (transOn) transOn.style.fill = "black";

  if (ancStrengthSelector) {
    ancStrengthSelector.style.opacity = "0";
    ancStrengthSelector.style.height = "0";
  }

  ANC_type = 1;
}

function setAncToOff() {
  const selector = document.getElementById("selector");
  const ancStrengthSelector = document.getElementById("anc_strength_selector");

  if (selector) selector.style.marginLeft = "208px";

  const icons = document.querySelectorAll("#one svg, #two svg, #three svg");
  icons.forEach((icon) => (icon.style.fill = "white"));
  const ancOff = document.getElementById("anc_off");
  if (ancOff) ancOff.style.fill = "black";

  if (ancStrengthSelector) {
    ancStrengthSelector.style.opacity = "0";
    ancStrengthSelector.style.height = "0";
  }

  ANC_type = 2;
}

function setAncStrengthHigh() {
  ANC_strength = 0;
  setANCStrengthUI(0);
}

function setAncStrengthMid() {
  ANC_strength = 1;
  setANCStrengthUI(1);
}

function setAncStrengthLow() {
  ANC_strength = 2;
  setANCStrengthUI(2);
}

function setAncStrengthAdaptive() {
  ANC_strength = 3;
  setANCStrengthUI(3);
}

function setANCStrengthUI(strength) {
  const stageOneBtn = document.getElementById("stage_one_button");
  const stageTwoBtn = document.getElementById("stage_two_button");
  const stageThreeBtn = document.getElementById("stage_three_button");
  const stageFourBtn = document.getElementById("stage_four_button");

  if (stageOneBtn) {
    stageOneBtn.style.width = "4px";
    stageOneBtn.style.height = "4px";
  }
  if (stageTwoBtn) {
    stageTwoBtn.style.width = "4px";
    stageTwoBtn.style.height = "4px";
  }
  if (stageThreeBtn) {
    stageThreeBtn.style.width = "4px";
    stageThreeBtn.style.height = "4px";
  }
  if (stageFourBtn) {
    stageFourBtn.style.width = "4px";
    stageFourBtn.style.height = "4px";
  }

  if (strength === 0 && stageOneBtn) {
    stageOneBtn.style.width = "8px";
    stageOneBtn.style.height = "8px";
  } else if (strength === 1 && stageTwoBtn) {
    stageTwoBtn.style.width = "8px";
    stageTwoBtn.style.height = "8px";
  } else if (strength === 2 && stageThreeBtn) {
    stageThreeBtn.style.width = "8px";
    stageThreeBtn.style.height = "8px";
  } else if (strength === 3 && stageFourBtn) {
    stageFourBtn.style.width = "8px";
    stageFourBtn.style.height = "8px";
  }
}

function setBattery(side, percentage) {
  const batteryText = document.getElementById("battery-h");
  const batteryBarFill = document.getElementById("battery_bar_fill_h");

  if (batteryText) {
    if (percentage === "DISCONNECTED" || typeof percentage === "undefined") {
      batteryText.innerText = "-- %";
      if (batteryBarFill) batteryBarFill.style.width = "0%";
      return;
    }
    batteryText.innerText = percentage + " %";
  }

  if (batteryBarFill) {
    batteryBarFill.style.width = percentage + "%";
    batteryBarFill.style.backgroundColor = "#ffffff";
  }
}

function setPersonalizedSoundCheckbox(status) {
  const checkbox = document.getElementById("personalized_sound");
  if (checkbox) checkbox.checked = status == 1;
}

function setFirmwareVersion(version) {
  const firmwareElement = document.getElementById("settings_subtitle_firmware");
  if (firmwareElement) {
    firmwareElement.innerText = version;
  }
}

function setANCStatus(level) {
  if (level === 1) {
    setAncToOff();
  } else if (level === 2) {
    setAncToTransparent();
  } else if (level === 3) {
    setAncToNC();
    ANC_strength = 2;
    setANCStrengthUI(2);
  } else if (level === 4) {
    setAncToNC();
    ANC_strength = 0;
    setANCStrengthUI(0);
  } else if (level === 5) {
    setAncToNC();
    ANC_strength = 1;
    setANCStrengthUI(1);
  } else if (level === 6) {
    setAncToNC();
    ANC_strength = 3;
    setANCStrengthUI(3);
  }
}
