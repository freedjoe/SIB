import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { ChevronRight, FolderPlus, FileEdit, Trash2, Eye, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Mock data
interface Program {
  id: string;
  portfolioId: string;
  name: string;
  description: string;
  allocatedAmount: number;
  usedAmount: number;
  progress: number;
  actions: number;
  operations: number;
  status: "active" | "completed" | "planned";
}

interface FiscalYearData {
  id: string;
  year: number;
  allocatedAE: number;
  allocatedCP: number;
  consumedAE: number;
  consumedCP: number;
  programs: string[];
}

interface Portfolio {
  id: string;
  ministry_id: string;
  name: string;
  code: string;
  allocated_ae: number;
  allocated_cp: number;
  fiscal_year_id: string;
  status: "draft" | "active" | "archived";
  description: string;
  // Calculated fields (not in database)
  ministryName?: string;
  usedAmount?: number;
  programs?: number;
  consumedAE?: number;
  consumedCP?: number;
  fiscalYears?: FiscalYearData[];
}

interface NewPortfolioData {
  code?: string;
  name?: string;
  description?: string;
  ministry_id?: string;
  ministryName?: string;
  status?: Portfolio["status"];
  allocated_ae?: number;
  allocated_cp?: number;
  fiscal_year_id?: string;
}

const mockPrograms: Program[] = [
  {
    id: "prog1",
    portfolioId: "port1",
    name: "Programme d'Éducation Nationale",
    description: "Amélioration de la qualité de l'éducation à tous les niveaux",
    allocatedAmount: 750000000,
    usedAmount: 480000000,
    progress: 64,
    actions: 8,
    operations: 24,
    status: "active",
  },
  {
    id: "prog2",
    portfolioId: "port2",
    name: "Santé Publique",
    description: "Renforcement du système de santé et lutte contre les maladies",
    allocatedAmount: 580000000,
    usedAmount: 390000000,
    progress: 67,
    actions: 6,
    operations: 18,
    status: "active",
  },
  {
    id: "prog3",
    portfolioId: "port3",
    name: "Infrastructure Routière",
    description: "Construction et entretien du réseau routier national",
    allocatedAmount: 430000000,
    usedAmount: 210000000,
    progress: 49,
    actions: 5,
    operations: 12,
    status: "active",
  },
  {
    id: "prog4",
    portfolioId: "port4",
    name: "Développement Agricole",
    description: "Soutien à l'agriculture et la sécurité alimentaire",
    allocatedAmount: 380000000,
    usedAmount: 145000000,
    progress: 38,
    actions: 7,
    operations: 19,
    status: "active",
  },
  {
    id: "prog5",
    portfolioId: "port5",
    name: "Sécurité Nationale",
    description: "Maintien de l'ordre et protection du territoire",
    allocatedAmount: 410000000,
    usedAmount: 290000000,
    progress: 71,
    actions: 4,
    operations: 16,
    status: "active",
  },
  {
    id: "prog6",
    portfolioId: "port1",
    name: "Numérisation des Écoles",
    description: "Équipement informatique des établissements scolaires",
    allocatedAmount: 120000000,
    usedAmount: 45000000,
    progress: 38,
    actions: 3,
    operations: 8,
    status: "active",
  },
  {
    id: "prog7",
    portfolioId: "port3",
    name: "Pont Intercommunal",
    description: "Construction d'un nouveau pont reliant deux provinces",
    allocatedAmount: 280000000,
    usedAmount: 0,
    progress: 0,
    actions: 4,
    operations: 0,
    status: "planned",
  },
  {
    id: "prog8",
    portfolioId: "port2",
    name: "Campagne de Vaccination",
    description: "Campagne nationale de vaccination contre les épidémies",
    allocatedAmount: 150000000,
    usedAmount: 150000000,
    progress: 100,
    actions: 2,
    operations: 12,
    status: "completed",
  },
];

const mockPortfolios: Portfolio[] = [
  {
    id: "port1",
    ministry_id: "m1",
    code: "PE-001",
    name: "Portfolio Éducation",
    description: "Regroupe tous les programmes éducatifs",
    allocated_ae: 870000000,
    allocated_cp: 750000000,
    fiscal_year_id: "fy1",
    status: "active",
    // Calculated fields
    ministryName: "Ministère de l'Éducation",
    usedAmount: 525000000,
    programs: 2,
    consumedAE: 525000000,
    consumedCP: 480000000,
  },
  {
    id: "port2",
    ministry_id: "m2",
    code: "PS-002",
    name: "Portfolio Santé",
    description: "Programmes de santé publique et prévention",
    allocated_ae: 730000000,
    allocated_cp: 650000000,
    fiscal_year_id: "fy1",
    status: "active",
    // Calculated fields
    ministryName: "Ministère de la Santé",
    usedAmount: 540000000,
    programs: 2,
    consumedAE: 540000000,
    consumedCP: 490000000,
  },
  {
    id: "port3",
    ministry_id: "m3",
    code: "PI-003",
    name: "Portfolio Infrastructure",
    description: "Développement des infrastructures de transport",
    allocated_ae: 710000000,
    allocated_cp: 630000000,
    fiscal_year_id: "fy1",
    status: "active",
    // Calculated fields
    ministryName: "Ministère des Transports",
    usedAmount: 210000000,
    programs: 2,
    consumedAE: 210000000,
    consumedCP: 180000000,
  },
  {
    id: "port4",
    ministry_id: "m4",
    code: "PA-004",
    name: "Portfolio Agriculture",
    description: "Soutien à l'agriculture et l'élevage",
    allocated_ae: 380000000,
    allocated_cp: 340000000,
    fiscal_year_id: "fy1",
    status: "active",
    // Calculated fields
    ministryName: "Ministère de l'Agriculture",
    usedAmount: 145000000,
    programs: 1,
    consumedAE: 145000000,
    consumedCP: 120000000,
  },
  {
    id: "port5",
    ministry_id: "m5",
    code: "PD-005",
    name: "Portfolio Défense",
    description: "Sécurité nationale et protection civile",
    allocated_ae: 410000000,
    allocated_cp: 380000000,
    fiscal_year_id: "fy1",
    status: "archived",
    // Calculated fields
    ministryName: "Ministère de la Défense",
    usedAmount: 290000000,
    programs: 1,
    consumedAE: 290000000,
    consumedCP: 250000000,
  },
];

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
  const [portfolioFilter, setPortfolioFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [portfolioNameFilter, setPortfolioNameFilter] = useState(""); // New state for portfolio name filter
  const [portfolioStatusFilter, setPortfolioStatusFilter] = useState("all"); // Changed default to 'all'
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([]); // New state for filtered portfolios
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("fy1"); // For dialog view
  const [portfolioFiscalYears, setPortfolioFiscalYears] = useState<{ [key: string]: string }>({}); // For individual cards
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);

  // Modal states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [newProgramData, setNewProgramData] = useState<Partial<Program>>({
    status: "planned",
    allocatedAmount: 0,
    usedAmount: 0,
    progress: 0,
    actions: 0,
    operations: 0,
  });
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [isEditPortfolioOpen, setIsEditPortfolioOpen] = useState(false);
  const [isViewPortfolioOpen, setIsViewPortfolioOpen] = useState(false);
  const [isDeletePortfolioOpen, setIsDeletePortfolioOpen] = useState(false);
  const [newPortfolioData, setNewPortfolioData] = useState<NewPortfolioData>({
    allocated_ae: 0,
    allocated_cp: 0,
    status: "draft",
  });
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Set default fiscal year for each portfolio on component mount
  useEffect(() => {
    const defaultFiscalYears: { [key: string]: string } = {};
    portfolios.forEach((portfolio) => {
      // Set fy1 (2024) as default for each portfolio
      defaultFiscalYears[portfolio.id] = "fy1";
    });
    setPortfolioFiscalYears(defaultFiscalYears);
  }, [portfolios]); // Added portfolios to dependency array

  // Initialize filteredPortfolios with all portfolios initially (or based on default filter)
  useEffect(() => {
    const initialPortfolios =
      portfolioStatusFilter === "all" ? portfolios : portfolios.filter((portfolio) => portfolio.status === portfolioStatusFilter);
    setFilteredPortfolios(initialPortfolios);
  }, [portfolios, portfolioStatusFilter]); // Depend on portfolioStatusFilter as well

  // Update the existing useEffect for filtering to depend on portfolios changes
  useEffect(() => {
    let result = portfolios;

    if (portfolioNameFilter) {
      result = result.filter(
        (portfolio) =>
          portfolio.name.toLowerCase().includes(portfolioNameFilter.toLowerCase()) ||
          portfolio.code.toLowerCase().includes(portfolioNameFilter.toLowerCase())
      );
    }

    if (portfolioStatusFilter && portfolioStatusFilter !== "all") {
      result = result.filter((portfolio) => portfolio.status === portfolioStatusFilter);
    }

    setFilteredPortfolios(result);
  }, [portfolioNameFilter, portfolioStatusFilter, portfolios]);

  // Function to get or set fiscal year for a specific portfolio
  const getPortfolioFiscalYear = (portfolioId: string) => {
    return portfolioFiscalYears[portfolioId] || "fy1"; // Default to fy1 if not set
  };

  const setPortfolioFiscalYear = (portfolioId: string, fiscalYearId: string) => {
    setPortfolioFiscalYears((prev) => ({
      ...prev,
      [portfolioId]: fiscalYearId,
    }));
  };

  useEffect(() => {
    let result = programs;

    if (portfolioFilter && portfolioFilter !== "all") {
      result = result.filter((program) => program.portfolioId === portfolioFilter);
    }

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((program) => program.status === statusFilter);
    }

    setFilteredPrograms(result);
  }, [portfolioFilter, statusFilter, programs]);

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

  // Program modal handlers
  const handleOpenAddDialog = () => {
    setNewProgramData({
      status: "planned",
      allocatedAmount: 0,
      usedAmount: 0,
      progress: 0,
      actions: 0,
      operations: 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (program: Program) => {
    setCurrentProgram(program);
    setNewProgramData({
      name: program.name,
      description: program.description,
      portfolioId: program.portfolioId,
      allocatedAmount: program.allocatedAmount,
      usedAmount: program.usedAmount,
      progress: program.progress,
      actions: program.actions,
      operations: program.operations,
      status: program.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenViewDialog = (program: Program) => {
    setCurrentProgram(program);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (program: Program) => {
    setCurrentProgram(program);
    setIsDeleteDialogOpen(true);
  };

  // Portfolio modal handlers
  const handleOpenAddPortfolio = () => {
    setNewPortfolioData({
      allocated_ae: 0,
      allocated_cp: 0,
      status: "draft",
    });
    setIsAddPortfolioOpen(true);
  };

  const handleOpenEditPortfolio = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);
    setNewPortfolioData({
      code: portfolio.code,
      name: portfolio.name,
      description: portfolio.description,
      ministry_id: portfolio.ministry_id,
      ministryName: portfolio.ministryName,
      status: portfolio.status,
      allocated_ae: portfolio.allocated_ae,
      allocated_cp: portfolio.allocated_cp,
    });
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

  // CRUD operations for programs
  const handleAddProgram = () => {
    if (!newProgramData.name || !newProgramData.portfolioId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const newProgram: Program = {
      id: `prog${programs.length + 9}`,
      name: newProgramData.name!,
      description: newProgramData.description || "",
      portfolioId: newProgramData.portfolioId!,
      allocatedAmount: newProgramData.allocatedAmount || 0,
      usedAmount: 0,
      progress: 0,
      actions: 0,
      operations: 0,
      status: "planned",
    };

    setPrograms([...programs, newProgram]);
    setIsAddDialogOpen(false);
    toast({
      title: "Programme ajouté",
      description: `Le programme "${newProgram.name}" a été ajouté avec succès.`,
    });
  };

  const handleEditProgram = () => {
    if (!currentProgram) return;

    if (!newProgramData.name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const updatedPrograms = programs.map((program) =>
      program.id === currentProgram.id
        ? {
            ...program,
            name: newProgramData.name!,
            description: newProgramData.description || program.description,
            portfolioId: newProgramData.portfolioId || program.portfolioId,
            allocatedAmount: newProgramData.allocatedAmount || program.allocatedAmount,
            usedAmount: newProgramData.usedAmount || program.usedAmount,
            status: newProgramData.status || program.status,
            progress: newProgramData.progress || program.progress,
          }
        : program
    );

    setPrograms(updatedPrograms);
    setIsEditDialogOpen(false);
    toast({
      title: "Programme modifié",
      description: `Le programme "${currentProgram.name}" a été modifié avec succès.`,
    });
  };

  const handleDeleteProgram = () => {
    if (!currentProgram) return;

    const updatedPrograms = programs.filter((program) => program.id !== currentProgram.id);
    setPrograms(updatedPrograms);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Programme supprimé",
      description: `Le programme "${currentProgram.name}" a été supprimé avec succès.`,
    });
  };

  // CRUD operations for portfolios
  const handleAddPortfolio = () => {
    if (!newPortfolioData.name || !newPortfolioData.code || !newPortfolioData.ministryName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const newPortfolio: Portfolio = {
      id: `port${portfolios.length + 6}`,
      ministry_id: newPortfolioData.ministry_id || `m${Math.floor(Math.random() * 100)}`,
      code: newPortfolioData.code,
      name: newPortfolioData.name,
      description: newPortfolioData.description || "",
      allocated_ae: 0,
      allocated_cp: 0,
      fiscal_year_id: "fy1",
      status: newPortfolioData.status || "draft",
      // Initialize calculated fields with zero/empty values
      ministryName: newPortfolioData.ministryName,
      usedAmount: 0,
      programs: 0,
      consumedAE: 0,
      consumedCP: 0,
    };

    setPortfolios([...portfolios, newPortfolio]);
    setIsAddPortfolioOpen(false);
    toast({
      title: "Portefeuille ajouté",
      description: `Le portefeuille "${newPortfolio.name}" a été ajouté avec succès.`,
    });
  };

  const handleEditPortfolio = () => {
    if (!currentPortfolio) return;

    if (!newPortfolioData.name || !newPortfolioData.code) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const updatedPortfolios = portfolios.map((portfolio) =>
      portfolio.id === currentPortfolio.id
        ? {
            ...portfolio,
            code: newPortfolioData.code!,
            name: newPortfolioData.name!,
            description: newPortfolioData.description || portfolio.description,
            ministryName: newPortfolioData.ministryName || portfolio.ministryName,
            allocated_ae: newPortfolioData.allocated_ae || portfolio.allocated_ae,
            allocated_cp: newPortfolioData.allocated_cp || portfolio.allocated_cp,
            status: (newPortfolioData.status as "active" | "archived" | "draft") || portfolio.status,
            fiscalYears: portfolio.fiscalYears.map((fy) =>
              fy.id === "fy1"
                ? {
                    ...fy,
                    allocatedAE: newPortfolioData.allocated_ae || fy.allocatedAE,
                    allocatedCP: Math.round((newPortfolioData.allocated_cp || fy.allocatedCP) * 0.9),
                  }
                : fy
            ),
          }
        : portfolio
    );

    setPortfolios(updatedPortfolios);
    setIsEditPortfolioOpen(false);
    toast({
      title: "Portefeuille modifié",
      description: `Le portefeuille "${currentPortfolio.name}" a été modifié avec succès.`,
    });
  };

  const handleDeletePortfolio = () => {
    if (!currentPortfolio) return;

    const updatedPortfolios = portfolios.filter((portfolio) => portfolio.id !== currentPortfolio.id);
    setPortfolios(updatedPortfolios);
    setIsDeletePortfolioOpen(false);
    toast({
      title: "Portefeuille supprimé",
      description: `Le portefeuille "${currentPortfolio.name}" a été supprimé avec succès.`,
    });
  };

  // Mock ministries for select dropdown
  const ministries = [
    "Ministère de l'Éducation",
    "Ministère de la Santé",
    "Ministère des Transports",
    "Ministère de l'Agriculture",
    "Ministère de la Défense",
    "Ministère de la Justice",
    "Ministère des Affaires Étrangères",
    "Ministère des Finances",
    "Ministère de l'Intérieur",
  ];

  return (
    <Dashboard>
      <DashboardHeader title="Portefeuille des Programmes" description="Gérez les programmes et leurs actions associées">
        {/* Moved Button Here */}
        <Button onClick={handleOpenAddPortfolio} className="ml-auto">
          <FolderPlus className="mr-2 h-4 w-4" />
          Nouveau Portefeuille
        </Button>
      </DashboardHeader>

      {/* Moved Filter Card Here */}
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
                  className="w-full pl-8" // Added padding for the icon
                />
              </div>
            </div>
            <div className="w-full sm:w-[200px]">
              {" "}
              {/* Adjusted width */}
              <Label htmlFor="portfolio-status-filter" className="mb-2 block">
                Statut
              </Label>
              <Select value={portfolioStatusFilter} onValueChange={setPortfolioStatusFilter}>
                <SelectTrigger id="portfolio-status-filter" className="w-full">
                  {" "}
                  {/* Made trigger full width */}
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
          {/* Commented out TabsList as it wasn't used */}
          {/* <TabsList className="mb-6">
            <TabsTrigger value="portfolios">Portefeuilles</TabsTrigger>
            <TabsTrigger value="programs">Programmes</TabsTrigger>
          </TabsList> */}

          <TabsContent value="portfolios" className="animate-fade-in">
            {/* Removed the outer div and filter card that were here */}
            <DashboardGrid columns={2}>
              {filteredPortfolios.map((portfolio) => (
                <Card key={portfolio.id} className="budget-card transition-all duration-300 hover:shadow-elevation">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      {" "}
                      {/* Added gap */}
                      <div className="flex-1">
                        {" "}
                        {/* Allow title/desc to take space */}
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                          <span className="text-sm text-muted-foreground">({portfolio.code})</span>
                        </div>
                        <CardDescription className="mt-1 line-clamp-2">{portfolio.description}</CardDescription> {/* Added line-clamp */}
                      </div>
                      {/* Added whitespace-nowrap to prevent wrapping */}
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
                  </CardHeader>
                  <CardContent className="pb-2">
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
                          <p className="font-medium">{portfolio.ministryName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Programmes</p>
                          <p className="font-medium">{portfolio.programs}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
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
                    <Select value={getPortfolioFiscalYear(portfolio.id)} onValueChange={(value) => setPortfolioFiscalYear(portfolio.id, value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Année fiscale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fy1">Année 2024</SelectItem>
                        <SelectItem value="fy2">Année 2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
              ))}
            </DashboardGrid>
          </TabsContent>

          <TabsContent value="programs" className="animate-fade-in">
            <div className="flex justify-end mb-4">
              <Button className="shadow-subtle" onClick={handleOpenAddDialog}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Nouveau Programme
              </Button>
            </div>
            <Card className="budget-card mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Filtrer les programmes</CardTitle>
                    <CardDescription>Filtrez par portefeuille ou par statut</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un portefeuille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les portefeuilles</SelectItem>
                      {portfolios.map((portfolio) => (
                        <SelectItem key={portfolio.id} value={portfolio.id}>
                          {portfolio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="planned">Planifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <DashboardGrid columns={2}>
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="budget-card transition-all duration-300 hover:shadow-elevation">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      {getStatusBadge(program.status)}
                    </div>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-muted-foreground">Progression</span>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              program.progress < 40 ? "text-budget-danger" : program.progress < 70 ? "text-budget-warning" : "text-budget-success"
                            )}
                          >
                            {program.progress}%
                          </span>
                        </div>
                        <Progress value={program.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Budget alloué</p>
                          <p className="font-medium">{formatCurrency(program.allocatedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Budget utilisé</p>
                          <p className="font-medium">{formatCurrency(program.usedAmount)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Actions</p>
                          <p className="font-medium">{program.actions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Opérations</p>
                          <p className="font-medium">{program.operations}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenViewDialog(program)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(program)}>
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(program)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="justify-between">
                      <span>Voir les détails</span>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </DashboardGrid>
          </TabsContent>
        </Tabs>
      </DashboardSection>

      {/* Add Program Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau programme</DialogTitle>
            <DialogDescription>Complétez le formulaire pour créer un nouveau programme.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-name" className="text-right">
                Nom
              </Label>
              <Input
                id="program-name"
                className="col-span-3"
                value={newProgramData.name || ""}
                onChange={(e) => setNewProgramData({ ...newProgramData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="program-description"
                className="col-span-3"
                value={newProgramData.description || ""}
                onChange={(e) => setNewProgramData({ ...newProgramData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-portfolio" className="text-right">
                Portefeuille
              </Label>
              <Select value={newProgramData.portfolioId} onValueChange={(value) => setNewProgramData({ ...newProgramData, portfolioId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un portefeuille" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-amount" className="text-right">
                Budget alloué
              </Label>
              <Input
                id="program-amount"
                type="number"
                className="col-span-3"
                value={newProgramData.allocatedAmount || ""}
                onChange={(e) =>
                  setNewProgramData({
                    ...newProgramData,
                    allocatedAmount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-status" className="text-right">
                Statut
              </Label>
              <Select
                value={newProgramData.status}
                onValueChange={(value) =>
                  setNewProgramData({
                    ...newProgramData,
                    status: value as "active" | "completed" | "planned",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="active">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddProgram}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le programme</DialogTitle>
            <DialogDescription>Modifiez les détails du programme.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-program-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-program-name"
                className="col-span-3"
                value={newProgramData.name || ""}
                onChange={(e) => setNewProgramData({ ...newProgramData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-program-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-program-description"
                className="col-span-3"
                value={newProgramData.description || ""}
                onChange={(e) => setNewProgramData({ ...newProgramData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-program-portfolio" className="text-right">
                Portefeuille
              </Label>
              <Select value={newProgramData.portfolioId} onValueChange={(value) => setNewProgramData({ ...newProgramData, portfolioId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un portefeuille" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-program-allocated" className="text-right">
                Budget alloué
              </Label>
              <Input
                id="edit-program-allocated"
                type="number"
                className="col-span-3"
                value={newProgramData.allocatedAmount || ""}
                onChange={(e) =>
                  setNewProgramData({
                    ...newProgramData,
                    allocatedAmount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-program-used" className="text-right">
                Budget utilisé
              </Label>
              <Input
                id="edit-program-used"
                type="number"
                className="col-span-3"
                value={newProgramData.usedAmount || ""}
                onChange={(e) =>
                  setNewProgramData({
                    ...newProgramData,
                    usedAmount: parseFloat(e.target.value),
                    progress: newProgramData.allocatedAmount ? Math.round((parseFloat(e.target.value) / newProgramData.allocatedAmount) * 100) : 0,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-program-status" className="text-right">
                Statut
              </Label>
              <Select
                value={newProgramData.status}
                onValueChange={(value) =>
                  setNewProgramData({
                    ...newProgramData,
                    status: value as "active" | "completed" | "planned",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="active">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditProgram}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Program Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du programme</DialogTitle>
          </DialogHeader>
          {currentProgram && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Nom:</div>
                <div>{currentProgram.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Description:</div>
                <div>{currentProgram.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Portefeuille:</div>
                <div>{portfolios.find((p) => p.id === currentProgram.portfolioId)?.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Budget alloué:</div>
                <div>{formatCurrency(currentProgram.allocatedAmount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Budget utilisé:</div>
                <div>{formatCurrency(currentProgram.usedAmount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Progression:</div>
                <div>{currentProgram.progress}%</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Actions:</div>
                <div>{currentProgram.actions}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Opérations:</div>
                <div>{currentProgram.operations}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Statut:</div>
                <div>{getStatusBadge(currentProgram.status)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Program Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer ce programme? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {currentProgram && (
            <div className="py-4">
              <p>
                <strong>Nom:</strong> {currentProgram.name}
              </p>
              <p>
                <strong>Description:</strong> {currentProgram.description}
              </p>
              <p>
                <strong>Budget alloué:</strong> {formatCurrency(currentProgram.allocatedAmount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteProgram}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portfolio Dialogs */}
      <Dialog open={isAddPortfolioOpen} onOpenChange={setIsAddPortfolioOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau portefeuille</DialogTitle>
            <DialogDescription>Complétez le formulaire pour créer un nouveau portefeuille.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-code" className="text-right">
                Code
              </Label>
              <Input
                id="portfolio-code"
                className="col-span-3"
                value={newPortfolioData.code || ""}
                onChange={(e) => setNewPortfolioData({ ...newPortfolioData, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-name" className="text-right">
                Nom
              </Label>
              <Input
                id="portfolio-name"
                className="col-span-3"
                value={newPortfolioData.name || ""}
                onChange={(e) => setNewPortfolioData({ ...newPortfolioData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-ministry" className="text-right">
                Ministère
              </Label>
              <Select
                value={newPortfolioData.ministryName}
                onValueChange={(value) => setNewPortfolioData({ ...newPortfolioData, ministryName: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un ministère" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map((ministry) => (
                    <SelectItem key={ministry} value={ministry}>
                      {ministry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-status" className="text-right">
                Statut
              </Label>
              <Select
                value={newPortfolioData.status}
                onValueChange={(value: "active" | "archived" | "draft") => setNewPortfolioData({ ...newPortfolioData, status: value })}
              >
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
                value={newPortfolioData.description || ""}
                onChange={(e) => setNewPortfolioData({ ...newPortfolioData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-amount" className="text-right">
                Budget AE
              </Label>
              <Input
                id="portfolio-amount"
                type="number"
                className="col-span-3"
                value={newPortfolioData.allocated_ae || ""}
                onChange={(e) =>
                  setNewPortfolioData({
                    ...newPortfolioData,
                    allocated_ae: parseFloat(e.target.value),
                  })
                }
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
              <Input
                id="edit-portfolio-code"
                className="col-span-3"
                value={newPortfolioData.code || ""}
                onChange={(e) => setNewPortfolioData({ ...newPortfolioData, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-portfolio-name"
                className="col-span-3"
                value={newPortfolioData.name || ""}
                onChange={(e) => setNewPortfolioData({ ...newPortfolioData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-ministry" className="text-right">
                Ministère
              </Label>
              <Select
                value={newPortfolioData.ministryName}
                onValueChange={(value) => setNewPortfolioData({ ...newPortfolioData, ministryName: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un ministère" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map((ministry) => (
                    <SelectItem key={ministry} value={ministry}>
                      {ministry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-status" className="text-right">
                Statut
              </Label>
              <Select
                value={newPortfolioData.status}
                onValueChange={(value: "active" | "archived" | "draft") => setNewPortfolioData({ ...newPortfolioData, status: value })}
              >
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
                value={newPortfolioData.description || ""}
                onChange={(e) => setNewPortfolioData({ ...newPortfolioData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-amount" className="text-right">
                Budget AE
              </Label>
              <Input
                id="edit-portfolio-amount"
                type="number"
                className="col-span-3"
                value={newPortfolioData.allocated_ae || ""}
                onChange={(e) =>
                  setNewPortfolioData({
                    ...newPortfolioData,
                    allocated_ae: parseFloat(e.target.value),
                  })
                }
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
                <Select value={selectedFiscalYear} onValueChange={setSelectedFiscalYear}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Année Fiscale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fy1">Année Fiscale 2024</SelectItem>
                    <SelectItem value="fy2">Année Fiscale 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">AE Allouées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(currentPortfolio.allocated_ae || 0)}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-secondary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">CP Alloués</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(currentPortfolio.allocated_cp || 0)}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">AE Consommées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(currentPortfolio.consumedAE || 0)}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {currentPortfolio.allocated_ae > 0 ? Math.round(((currentPortfolio.consumedAE || 0) / currentPortfolio.allocated_ae) * 100) : 0}
                      % utilisés
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">CP Consommés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(currentPortfolio.consumedCP || 0)}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {currentPortfolio.allocated_cp > 0 ? Math.round(((currentPortfolio.consumedCP || 0) / currentPortfolio.allocated_cp) * 100) : 0}
                      % utilisés
                    </div>
                  </CardContent>
                </Card>
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
                  <CardTitle className="text-lg">Programmes associés</CardTitle> {/* Increased title size */}
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
                          <th className="py-3 px-4 text-center font-medium">Progression</th> {/* Added width */}
                          <th className="py-3 px-4 text-center font-medium">Statut</th> {/* Added width */}
                        </tr>
                      </thead>
                      <tbody>
                        {programs
                          .filter((program) => program.portfolioId === currentPortfolio.id)
                          .map((program) => (
                            <tr key={program.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4">{program.name}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(program.allocatedAmount)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(Math.round(program.allocatedAmount * 0.9))}</td>
                              <td className="py-3 px-4 text-center">{program.progress}%</td>
                            </tr>
                          ))}
                        {/* Add a row if no programs */}
                        {programs.filter((program) => program.portfolioId === currentPortfolio.id).length === 0 && (
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
            <DialogDescription>Aperçu du rapport détaillé pour l'année fiscale {selectedFiscalYear === "fy1" ? "2024" : "2023"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mock PDF Preview */}
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Rapport de Portefeuille</h1>
                <p className="text-lg">
                  {currentPortfolio?.name} ({currentPortfolio?.code})
                </p>
                <p className="text-muted-foreground">Année Fiscale {selectedFiscalYear === "fy1" ? "2024" : "2023"}</p>
                <p className="text-muted-foreground">Généré le {new Date().toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Informations générales</h2>
                  <p>
                    <strong>Ministère:</strong> {currentPortfolio?.ministryName}
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
                    <strong>AE Allouées:</strong>{" "}
                    {formatCurrency(currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.allocatedAE || 0)}
                  </p>
                  <p>
                    <strong>CP Alloués:</strong>{" "}
                    {formatCurrency(currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.allocatedCP || 0)}
                  </p>
                  <p>
                    <strong>AE Consommées:</strong>{" "}
                    {formatCurrency(currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.consumedAE || 0)}
                  </p>
                  <p>
                    <strong>CP Consommés:</strong>{" "}
                    {formatCurrency(currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.consumedCP || 0)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Consommation budgétaire</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1">
                      AE:{" "}
                      {Math.round(
                        ((currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.consumedAE || 0) /
                          (currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.allocatedAE || 1)) *
                          100
                      )}
                      %
                    </p>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.round(
                            ((currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.consumedAE || 0) /
                              (currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.allocatedAE || 1)) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1">
                      CP:{" "}
                      {Math.round(
                        ((currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.consumedCP || 0) /
                          (currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.allocatedCP || 1)) *
                          100
                      )}
                      %
                    </p>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{
                          width: `${Math.round(
                            ((currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.consumedCP || 0) /
                              (currentPortfolio?.fiscalYears.find((fy) => fy.id === selectedFiscalYear)?.allocatedCP || 1)) *
                              100
                          )}%`,
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
                    {programs
                      .filter((program) => program.portfolioId === currentPortfolio?.id)
                      .map((program) => (
                        <tr key={program.id}>
                          <td className="border p-2">{program.name}</td>
                          <td className="border p-2 text-right">{formatCurrency(program.allocatedAmount)}</td>
                          <td className="border p-2 text-right">{formatCurrency(Math.round(program.allocatedAmount * 0.9))}</td>
                          <td className="border p-2 text-center">{program.progress}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Notes et observations</h2>
                <p className="text-muted-foreground">
                  Ce rapport présente une synthèse des données budgétaires du portefeuille {currentPortfolio?.name} pour l'année fiscale{" "}
                  {selectedFiscalYear === "fy1" ? "2024" : "2023"}. Les données sont issues du Système Intégréde Gestion Budgétaire (SIB).
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
