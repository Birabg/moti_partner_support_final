import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusPieChart({ data = {} }) {
  const labels = Object.keys(data);
  const values = labels.map((k) => data[k] || 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#3b86f6", "#f59e0b", "#10b981", "#ef4444"],
      },
    ],
  };

  return (
    <div className="ps-chart-card">
      <h4>Cases by Status</h4>
      <div>
        <Pie data={chartData} />
      </div>
    </div>
  );
}
