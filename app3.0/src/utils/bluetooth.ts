// =====================================================
// WEB BLUETOOTH UTILITIES FOR ESP32 CONNECTION
// =====================================================

export interface SensorData {
  pH: number;
  moisture: number;
  tds: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

// TODO: Replace this with your ESP32's Bluetooth service UUID
const ESP32_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const ESP32_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

/**
 * Connect to ESP32 via Web Bluetooth and read sensor data
 * Expected format: "pH:6.8,Moisture:25,TDS:1.5,N:145,P:38,K:210"
 */
export async function connectToESP32(): Promise<SensorData> {
  try {
    // Check if Web Bluetooth is supported
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome or Edge on Android/Windows/Mac.');
    }

    // Request Bluetooth device
    const device = await navigator.bluetooth.requestDevice({
      // Option 1: Filter by name (uncomment and modify)
      // filters: [{ name: 'ESP32' }],
      
      // Option 2: Accept all devices (for testing)
      acceptAllDevices: true,
      
      optionalServices: [ESP32_SERVICE_UUID],
    });

    console.log('Connecting to device:', device.name);

    // Connect to GATT server
    const server = await device.gatt!.connect();
    console.log('Connected to GATT server');

    // Get service
    const service = await server.getPrimaryService(ESP32_SERVICE_UUID);
    console.log('Got service');

    // Get characteristic
    const characteristic = await service.getCharacteristic(ESP32_CHARACTERISTIC_UUID);
    console.log('Got characteristic');

    // Read value
    const value = await characteristic.readValue();
    const decoder = new TextDecoder('utf-8');
    const dataString = decoder.decode(value);
    
    console.log('Received data:', dataString);

    // Parse the data
    const sensorData = parseESP32Data(dataString);

    // Disconnect
    device.gatt!.disconnect();

    return sensorData;
  } catch (error) {
    console.error('Bluetooth error:', error);
    throw error;
  }
}

/**
 * Parse ESP32 data string
 * Format: "pH:6.8,Moisture:25,TDS:1.5,N:145,P:38,K:210"
 */
export function parseESP32Data(dataString: string): SensorData {
  try {
    const parts = dataString.split(',');
    const data: any = {};

    parts.forEach((part) => {
      const [key, value] = part.split(':');
      data[key.trim()] = parseFloat(value.trim());
    });

    return {
      pH: data.pH || data.ph || 0,
      moisture: data.Moisture || data.moisture || 0,
      tds: data.TDS || data.tds || 0,
      nitrogen: data.N || data.n || 0,
      phosphorus: data.P || data.p || 0,
      potassium: data.K || data.k || 0,
    };
  } catch (error) {
    console.error('Error parsing data:', error);
    throw new Error('Invalid data format from ESP32');
  }
}

/**
 * DEMO MODE: Simulated ESP32 connection for testing
 * Returns mock data. Remove this when using real ESP32.
 */
export async function connectToESP32Demo(): Promise<SensorData> {
  // Simulate connection delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Example data string from ESP32
  const mockDataString = 'pH:6.8,Moisture:25,TDS:1.5,N:145,P:38,K:210';
  
  console.log('DEMO MODE: Simulated ESP32 data:', mockDataString);
  
  return parseESP32Data(mockDataString);
}
