import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor?: string[];
      borderWidth?: number;
    }>;
  };
  options?: ChartOptions<"pie">;
  height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ data, options, height = 300 }) => {
  const defaultOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            const percentage = Math.round(((value as number) / total) * 100);
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Pie data={data} options={options || defaultOptions} />
    </div>
  );
};
