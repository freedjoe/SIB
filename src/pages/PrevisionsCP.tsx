import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Calendar,
  Check,
  Clock,
  Edit,
  Plus,
  Trash2,
  AlertTriangle,
  Download,
  CreditCard,
  PlusCircle,
  FileText,
  BarChart,
  Search,
  ChevronRight,
  Eye,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { PrevisionCPDialog } from "@/components/dialogs/PrevisionCPDialog";
import { PrevisionCPMobilizationDialog } from "@/components/dialogs/PrevisionCPMobilizationDialog";
import { PrevisionCPChart } from "@/components/charts/PrevisionCPChart";
import { PrevisionCP, PrevisionCPStatus } from "@/types/prevision_cp";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui-custom/StatCard";
import { PrevisionsCPTable } from "@/components/tables/PrevisionsCPTable";
import { DataLoadingWrapper } from "@/components/ui-custom/DataLoadingWrapper";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";
import { cn, formatCurrency } from "@/lib/utils";

// Import our custom React Query hooks
import { usePrevisionsCP, useEngagements, useOperations, useMinistries, useSupabaseMutation } from "@/hooks/supabase";

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
  const [loading, setLoading] = useState(true);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [isViewPrevisionOpen, setIsViewPrevisionOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredPrevisionsCP, setFilteredPrevisionsCP] = useState<PrevisionCP[]>([]);
  const [paginatedPrevisionsCP, setPaginatedPrevisionsCP] = useState<PrevisionCP[]>([]);

  // Use our custom React Query hooks instead of direct React Query usage
  const {
    data: previsionsCP = [],
    isLoading: isLoadingPrevisions,
    refetch: refetchPrevisions,
  } = usePrevisionsCP(
    {
      filter: (query) => {
        let filteredQuery = query.eq("exercice", selectedYear);

        if (selectedEngagement && selectedEngagement !== "all") {
          filteredQuery = filteredQuery.eq("engagement_id", selectedEngagement);
        }

        if (selectedOperation && selectedOperation !== "all") {
          filteredQuery = filteredQuery.eq("operation_id", selectedOperation);
        }

        if (selectedStatus && selectedStatus !== "all") {
          filteredQuery = filteredQuery.eq("statut", selectedStatus);
        }

        return filteredQuery;
      },
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Use our custom React Query hooks for related data
  const { data: engagements = [], isLoading: isLoadingEngagements } = useEngagements({
    filter: (query) => {
      let filteredQuery = query;

      if (selectedOperation && selectedOperation !== "all") {
        filteredQuery = filteredQuery.eq("operation_id", selectedOperation);
      }

      return filteredQuery;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: operations = [], isLoading: isLoadingOperations } = useOperations({
    filter: (query) => {
      let filteredQuery = query;

      if (selectedMinistry && selectedMinistry !== "all") {
        filteredQuery = filteredQuery.eq("ministry_id", selectedMinistry);
      }

      return filteredQuery;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const { data: ministries = [], isLoading: isLoadingMinistries } = useMinistries({
    staleTime: 30 * 60 * 1000, // 30 minutes - ministries change less frequently
  });

  // Use our mutation hooks for data changes
  const previsionCPMutation = useSupabaseMutation("previsions_cp", {
    onSuccess: () => {
      refetchPrevisions();
    },
    invalidateQueries: ["previsions-cp"],
  });

  // Get available years (current year and next year)
  const availableYears = useMemo(() => [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1], []);

  // Filter projections based on search term, year, trimester and status
  const computeFilteredPrevisionsCP = useCallback(() => {
    if (!previsionsCP || previsionsCP.length === 0) {
      return [];
    }

    return previsionsCP.filter((projection) => {
      const matchesSearch =
        !searchTerm ||
        projection.engagement_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projection.operation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projection.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear = selectedYear === projection.exercice;
      const matchesTrimester = selectedTrimester === "all" || projection.periode.split("-")[1] === selectedTrimester;
      const matchesStatus = activeTab === "all" || projection.statut === activeTab;

      return matchesSearch && matchesYear && matchesTrimester && matchesStatus;
    });
  }, [previsionsCP, searchTerm, selectedYear, selectedTrimester, activeTab]);

  // Apply pagination to filtered previsions
  const computePaginatedPrevisionsCP = useCallback(
    (filtered: PrevisionCP[]) => {
      const start = currentPage * itemsPerPage;
      const end = start + itemsPerPage;
      return filtered.slice(start, end);
    },
    [currentPage, itemsPerPage]
  );

  // Effect to update filtered and paginated previsions
  useEffect(() => {
    const filtered = computeFilteredPrevisionsCP();
    setFilteredPrevisionsCP(filtered);

    const paginated = computePaginatedPrevisionsCP(filtered);
    setPaginatedPrevisionsCP(paginated);

    // Reset to first page if current page exceeds available pages
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage >= totalPages && currentPage > 0 && filtered.length > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [computeFilteredPrevisionsCP, computePaginatedPrevisionsCP, itemsPerPage, currentPage]);

  // Process data effect
  useEffect(() => {
    if (isLoadingPrevisions || isLoadingEngagements || isLoadingOperations || isLoadingMinistries) {
      setLoading(true);
      return;
    }

    setLoading(false);
  }, [isLoadingPrevisions, isLoadingEngagements, isLoadingOperations, isLoadingMinistries]);

  // Handle create prevision CP
  const handleCreatePrevision = async (prevision: Partial<PrevisionCP>) => {
    try {
      await previsionCPMutation.mutateAsync({
        type: "insert",
        data: prevision,
      });

      toast({
        title: t("PrevisionsCP.toast.created.title"),
        description: t("PrevisionsCP.toast.created.description"),
      });

      setIsPrevisionDialogOpen(false);
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
    if (!data.id) return;

    try {
      await previsionCPMutation.mutateAsync({
        type: "update",
        id: data.id,
        data,
      });

      toast({
        title: t("PrevisionsCP.toast.updated.title"),
        description: t("PrevisionsCP.toast.updated.description"),
      });

      setIsPrevisionDialogOpen(false);
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
      await previsionCPMutation.mutateAsync({
        type: "delete",
        id,
      });

      toast({
        title: t("PrevisionsCP.toast.deleted.title"),
        description: t("PrevisionsCP.toast.deleted.description"),
      });
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
      await previsionCPMutation.mutateAsync({
        type: "update",
        id: data.id,
        data: {
          montant_demande: data.montant_demande,
          date_demande: new Date().toISOString(),
          statut: "demandé",
          notes: data.notes,
        },
      });

      toast({
        title: t("PrevisionsCP.toast.mobilization.title"),
        description: t("PrevisionsCP.toast.mobilization.description"),
      });

      setIsMobilizationDialogOpen(false);
    } catch (error) {
      console.error("Error requesting mobilization:", error);
      toast({
        title: t("PrevisionsCP.toast.error.title"),
        description: t("PrevisionsCP.toast.error.description"),
        variant: "destructive",
      });
    }
  };

  // Handle opening dialogs
  const handleAddNewPrevision = () => {
    setSelectedPrevision(null);
    setIsPrevisionDialogOpen(true);
  };

  const handleEditPrevision = (prevision: PrevisionCP) => {
    setSelectedPrevision(prevision);
    setIsPrevisionDialogOpen(true);
  };

  const handleViewPrevision = (prevision: PrevisionCP) => {
    setSelectedPrevision(prevision);
    setIsViewPrevisionOpen(true);
  };

  const handleMobilizePrevision = (prevision: PrevisionCP) => {
    setSelectedPrevision(prevision);
    setIsMobilizationDialogOpen(true);
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

  // Calculate total amounts
  const totalProjected = previsionsCP?.reduce((sum, projection) => sum + projection.montant_prevu, 0) || 0;
  const totalApproved =
    previsionsCP?.filter((projection) => projection.statut === "prévu").reduce((sum, projection) => sum + projection.montant_prevu, 0) || 0;
  const totalPending =
    previsionsCP?.filter((projection) => projection.statut === "demandé").reduce((sum, projection) => sum + projection.montant_demande, 0) || 0;
  const totalMobilized =
    previsionsCP?.filter((projection) => projection.statut === "mobilisé").reduce((sum, projection) => sum + projection.montant_mobilise, 0) || 0;

  if (isLoadingPrevisions || isLoadingEngagements || isLoadingOperations || isLoadingMinistries) {
    return <PageLoadingSpinner message="Chargement des prévisions CP..." />;
  }

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

      {/* Alerts */}
      {alerts.length > 0 && (
        <DashboardSection>
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.variant}>
              <alert.icon className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </DashboardSection>
      )}

      <DashboardSection>
        <DashboardGrid columns={4}>
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
            icon={<Check className="h-4 w-4" />}
          />
          <StatCard
            title="CP En Attente"
            value={formatCurrency(totalPending)}
            description="Prévisions en attente"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="CP Mobilisés"
            value={formatCurrency(totalMobilized)}
            description="Crédits déjà mobilisés"
            icon={<Calendar className="h-4 w-4" />}
          />
        </DashboardGrid>
      </DashboardSection>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtrer les prévisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="prevision-search-filter" className="mb-2 block">
                Recherche
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prevision-search-filter"
                  placeholder="Rechercher par engagement ou opération..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="prevision-year-filter" className="mb-2 block">
                Année
              </Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger id="prevision-year-filter" className="w-[120px]">
                  <SelectValue placeholder="Année" />
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
            <div>
              <Label htmlFor="prevision-trimester-filter" className="mb-2 block">
                Trimestre
              </Label>
              <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
                <SelectTrigger id="prevision-trimester-filter" className="w-[140px]">
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
            <div>
              <Label htmlFor="prevision-status-filter" className="mb-2 block">
                Statut
              </Label>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger id="prevision-status-filter" className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="prévu">Prévu</SelectItem>
                  <SelectItem value="demandé">Demandé</SelectItem>
                  <SelectItem value="mobilisé">Mobilisé</SelectItem>
                  <SelectItem value="en retard">En retard</SelectItem>
                  <SelectItem value="partiellement mobilisé">Partiellement mobilisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DashboardSection>
        <Tabs defaultValue="list" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list" onClick={() => setViewMode("list")}>
                Liste
              </TabsTrigger>
              <TabsTrigger value="chart" onClick={() => setViewMode("chart")}>
                Graphiques
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="animate-fade-in">
            <DataLoadingWrapper isLoading={loading}>
              {paginatedPrevisionsCP.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left text-sm font-medium">Engagement</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Période</th>
                        <th className="py-3 px-4 text-right text-sm font-medium">Montant prévu</th>
                        <th className="py-3 px-4 text-right text-sm font-medium">Montant mobilisé</th>
                        <th className="py-3 px-4 text-center text-sm font-medium">Statut</th>
                        <th className="py-3 px-4 text-center text-sm font-medium">Progression</th>
                        <th className="py-3 px-4 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPrevisionsCP.map((prevision) => (
                        <tr key={prevision.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{prevision.engagement_name}</div>
                              <div className="text-xs text-muted-foreground">{prevision.operation_name}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {prevision.exercice} - {prevision.periode}
                            </div>
                            {prevision.date_prevu && (
                              <div className="text-xs text-muted-foreground">{format(new Date(prevision.date_prevu), "dd/MM/yyyy")}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">{formatCurrency(prevision.montant_prevu)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(prevision.montant_mobilise || 0)}</td>
                          <td className="py-3 px-4 text-center">{getStatusBadgeVariant(prevision.statut)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={getMobilizationPercentage(prevision.montant_prevu, prevision.montant_mobilise || 0)} className="h-2" />
                              <span className="text-xs">{getMobilizationPercentage(prevision.montant_prevu, prevision.montant_mobilise || 0)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleViewPrevision(prevision)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditPrevision(prevision)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (window.confirm(t("PrevisionsCP.confirmDelete"))) {
                                    handleDeletePrevision(prevision.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

              {/* Pagination Controls */}
              {filteredPrevisionsCP.length > 0 && (
                <div className="flex items-center justify-between px-2 py-4 mt-4">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Affichage de {paginatedPrevisionsCP.length > 0 ? currentPage * itemsPerPage + 1 : 0} à{" "}
                    {Math.min((currentPage + 1) * itemsPerPage, filteredPrevisionsCP.length)} sur {filteredPrevisionsCP.length} prévisions
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    {/* Items per page */}
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Éléments par page</p>
                      <Select
                        value={String(itemsPerPage)}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(0); // Reset to first page when changing items per page
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 30, 50, 100].map((pageSize) => (
                            <SelectItem key={pageSize} value={String(pageSize)}>
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Page info */}
                    <div className="flex items-center text-sm font-medium">
                      Page {currentPage + 1} sur {Math.max(1, Math.ceil(filteredPrevisionsCP.length / itemsPerPage))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(0)}
                        disabled={currentPage === 0}
                        title="Première page"
                      >
                        <span className="sr-only">Aller à la première page</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m11 17-5-5 5-5"></path>
                          <path d="m18 17-5-5 5-5"></path>
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(currentPage > 0 ? currentPage - 1 : 0)}
                        disabled={currentPage === 0}
                        title="Page précédente"
                      >
                        <span className="sr-only">Aller à la page précédente</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m15 18-6-6 6-6"></path>
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const lastPage = Math.max(0, Math.ceil(filteredPrevisionsCP.length / itemsPerPage) - 1);
                          setCurrentPage(currentPage < lastPage ? currentPage + 1 : lastPage);
                        }}
                        disabled={currentPage >= Math.ceil(filteredPrevisionsCP.length / itemsPerPage) - 1}
                        title="Page suivante"
                      >
                        <span className="sr-only">Aller à la page suivante</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const lastPage = Math.max(0, Math.ceil(filteredPrevisionsCP.length / itemsPerPage) - 1);
                          setCurrentPage(lastPage);
                        }}
                        disabled={currentPage >= Math.ceil(filteredPrevisionsCP.length / itemsPerPage) - 1}
                        title="Dernière page"
                      >
                        <span className="sr-only">Aller à la dernière page</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m13 17 5-5-5-5"></path>
                          <path d="m6 17 5-5-5-5"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DataLoadingWrapper>
          </TabsContent>

          <TabsContent value="chart" className="animate-fade-in">
            <BlurLoader isLoading={loading}>
              <PrevisionCPChart previsionsCP={previsionsCP} />
            </BlurLoader>
          </TabsContent>
        </Tabs>
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

      {/* View Prevision Dialog */}
      <Dialog open={isViewPrevisionOpen} onOpenChange={setIsViewPrevisionOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl flex items-center gap-2">
                  Prévision CP {selectedPrevision?.exercice} - {selectedPrevision?.periode}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {selectedPrevision?.engagement_name} ({selectedPrevision?.operation_name})
                </DialogDescription>
              </div>
              {selectedPrevision && getStatusBadgeVariant(selectedPrevision.statut)}
            </div>
          </DialogHeader>

          {selectedPrevision && (
            <div className="py-6 space-y-8">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <BlurLoader isLoading={loading}>
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Montant prévu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(selectedPrevision.montant_prevu || 0)}</div>
                    </CardContent>
                  </Card>
                </BlurLoader>
                <BlurLoader isLoading={loading}>
                  <Card className="border-l-4 border-l-secondary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Montant demandé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(selectedPrevision.montant_demande || 0)}</div>
                    </CardContent>
                  </Card>
                </BlurLoader>
                <BlurLoader isLoading={loading}>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Montant mobilisé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(selectedPrevision.montant_mobilise || 0)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getMobilizationPercentage(selectedPrevision.montant_prevu, selectedPrevision.montant_mobilise || 0)}% du prévu
                      </div>
                    </CardContent>
                  </Card>
                </BlurLoader>
                <BlurLoader isLoading={loading}>
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Montant consommé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(selectedPrevision.montant_consomme || 0)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getConsumptionPercentage(selectedPrevision.montant_mobilise || 0, selectedPrevision.montant_consomme || 0)}% du mobilisé
                      </div>
                    </CardContent>
                  </Card>
                </BlurLoader>
              </div>

              {/* Progress visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progression de la mobilisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="flex flex-col items-center">
                      <div className="w-40 h-40 relative flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 dark:text-gray-700 stroke-current"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-primary stroke-current"
                            strokeWidth="10"
                            strokeDasharray={`${Math.round(
                              ((selectedPrevision.montant_mobilise || 0) / (selectedPrevision.montant_prevu || 1)) * 100 * 2.51
                            )} 251.2`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xl font-bold">
                            {getMobilizationPercentage(selectedPrevision.montant_prevu, selectedPrevision.montant_mobilise || 0)}%
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium">Mobilisation</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-40 h-40 relative flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 dark:text-gray-700 stroke-current"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-secondary stroke-current"
                            strokeWidth="10"
                            strokeDasharray={`${Math.round(
                              ((selectedPrevision.montant_consomme || 0) / (selectedPrevision.montant_mobilise || 1)) * 100 * 2.51
                            )} 251.2`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xl font-bold">
                            {getConsumptionPercentage(selectedPrevision.montant_mobilise || 0, selectedPrevision.montant_consomme || 0)}%
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium">Consommation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline/Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chronologie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="w-px h-full bg-gray-300 dark:bg-gray-600"></div>
                      </div>
                      <div className="pb-6">
                        <p className="font-medium">Prévision créée</p>
                        <p className="text-sm text-muted-foreground">
                          Date: {selectedPrevision.date_prevu ? format(new Date(selectedPrevision.date_prevu), "dd/MM/yyyy") : "Non définie"}
                        </p>
                        <p className="text-sm">Montant prévu: {formatCurrency(selectedPrevision.montant_prevu)}</p>
                      </div>
                    </div>

                    {selectedPrevision.date_demande && (
                      <div className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="w-px h-full bg-gray-300 dark:bg-gray-600"></div>
                        </div>
                        <div className="pb-6">
                          <p className="font-medium">Demande de mobilisation</p>
                          <p className="text-sm text-muted-foreground">Date: {format(new Date(selectedPrevision.date_demande), "dd/MM/yyyy")}</p>
                          <p className="text-sm">Montant demandé: {formatCurrency(selectedPrevision.montant_demande || 0)}</p>
                        </div>
                      </div>
                    )}

                    {selectedPrevision.date_mobilise && (
                      <div className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <Check className="h-5 w-5" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Mobilisation effectuée</p>
                          <p className="text-sm text-muted-foreground">Date: {format(new Date(selectedPrevision.date_mobilise), "dd/MM/yyyy")}</p>
                          <p className="text-sm">Montant mobilisé: {formatCurrency(selectedPrevision.montant_mobilise || 0)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes and Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations supplémentaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Détails de l'engagement</h3>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>Engagement:</strong> {selectedPrevision.engagement_name}
                        </li>
                        <li>
                          <strong>Opération:</strong> {selectedPrevision.operation_name}
                        </li>
                        <li>
                          <strong>Programme:</strong> {selectedPrevision.programme_name}
                        </li>
                        <li>
                          <strong>Ministère:</strong> {selectedPrevision.ministere_name}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Notes</h3>
                      <div className="p-3 border rounded-md text-sm">{selectedPrevision.notes || "Aucune note disponible pour cette prévision."}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              variant="outline"
              disabled={generatingPdf}
              onClick={() => {
                setGeneratingPdf(true);
                // Simulate PDF generation with a delay
                setTimeout(() => {
                  setGeneratingPdf(false);
                  setIsPdfPreviewOpen(true);

                  toast({
                    title: "Rapport généré",
                    description: "Le rapport détaillé de la prévision a été généré avec succès",
                  });
                }, 1500);
              }}
            >
              {generatingPdf ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Génération en cours...
                </>
              ) : (
                <>Générer un rapport</>
              )}
            </Button>
            <Button onClick={() => setIsViewPrevisionOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rapport détaillé - Prévision CP</DialogTitle>
            <DialogDescription>Aperçu du rapport détaillé pour la prévision de l'engagement {selectedPrevision?.engagement_name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mock PDF Preview */}
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Rapport de Prévision CP</h1>
                <p className="text-lg">{selectedPrevision?.engagement_name}</p>
                <p className="text-muted-foreground">
                  Année Fiscale {selectedPrevision?.exercice} - {selectedPrevision?.periode}
                </p>
                <p className="text-muted-foreground">Généré le {new Date().toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Informations générales</h2>
                  <p>
                    <strong>Opération:</strong> {selectedPrevision?.operation_name}
                  </p>
                  <p>
                    <strong>Programme:</strong> {selectedPrevision?.programme_name}
                  </p>
                  <p>
                    <strong>Ministère:</strong> {selectedPrevision?.ministere_name}
                  </p>
                  <p>
                    <strong>Statut:</strong> {selectedPrevision?.statut}
                  </p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Montants</h2>
                  <p>
                    <strong>Montant prévu:</strong> {formatCurrency(selectedPrevision?.montant_prevu || 0)}
                  </p>
                  <p>
                    <strong>Montant demandé:</strong> {formatCurrency(selectedPrevision?.montant_demande || 0)}
                  </p>
                  <p>
                    <strong>Montant mobilisé:</strong> {formatCurrency(selectedPrevision?.montant_mobilise || 0)}
                  </p>
                  <p>
                    <strong>Montant consommé:</strong> {formatCurrency(selectedPrevision?.montant_consomme || 0)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Progression</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1">
                      Mobilisation: {getMobilizationPercentage(selectedPrevision?.montant_prevu || 0, selectedPrevision?.montant_mobilise || 0)}%
                    </p>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{
                          width: `${getMobilizationPercentage(selectedPrevision?.montant_prevu || 0, selectedPrevision?.montant_mobilise || 0)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1">
                      Consommation: {getConsumptionPercentage(selectedPrevision?.montant_mobilise || 0, selectedPrevision?.montant_consomme || 0)}%
                    </p>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{
                          width: `${getConsumptionPercentage(selectedPrevision?.montant_mobilise || 0, selectedPrevision?.montant_consomme || 0)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Chronologie</h2>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left border-b">Étape</th>
                      <th className="p-2 text-left border-b">Date</th>
                      <th className="p-2 text-right border-b">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Prévision créée</td>
                      <td className="border p-2">
                        {selectedPrevision?.date_prevu ? format(new Date(selectedPrevision.date_prevu), "dd/MM/yyyy") : "Non définie"}
                      </td>
                      <td className="border p-2 text-right">{formatCurrency(selectedPrevision?.montant_prevu || 0)}</td>
                    </tr>
                    {selectedPrevision?.date_demande && (
                      <tr>
                        <td className="border p-2">Demande de mobilisation</td>
                        <td className="border p-2">{format(new Date(selectedPrevision.date_demande), "dd/MM/yyyy")}</td>
                        <td className="border p-2 text-right">{formatCurrency(selectedPrevision?.montant_demande || 0)}</td>
                      </tr>
                    )}
                    {selectedPrevision?.date_mobilise && (
                      <tr>
                        <td className="border p-2">Mobilisation effectuée</td>
                        <td className="border p-2">{format(new Date(selectedPrevision.date_mobilise), "dd/MM/yyyy")}</td>
                        <td className="border p-2 text-right">{formatCurrency(selectedPrevision?.montant_mobilise || 0)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Notes et observations</h2>
                <p className="text-muted-foreground">{selectedPrevision?.notes || "Aucune note disponible pour cette prévision."}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPdfPreviewOpen(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                setIsPdfPreviewOpen(false);
                toast({
                  title: "Rapport téléchargé",
                  description: "Le rapport détaillé a été téléchargé avec succès",
                });
              }}
            >
              Télécharger le PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default PrevisionsCP;
