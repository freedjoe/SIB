import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar, Check, Clock, Edit, Plus, Trash2, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

import { PrevisionCPDialog } from "@/components/dialogs/PrevisionCPDialog";
import { PrevisionCPMobilizationDialog } from "@/components/dialogs/PrevisionCPMobilizationDialog";
import { PrevisionCPChart } from "@/components/charts/PrevisionCPChart";
import { PrevisionCP, PrevisionCPStatus } from "@/types/prevision_cp";

type Engagement = {
  id: string;
  name: string;
  operation_id: string;
  operation_name?: string;
  ministry_id: string | null;
};

type Operation = {
  id: string;
  name: string;
  ministry_id: string | null;
};

type Ministry = {
  id: string;
  name: string;
  code: string;
};

const PrevisionsCP = () => {
  const { t } = useTranslation();
  const [selectedMinistry, setSelectedMinistry] = useState<string>("all");
  const [selectedEngagement, setSelectedEngagement] = useState<string>("all");
  const [selectedOperation, setSelectedOperation] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPrevisionDialogOpen, setIsPrevisionDialogOpen] = useState(false);
  const [isMobilizationDialogOpen, setIsMobilizationDialogOpen] = useState(false);
  const [selectedPrevision, setSelectedPrevision] = useState<PrevisionCP | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "chart">("list");

  // Fetch previsions CP data
  const {
    data: previsionsCP,
    isLoading: isLoadingPrevisions,
    refetch: refetchPrevisions,
  } = useQuery({
    queryKey: ["previsionsCP", selectedMinistry, selectedEngagement, selectedOperation, selectedYear, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from("prevision_cp")
        .select(
          `
          *,
          engagement:engagement_id (name, operation_id, ministry_id),
          operation:operation_id (name, ministry_id)
        `
        )
        .eq("exercice", selectedYear);

      if (selectedMinistry && selectedMinistry !== "all") {
        query = query.eq("engagement.ministry_id", selectedMinistry);
      }

      if (selectedEngagement && selectedEngagement !== "all") {
        query = query.eq("engagement_id", selectedEngagement);
      }

      if (selectedOperation && selectedOperation !== "all") {
        query = query.eq("operation_id", selectedOperation);
      }

      if (selectedStatus && selectedStatus !== "all") {
        query = query.eq("statut", selectedStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching previsions CP:", error);
        throw error;
      }

      return data as PrevisionCP[];
    },
  });

  // Fetch engagements data
  const { data: engagements, isLoading: isLoadingEngagements } = useQuery({
    queryKey: ["engagements", selectedMinistry, selectedOperation],
    queryFn: async () => {
      let query = supabase.from("engagements").select(`
        *,
        operation:operation_id (name)
      `);

      if (selectedMinistry && selectedMinistry !== "all") {
        query = query.eq("ministry_id", selectedMinistry);
      }

      if (selectedOperation && selectedOperation !== "all") {
        query = query.eq("operation_id", selectedOperation);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching engagements:", error);
        throw error;
      }

      return data as Engagement[];
    },
  });

  // Fetch operations data
  const { data: operations, isLoading: isLoadingOperations } = useQuery({
    queryKey: ["operations", selectedMinistry],
    queryFn: async () => {
      let query = supabase.from("operations").select("*");

      if (selectedMinistry && selectedMinistry !== "all") {
        query = query.eq("ministry_id", selectedMinistry);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching operations:", error);
        throw error;
      }

      return data as Operation[];
    },
  });

  // Fetch ministries data
  const { data: ministries, isLoading: isLoadingMinistries } = useQuery({
    queryKey: ["ministries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ministries").select("*");

      if (error) {
        console.error("Error fetching ministries:", error);
        throw error;
      }

      return data as Ministry[];
    },
  });

  // Get available years (current year and next year)
  const availableYears = [new Date().getFullYear(), new Date().getFullYear() + 1];

  // Get available statuses
  const availableStatuses: { value: PrevisionCPStatus; label: string }[] = [
    { value: "prévu", label: t("PrevisionsCP.status.planned") },
    { value: "demandé", label: t("PrevisionsCP.status.requested") },
    { value: "mobilisé", label: t("PrevisionsCP.status.mobilized") },
    { value: "en retard", label: t("PrevisionsCP.status.delayed") },
    { value: "partiellement mobilisé", label: t("PrevisionsCP.status.partiallyMobilized") },
  ];

  // Handle create prevision CP
  const handleCreatePrevision = async (prevision: Partial<PrevisionCP>) => {
    try {
      const { data, error } = await supabase.from("prevision_cp").insert([prevision]).select();

      if (error) {
        throw error;
      }

      toast({
        title: t("PrevisionsCP.toast.created.title"),
        description: t("PrevisionsCP.toast.created.description"),
      });

      refetchPrevisions();
    } catch (error) {
      console.error("Error creating prevision CP:", error);
      toast({
        title: t("PrevisionsCP.toast.error.title"),
        description: t("PrevisionsCP.toast.error.description"),
        variant: "destructive",
      });
    }
  };

  // Handle update prevision CP
  const handleUpdatePrevision = async (id: string, updates: Partial<PrevisionCP>) => {
    try {
      const { data, error } = await supabase.from("prevision_cp").update(updates).eq("id", id).select();

      if (error) {
        throw error;
      }

      toast({
        title: t("PrevisionsCP.toast.updated.title"),
        description: t("PrevisionsCP.toast.updated.description"),
      });

      refetchPrevisions();
    } catch (error) {
      console.error("Error updating prevision CP:", error);
      toast({
        title: t("PrevisionsCP.toast.error.title"),
        description: t("PrevisionsCP.toast.error.description"),
        variant: "destructive",
      });
    }
  };

  // Handle delete prevision CP
  const handleDeletePrevision = async (id: string) => {
    try {
      const { error } = await supabase.from("prevision_cp").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: t("PrevisionsCP.toast.deleted.title"),
        description: t("PrevisionsCP.toast.deleted.description"),
      });

      refetchPrevisions();
    } catch (error) {
      console.error("Error deleting prevision CP:", error);
      toast({
        title: t("PrevisionsCP.toast.error.title"),
        description: t("PrevisionsCP.toast.error.description"),
        variant: "destructive",
      });
    }
  };

  // Handle request mobilization
  const handleRequestMobilization = async (id: string, montant_demande: number) => {
    try {
      const { data, error } = await supabase
        .from("prevision_cp")
        .update({
          montant_demande,
          statut: "demandé",
          date_soumission: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: t("PrevisionsCP.toast.mobilizationRequested.title"),
        description: t("PrevisionsCP.toast.mobilizationRequested.description"),
      });

      refetchPrevisions();
    } catch (error) {
      console.error("Error requesting mobilization:", error);
      toast({
        title: t("PrevisionsCP.toast.error.title"),
        description: t("PrevisionsCP.toast.error.description"),
        variant: "destructive",
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: PrevisionCPStatus) => {
    switch (status) {
      case "prévu":
        return "outline";
      case "demandé":
        return "secondary";
      case "mobilisé":
        return "success";
      case "en retard":
        return "destructive";
      case "partiellement mobilisé":
        return "warning";
      default:
        return "default";
    }
  };

  // Calculate mobilization percentage
  const getMobilizationPercentage = (prevu: number, mobilise: number) => {
    if (prevu === 0) return 0;
    return Math.round((mobilise / prevu) * 100);
  };

  // Calculate consumption percentage
  const getConsumptionPercentage = (mobilise: number, consomme: number) => {
    if (mobilise === 0) return 0;
    return Math.round((consomme / mobilise) * 100);
  };

  // Check for alerts (delayed or insufficient mobilization)
  const getAlerts = () => {
    if (!previsionsCP) return [];

    const alerts = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    for (const prevision of previsionsCP) {
      // Check if mobilization is delayed
      if (prevision.statut === "prévu" || prevision.statut === "demandé") {
        const [year, period] = prevision.periode.split("-");
        const previsionYear = parseInt(year);

        if (
          previsionYear < selectedYear ||
          (previsionYear === selectedYear && period.startsWith("Q") && parseInt(period.substring(1)) < currentQuarter)
        ) {
          alerts.push({
            type: "delayed",
            message: t("PrevisionsCP.alerts.delayed", {
              engagement: prevision.engagement_name,
              operation: prevision.operation_name,
              periode: prevision.periode,
            }),
            prevision,
          });
        }
      }

      // Check if mobilization is insufficient
      if (prevision.montant_mobilise < prevision.montant_prevu) {
        alerts.push({
          type: "insufficient",
          message: t("PrevisionsCP.alerts.insufficient", {
            engagement: prevision.engagement_name,
            operation: prevision.operation_name,
            periode: prevision.periode,
            prevu: formatCurrency(prevision.montant_prevu),
            mobilise: formatCurrency(prevision.montant_mobilise),
          }),
          prevision,
        });
      }
    }

    return alerts;
  };

  const alerts = getAlerts();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("PrevisionsCP.title")}</h1>
        <Button onClick={() => setIsPrevisionDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("PrevisionsCP.actions.create")}
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === "delayed" ? "destructive" : "warning"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t("PrevisionsCP.alerts.title")}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("PrevisionsCP.filters.title")}</CardTitle>
          <CardDescription>{t("PrevisionsCP.filters.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("PrevisionsCP.filters.ministry")}</label>
              <Select
                value={selectedMinistry}
                onValueChange={(value) => {
                  setSelectedMinistry(value);
                  setSelectedEngagement("all");
                  setSelectedOperation("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("PrevisionsCP.filters.selectMinistry")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("PrevisionsCP.filters.allMinistries")}</SelectItem>
                  {ministries?.map((ministry) => (
                    <SelectItem key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("PrevisionsCP.filters.operation")}</label>
              <Select
                value={selectedOperation}
                onValueChange={(value) => {
                  setSelectedOperation(value);
                  setSelectedEngagement("all");
                }}
                disabled={selectedMinistry === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("PrevisionsCP.filters.selectOperation")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("PrevisionsCP.filters.allOperations")}</SelectItem>
                  {operations?.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      {operation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("PrevisionsCP.filters.engagement")}</label>
              <Select value={selectedEngagement} onValueChange={setSelectedEngagement} disabled={selectedOperation === "all"}>
                <SelectTrigger>
                  <SelectValue placeholder={t("PrevisionsCP.filters.selectEngagement")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("PrevisionsCP.filters.allEngagements")}</SelectItem>
                  {engagements?.map((engagement) => (
                    <SelectItem key={engagement.id} value={engagement.id}>
                      {engagement.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("PrevisionsCP.filters.year")}</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("PrevisionsCP.filters.selectYear")} />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("PrevisionsCP.filters.status")}</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t("PrevisionsCP.filters.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("PrevisionsCP.filters.allStatuses")}</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-end">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "chart")}>
          <TabsList>
            <TabsTrigger value="list">{t("PrevisionsCP.view.list")}</TabsTrigger>
            <TabsTrigger value="chart">{t("PrevisionsCP.view.chart")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            {isLoadingPrevisions ? (
              <div className="p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("PrevisionsCP.table.engagement")}</TableHead>
                    <TableHead>{t("PrevisionsCP.table.operation")}</TableHead>
                    <TableHead>{t("PrevisionsCP.table.period")}</TableHead>
                    <TableHead>{t("PrevisionsCP.table.planned")}</TableHead>
                    <TableHead>{t("PrevisionsCP.table.requested")}</TableHead>
                    <TableHead>{t("PrevisionsCP.table.mobilized")}</TableHead>
                    <TableHead>{t("PrevisionsCP.table.consumed")}</TableHead>
                    <TableHead>{t("PrevisionsCP.table.status")}</TableHead>
                    <TableHead>{t("PrevisionsCP.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previsionsCP?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6">
                        {t("PrevisionsCP.table.noData")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    previsionsCP?.map((prevision) => (
                      <TableRow key={prevision.id}>
                        <TableCell>{prevision.engagement_name}</TableCell>
                        <TableCell>{prevision.operation_name}</TableCell>
                        <TableCell>{prevision.periode}</TableCell>
                        <TableCell>{formatCurrency(prevision.montant_prevu)}</TableCell>
                        <TableCell>{formatCurrency(prevision.montant_demande)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{formatCurrency(prevision.montant_mobilise)}</div>
                            <Progress value={getMobilizationPercentage(prevision.montant_prevu, prevision.montant_mobilise)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{formatCurrency(prevision.montant_consomme)}</div>
                            <Progress value={getConsumptionPercentage(prevision.montant_mobilise, prevision.montant_consomme)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(prevision.statut)}>{t(`PrevisionsCP.status.${prevision.statut}`)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedPrevision(prevision);
                                setIsPrevisionDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {prevision.statut === "prévu" && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedPrevision(prevision);
                                  setIsMobilizationDialogOpen(true);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="icon" onClick={() => handleDeletePrevision(prevision.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chart View */}
      {viewMode === "chart" && (
        <Card>
          <CardContent className="p-6">
            {isLoadingPrevisions ? <Skeleton className="h-[400px] w-full" /> : <PrevisionCPChart previsions={previsionsCP || []} />}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <PrevisionCPDialog
        open={isPrevisionDialogOpen}
        onOpenChange={setIsPrevisionDialogOpen}
        prevision={selectedPrevision}
        engagements={engagements || []}
        operations={operations || []}
        ministries={ministries || []}
        onSubmit={selectedPrevision ? handleUpdatePrevision : handleCreatePrevision}
      />

      <PrevisionCPMobilizationDialog
        open={isMobilizationDialogOpen}
        onOpenChange={setIsMobilizationDialogOpen}
        prevision={selectedPrevision}
        onSubmit={handleRequestMobilization}
      />
    </div>
  );
};

export default PrevisionsCP;
