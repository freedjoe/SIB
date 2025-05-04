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

// Define an interface that matches the actual data structure
interface PrevisionData {
  id: string;
  operation_id: string;
  fiscal_year_id: string;
  forecast_cp: number;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  description: string;
  created_at?: string;
  // These will be populated from join queries
  operation?: {
    id: string;
    name?: string;
    ministry_id?: string;
    ministry?: {
      id: string;
      name?: string;
    };
  };
  engagement_id?: string;
  engagement?: {
    id: string;
    amount?: number;
  };
}

export default function PrevisionsCP() {
  const { t } = useTranslation();
  const [previsions, setPrevisions] = useState<PrevisionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the fetchPrevisions function inside useEffect to avoid dependency issues
  useEffect(() => {
    const fetchPrevisions = async () => {
      try {
        setLoading(true);
        // Use more specific type for data
        const { data, error } = await supabase
          .from("prevision_cp")
          .select(
            `
            *,
            operation:operation_id (
              id, 
              name,
              ministry:ministry_id (
                id,
                name
              )
            ),
            engagement:engagement_id (
              id,
              amount
            )
          `
          )
          .eq("fiscal_year_id", "2025")
          .order("created_at", { ascending: false });

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

    fetchPrevisions();
  }, [t]); // Add t as a dependency since it's used inside the effect

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
      <h1 className="text-2xl font-bold mb-4">{t("app.PrevisionsCP.title")} 2025</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">{t("app.operations.ministry")}</th>
              <th className="px-4 py-2">{t("app.operations.title", "Opération")}</th>
              <th className="px-4 py-2">{t("app.engagements.title", "Engagement")}</th>
              <th className="px-4 py-2">{t("app.PrevisionsCP.table.montant_prevu")}</th>
              <th className="px-4 py-2">{t("app.PrevisionsCP.table.date_soumission")}</th>
              <th className="px-4 py-2">{t("app.common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {previsions.map((prevision) => (
              <tr key={prevision.id} className="border-t">
                <td className="px-4 py-2">
                  {prevision.operation && prevision.operation.ministry && prevision.operation.ministry.name ? prevision.operation.ministry.name : "-"}
                </td>
                <td className="px-4 py-2">{prevision.operation && prevision.operation.name ? prevision.operation.name : "-"}</td>
                <td className="px-4 py-2">
                  {prevision.engagement && typeof prevision.engagement.amount === "number"
                    ? prevision.engagement.amount.toLocaleString("fr-DZ", {
                        style: "currency",
                        currency: "DZD",
                      })
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  {typeof prevision.forecast_cp === "number"
                    ? prevision.forecast_cp.toLocaleString("fr-DZ", {
                        style: "currency",
                        currency: "DZD",
                      })
                    : "-"}
                </td>
                <td className="px-4 py-2">{prevision.created_at ? new Date(prevision.created_at).toLocaleDateString("fr-DZ") : "-"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      prevision.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : prevision.status === "submitted"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t(`app.PrevisionsCP.status.${prevision.status}`, prevision.status || t("app.common.unknown", "Unknown"))}
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
