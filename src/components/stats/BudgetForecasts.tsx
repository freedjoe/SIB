import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts";
import { formatCurrency } from "@/lib/utils";

interface Forecast {
  year: number;
  revenue: number;
  expenditure: number;
  gdpGrowth: number;
  inflationRate: number;
}

interface BudgetForecastsProps {
  baseYear: number;
  forecasts: Forecast[];
}

export function BudgetForecasts({ baseYear, forecasts }: BudgetForecastsProps) {
  const chartData = {
    labels: forecasts.map((f) => f.year.toString()),
    datasets: [
      {
        label: "Revenus prévus",
        data: forecasts.map((f) => f.revenue / 1000000), // Convert to millions
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
      },
      {
        label: "Dépenses prévues",
        data: forecasts.map((f) => f.expenditure / 1000000), // Convert to millions
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
      },
    ],
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Prévisions budgétaires {baseYear}-{baseYear + 3}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-6">
          <LineChart data={chartData} />
        </div>

        <div className="grid grid-cols-4 gap-4">
          {forecasts.map((forecast, index) => (
            <div
              key={index}
              className="space-y-2 p-4 rounded-lg bg-muted">
              <h4 className="font-medium text-center">{forecast.year}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Revenus:</span>
                  <span className="font-medium">{formatCurrency(forecast.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dépenses:</span>
                  <span className="font-medium">{formatCurrency(forecast.expenditure)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Croissance PIB:</span>
                  <span className="font-medium text-green-600">+{forecast.gdpGrowth}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Inflation:</span>
                  <span className="font-medium text-yellow-600">{forecast.inflationRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
