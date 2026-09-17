import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ResolutionTrendChart({ data = {} }) {
  const labels = data.labels || [];
  const values = data.values || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Resolutions",
        data: values,
        borderColor: 'navy-500',
        backgroundColor: "rgba(59,130,246,0.2)",
      },
    ],
  };

  return (
    <div className="ps-chart-card">
      <h4>Resolution Trend</h4>
      <Line data={chartData} />
    </div>
  );
}








