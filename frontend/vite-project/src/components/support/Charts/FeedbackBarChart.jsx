import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function FeedbackBarChart({ data = {} }) {
  const distribution =
    data?.ratingDistribution || data || {};

  const labels = [
    "5 Stars",
    "4 Stars",
    "3 Stars",
    "2 Stars",
    "1 Star",
  ];

  const values = [
    Number(distribution["5_star"] || 0),
    Number(distribution["4_star"] || 0),
    Number(distribution["3_star"] || 0),
    Number(distribution["2_star"] || 0),
    Number(distribution["1_star"] || 0),
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Customer Ratings",
        data: values,

        backgroundColor: [
          "#0b1b33",
          'navy-500',
          "navy-400",
          'gold-500',
          "ink-200",
        ],

        borderRadius: 8,
        borderSkipped: false,

        barThickness: 28,
        maxBarThickness: 32,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0b1b33",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 10,

        displayColors: false,

        callbacks: {
          title: (items) => {
            return items?.[0]?.label || "";
          },

          label: (context) => {
            return ` ${context.raw} response${
              context.raw === 1 ? "" : "s"
            }`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        border: {
          display: false,
        },

        ticks: {
          color: "ink-500",
          font: {
            size: 11,
            weight: "600",
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          color: "ink-400",
          font: {
            size: 10,
          },
        },

        grid: {
          color: "ink-50",
          drawBorder: false,
        },

        border: {
          display: false,
          dash: [4, 4],
        },
      },
    },

    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
  };

  const hasData = values.some((value) => value > 0);

  if (!hasData) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl bg-ink-50">
        <div className="text-center">
          <p className="text-sm font-semibold text-ink-500">
            No rating data
          </p>

          <p className="mt-1 text-xs text-ink-400">
            Customer ratings will appear here once feedback is received.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative h-[300px] w-full">
        <Bar
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
}







