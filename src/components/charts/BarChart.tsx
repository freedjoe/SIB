import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: ChartOptions<"bar">;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, options, height = 300 }) => {
  const defaultOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options || defaultOptions} />
    </div>
  );
};
