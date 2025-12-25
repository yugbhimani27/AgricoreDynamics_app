import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

interface Props {
  espId: string;
  parameter: string;
  onBack: () => void;
}

export function ParameterGraph({ espId, parameter, onBack }: Props) {
  const history =
    JSON.parse(localStorage.getItem("esp32_history") || "{}")?.[espId]?.[parameter] || [];

  const data = {
    labels: history.map((p: any) =>
      new Date(p.time).toLocaleTimeString()
    ),
    datasets: [
      {
        label: parameter,
        data: history.map((p: any) => p.value),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4">⬅ Back</button>
      <Line data={data} />
    </div>
  );
}
