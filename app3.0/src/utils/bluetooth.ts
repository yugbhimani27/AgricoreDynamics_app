// =====================================================
// WEB BLUETOOTH UTILITIES FOR ESP32 (WITH HISTORY)
// =====================================================

export interface SensorData {
  pH: number;
  moisture: number;
  tds: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

// ⚠️ MUST match ESP32 UUIDs exactly
const ESP32_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const ESP32_CHAR_UUID    = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// 🔐 One ESP32 = one ID
const ESP_ID = "ESP32_001";

/* ================================
   SAVE DATA FOR GRAPHS
================================ */
function saveHistory(parameter: string, value: number) {
  const key = "esp32_history";
  const stored = JSON.parse(localStorage.getItem(key) || "{}");

  if (!stored[ESP_ID]) stored[ESP_ID] = {};
  if (!stored[ESP_ID][parameter]) stored[ESP_ID][parameter] = [];

  stored[ESP_ID][parameter].push({
    time: Date.now(),
    value
  });

  localStorage.setItem(key, JSON.stringify(stored));
}

/* ================================
   MAIN BLE FUNCTION
================================ */
export async function connectToESP32(
  onData: (data: SensorData) => void
) {
  if (!navigator.bluetooth) {
    alert("Bluetooth not supported");
    return;
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: "SoilSense" }],
    optionalServices: [ESP32_SERVICE_UUID],
  });

  const server = await device.gatt!.connect();
  const service = await server.getPrimaryService(ESP32_SERVICE_UUID);
  const characteristic = await service.getCharacteristic(ESP32_CHAR_UUID);

  await characteristic.startNotifications();

  const handler = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
    const data: SensorData = {
      moisture: value.getUint8(0),
      tds: value.getUint8(1),
      pH: value.getUint8(2),
      nitrogen: value.getUint8(3),
      phosphorus: value.getUint8(4),
      potassium: value.getUint8(5),
    };

    // ✅ SAVE HISTORY (FOR GRAPHS)
    Object.entries(data).forEach(([key, val]) => {
      saveHistory(key, val as number);
    });

    onData(data);

    // One reading only
    characteristic.removeEventListener(
      "characteristicvaluechanged",
      handler
    );
    device.gatt?.disconnect();
  };

  characteristic.addEventListener(
    "characteristicvaluechanged",
    handler
  );
}
