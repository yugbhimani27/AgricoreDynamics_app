// =====================================================
// WEB BLUETOOTH UTILITIES FOR ESP32 (BLE NOTIFICATIONS)
// =====================================================

export interface SensorData {
  pH: number;
  moisture: number;
  tds: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

// Must match ESP32 BLE code
const ESP32_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const ESP32_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

/**
 * Connect to ESP32 via BLE and stream soil moisture
 * ESP32 sends: 1 byte (0–100)
 */
export async function connectToESP32(
  onData: (data: SensorData) => void
) {
  if (!navigator.bluetooth) {
    alert("Web Bluetooth not supported. Use Safari over HTTPS on iPhone.");
    return;
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ name: "SoilSense-ESP32" }],
    optionalServices: [ESP32_SERVICE_UUID],
  });

  console.log("Connecting to:", device.name);

  const server = await device.gatt!.connect();
  const service = await server.getPrimaryService(ESP32_SERVICE_UUID);
  const characteristic = await service.getCharacteristic(
    ESP32_CHARACTERISTIC_UUID
  );

  await characteristic.startNotifications();
  console.log("BLE notifications started");

  characteristic.addEventListener(
    "characteristicvaluechanged",
    (event: Event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
      const moisture = value.getUint8(0); // 0–100

      console.log("Moisture received:", moisture);

      onData({
        pH: 0,
        moisture,
        tds: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
      });
    }
  );
}
