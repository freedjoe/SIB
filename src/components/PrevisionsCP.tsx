import { useEffect, useState } from "react";
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
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Prévisions CP 2025</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Ministère</th>
              <th className="px-4 py-2">Opération</th>
              <th className="px-4 py-2">Engagement</th>
              <th className="px-4 py-2">Montant CP</th>
              <th className="px-4 py-2">Date Prévue</th>
              <th className="px-4 py-2">Statut</th>
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
                    {prevision.status}
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
