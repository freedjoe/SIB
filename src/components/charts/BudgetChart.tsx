
import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BudgetItem {
  name: string;
  value: number;
  color: string;
}

interface BudgetChartProps {
  title: string;
  data: BudgetItem[];
  className?: string;
  showLegend?: boolean;
}

export function BudgetChart({
  title,
  data,
  className,
  showLegend = true,
}: BudgetChartProps) {
  const [chartData, setChartData] = useState<BudgetItem[]>([]);

  // Animate chart data on mount
  useEffect(() => {
    setChartData([]);
    const timer = setTimeout(() => {
      setChartData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={cn("budget-card h-full", className)}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number) => formatCurrency(value)}
                wrapperStyle={{ outline: "none" }}
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  padding: "8px 12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {showLegend && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <div
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="ml-auto font-medium">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
