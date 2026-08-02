async function switchViewFromModelID(model, sku) {
    localStorage.setItem("model", JSON.stringify(model));
    localStorage.setItem("sku", sku);
    if (sku === null || sku === "") {
        document.getElementById("scan_button-c").innerText = "Incompatible Device";
        return;
    }
    console.log("Switching view from model ID " + model.base);
    if (model.base == "B181") {
        window.location.href = "MainControl_one";
    } else if (model.base == "B157") {
        window.location.href = "MainControl_sticks";
    } else if (model.base == "B155") {
        window.location.href = "MainControl_two";
    } else if (model.base == "B163") {
        window.location.href = "MainControl_corsola";
    } else if (model.base == "B171") {
        window.location.href = "MainControl_twos";
    } else if (model.base == "B172") {
        window.location.href = "MainControl_espeon";
    } else if (model.base == "B168") {
        window.location.href = "MainControl_donphan";
    } else if (model.base == "B174") {
        window.location.href = "MainControl_flaaffy";
    } else if (model.base == "B162") {
        window.location.href = "MainControl_cleffa";
    } else if (model.base == "B184") {
        window.location.href = "MainControl_gligar";
    } else if (model.base == "B179") {
        window.location.href = "MainControl_girafarig";
    } else if (model.base == "B185") {
        window.location.href = "MainControl_hoothoot";
    } else if (model.base == "B170") {
        window.location.href = "MainControl_elekid";
    } else if (model.base == "B164") {
        window.location.href = "MainControl_crobat";
    } else if (model.base == "B175") {
        window.location.href = "MainControl_forretress";
    } else {
        document.getElementById("scan_button-c").innerText = "Incompatible Device";
    }
}
async function scanNewDevices() {
    document.getElementById("device_container").innerHTML = '<img src="../assets/loading.svg" alt="loading_animation" class="h-[80px] w-[80px] m-auto" id="loading_animation" />';
    document.getElementById("scan_button").style.display = "none";
    const SPP_UUID = "aeac4a03-dff5-498f-843a-34487cf133eb";
    const FASTPAIR_UUID = "df21fe2c-2515-4fdb-8886-f12c4d67927c";
    sppPort = await navigator.serial.requestPort({
        allowedBluetoothServiceClassIds: [FASTPAIR_UUID],
        filters: [{ bluetoothServiceClassId: FASTPAIR_UUID }],
    });

    if (sppPort) {
        console.log('connected to a Bluetooth Serial Port Profile port', sppPort.getInfo());
        //print mac address of the connected device
        console.log(sppPort);
        await sppPort.open({ baudRate: 9600 });
        //read from the serial port
        const reader = sppPort.readable.getReader();
        while (true) {
            const { value, done } = await reader.read();
            //console.log(value);
            //print hex string of the received data
            var string = "";
            for (let i = 0; i < value.length; i++) {
                //fill the string with leading zero if needed
                string += (value[i] < 16 ? "0" : "") + value[i].toString(16);
            }
            console.log(string);
            if (done) {
                // Allow the serial port to be closed later.
                reader.releaseLock();
                break;
            }
            console.log(value);
            //if received data is 7 bytes long, disconnect
            if (value.length > 1) {
                reader.releaseLock();
                await sppPort.close();
                var modelID = string.substring(8, 14);
                console.log(modelID);
                switchViewFromModelID(modelID);
                break;
            }
        }
    }
    setTimeout(function(){
        window.location.reload();
    }, 3000);
}
async function scanNewDevicesFastpair() {
	const SPP_UUID = "aeac4a03-dff5-498f-843a-34487cf133eb";
	const FASTPAIR_UUID = "df21fe2c-2515-4fdb-8886-f12c4d67927c";
	forgetAllDevices();
	try {
		sppPort = await navigator.serial.requestPort({
			allowedBluetoothServiceClassIds: [SPP_UUID, FASTPAIR_UUID],
			filters: [{ bluetoothServiceClassId: FASTPAIR_UUID }],
		});
	}
	catch (error) {
		console.error('Connection failed', error);
		document.getElementById("scan_button-c").innerText = "Device not selected";
		setTimeout(function () {
			window.location.reload();
		}, 3000);
		return;
	}

	if (sppPort) {
		console.log('connected to a Bluetooth Serial Port Profile port, waiting for id data...', sppPort.getInfo());
		console.log(sppPort);
		await sppPort.open({ baudRate: 9600 });
		//read from the serial port
		const reader = sppPort.readable.getReader();
		while (true) {
			const { value, done } = await reader.read();
			//console.log(value);
			//print hex string of the received data
			var string = "";
			for (let i = 0; i < value.length; i++) {
				//fill the string with leading zero if needed
				string += (value[i] < 16 ? "0" : "") + value[i].toString(16);
			}
			if (done) {
				// Allow the serial port to be closed later.
				reader.releaseLock();
				break;
			}
			//if received data is 7 bytes long, disconnect
			if (value.length == 7) {
				console.log("Received id data: " + string);
				reader.releaseLock();
				await sppPort.close();
				var modelID = string.substring(8, 14).toUpperCase();
				var modelInfo = getModelFromFastpair(modelID);
				if (modelInfo) {
					switchViewFromModelID(modelInfo, modelID);
				}
				else {
                    document.getElementById("scan_button-c").innerText = "Incompatible Device";
                }
				break;
			}
		}
	}
}