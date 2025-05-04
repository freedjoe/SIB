import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import type { PrevisionCP } from "@/types/supabase";
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// BlurLoader component to blur content while loading
interface BlurLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

const BlurLoader = ({ isLoading, children, className }: BlurLoaderProps) => {
  return (
    <div
      className={cn(
        "transition-all duration-300",
        isLoading ? "opacity-50 blur-[2px] pointer-events-none animate-pulse" : "opacity-100 blur-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default function PrevisionsCP() {
  const { t } = useTranslation();
  const [previsions, setPrevisions] = useState<PrevisionCP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrevisions();
  }, []);

  const fetchPrevisions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("prevision_cp").select("*").eq("exercice", 2025).order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setPrevisions(data || []);
    } catch (err) {
      console.error("Error fetching previsions CP:", err);
      setError(err instanceof Error ? err.message : t("app.common.errorOccurred", "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>{t("app.common.loading")}</div>;
  }

  if (error) {
    return (
      <div>
        {t("app.common.error")}: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">{t("PrevisionsCP.title")} 2025</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">{t("app.operations.ministry")}</th>
              <th className="px-4 py-2">{t("app.operations.title", "Opération")}</th>
              <th className="px-4 py-2">{t("app.engagements.title", "Engagement")}</th>
              <th className="px-4 py-2">{t("PrevisionsCP.table.montant_prevu")}</th>
              <th className="px-4 py-2">{t("PrevisionsCP.table.date_soumission")}</th>
              <th className="px-4 py-2">{t("app.common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {previsions.map((prevision) => (
              <tr key={prevision.id} className="border-t">
                <td className="px-4 py-2">{prevision.operation?.ministry?.name}</td>
                <td className="px-4 py-2">{prevision.operation?.name}</td>
                <td className="px-4 py-2">
                  {prevision.engagement?.amount.toLocaleString("fr-DZ", {
                    style: "currency",
                    currency: "DZD",
                  })}
                </td>
                <td className="px-4 py-2">
                  {prevision.amount.toLocaleString("fr-DZ", {
                    style: "currency",
                    currency: "DZD",
                  })}
                </td>
                <td className="px-4 py-2">{prevision.payment_date ? new Date(prevision.payment_date).toLocaleDateString("fr-DZ") : "-"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      prevision.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : prevision.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t(`PrevisionsCP.status.${prevision.status.toLowerCase()}`, prevision.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
