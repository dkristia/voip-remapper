import HID from 'node-hid';
import robot from 'robotjs';

const VENDOR_ID = 0x6993;
const PRODUCT_ID = 0xB700;

const PREFIX = 0x81;
const REMAP: { [key: string]: string } = {
    "0D": "left",
    "12": "up",
    "04": "right",
    "0E": "down",
    "03": "accept",
    "08": "back",
    "09": "menu",
    "00": "1",
    "01": "2",
    "02": "3",
    "05": "4",
    "06": "5",
    "07": "6",
    "0A": "7",
    "0B": "8",
    "0C": "9",
    "0F": "star",
    "10": "0",
    "11": "hash",
};

const KEYCODES: { [key: string]: string } = {
    "up": "f16",
    "down": "f17",
    "left": "f18",
    "right": "f19",
    "accept": "f20",
    "back": "f21",
    "menu": "f22",
}

function sendKeyEvent(action: string) {
    const key = KEYCODES[action];
    if (key) {
        robot.keyTap(key);
    }
}

function main() {
    try {
        const devices = HID.devices();
        const deviceInfo = devices.find(d => d.vendorId === VENDOR_ID && d.productId === PRODUCT_ID);

        if (!deviceInfo) {
            console.error("Device not found");
            return;
        }

        const device = new HID.HID(deviceInfo.path || '');

        device.on('data', (data) => {
            if (data[0] === PREFIX) {
                const buttonCode = data[1].toString(16).padStart(2, '0').toUpperCase();
                const action = REMAP[buttonCode];
                if (action) {
                    console.log(`Detected action: ${action}`);
                    sendKeyEvent(action);
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
