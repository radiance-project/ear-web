async function switchViewFromModelID(modelID) {
    if (modelID == "31d53d" || modelID == "624011") {
        window.location.href = "MainControl_one.html?modelID=" + modelID;
    } else if (modelID == "1016dd") {
        window.location.href = "MainControl_sticks.html?modelID=" + modelID;
    } else if (modelID == "dee8c0" || modelID == "acc520") {
        window.location.href = "MainControl_two.html?modelID=" + modelID;
    }
}
async function loadDevicePage(device) {
    console.log("Loading device page for " + device);
    connectDeviceFromList(device);   
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