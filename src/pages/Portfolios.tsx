import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/DashboardComponents";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency } from "@/lib/utils";
import { ChevronRight, FolderPlus, FileEdit, Trash2, Eye, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { usePortfolios, useMinistries, useFiscalYears, usePrograms, usePortfolioMutation } from "@/hooks/supabase";
import { Portfolio, Ministry, FiscalYear, Program } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";

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

export default function PortfoliosPage() {
  const { t } = useTranslation();
  const [portfolioFilter, setPortfolioFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [portfolioNameFilter, setPortfolioNameFilter] = useState(""); // Name filter state
  const [searchInputValue, setSearchInputValue] = useState(""); // Debounced search input
  const [portfolioStatusFilter, setPortfolioStatusFilter] = useState("all"); // Changed default to 'all'
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([]); // New state for filtered portfolios

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedPortfolios, setPaginatedPortfolios] = useState<Portfolio[]>([]);

  const [selectedPortfolio, setSelectedPortfolio] = useState(""); // For dialog view
  const [portfolioPortfolios, setPortfolioPortfolios] = useState<{ [key: string]: string }>({}); // For individual cards
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [programs, setPrograms] = useState([]);
  const [currentFiscalYear, setCurrentFiscalYear] = useState<string>(""); // Current fiscal year ID

  // Modal states
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [isEditPortfolioOpen, setIsEditPortfolioOpen] = useState(false);
  const [isViewPortfolioOpen, setIsViewPortfolioOpen] = useState(false);
  const [isDeletePortfolioOpen, setIsDeletePortfolioOpen] = useState(false);

  // Split form data into individual state variables to improve input responsiveness
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMinistryId, setFormMinistryId] = useState("");
  const [formAllocatedAE, setFormAllocatedAE] = useState<number>(0);
  const [formAllocatedCP, setFormAllocatedCP] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<"draft" | "active" | "archived">("draft");

  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Use our custom React Query hooks with staleTime for improved caching
  const {
    data: portfoliosData = [],
    isLoading: isLoadingPortfolios,
    refetch: refetchPortfolios,
  } = usePortfolios({
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const { data: ministriesData = [], isLoading: isLoadingMinistries } = useMinistries({
    staleTime: 1000 * 60 * 30, // 30 minutes - ministries change less frequently
  });

  const { data: fiscalYearsData = [], isLoading: isLoadingFiscalYears } = useFiscalYears({
    staleTime: 1000 * 60 * 60, // 60 minutes - fiscal years rarely change
  });

  const { data: programsData = [], isLoading: isLoadingPrograms } = usePrograms({
    staleTime: 1000 * 60 * 15, // 15 minutes
    realtime: false, // IMPORTANT: Disable realtime
  });

  // Use mutation hook for portfolio operations
  const portfolioMutation = usePortfolioMutation({
    onSuccess: () => {
      refetchPortfolios();
      toast({
        title: "Succès",
        description: "L'opération a été effectuée avec succès",
      });
    },
  });

  // Memoize the current year value to avoid recreating it on every render
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Process data from the queries
  const processData = useCallback(() => {
    if (isLoadingPortfolios || isLoadingMinistries || isLoadingFiscalYears || isLoadingPrograms) {
      return;
    }

    setLoading(true);

    try {
      // Process fiscal years
      const transformedFiscalYears: FiscalYear[] = fiscalYearsData.map((fy) => ({
        id: fy.id,
        year: fy.year,
        status: fy.status || "draft",
        description: fy.description,
      }));
      setFiscalYears(transformedFiscalYears);

      // Find and set current fiscal year
      const currentFY = transformedFiscalYears.find((fy) => fy.year === currentYear);
      if (currentFY) {
        setCurrentFiscalYear(currentFY.id);
      } else if (transformedFiscalYears.length > 0) {
        setCurrentFiscalYear(transformedFiscalYears[0].id);
      }

      // Set ministries
      setMinistries(ministriesData || []);

      // Process portfolios with program counts
      const mappedPortfolios: Portfolio[] = (portfoliosData || []).map((portfolio) => {
        const portfolioPrograms = programsData.filter((p) => p.portfolio_id === portfolio.id);

        return {
          id: portfolio.id,
          ministry_id: portfolio.ministry_id || "",
          name: portfolio.name || "",
          code: portfolio.code || "",
          allocated_ae: portfolio.allocated_ae || 0,
          allocated_cp: portfolio.allocated_cp || 0,
          status: portfolio.status || "draft",
          description: portfolio.description || "",
          consumedAE: 0, // Calculate these if you have the data
          consumedCP: 0, // Calculate these if you have the data
          programs: portfolioPrograms.length,
        };
      });

      setPortfolios(mappedPortfolios);

      // Initialize portfolioPortfolios if needed and not already set
      if (Object.keys(portfolioPortfolios).length === 0 && mappedPortfolios.length > 0 && transformedFiscalYears.length > 0) {
        const defaultFiscalYearId = currentFY ? currentFY.id : transformedFiscalYears[0]?.id || "";
        const defaultPortfolios: { [key: string]: string } = {};

        mappedPortfolios.forEach((portfolio) => {
          defaultPortfolios[portfolio.id] = defaultFiscalYearId;
        });

        setPortfolioPortfolios(defaultPortfolios);
      }
    } catch (error) {
      console.error("Error processing data:", error);
      toast({
        title: t("common.error"),
        description: t("fiscalYears.fetchError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    isLoadingPortfolios,
    isLoadingMinistries,
    isLoadingFiscalYears,
    isLoadingPrograms,
    fiscalYearsData,
    ministriesData,
    portfoliosData,
    programsData,
    currentYear,
    portfolioPortfolios,
    t,
  ]);

  // Safe function for portfolio fiscal year selection
  const handlePortfolioFiscalYearChange = useCallback((portfolioId: string, fiscalYearId: string) => {
    setPortfolioPortfolios((prev) => ({
      ...prev,
      [portfolioId]: fiscalYearId,
    }));
  }, []);

  // Safe getter function that won't trigger rerenders
  const getPortfolioFiscalYear = useCallback(
    (portfolioId: string) => {
      // If we have a specific fiscal year for this portfolio, return it
      if (portfolioPortfolios[portfolioId]) {
        return portfolioPortfolios[portfolioId];
      }

      // Otherwise fall back to the current fiscal year or the first available
      if (currentFiscalYear) {
        return currentFiscalYear;
      }

      // Last resort
      return fiscalYears[0]?.id || "";
    },
    [portfolioPortfolios, currentFiscalYear, fiscalYears]
  );

  // Filter portfolios based on search and status
  const computeFilteredPortfolios = useCallback(() => {
    // No portfolios or loading, return empty array
    if (portfolios.length === 0) {
      return [];
    }

    let result = [...portfolios];

    // Apply name/code filter if provided
    if (portfolioNameFilter) {
      const searchTerm = portfolioNameFilter.toLowerCase();
      result = result.filter((portfolio) => portfolio.name?.toLowerCase().includes(searchTerm) || portfolio.code?.toLowerCase().includes(searchTerm));
    }

    // Apply status filter if not "all"
    if (portfolioStatusFilter && portfolioStatusFilter !== "all") {
      result = result.filter((portfolio) => portfolio.status === portfolioStatusFilter);
    }

    return result;
  }, [portfolios, portfolioNameFilter, portfolioStatusFilter]);

  // Apply pagination to filtered portfolios
  const computePaginatedPortfolios = useCallback(
    (filtered: Portfolio[]) => {
      const start = currentPage * itemsPerPage;
      const end = start + itemsPerPage;
      return filtered.slice(start, end);
    },
    [currentPage, itemsPerPage]
  );

  // Effect to run data processing once all data is available
  useEffect(() => {
    processData();
  }, [processData]);

  // Effect to update filtered and paginated portfolios
  useEffect(() => {
    const filtered = computeFilteredPortfolios();
    setFilteredPortfolios(filtered);

    const paginated = computePaginatedPortfolios(filtered);
    setPaginatedPortfolios(paginated);

    // Reset to first page if current page exceeds available pages
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage >= totalPages && currentPage > 0 && filtered.length > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [computeFilteredPortfolios, computePaginatedPortfolios, itemsPerPage, currentPage]);

  const getStatusBadge = (status: Program["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400">
            En cours
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
            Terminé
          </Badge>
        );
      case "planned":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-400">
            Planifié
          </Badge>
        );
      default:
        return null;
    }
  };

  // Portfolio modal handlers
  const handleOpenAddPortfolio = () => {
    // Reset form fields
    setFormCode("");
    setFormName("");
    setFormDescription("");
    setFormMinistryId("");
    setFormAllocatedAE(0);
    setFormAllocatedCP(0);
    setFormStatus("draft");

    setIsAddPortfolioOpen(true);
  };

  const handleOpenEditPortfolio = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);

    // Set form fields with portfolio data
    setFormCode(portfolio.code);
    setFormName(portfolio.name);
    setFormDescription(portfolio.description);
    setFormMinistryId(portfolio.ministry_id);
    setFormAllocatedAE(portfolio.allocated_ae);
    setFormAllocatedCP(portfolio.allocated_cp);
    setFormStatus(portfolio.status as "draft" | "active" | "archived");

    setIsEditPortfolioOpen(true);
  };

  const handleOpenViewPortfolio = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);
    setIsViewPortfolioOpen(true);
  };

  const handleOpenDeletePortfolio = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);
    setIsDeletePortfolioOpen(true);
  };

  // CRUD operations for portfolios
  const handleAddPortfolio = async () => {
    try {
      if (!formName || !formMinistryId) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir au moins le nom et le ministère du portefeuille",
          variant: "destructive",
        });
        return;
      }

      await portfolioMutation.mutateAsync({
        type: "INSERT",
        data: {
          name: formName,
          code: formCode,
          ministry_id: formMinistryId,
          allocated_ae: formAllocatedAE || 0,
          allocated_cp: formAllocatedCP || 0,
          status: formStatus,
          description: formDescription,
        },
      });

      toast({
        title: "Succès",
        description: `Le portefeuille "${formName}" a été créé avec succès.`,
      });

      setIsAddPortfolioOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du portefeuille",
        variant: "destructive",
      });
    }
  };

  const handleEditPortfolio = async () => {
    if (!currentPortfolio) return;

    try {
      await portfolioMutation.mutateAsync({
        type: "UPDATE",
        id: currentPortfolio.id,
        data: {
          ministry_id: formMinistryId,
          name: formName,
          code: formCode,
          allocated_ae: formAllocatedAE || 0,
          allocated_cp: formAllocatedCP || 0,
          status: formStatus,
          description: formDescription,
        },
      });

      toast({
        title: "Portefeuille modifié",
        description: `Le portefeuille "${formName}" a été modifié avec succès.`,
      });

      setIsEditPortfolioOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive",
      });
    }
  };

  const handleDeletePortfolio = async () => {
    if (!currentPortfolio) return;

    try {
      await portfolioMutation.mutateAsync({
        type: "DELETE",
        id: currentPortfolio.id,
      });

      toast({
        title: "Succès",
        description: "Portefeuille supprimé",
      });

      setIsDeletePortfolioOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  if (isLoadingPortfolios || isLoadingMinistries || isLoadingFiscalYears) {
    return <PageLoadingSpinner message="Chargement des portefeuilles..." />;
  }

  return (
    <Dashboard>
      <DashboardHeader title="Portefeuille des Programmes" description="Gérez les programmes et leurs actions associées">
        <Button onClick={handleOpenAddPortfolio} className="ml-auto">
          <FolderPlus className="mr-2 h-4 w-4" />
          Nouveau Portefeuille
        </Button>
      </DashboardHeader>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtrer les portefeuilles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="portfolio-name-filter" className="mb-2 block">
                Recherche
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="portfolio-name-filter"
                  placeholder="Rechercher par nom ou code..."
                  value={portfolioNameFilter}
                  onChange={(e) => setPortfolioNameFilter(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>
            <div className="w-full sm:w-[200px]">
              <Label htmlFor="portfolio-status-filter" className="mb-2 block">
                Statut
              </Label>
              <Select value={portfolioStatusFilter} onValueChange={setPortfolioStatusFilter}>
                <SelectTrigger id="portfolio-status-filter" className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DashboardSection>
        <Tabs defaultValue="portfolios" className="w-full">
          <TabsContent value="portfolios" className="animate-fade-in">
            <DashboardGrid columns={2}>
              {paginatedPortfolios.map((portfolio) => (
                <Card key={portfolio.id} className="budget-card transition-all duration-300 hover:shadow-elevation flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg line-clamp-2">{portfolio.name}</CardTitle>
                        </div>
                        <CardDescription className="mt-1 line-clamp-2">{portfolio.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0 items-center">
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-400 whitespace-nowrap"
                        >
                          {portfolio.code}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap",
                            portfolio.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400"
                              : portfolio.status === "archived"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400"
                          )}
                        >
                          {portfolio.status === "active" ? "Actif" : portfolio.status === "archived" ? "Archivé" : "Brouillon"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 flex-grow">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-muted-foreground">Utilisation du budget</span>
                          <span className="text-sm font-medium">
                            {portfolio.allocated_ae > 0 ? Math.round(((portfolio.consumedAE || 0) / portfolio.allocated_ae) * 100) : 0}%
                          </span>
                        </div>
                        <Progress
                          value={portfolio.allocated_ae > 0 ? Math.round(((portfolio.consumedAE || 0) / portfolio.allocated_ae) * 100) : 0}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Budget AE</p>
                          <p className="font-medium">{formatCurrency(portfolio.allocated_ae || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Budget CP</p>
                          <p className="font-medium">{formatCurrency(portfolio.allocated_cp || 0)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Ministère</p>
                          <p className="font-medium">{ministries.filter((ministry) => ministry.id === portfolio.ministry_id)[0]?.name_fr || "—"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Programmes</p>
                          <p className="font-medium">{portfolio?.programs || 0}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center border-t pt-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenViewPortfolio(portfolio)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditPortfolio(portfolio)}>
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeletePortfolio(portfolio)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select
                      value={getPortfolioFiscalYear(portfolio.id)}
                      onValueChange={(value) => handlePortfolioFiscalYearChange(portfolio.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Année fiscale" />
                      </SelectTrigger>
                      <SelectContent>
                        {fiscalYears?.map((fiscalYear) => (
                          <SelectItem key={fiscalYear.id} value={fiscalYear.id}>
                            {"Année " + fiscalYear.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
              ))}
              {filteredPortfolios.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-10">
                  Aucun portefeuille ne correspond aux filtres sélectionnés.
                </div>
              )}
            </DashboardGrid>

            {/* Pagination Controls */}
            {filteredPortfolios.length > 0 && (
              <div className="flex items-center justify-between px-2 py-4 mt-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Affichage de {paginatedPortfolios.length > 0 ? currentPage * itemsPerPage + 1 : 0} à{" "}
                  {Math.min((currentPage + 1) * itemsPerPage, filteredPortfolios.length)} sur {filteredPortfolios.length} portefeuilles
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
                    Page {currentPage + 1} sur {Math.max(1, Math.ceil(filteredPortfolios.length / itemsPerPage))}
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
                        const lastPage = Math.max(0, Math.ceil(filteredPortfolios.length / itemsPerPage) - 1);
                        setCurrentPage(currentPage < lastPage ? currentPage + 1 : lastPage);
                      }}
                      disabled={currentPage >= Math.ceil(filteredPortfolios.length / itemsPerPage) - 1}
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
                        const lastPage = Math.max(0, Math.ceil(filteredPortfolios.length / itemsPerPage) - 1);
                        setCurrentPage(lastPage);
                      }}
                      disabled={currentPage >= Math.ceil(filteredPortfolios.length / itemsPerPage) - 1}
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
          </TabsContent>
        </Tabs>
      </DashboardSection>

      {/* Add Portfolio Dialog */}
      <Dialog open={isAddPortfolioOpen} onOpenChange={setIsAddPortfolioOpen}>
        <DialogContent className="sm:max-w-[500px] md:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau portefeuille</DialogTitle>
            <DialogDescription>Complétez le formulaire pour créer un nouveau portefeuille.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-code" className="text-right">
                Code
              </Label>
              <Input id="portfolio-code" className="col-span-3" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-name" className="text-right">
                Nom
              </Label>
              <Input id="portfolio-name" className="col-span-3" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-ministry" className="text-right">
                Ministère
              </Label>
              <Select value={formMinistryId} onValueChange={(value) => setFormMinistryId(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un ministère" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map((ministry) => (
                    <SelectItem key={ministry.id} value={ministry.id}>
                      {ministry.code + " - " + ministry.name_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-amount-ae" className="text-right">
                Budget AE
              </Label>
              <Input
                id="portfolio-amount-ae"
                type="number"
                className="col-span-3"
                value={formAllocatedAE || ""}
                onChange={(e) => setFormAllocatedAE(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-amount-cp" className="text-right">
                Budget CP
              </Label>
              <Input
                id="portfolio-amount-cp"
                type="number"
                className="col-span-3"
                value={formAllocatedCP || ""}
                onChange={(e) => setFormAllocatedCP(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-status" className="text-right">
                Statut
              </Label>
              <Select value={formStatus} onValueChange={(value: "active" | "archived" | "draft") => setFormStatus(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="portfolio-description"
                className="col-span-3"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPortfolioOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddPortfolio}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit portfolio Dialog */}
      <Dialog open={isEditPortfolioOpen} onOpenChange={setIsEditPortfolioOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le portefeuille</DialogTitle>
            <DialogDescription>Modifiez les détails du portefeuille.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-code" className="text-right">
                Code
              </Label>
              <Input id="edit-portfolio-code" className="col-span-3" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-name" className="text-right">
                Nom
              </Label>
              <Input id="edit-portfolio-name" className="col-span-3" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-ministry" className="text-right">
                Ministère
              </Label>
              <Select value={formMinistryId} onValueChange={(value) => setFormMinistryId(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un ministère" />
                </SelectTrigger>
                <SelectContent>
                  {ministries?.map((ministry) => (
                    <SelectItem key={ministry.id} value={ministry.id}>
                      {ministry.code + " - " + ministry.name_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-amount-ae" className="text-right">
                Budget AE
              </Label>
              <Input
                id="edit-portfolio-amount-ae"
                type="number"
                className="col-span-3"
                value={formAllocatedAE || ""}
                onChange={(e) => setFormAllocatedAE(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-amount-cp" className="text-right">
                Budget CP
              </Label>
              <Input
                id="edit-portfolio-amount-cp"
                type="number"
                className="col-span-3"
                value={formAllocatedCP || ""}
                onChange={(e) => setFormAllocatedCP(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-status" className="text-right">
                Statut
              </Label>
              <Select value={formStatus} onValueChange={(value: "active" | "archived" | "draft") => setFormStatus(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-portfolio-description"
                className="col-span-3"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPortfolioOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditPortfolio}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Portfolio Dialog */}
      <Dialog open={isDeletePortfolioOpen} onOpenChange={setIsDeletePortfolioOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer ce portfolio? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {currentPortfolio && (
            <div className="py-4">
              <p>
                <strong>Nom:</strong> {currentPortfolio.name}
              </p>
              <p>
                <strong>Description:</strong> {currentPortfolio.description}
              </p>
              <p>
                <strong>Budget alloué:</strong> {formatCurrency(currentPortfolio.allocated_ae)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletePortfolioOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePortfolio}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* View Portfolio Dialog */}
      <Dialog open={isViewPortfolioOpen} onOpenChange={setIsViewPortfolioOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl flex items-center gap-2">
                  {currentPortfolio?.name} <span className="text-sm font-normal text-muted-foreground">({currentPortfolio?.code})</span>
                </DialogTitle>
                {currentPortfolio?.description && (
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">{currentPortfolio.description}</DialogDescription>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "ml-2 whitespace-nowrap",
                  currentPortfolio?.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400"
                    : currentPortfolio?.status === "archived"
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-400"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400"
                )}
              >
                {currentPortfolio?.status === "active" ? "Actif" : currentPortfolio?.status === "archived" ? "Archivé" : "Brouillon"}
              </Badge>
            </div>
          </DialogHeader>

          {currentPortfolio && (
            <div className="py-6 space-y-8">
              <div className="flex justify-end">
                <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Année Fiscale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fy1">Année Fiscale 2025</SelectItem>
                    <SelectItem value="fy2">Année Fiscale 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Wrap summary cards with BlurLoader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <BlurLoader isLoading={loading || isLoadingPortfolios}>
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">AE Allouées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(currentPortfolio.allocated_ae || 0)}</div>
                    </CardContent>
                  </Card>
                </BlurLoader>
                <BlurLoader isLoading={loading || isLoadingPortfolios}>
                  <Card className="border-l-4 border-l-secondary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">CP Alloués</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(currentPortfolio.allocated_cp || 0)}</div>
                    </CardContent>
                  </Card>
                </BlurLoader>
                <BlurLoader isLoading={loading || isLoadingPortfolios}>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">AE Consommées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(currentPortfolio.consumedAE || 0)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {currentPortfolio.allocated_ae > 0
                          ? Math.round(((currentPortfolio.consumedAE || 0) / currentPortfolio.allocated_ae) * 100)
                          : 0}
                        % utilisés
                      </div>
                    </CardContent>
                  </Card>
                </BlurLoader>
                <BlurLoader isLoading={loading || isLoadingPortfolios}>
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">CP Consommés</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(currentPortfolio.consumedCP || 0)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {currentPortfolio.allocated_cp > 0
                          ? Math.round(((currentPortfolio.consumedCP || 0) / currentPortfolio.allocated_cp) * 100)
                          : 0}
                        % utilisés
                      </div>
                    </CardContent>
                  </Card>
                </BlurLoader>
              </div>

              {/* Progress Charts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progression de la Consommation</CardTitle>
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
                              ((currentPortfolio.consumedAE || 0) / (currentPortfolio.allocated_ae || 1)) * 100 * 2.51
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
                            {currentPortfolio.allocated_ae > 0
                              ? Math.round(((currentPortfolio.consumedAE || 0) / currentPortfolio.allocated_ae) * 100)
                              : 0}
                            %
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium">Consommation AE</p>
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
                              ((currentPortfolio.consumedCP || 0) / (currentPortfolio.allocated_cp || 1)) * 100 * 2.51
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
                            {currentPortfolio.allocated_cp > 0
                              ? Math.round(((currentPortfolio.consumedCP || 0) / currentPortfolio.allocated_cp) * 100)
                              : 0}
                            %
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium">Consommation CP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Programs Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Programmes associés</CardTitle>
                  <CardDescription>Liste des programmes liés à ce portefeuille pour l'année fiscale sélectionnée</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                          <th className="py-3 px-4 text-left font-medium">Nom</th>
                          <th className="py-3 px-4 text-right font-medium">AE Allouées</th>
                          <th className="py-3 px-4 text-right font-medium">CP Alloués</th>
                          <th className="py-3 px-4 text-center font-medium">Progression</th>
                          <th className="py-3 px-4 text-center font-medium">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programsData
                          .filter((program) => program.portfolio_id === currentPortfolio.id)
                          .map((program) => (
                            <tr key={program.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4">{program.name}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(program.allocated_ae || 0)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(program.allocated_cp || 0)}</td>
                              <td className="py-3 px-4 text-center">
                                {program.allocated_ae > 0 ? Math.round(((program.consumed_ae || 0) / program.allocated_ae) * 100) : 0}%
                              </td>
                              <td className="py-3 px-4 text-center">
                                {program.status === "active" ? "Actif" : program.status === "archived" ? "Archivé" : "Brouillon"}
                              </td>
                            </tr>
                          ))}
                        {programsData.filter((program) => program.portfolio_id === currentPortfolio.id).length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-muted-foreground">
                              Aucun programme associé pour cette année fiscale.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Charts (Placeholder) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Répartition budgétaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border rounded-md p-4">
                      <p className="font-medium mb-2">Répartition par programme</p>
                      <p className="text-sm">[Graphique à venir]</p>
                    </div>
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border rounded-md p-4">
                      <p className="font-medium mb-2">Répartition par action</p>
                      <p className="text-sm">[Graphique à venir]</p>
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
                    description: "Le rapport détaillé a été généré avec succès",
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
            <Button onClick={() => setIsViewPortfolioOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rapport détaillé - {currentPortfolio?.name}</DialogTitle>
            <DialogDescription>Aperçu du rapport détaillé pour l'année fiscale {selectedPortfolio === "fy1" ? "2025" : "2024"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mock PDF Preview */}
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Rapport de Portefeuille</h1>
                <p className="text-lg">
                  {currentPortfolio?.name} ({currentPortfolio?.code})
                </p>
                <p className="text-muted-foreground">Année Fiscale {selectedPortfolio === "fy1" ? "2025" : "2024"}</p>
                <p className="text-muted-foreground">Généré le {new Date().toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Informations générales</h2>
                  <p>
                    <strong>Ministère:</strong> {ministries.find((m) => m.id === currentPortfolio?.ministry_id)?.name_fr}
                  </p>
                  <p>
                    <strong>Statut:</strong>{" "}
                    {currentPortfolio?.status === "active" ? "Actif" : currentPortfolio?.status === "archived" ? "Archivé" : "Brouillon"}
                  </p>
                  <p>
                    <strong>Description:</strong> {currentPortfolio?.description}
                  </p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Budget</h2>
                  <p>
                    <strong>AE Allouées:</strong> {formatCurrency(currentPortfolio?.allocated_ae || 0)}
                  </p>
                  <p>
                    <strong>CP Alloués:</strong> {formatCurrency(currentPortfolio?.allocated_cp || 0)}
                  </p>
                  <p>
                    <strong>AE Consommées:</strong> {formatCurrency(currentPortfolio?.consumedAE || 0)}
                  </p>
                  <p>
                    <strong>CP Consommés:</strong> {formatCurrency(currentPortfolio?.consumedCP || 0)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Consommation budgétaire</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1">
                      AE:{" "}
                      {currentPortfolio?.allocated_ae > 0
                        ? Math.round(((currentPortfolio?.consumedAE || 0) / currentPortfolio?.allocated_ae) * 100)
                        : 0}
                      %
                    </p>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            currentPortfolio?.allocated_ae > 0
                              ? Math.round(((currentPortfolio?.consumedAE || 0) / currentPortfolio?.allocated_ae) * 100)
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1">
                      CP:{" "}
                      {currentPortfolio?.allocated_cp > 0
                        ? Math.round(((currentPortfolio?.consumedCP || 0) / currentPortfolio?.allocated_cp) * 100)
                        : 0}
                      %
                    </p>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{
                          width: `${
                            currentPortfolio?.allocated_cp > 0
                              ? Math.round(((currentPortfolio?.consumedCP || 0) / currentPortfolio?.allocated_cp) * 100)
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Programmes associés</h2>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left border-b">Programme</th>
                      <th className="p-2 text-right border-b">AE Allouées</th>
                      <th className="p-2 text-right border-b">CP Alloués</th>
                      <th className="p-2 text-center border-b">Progression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programsData
                      .filter((program) => program.portfolio_id === currentPortfolio?.id)
                      .map((program) => (
                        <tr key={program.id}>
                          <td className="border p-2">{program.name}</td>
                          <td className="border p-2 text-right">{formatCurrency(program.allocated_ae || 0)}</td>
                          <td className="border p-2 text-right">{formatCurrency(program.allocated_cp || 0)}</td>
                          <td className="border p-2 text-center">
                            {program.allocated_ae > 0 ? Math.round(((program.consumed_ae || 0) / program.allocated_ae) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                    {programsData.filter((p) => p.portfolio_id === currentPortfolio?.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          Aucun programme associé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Notes et observations</h2>
                <p className="text-muted-foreground">
                  Ce rapport présente une synthèse des données budgétaires du portefeuille {currentPortfolio?.name} pour l'année fiscale{" "}
                  {selectedPortfolio === "fy1" ? "2025" : "2024"}. Les données sont issues du Système Intégré de Gestion Budgétaire (SIB).
                </p>
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
}
