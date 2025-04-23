import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar, Check, Clock, Edit, Plus, Trash2, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui-custom/StatCard";
import { PlusCircle, FileText, BarChart, Download, CreditCard } from "lucide-react";
import { PrevisionsCPTable } from "@/components/tables/PrevisionsCPTable";

type Engagement = {
  id: string;
  name: string;
  operation_id: string;
  operation_name?: string;
  ministry_id?: string | null; // Made optional to avoid type errors
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
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrimester, setSelectedTrimester] = useState("all");

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
          engagement:engagements(id, name, operation_id),
          operation:operations(id, name, ministry_id)
        `
        )
        .eq("exercice", selectedYear);

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

      // Map relationship data to make it easier to work with
      return data.map((prevision: any) => ({
        ...prevision,
        engagement_name: prevision.engagement?.name,
        operation_name: prevision.operation?.name,
      }));
    },
  });

  // Fetch engagements data
  const { data: engagements, isLoading: isLoadingEngagements } = useQuery({
    queryKey: ["engagements", selectedMinistry, selectedOperation],
    queryFn: async () => {
      let query = supabase.from("engagements").select(`
        id,
        name,
        operation_id,
        operation:operation_id (id, name, ministry_id)
      `);

      if (selectedOperation && selectedOperation !== "all") {
        query = query.eq("operation_id", selectedOperation);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching engagements:", error);
        throw error;
      }

      return data.map((engagement: any) => ({
        ...engagement,
        operation_name: engagement.operation?.name,
      }));
    },
  });

  // Fetch operations data
  const { data: operations, isLoading: isLoadingOperations } = useQuery({
    queryKey: ["operations", selectedMinistry],
    queryFn: async () => {
      let query = supabase.from("operations").select("id, name, ministry_id");

      if (selectedMinistry && selectedMinistry !== "all") {
        query = query.eq("ministry_id", selectedMinistry);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching operations:", error);
        throw error;
      }

      return data;
    },
  });

  // Fetch ministries data
  const { data: ministries, isLoading: isLoadingMinistries } = useQuery({
    queryKey: ["ministries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ministries").select("id, name, code");

      if (error) {
        console.error("Error fetching ministries:", error);
        throw error;
      }

      return data;
    },
  });

  // Get available years (current year and next year)
  const availableYears = [new Date().getFullYear(), new Date().getFullYear() + 1];

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
  const handleUpdatePrevision = async (data: Partial<PrevisionCP>) => {
    try {
      const { error } = await supabase.from("prevision_cp").update(data).eq("id", data.id);

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
    if (!id) return;

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
  const handleRequestMobilization = async (data: Partial<PrevisionCP>) => {
    if (!data.id) return;

    try {
      const { error } = await supabase
        .from("prevision_cp")
        .update({
          montant_demande: data.montant_demande,
          date_demande: new Date().toISOString(),
          statut: "demandé",
          notes: data.notes,
        })
        .eq("id", data.id);

      if (error) {
        throw error;
      }

      toast({
        title: t("PrevisionsCP.toast.mobilization.title"),
        description: t("PrevisionsCP.toast.mobilization.description"),
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

  // Handle opening the dialog for a new prevision
  const handleAddNewPrevision = () => {
    setSelectedPrevision(null);
    setIsPrevisionDialogOpen(true);
  };

  // Handle opening the edit dialog
  const handleEditPrevision = (prevision: PrevisionCP) => {
    setSelectedPrevision(prevision);
    setIsPrevisionDialogOpen(true);
  };

  // Handle opening the view dialog (could be the same as edit but readonly)
  const handleViewPrevision = (prevision: PrevisionCP) => {
    setSelectedPrevision(prevision);
    setIsPrevisionDialogOpen(true);
  };

  // Handle opening the mobilization dialog
  const handleMobilizePrevision = (prevision: PrevisionCP) => {
    setSelectedPrevision(prevision);
    setIsMobilizationDialogOpen(true);
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get status badge color helper
  const getStatusBadgeVariant = (status: PrevisionCPStatus) => {
    switch (status) {
      case "prévu":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400">
            Prévu
          </Badge>
        );
      case "demandé":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400">
            Demandé
          </Badge>
        );
      case "mobilisé":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
            Mobilisé
          </Badge>
        );
      case "en retard":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400">
            En retard
          </Badge>
        );
      case "partiellement mobilisé":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-400">
            Partiellement mobilisé
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Get mobilization percentage helper
  const getMobilizationPercentage = (prevu: number, mobilise: number) => {
    if (prevu === 0) return 0;
    return Math.round((mobilise / prevu) * 100);
  };

  // Get consumption percentage helper
  const getConsumptionPercentage = (mobilise: number, consomme: number) => {
    if (mobilise === 0) return 0;
    return Math.round((consomme / mobilise) * 100);
  };

  // Get alerts helper
  const getAlerts = () => {
    const alerts = [];

    // Alert for late previsions
    const latePrevisions = previsionsCP?.filter((projection) => projection.statut === "en retard") || [];
    if (latePrevisions.length > 0) {
      alerts.push({
        id: "late-previsions",
        title: "Prévisions en retard",
        description: `Il y a ${latePrevisions.length} prévisions en retard de mobilisation.`,
        icon: AlertTriangle,
        variant: "destructive" as const,
      });
    }

    return alerts;
  };

  const alerts = getAlerts();

  // Filter projections based on search term, year, trimester and status
  const filteredProjections =
    previsionsCP?.filter((projection) => {
      const matchesSearch =
        projection.engagement_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projection.operation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projection.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear = selectedYear === projection.exercice;
      const matchesTrimester = selectedTrimester === "all" || projection.periode.split("-")[1] === selectedTrimester;

      if (activeTab === "all") return matchesSearch && matchesYear && matchesTrimester;
      return projection.statut === activeTab && matchesSearch && matchesYear && matchesTrimester;
    }) || [];

  // Calculate total amounts
  const totalProjected = previsionsCP?.reduce((sum, projection) => sum + projection.montant_prevu, 0) || 0;
  const totalApproved =
    previsionsCP?.filter((projection) => projection.statut === "prévu").reduce((sum, projection) => sum + projection.montant_prevu, 0) || 0;
  const totalPending =
    previsionsCP?.filter((projection) => projection.statut === "demandé").reduce((sum, projection) => sum + projection.montant_demande, 0) || 0;

  return (
    <Dashboard>
      <DashboardHeader title="Prévisions de Crédits de Paiement" description="Planifiez et suivez les prévisions de crédits de paiement (CP)">
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={handleAddNewPrevision}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle prévision
          </Button>
        </div>
      </DashboardHeader>

      <DashboardSection>
        <DashboardGrid columns={3}>
          <StatCard
            title="Total Prévisions CP"
            value={formatCurrency(totalProjected)}
            description="Budget total prévu"
            icon={<CreditCard className="h-4 w-4" />}
          />
          <StatCard
            title="CP Approuvés"
            value={formatCurrency(totalApproved)}
            description="Prévisions approuvées"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="CP En Attente"
            value={formatCurrency(totalPending)}
            description="Prévisions en attente"
            icon={<Calendar className="h-4 w-4" />}
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prévisions de Crédits de Paiement</CardTitle>
                <CardDescription>Gérez les prévisions de CP par programme et par période</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-[250px]"
                />
                <div className="flex gap-2">
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Trimestre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="Q1">Trimestre 1</SelectItem>
                      <SelectItem value="Q2">Trimestre 2</SelectItem>
                      <SelectItem value="Q3">Trimestre 3</SelectItem>
                      <SelectItem value="Q4">Trimestre 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="prévu">Prévu</TabsTrigger>
                  <TabsTrigger value="demandé">Demandé</TabsTrigger>
                  <TabsTrigger value="mobilisé">Mobilisé</TabsTrigger>
                  <TabsTrigger value="en retard">En retard</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isLoadingPrevisions ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : filteredProjections.length > 0 ? (
              <PrevisionsCPTable
                previsionsCP={filteredProjections}
                formatCurrency={formatCurrency}
                onView={handleViewPrevision}
                onEdit={handleEditPrevision}
                onDelete={(prevision) => {
                  if (window.confirm(t("PrevisionsCP.confirmDelete"))) {
                    handleDeletePrevision(prevision.id);
                  }
                }}
                onMobilize={handleMobilizePrevision}
                onRefresh={refetchPrevisions}
                onAddNew={handleAddNewPrevision}
              />
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Aucune prévision trouvée pour les critères sélectionnés.
                <div className="mt-4">
                  <Button onClick={handleAddNewPrevision}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle prévision
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardSection>

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
    </Dashboard>
  );
};

export default PrevisionsCP;
