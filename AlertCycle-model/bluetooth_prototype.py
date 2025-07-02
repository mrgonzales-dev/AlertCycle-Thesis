import asyncio
from bleak import BleakScanner, BleakClient

async def find_bluetooth_devices():
    print("Scanning for Bluetooth devices...")
    devices = await BleakScanner.discover()
    
    if devices:
        print("Found devices:")
        for i, device in enumerate(devices):
            print(f"{i}: {device.name} ({device.address})")
        
        choice = int(input("Select device number to connect: "))
        if 0 <= choice < len(devices):
            return devices[choice].address, devices[choice].name
        else:
            print("Invalid selection.")
    else:
        print("No devices found.")
    return None, None

async def connect_and_get_info(device_address, device_name):
    async with BleakClient(device_address) as client:
        if await client.is_connected():
            print(f"Connected to {device_name} ({device_address})")
            MODEL_NBR_UUID = "00002a24-0000-1000-8000-00805f9b34fb"  # Adjust as needed
            try:
                model_number = await client.read_gatt_char(MODEL_NBR_UUID)
                print(f"Model Number: {''.join(map(chr, model_number))}")
            except Exception as e:
                print(f"Error reading model number: {e}")
        else:
            print("Failed to connect.")

if __name__ == "__main__":
    device_address, device_name = asyncio.run(find_bluetooth_devices())
    if device_address:
        asyncio.run(connect_and_get_info(device_address, device_name))
