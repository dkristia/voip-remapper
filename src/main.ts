import HID from 'node-hid';
import robot from 'robotjs';
import fs from 'fs';

function sendKeyEvent(action: string, keycodes: { [key: string]: string }) {
    const key = keycodes[action];
    if (key) {
        robot.keyTap(key);
    }
}

function main() {
    try {
        const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
        const devices = HID.devices();
        const deviceInfo = devices.find(d => d.vendorId === Number(settings.VENDOR_ID) && d.productId === Number(settings.PRODUCT_ID));

        const prefix = Number(settings.PREFIX);

        if (!deviceInfo) {
            console.error("Device not found");
            return;
        }

        const device = new HID.HID(deviceInfo.path || '');

        device.on('data', (data) => {
            if (data[0] === prefix) {
                const buttonCode = data[1].toString(16).padStart(2, '0').toUpperCase();
                const action = settings.REMAP[buttonCode];
                if (action) {
                    console.log(`Detected action: ${action}`);
                    sendKeyEvent(action, settings.KEYCODES);
                } else if (buttonCode === "FF") {
                    // Ignore the FF code
                }
                else {
                    console.log(`Unknown button code: ${buttonCode}`);
                }
            }
        });

        device.on('error', (err) => {
            console.error(`Error: ${err}`);
        });

        console.log("Device opened successfully");

    } catch (err) {
        console.error(`Failed to open device: ${err}`);
    }
}

main();
