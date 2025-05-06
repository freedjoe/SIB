import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrevisionCP } from "@/types/prevision_cp";
import { formatCurrency } from "@/lib/utils";

interface PrevisionCPChartProps {
  previsions: PrevisionCP[];
}

export const PrevisionCPChart: React.FC<PrevisionCPChartProps> = ({ previsions }) => {
  // Process data for charts
  const chartData = previsions.reduce((acc: any[], curr) => {
    const existing = acc.find((item) => item.periode === curr.periode);
    if (existing) {
      existing.montant_prevu += curr.montant_prevu || 0;
      existing.montant_demande += curr.montant_demande || 0;
      existing.montant_mobilise += curr.montant_mobilise || 0;
      existing.montant_consomme += curr.montant_consomme || 0;
    } else {
      acc.push({
        periode: curr.periode,
        montant_prevu: curr.montant_prevu || 0,
        montant_demande: curr.montant_demande || 0,
        montant_mobilise: curr.montant_mobilise || 0,
        montant_consomme: curr.montant_consomme || 0,
      });
    }
    return acc;
  }, []);

  const ministryData = previsions.reduce((acc: any[], curr) => {
    const existing = acc.find((item) => item.ministere === curr.ministere_name);
    if (existing) {
      existing.montant += curr.montant_prevu || 0;
    } else {
      acc.push({
        ministere: curr.ministere_name,
        montant: curr.montant_prevu || 0,
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Evolution des montants par période</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer
              width="100%"
              height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periode" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Période: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="montant_prevu"
                  name="Prévu"
                  fill="#4338ca"
                />
                <Bar
                  dataKey="montant_demande"
                  name="Demandé"
                  fill="#f59e0b"
                />
                <Bar
                  dataKey="montant_mobilise"
                  name="Mobilisé"
                  fill="#10b981"
                />
                <Bar
                  dataKey="montant_consomme"
                  name="Consommé"
                  fill="#6366f1"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition par ministère</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer
              width="100%"
              height="100%">
              <BarChart
                data={ministryData}
                layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis
                  type="category"
                  dataKey="ministere"
                  width={150}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Ministère: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="montant"
                  name="Montant prévu"
                  fill="#4338ca"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
