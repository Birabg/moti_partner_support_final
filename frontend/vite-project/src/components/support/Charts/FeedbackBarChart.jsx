import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FeedbackBarChart({ data = {} }) {
  const distribution = data.ratingDistribution || data || {};
  const labels = ["5★", "4★", "3★", "2★", "1★"];
  const values = [
    distribution["5_star"] || 0,
    distribution["4_star"] || 0,
    distribution["3_star"] || 0,
    distribution["2_star"] || 0,
    distribution["1_star"] || 0,
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Rating distribution",
        data: values,
        backgroundColor: "#10b981",
      },
    ],
  };

  return (
    <div className="ps-chart-card">
      <h4>Customer Rating Distribution</h4>
      <Bar data={chartData} />
    </div>
  );
}
