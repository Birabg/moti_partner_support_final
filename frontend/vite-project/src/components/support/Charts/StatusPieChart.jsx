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
        backgroundColor: ['navy-500', 'gold-500', "success-500", "danger-500"],
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








