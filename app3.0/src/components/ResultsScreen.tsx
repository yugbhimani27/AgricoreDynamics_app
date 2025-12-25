import { useState } from 'react';
import { Droplets, Leaf, FlaskConical, ArrowLeft } from 'lucide-react';
import { Language, TRANSLATIONS } from '../config/translations';
import { APP_CONFIG } from '../config/appConfig';
import { FarmerData } from './FarmerDetails';
import { SensorData } from '../utils/bluetooth';
import { ParameterGraph } from './ParameterGraph';

interface ResultsScreenProps {
  language: Language;
  farmerData: FarmerData;
  sensorData: SensorData;
  onScanAgain: () => void;
}

export function ResultsScreen({
  language,
  farmerData,
  sensorData,
  onScanAgain,
}: ResultsScreenProps) {

  const [selectedParam, setSelectedParam] = useState<string | null>(null);

  if (selectedParam) {
    return (
      <ParameterGraph
        espId="ESP32_001"
        parameter={selectedParam}
        onBack={() => setSelectedParam(null)}
      />
    );
  }

  const Item = ({ label, value }: { label: string; value: number }) => (
    <div
      onClick={() => setSelectedParam(label)}
      className="cursor-pointer p-4 rounded-xl bg-white shadow hover:scale-105 transition"
    >
      <p className="font-semibold">{label}</p>
      <p className="text-xl">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">
        {TRANSLATIONS.results[language]}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Item label="moisture" value={sensorData.moisture} />
        <Item label="pH" value={sensorData.pH} />
        <Item label="tds" value={sensorData.tds} />
        <Item label="nitrogen" value={sensorData.nitrogen} />
        <Item label="phosphorus" value={sensorData.phosphorus} />
        <Item label="potassium" value={sensorData.potassium} />
      </div>

      <button
        onClick={onScanAgain}
        className="w-full py-4 px-6 rounded-2xl text-white"
        style={{ backgroundColor: APP_CONFIG.colors.primary }}
      >
        {TRANSLATIONS.scanAgain[language]}
      </button>
    </div>
  );
}
