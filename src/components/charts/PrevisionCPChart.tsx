import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from "recharts";

import { PrevisionCP } from "@/types/prevision_cp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PrevisionCPChartProps {
  previsions: PrevisionCP[];
}

export function PrevisionCPChart({ previsions }: PrevisionCPChartProps) {
  const { t } = useTranslation();

  // Group previsions by period
  const data = previsions.reduce(
    (acc, prevision) => {
      const existingPeriod = acc.find((item) => item.periode === prevision.periode);
      if (existingPeriod) {
        existingPeriod.montant_prevu += prevision.montant_prevu;
        existingPeriod.montant_demande += prevision.montant_demande || 0;
        existingPeriod.montant_mobilise += prevision.montant_mobilise || 0;
        existingPeriod.montant_consomme += prevision.montant_consomme || 0;
      } else {
        acc.push({
          periode: prevision.periode,
          montant_prevu: prevision.montant_prevu,
          montant_demande: prevision.montant_demande || 0,
          montant_mobilise: prevision.montant_mobilise || 0,
          montant_consomme: prevision.montant_consomme || 0,
        });
      }
      return acc;
    },
    [] as Array<{
      periode: string;
      montant_prevu: number;
      montant_demande: number;
      montant_mobilise: number;
      montant_consomme: number;
    }>
  );

  // Sort data by period
  data.sort((a, b) => a.periode.localeCompare(b.periode));

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periode" />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("fr-FR", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "XOF",
              }).format(value)
            }
          />
          <Legend />
          <Bar dataKey="montant_prevu" name={t("PrevisionsCP.chart.montantPrevu")} fill="#8884d8" />
          <Bar dataKey="montant_demande" name={t("PrevisionsCP.chart.montantDemande")} fill="#82ca9d" />
          <Bar dataKey="montant_mobilise" name={t("PrevisionsCP.chart.montantMobilise")} fill="#ffc658" />
          <Bar dataKey="montant_consomme" name={t("PrevisionsCP.chart.montantConsomme")} fill="#ff8042" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
