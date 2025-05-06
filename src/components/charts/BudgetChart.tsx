import { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { cn, formatCurrency } from "@/lib/utils";

interface BudgetTitle {
  name: string;
  value: number;
  color: string;
}

interface BudgetChartProps {
  title: string;
  data: BudgetTitle[];
  className?: string;
}

export function BudgetChart({ title, data, className }: BudgetChartProps) {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<BudgetTitle[]>([]);

  // Animate chart data on mount
  useEffect(() => {
    setChartData([]);
    const timer = setTimeout(() => {
      setChartData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <Card className={cn("budget-card h-full", className)}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title === "dashboard.engagementStatus" ? t("dashboard.engagementStatus") : title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer
            width="100%"
            height="100%">
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
                animationDuration={800}>
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
      </CardContent>
    </Card>
  );
}
