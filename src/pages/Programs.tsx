import React, { useEffect, useState, useCallback, FormEvent, useMemo } from "react";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FolderPlus, FileEdit, Trash2, Eye, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
// Replace direct Supabase import with hooks
import { usePrograms, usePortfolios, useMinistries, useFiscalYears, useProgramMutation, useActionsByProgram } from "@/hooks/useSupabaseData";
// Import types from types folder
import { Portfolio, Ministry, FiscalYear, Action, Program } from "@/types/database.types";

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProgramsPage() {
  // State for filters
  const [searchInputValue, setSearchInputValue] = useState("");
  const [programNameFilter, setProgramNameFilter] = useState("");
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Program fiscal year mapping state
  const [programFiscalYears, setProgramFiscalYears] = useState<{ [key: string]: string }>({});

  const [selectedFiscalYearView, setSelectedFiscalYearView] = useState("fy1"); // For view dialog

  // State for modals and current program
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);

  // State for fiscal year mapping
  interface ProgramFiscalYearData {
    year: number;
    allocatedAE: number;
    allocatedCP: number;
    consumedAE: number;
    consumedCP: number;
    progress: number;
  }

  const [programFiscalYearData, setProgramFiscalYearData] = useState<Record<string, Record<string, ProgramFiscalYearData>>>({});

  // Actions state
  const [programActions, setProgramActions] = useState<Record<string, Action[]>>({});

  // State for actions mapping
  interface ActionFiscalYearData {
    allocatedAE: number;
    consumedAE: number;
    progress: number;
  }

  const [actionsFiscalYearData, setActionsFiscalYearData] = useState<Record<string, Record<string, ActionFiscalYearData>>>({});

  // Use action by program hook
  const { data: currentActions = [] } = useActionsByProgram(currentProgram?.id || null);

  useEffect(() => {
    if (currentProgram?.id && currentActions.length > 0) {
      setProgramActions((prev) => ({
        ...prev,
        [currentProgram.id]: currentActions,
      }));
    }
  }, [currentProgram?.id, currentActions]);

  // Helper to get actions for a program
  const getProgramActions = (programId: string): Action[] => {
    return programActions[programId] || [];
  };

  // Update fiscal year data when program or fiscal year changes
  useEffect(() => {
    const fetchFiscalYearData = async (programId: string, fiscalYearId: string) => {
      // Here you would fetch the actual fiscal year data from your database
      // For now, we'll use dummy data
      setProgramFiscalYearData((prev) => ({
        ...prev,
        [programId]: {
          ...prev[programId],
          [fiscalYearId]: {
            year: new Date().getFullYear(),
            allocatedAE: 0,
            allocatedCP: 0,
            consumedAE: 0,
            consumedCP: 0,
            progress: 0,
          },
        },
      }));
    };

    // Fetch data for each program-fiscal year combination
    Object.entries(programFiscalYears).forEach(([programId, fiscalYearId]) => {
      fetchFiscalYearData(programId, fiscalYearId);
    });
  }, [programFiscalYears]);

  // Helper to get fiscal year data for a program
  const getFiscalYearData = (programId: string, fiscalYearId: string): ProgramFiscalYearData => {
    return (
      programFiscalYearData[programId]?.[fiscalYearId] || {
        year: new Date().getFullYear(),
        allocatedAE: 0,
        allocatedCP: 0,
        consumedAE: 0,
        consumedCP: 0,
        progress: 0,
      }
    );
  };

  // Helper to get fiscal year data for an action
  const getActionFiscalYearData = (actionId: string, fiscalYearId: string): ActionFiscalYearData => {
    return (
      actionsFiscalYearData[actionId]?.[fiscalYearId] || {
        allocatedAE: 0,
        consumedAE: 0,
        progress: 0,
      }
    );
  };

  // Form state using a single object to improve input responsiveness
  const [formData, setFormData] = useState<Partial<Program>>({
    code: "",
    name: "",
    description: "",
    portfolio_id: "",
    parent_id: null,
    type: undefined,
    status: undefined,
    allocated_ae: undefined,
    allocated_cp: undefined,
  });

  // Use React Query hooks for data fetching
  const { data: rawPrograms = [], isLoading: isLoadingPrograms, refetch: refetchPrograms } = usePrograms();
  const programs = rawPrograms as unknown as Program[];

  const { data: portfolios = [], isLoading: isLoadingPortfolios } = usePortfolios();

  const { data: ministries = [], isLoading: isLoadingMinistries } = useMinistries();

  const { data: fiscalYears = [], isLoading: isLoadingFiscalYears } = useFiscalYears();

  // Use mutation hooks for data changes
  const programMutation = useProgramMutation({
    onSuccess: () => {
      refetchPrograms();
      toast({
        title: "Success",
        description: "The operation was completed successfully",
      });
    },
  });

  // Initialize fiscal years only once when programs or fiscal years change
  useEffect(() => {
    if (!fiscalYears.length || !programs.length) return;

    const now = new Date().getFullYear();
    const currentFiscalYear = fiscalYears.find((fy) => fy.year === now);
    const defaultFiscalYearId = currentFiscalYear ? currentFiscalYear.id : fiscalYears[0]?.id || "";
    const defaultPrograms: { [key: string]: string } = {};

    programs.forEach((program) => {
      if (!programFiscalYears[program.id]) {
        defaultPrograms[program.id] = defaultFiscalYearId;
      }
    });

    if (Object.keys(defaultPrograms).length > 0) {
      setProgramFiscalYears((prev) => ({
        ...prev,
        ...defaultPrograms,
      }));
    }
  }, [fiscalYears, programs, programFiscalYears]);

  // Debounced search with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgramNameFilter(searchInputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // Programs filtering with useMemo
  const filteredPrograms = useMemo(() => {
    let result = programs;

    if (programNameFilter) {
      result = result.filter(
        (program) =>
          program.name.toLowerCase().includes(programNameFilter.toLowerCase()) || program.code.toLowerCase().includes(programNameFilter.toLowerCase())
      );
    }

    if (portfolioFilter && portfolioFilter !== "all") {
      result = result.filter((program) => program.portfolio_id === portfolioFilter);
    }

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((program) => program.status === statusFilter);
    }

    return result;
  }, [programs, programNameFilter, portfolioFilter, statusFilter]);

  // Paginated programs with useMemo
  const paginatedPrograms = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredPrograms.slice(start, end);
  }, [filteredPrograms, currentPage, itemsPerPage]);

  // --- Helper Functions ---

  const getProgramFiscalYear = (programId: string) => {
    const now = new Date().getFullYear();
    const currentFiscalYear = fiscalYears.find((fy) => fy.year === now);
    const defaultFiscalYearId = currentFiscalYear ? currentFiscalYear.id : fiscalYears[0]?.id || "";
    return programFiscalYears[programId] || defaultFiscalYearId;
  };

  const setProgramFiscalYear = (programId: string, fiscalYearId: string) => {
    setProgramFiscalYears((prev) => ({
      ...prev,
      [programId]: fiscalYearId,
    }));
  };

  const getStatusBadge = (status: Program["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400 whitespace-nowrap">
            Actif
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-400 whitespace-nowrap">
            Archivé
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400 whitespace-nowrap"
          >
            Brouillon
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPortfolioName = (portfolioId: string) => {
    return portfolios.find((p) => p.id === portfolioId)?.name || "N/A";
  };

  const getParentProgramName = (parentId?: string | null) => {
    if (!parentId) return null;
    return programs.find((p) => p.id === parentId)?.name || "N/A";
  };

  const getProgramTypeLabel = (type: Program["type"]) => {
    switch (type) {
      case "program":
        return "Programme";
      case "subprogram":
        return "Sous-Programme";
      case "dotation":
        return "Dotation";
      default:
        return type;
    }
  };

  // --- Modal Handlers ---

  const handleOpenAddDialog = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      portfolio_id: "",
      parent_id: null,
      type: undefined,
      status: undefined,
      allocated_ae: undefined,
      allocated_cp: undefined,
    });

    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (program: Program) => {
    setCurrentProgram(program);
    // Find the data for the default fiscal year (e.g., 2024 or first available)
    const defaultFyId = getProgramFiscalYear(program.id);

    setFormData({
      code: program.code,
      name: program.name,
      description: program.description,
      portfolio_id: program.portfolio_id,
      parent_id: program.parent_id,
      type: program.type,
      status: program.status,
      allocated_ae: program.allocated_ae || 0,
      allocated_cp: program.allocated_cp || 0,
    });

    setIsEditDialogOpen(true);
  };

  const handleOpenViewDialog = (program: Program) => {
    setCurrentProgram(program);
    // Reset view dialog fiscal year to the default for the selected program
    const defaultFyId = getProgramFiscalYear(program.id);
    setSelectedFiscalYearView(defaultFyId || fiscalYears[0]?.id || ""); // Ensure a default if none found
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (program: Program) => {
    setCurrentProgram(program);
    setIsDeleteDialogOpen(true);
  };

  // --- CRUD Operations ---

  const handleAddProgram = async (e: FormEvent) => {
    e.preventDefault();
    const { name, code, portfolio_id, type, status } = formData;

    if (!name || !code || !portfolio_id || !type || !status) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis (Nom, Code, Portefeuille, Type, Statut).",
        variant: "destructive",
      });
      return;
    }

    try {
      await programMutation.mutateAsync({
        type: "INSERT",
        data: {
          name: formData.name,
          code: formData.code,
          description: formData.description || "",
          portfolio_id: formData.portfolio_id,
          parent_id: formData.parent_id,
          type: formData.type as Program["type"],
          status: formData.status as Program["status"],
          allocated_ae: formData.allocated_ae || 0,
          allocated_cp: formData.allocated_cp || 0,
        },
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding program:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du programme. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleEditProgram = async (e: FormEvent) => {
    e.preventDefault();
    const { name, code, portfolio_id, type, status } = formData;

    if (!currentProgram || !name || !code || !portfolio_id || !type || !status) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis (Nom, Code, Portefeuille, Type, Statut).",
        variant: "destructive",
      });
      return;
    }

    try {
      await programMutation.mutateAsync({
        type: "UPDATE",
        id: currentProgram.id,
        data: {
          name: formData.name,
          code: formData.code,
          description: formData.description || "",
          portfolio_id: formData.portfolio_id,
          parent_id: formData.parent_id,
          type: formData.type as Program["type"],
          status: formData.status as Program["status"],
          allocated_ae: formData.allocated_ae || 0,
          allocated_cp: formData.allocated_cp || 0,
        },
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating program:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du programme. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProgram = async () => {
    if (!currentProgram) return;

    try {
      await programMutation.mutateAsync({
        type: "DELETE",
        id: currentProgram.id,
      });

      // Clean up fiscal year state
      setProgramFiscalYears((prev) => {
        const newState = { ...prev };
        delete newState[currentProgram.id];
        return newState;
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du programme. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Filter programs for the parent dropdown (exclude the current program being edited)
  const availableParentPrograms = programs.filter((p) => p.id !== currentProgram?.id);

  if (isLoadingPrograms || isLoadingPortfolios || isLoadingMinistries || isLoadingFiscalYears) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des programmes...</span>
      </div>
    );
  }

  return (
    <Dashboard>
      {/* Updated Header */}
      <DashboardHeader title="Liste des Programmes" description="Gérez les programmes, sous-programmes et dotations.">
        <Button onClick={handleOpenAddDialog} className="ml-auto">
          <FolderPlus className="mr-2 h-4 w-4" />
          Nouveau Programme/Dotation
        </Button>
      </DashboardHeader>

      {/* Filter Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtrer les éléments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Name Filter */}
            <div>
              <Label htmlFor="program-name-filter" className="mb-2 block">
                Recherche (Nom/Code)
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="program-name-filter"
                  placeholder="Rechercher par nom ou code..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>
            {/* Portfolio Filter */}
            <div>
              <Label htmlFor="program-portfolio-filter" className="mb-2 block">
                Portefeuille
              </Label>
              <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
                <SelectTrigger id="program-portfolio-filter" className="w-full">
                  <SelectValue placeholder="Sélectionner un portefeuille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les portefeuilles</SelectItem>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name} ({portfolio.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Status Filter */}
            <div>
              <Label htmlFor="program-status-filter" className="mb-2 block">
                Statut
              </Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger id="program-status-filter" className="w-full">
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
        {/* Removed Tabs wrapper */}
        <DashboardGrid columns={2}>
          {paginatedPrograms.map((program) => {
            const selectedFyId = getProgramFiscalYear(program.id);
            const fiscalYearData = getFiscalYearData(program.id, selectedFyId);
            const allocatedAE = fiscalYearData.allocatedAE || program.allocated_ae || 0;
            const consumedAE = fiscalYearData.consumedAE || 0;
            const progress = fiscalYearData.progress || 0;
            const portfolioName = getPortfolioName(program.portfolio_id);
            const parentName = getParentProgramName(program.parent_id);

            return (
              <Card key={program.id} className="budget-card transition-all duration-300 hover:shadow-lg flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Ensure title/desc don't overflow */}
                      <CardTitle className="text-lg flex items-center gap-2 truncate">
                        <span className="truncate">{program.name}</span>
                        <span className="text-sm font-normal text-muted-foreground flex-shrink-0">({program.code})</span>
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{program.description}</CardDescription>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        <span>{getProgramTypeLabel(program.type)}</span>
                        {parentName && <span> / Parent: {parentName}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(program.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  {" "}
                  {/* Increased padding, flex-grow */}
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Progression ({fiscalYearData?.year || "N/A"})</span>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            progress < 40 ? "text-red-600" : progress < 70 ? "text-yellow-600" : "text-green-600" // Consistent colors
                          )}
                        >
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* AE/CP Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Budget AE</p>
                        <p className="font-medium">{formatCurrency(allocatedAE)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">AE Consommé</p>
                        <p className="font-medium">{formatCurrency(consumedAE)}</p>
                      </div>
                    </div>

                    {/* Portfolio Info */}
                    <div className="grid grid-cols-1 gap-1">
                      {" "}
                      {/* Single column for portfolio */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Portefeuille</p>
                        <p className="font-medium truncate">{portfolioName}</p> {/* Added truncate */}
                      </div>
                      {/* Add other info like CP if needed */}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  {" "}
                  {/* Added border-t and padding */}
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenViewDialog(program)} title="Voir les détails">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(program)} title="Modifier">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(program)} title="Supprimer">
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                  {/* Fiscal Year Selector */}
                  <Select value={getProgramFiscalYear(program.id)} onValueChange={(value) => setProgramFiscalYear(program.id, value)}>
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
            );
          })}
          {filteredPrograms.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">Aucun programme ne correspond aux filtres sélectionnés.</div>
          )}
        </DashboardGrid>

        {/* Pagination Controls */}
        {filteredPrograms.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 mt-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              {filteredPrograms.length > 0
                ? `Affichage de ${currentPage * itemsPerPage + 1} à ${Math.min((currentPage + 1) * itemsPerPage, filteredPrograms.length)} sur ${filteredPrograms.length} programmes`
                : "Aucun programme trouvé"}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Items per page */}
              <div className="flex items-center gap-2">
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

              {/* Page info and navigation buttons */}
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium">
                  Page {currentPage + 1} sur {Math.max(1, Math.ceil(filteredPrograms.length / itemsPerPage))}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    title="Première page"
                  >
                    <span className="sr-only">Première page</span>
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
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(currentPage > 0 ? currentPage - 1 : 0)}
                    disabled={currentPage === 0}
                    title="Page précédente"
                  >
                    <span className="sr-only">Page précédente</span>
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
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const lastPage = Math.max(0, Math.ceil(filteredPrograms.length / itemsPerPage) - 1);
                      setCurrentPage(currentPage < lastPage ? currentPage + 1 : lastPage);
                    }}
                    disabled={currentPage >= Math.ceil(filteredPrograms.length / itemsPerPage) - 1}
                    title="Page suivante"
                  >
                    <span className="sr-only">Page suivante</span>
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
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const lastPage = Math.max(0, Math.ceil(filteredPrograms.length / itemsPerPage) - 1);
                      setCurrentPage(lastPage);
                    }}
                    disabled={currentPage >= Math.ceil(filteredPrograms.length / itemsPerPage) - 1}
                    title="Dernière page"
                  >
                    <span className="sr-only">Dernière page</span>
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
          </div>
        )}
      </DashboardSection>

      {/* Add Program Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau programme</DialogTitle>
            <DialogDescription>Créez un nouveau programme, sous-programme ou dotation.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProgram}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-name">Nom</Label>
                  <Input
                    id="form-name"
                    placeholder="Nom du programme"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form-code">Code</Label>
                  <Input
                    id="form-code"
                    placeholder="Code du programme"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  placeholder="Description du programme"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-portfolio">Portefeuille</Label>
                  <Select value={formData?.portfolio_id} onValueChange={(value) => setFormData({ ...formData, portfolio_id: value })} required>
                    <SelectTrigger id="form-portfolio">
                      <SelectValue placeholder="Sélectionner un portefeuille" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolios?.map((portfolio) => (
                        <SelectItem key={portfolio.id} value={portfolio.id}>
                          {portfolio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form-parent">Programme parent (optionnel)</Label>
                  <Select value={formData.parent_id || ""} onValueChange={(value) => setFormData({ ...formData, parent_id: value || null })}>
                    <SelectTrigger id="form-parent">
                      <SelectValue placeholder="Sélectionner un parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Aucun (programme principal)</SelectItem>
                      {availableParentPrograms
                        ?.filter((p) => p.type === "program") // Only programs can be parents
                        .map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-type">Type</Label>
                  <Select value={formData?.type} onValueChange={(value) => setFormData({ ...formData, type: value as Program["type"] })} required>
                    <SelectTrigger id="form-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="program">Programme</SelectItem>
                      <SelectItem value="subprogram">Sous-Programme</SelectItem>
                      <SelectItem value="dotation">Dotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form-status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Program["status"] })}
                    required
                  >
                    <SelectTrigger id="form-status">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-ae">Budget AE</Label>
                  <Input
                    id="form-ae"
                    type="number"
                    placeholder="Budget AE"
                    value={formData.allocated_ae || ""}
                    onChange={(e) => setFormData({ ...formData, allocated_ae: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form-cp">Budget CP</Label>
                  <Input
                    id="form-cp"
                    type="number"
                    placeholder="Budget CP"
                    value={formData.allocated_cp || ""}
                    onChange={(e) => setFormData({ ...formData, allocated_cp: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={programMutation.isPending}>
                {programMutation.isPending ? "Création en cours..." : "Créer programme"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le programme</DialogTitle>
            <DialogDescription>Modifiez les détails du programme.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProgram}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-form-name">Nom</Label>
                  <Input
                    id="edit-form-name"
                    placeholder="Nom du programme"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-form-code">Code</Label>
                  <Input
                    id="edit-form-code"
                    placeholder="Code du programme"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-form-description">Description</Label>
                <Textarea
                  id="edit-form-description"
                  placeholder="Description du programme"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-form-portfolio">Portefeuille</Label>
                  <Select value={formData?.portfolio_id} onValueChange={(value) => setFormData({ ...formData, portfolio_id: value })} required>
                    <SelectTrigger id="edit-form-portfolio">
                      <SelectValue placeholder="Sélectionner un portefeuille" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolios?.map((portfolio) => (
                        <SelectItem key={portfolio.id} value={portfolio.id}>
                          {portfolio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-form-parent">Programme parent (optionnel)</Label>
                  <Select value={formData.parent_id || ""} onValueChange={(value) => setFormData({ ...formData, parent_id: value || null })}>
                    <SelectTrigger id="edit-form-parent">
                      <SelectValue placeholder="Sélectionner un parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Aucun (programme principal)</SelectItem>
                      {availableParentPrograms
                        ?.filter((p) => p.type === "program") // Only programs can be parents
                        .map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-form-type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Program["type"] })} required>
                    <SelectTrigger id="edit-form-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="program">Programme</SelectItem>
                      <SelectItem value="subprogram">Sous-Programme</SelectItem>
                      <SelectItem value="dotation">Dotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-form-status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Program["status"] })}
                    required
                  >
                    <SelectTrigger id="edit-form-status">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-form-ae">Budget AE</Label>
                  <Input
                    id="edit-form-ae"
                    type="number"
                    placeholder="Budget AE"
                    value={formData.allocated_ae || ""}
                    onChange={(e) => setFormData({ ...formData, allocated_ae: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-form-cp">Budget CP</Label>
                  <Input
                    id="edit-form-cp"
                    type="number"
                    placeholder="Budget CP"
                    value={formData.allocated_cp || ""}
                    onChange={(e) => setFormData({ ...formData, allocated_cp: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={programMutation.isPending}>
                {programMutation.isPending ? "Mise à jour en cours..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le programme "{currentProgram?.name}"? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteProgram} disabled={programMutation.isPending}>
              {programMutation.isPending ? "Suppression en cours..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Program Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{currentProgram?.name}</span>
              <span className="text-sm font-normal text-muted-foreground">({currentProgram?.code})</span>
              {currentProgram && getStatusBadge(currentProgram?.status)}
            </DialogTitle>
            <DialogDescription>{currentProgram?.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Informations générales</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{currentProgram && getProgramTypeLabel(currentProgram.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Portefeuille</p>
                  <p className="font-medium">{currentProgram && getPortfolioName(currentProgram.portfolio_id)}</p>
                </div>
                {currentProgram?.parent_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Programme parent</p>
                    <p className="font-medium">{getParentProgramName(currentProgram.parent_id)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fiscal Year Data */}
            <div className="border-t pt-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Données budgétaires</h3>
                <Select value={selectedFiscalYearView} onValueChange={setSelectedFiscalYearView}>
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
              </div>
              {/* Display budget data for the selected fiscal year */}
              {currentProgram && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Initial AE</p>
                    <p className="font-medium">
                      {formatCurrency(getFiscalYearData(currentProgram.id, selectedFiscalYearView).allocatedAE || currentProgram.allocated_ae || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Initial CP</p>
                    <p className="font-medium">
                      {formatCurrency(getFiscalYearData(currentProgram.id, selectedFiscalYearView).allocatedCP || currentProgram.allocated_cp || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AE Consommé</p>
                    <p className="font-medium">{formatCurrency(getFiscalYearData(currentProgram.id, selectedFiscalYearView).consumedAE || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CP Consommé</p>
                    <p className="font-medium">{formatCurrency(getFiscalYearData(currentProgram.id, selectedFiscalYearView).consumedCP || 0)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Progression</p>
                    <div className="flex justify-between items-center mb-1">
                      <Progress value={getFiscalYearData(currentProgram.id, selectedFiscalYearView).progress || 0} className="h-2 flex-1 mr-3" />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          (getFiscalYearData(currentProgram.id, selectedFiscalYearView).progress || 0) < 40
                            ? "text-red-600"
                            : (getFiscalYearData(currentProgram.id, selectedFiscalYearView).progress || 0) < 70
                              ? "text-yellow-600"
                              : "text-green-600"
                        )}
                      >
                        {getFiscalYearData(currentProgram.id, selectedFiscalYearView).progress || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions section - Show actions that are part of this program */}
            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold mb-3">Actions associées</h3>
              <div className="overflow-auto max-h-[200px] rounded-md border">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Code</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nom</th>
                      <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Budget AE</th>
                      <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Consommé</th>
                      <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Progression</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {currentProgram && getProgramActions(currentProgram.id).length > 0 ? (
                      getProgramActions(currentProgram.id).map((action) => {
                        const actionFiscalYearData = getActionFiscalYearData(action.id, selectedFiscalYearView);

                        return (
                          <tr key={action.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">{action.code}</td>
                            <td className="p-4 align-middle">{action.name}</td>
                            <td className="p-4 align-middle text-right">{formatCurrency(actionFiscalYearData.allocatedAE || 0)}</td>
                            <td className="p-4 align-middle text-right">{formatCurrency(actionFiscalYearData.consumedAE || 0)}</td>
                            <td className="p-4 align-middle text-right">
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  (actionFiscalYearData?.progress || 0) < 40
                                    ? "text-red-600"
                                    : (actionFiscalYearData?.progress || 0) < 70
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                )}
                              >
                                {actionFiscalYearData?.progress || 0}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                          Aucune action associée à ce programme
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
