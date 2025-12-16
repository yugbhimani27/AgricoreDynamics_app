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

// ⚠️ Must EXACTLY match ESP32 BLE UUIDs
const ESP32_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const ESP32_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

/**
 * Connect to ESP32 via BLE and listen for soil moisture updates
 * ESP32 sends: 1 byte → moisture (0–100)
 */
export async function connectToESP32(
  onData: (data: SensorData) => void
) {
  if (!navigator.bluetooth) {
    alert("Web Bluetooth not supported. Use Chrome (Android/Desktop) or Safari (iOS).");
    return;
  }

  console.log("🔍 Requesting ESP32 device...");

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ name: "ESP32-SoilSensor" }],
    optionalServices: [ESP32_SERVICE_UUID],
  });

  console.log("✅ Selected device:", device.name);

  const server = await device.gatt!.connect();
  console.log("🔗 GATT connected");

  const service = await server.getPrimaryService(ESP32_SERVICE_UUID);
  const characteristic = await service.getCharacteristic(
    ESP32_CHARACTERISTIC_UUID
  );

  await characteristic.startNotifications();
  console.log("📡 BLE notifications started");

  characteristic.addEventListener(
    "characteristicvaluechanged",
    (event: Event) => {
      const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
      if (!characteristic.value) return;

      // ESP32 sends 1 byte (0–100)
      const moisture = characteristic.value.getUint8(0);

      console.log("💧 Moisture received:", moisture);

      // IMPORTANT: Always send a NEW object
      onData({
        pH: 0,           // placeholder (add later)
        moisture,        // REAL value
        tds: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
      });
    }
  );
}
