
import { useEffect, useState } from "react";
import { 
  Dashboard, 
  DashboardHeader, 
  DashboardSection,
  DashboardGrid
} from "@/components/layout/Dashboard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChevronRight, FolderPlus, FileEdit, Trash2, Eye } from "lucide-react";
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

interface Portfolio {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  usedAmount: number;
  programs: number;
  ministryId: string;
  ministryName: string;
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
    status: "active"
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
    status: "active"
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
    status: "active"
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
    status: "active"
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
    status: "active"
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
    status: "active"
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
    status: "planned"
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
    status: "completed"
  }
];

const mockPortfolios: Portfolio[] = [
  {
    id: "port1",
    name: "Portfolio Éducation",
    description: "Regroupe tous les programmes éducatifs",
    totalAmount: 870000000,
    usedAmount: 525000000,
    programs: 2,
    ministryId: "m1",
    ministryName: "Ministère de l'Éducation"
  },
  {
    id: "port2",
    name: "Portfolio Santé",
    description: "Programmes de santé publique et prévention",
    totalAmount: 730000000,
    usedAmount: 540000000,
    programs: 2,
    ministryId: "m2",
    ministryName: "Ministère de la Santé"
  },
  {
    id: "port3",
    name: "Portfolio Infrastructure",
    description: "Développement des infrastructures de transport",
    totalAmount: 710000000,
    usedAmount: 210000000,
    programs: 2,
    ministryId: "m3",
    ministryName: "Ministère des Transports"
  },
  {
    id: "port4",
    name: "Portfolio Agriculture",
    description: "Soutien à l'agriculture et l'élevage",
    totalAmount: 380000000,
    usedAmount: 145000000,
    programs: 1,
    ministryId: "m4",
    ministryName: "Ministère de l'Agriculture"
  },
  {
    id: "port5",
    name: "Portfolio Défense",
    description: "Sécurité nationale et protection civile",
    totalAmount: 410000000,
    usedAmount: 290000000,
    programs: 1,
    ministryId: "m5",
    ministryName: "Ministère de la Défense"
  }
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
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  
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
    operations: 0
  });
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [isEditPortfolioOpen, setIsEditPortfolioOpen] = useState(false);
  const [isViewPortfolioOpen, setIsViewPortfolioOpen] = useState(false);
  const [isDeletePortfolioOpen, setIsDeletePortfolioOpen] = useState(false);
  const [newPortfolioData, setNewPortfolioData] = useState<Partial<Portfolio>>({
    totalAmount: 0,
    usedAmount: 0,
    programs: 0
  });

  useEffect(() => {
    let result = programs;
    
    if (portfolioFilter && portfolioFilter !== "all") {
      result = result.filter(program => program.portfolioId === portfolioFilter);
    }
    
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(program => program.status === statusFilter);
    }
    
    setFilteredPrograms(result);
  }, [portfolioFilter, statusFilter, programs]);

  const getStatusBadge = (status: Program["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400">En cours</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">Terminé</Badge>;
      case "planned":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-400">Planifié</Badge>;
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
      operations: 0
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
      status: program.status
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
      totalAmount: 0,
      usedAmount: 0,
      programs: 0
    });
    setIsAddPortfolioOpen(true);
  };

  const handleOpenEditPortfolio = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);
    setNewPortfolioData({
      name: portfolio.name,
      description: portfolio.description,
      ministryId: portfolio.ministryId,
      ministryName: portfolio.ministryName,
      totalAmount: portfolio.totalAmount,
      usedAmount: portfolio.usedAmount,
      programs: portfolio.programs
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
      status: "planned"
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

    const updatedPrograms = programs.map(program => 
      program.id === currentProgram.id 
        ? { 
            ...program,
            name: newProgramData.name!,
            description: newProgramData.description || program.description,
            portfolioId: newProgramData.portfolioId || program.portfolioId,
            allocatedAmount: newProgramData.allocatedAmount || program.allocatedAmount,
            usedAmount: newProgramData.usedAmount || program.usedAmount,
            status: newProgramData.status || program.status,
            progress: newProgramData.progress || program.progress
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

    const updatedPrograms = programs.filter(program => program.id !== currentProgram.id);
    setPrograms(updatedPrograms);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Programme supprimé",
      description: `Le programme "${currentProgram.name}" a été supprimé avec succès.`,
    });
  };

  // CRUD operations for portfolios
  const handleAddPortfolio = () => {
    if (!newPortfolioData.name || !newPortfolioData.ministryName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const newPortfolio: Portfolio = {
      id: `port${portfolios.length + 6}`,
      name: newPortfolioData.name!,
      description: newPortfolioData.description || "",
      ministryId: newPortfolioData.ministryId || `m${Math.floor(Math.random() * 100)}`,
      ministryName: newPortfolioData.ministryName!,
      totalAmount: newPortfolioData.totalAmount || 0,
      usedAmount: 0,
      programs: 0
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

    if (!newPortfolioData.name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const updatedPortfolios = portfolios.map(portfolio => 
      portfolio.id === currentPortfolio.id 
        ? { 
            ...portfolio,
            name: newPortfolioData.name!,
            description: newPortfolioData.description || portfolio.description,
            ministryName: newPortfolioData.ministryName || portfolio.ministryName,
            totalAmount: newPortfolioData.totalAmount || portfolio.totalAmount,
            usedAmount: newPortfolioData.usedAmount || portfolio.usedAmount
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

    const updatedPortfolios = portfolios.filter(portfolio => portfolio.id !== currentPortfolio.id);
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
    "Ministère de l'Intérieur"
  ];

  return (
    <Dashboard>
      <DashboardHeader 
        title="Portefeuille des Programmes" 
        description="Gérez les programmes et leurs actions associées"
      >
        <Button className="shadow-subtle" onClick={handleOpenAddDialog}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Nouveau programme
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="programs">Programmes</TabsTrigger>
            <TabsTrigger value="portfolios">Portefeuilles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="programs" className="animate-fade-in">
            <Card className="budget-card mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Filtrer les programmes</CardTitle>
                    <CardDescription>
                      Filtrez par portefeuille ou par statut
                    </CardDescription>
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
                      {portfolios.map(portfolio => (
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
              {filteredPrograms.map(program => (
                <Card 
                  key={program.id} 
                  className="budget-card transition-all duration-300 hover:shadow-elevation"
                >
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
                              program.progress < 40 
                                ? "text-budget-danger" 
                                : program.progress < 70 
                                  ? "text-budget-warning" 
                                  : "text-budget-success"
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenViewDialog(program)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(program)}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteDialog(program)}
                      >
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
          
          <TabsContent value="portfolios" className="animate-fade-in">
            <div className="flex justify-end mb-4">
              <Button onClick={handleOpenAddPortfolio}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Nouveau portefeuille
              </Button>
            </div>
            <DashboardGrid columns={2}>
              {portfolios.map(portfolio => (
                <Card 
                  key={portfolio.id} 
                  className="budget-card transition-all duration-300 hover:shadow-elevation"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                    <CardDescription>{portfolio.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-muted-foreground">Utilisation du budget</span>
                          <span className="text-sm font-medium">
                            {Math.round((portfolio.usedAmount / portfolio.totalAmount) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.round((portfolio.usedAmount / portfolio.totalAmount) * 100)} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Budget total</p>
                          <p className="font-medium">{formatCurrency(portfolio.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Budget utilisé</p>
                          <p className="font-medium">{formatCurrency(portfolio.usedAmount)}</p>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenViewPortfolio(portfolio)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditPortfolio(portfolio)}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeletePortfolio(portfolio)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="justify-between">
                      <span>Voir les programmes</span>
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
            <DialogDescription>
              Complétez le formulaire pour créer un nouveau programme.
            </DialogDescription>
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
                onChange={(e) =>
                  setNewProgramData({ ...newProgramData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setNewProgramData({ ...newProgramData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-portfolio" className="text-right">
                Portefeuille
              </Label>
              <Select
                value={newProgramData.portfolioId}
                onValueChange={(value) =>
                  setNewProgramData({ ...newProgramData, portfolioId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un portefeuille" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map(portfolio => (
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
                    status: value as "active" | "completed" | "planned" 
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
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
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
            <DialogDescription>
              Modifiez les détails du programme.
            </DialogDescription>
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
                onChange={(e) =>
                  setNewProgramData({ ...newProgramData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setNewProgramData({ ...newProgramData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-program-portfolio" className="text-right">
                Portefeuille
              </Label>
              <Select
                value={newProgramData.portfolioId}
                onValueChange={(value) =>
                  setNewProgramData({ ...newProgramData, portfolioId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un portefeuille" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map(portfolio => (
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
                    progress: newProgramData.allocatedAmount ? 
                      Math.round((parseFloat(e.target.value) / newProgramData.allocatedAmount) * 100) : 0
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
                    status: value as "active" | "completed" | "planned" 
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
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
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
                <div>{portfolios.find(p => p.id === currentProgram.portfolioId)?.name}</div>
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
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce programme? Cette action est irréversible.
            </DialogDescription>
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
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
            <DialogDescription>
              Complétez le formulaire pour créer un nouveau portefeuille.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-name" className="text-right">
                Nom
              </Label>
              <Input
                id="portfolio-name"
                className="col-span-3"
                value={newPortfolioData.name || ""}
                onChange={(e) =>
                  setNewPortfolioData({ ...newPortfolioData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="portfolio-description"
                className="col-span-3"
                value={newPortfolioData.description || ""}
                onChange={(e) =>
                  setNewPortfolioData({ ...newPortfolioData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-ministry" className="text-right">
                Ministère
              </Label>
              <Select
                value={newPortfolioData.ministryName}
                onValueChange={(value) =>
                  setNewPortfolioData({ ...newPortfolioData, ministryName: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un ministère" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map(ministry => (
                    <SelectItem key={ministry} value={ministry}>
                      {ministry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-amount" className="text-right">
                Budget total
              </Label>
              <Input
                id="portfolio-amount"
                type="number"
                className="col-span-3"
                value={newPortfolioData.totalAmount || ""}
                onChange={(e) =>
                  setNewPortfolioData({
                    ...newPortfolioData,
                    totalAmount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPortfolioOpen(false)}
            >
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
            <DialogDescription>
              Modifiez les détails du portefeuille.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-portfolio-name"
                className="col-span-3"
                value={newPortfolioData.name || ""}
                onChange={(e) =>
                  setNewPortfolioData({ ...newPortfolioData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-portfolio-description"
                className="col-span-3"
                value={newPortfolioData.description || ""}
                onChange={(e) =>
                  setNewPortfolioData({ ...newPortfolioData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-ministry" className="text-right">
                Ministère
              </Label>
              <Select
                value={newPortfolioData.ministryName}
                onValueChange={(value) =>
                  setNewPortfolioData({ ...newPortfolioData, ministryName: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un ministère" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map(ministry => (
                    <SelectItem key={ministry} value={ministry}>
                      {ministry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-portfolio-amount" className="text-right">
                Budget total
              </Label>
              <Input
                id="edit-portfolio-amount"
                type="number"
                className="col-span-3"
                value={newPortfolioData.totalAmount || ""}
                onChange={(e) =>
                  setNewPortfolioData({
                    ...newPortfolioData,
                    totalAmount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditPortfolioOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleEditPortfolio}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewPortfolioOpen} onOpenChange={setIsViewPortfolioOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du portefeuille</DialogTitle>
          </DialogHeader>
          {currentPortfolio && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Nom:</div>
                <div>{currentPortfolio.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Description:</div>
                <div>{currentPortfolio.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Ministère:</div>
                <div>{currentPortfolio.ministryName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Budget total:</div>
                <div>{formatCurrency(currentPortfolio.totalAmount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Budget utilisé:</div>
                <div>{formatCurrency(currentPortfolio.usedAmount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Programmes:</div>
                <div>{currentPortfolio.programs}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewPortfolioOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeletePortfolioOpen} onOpenChange={setIsDeletePortfolioOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce portefeuille? Cette action est irréversible.
            </DialogDescription>
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
                <strong>Ministère:</strong> {currentPortfolio.ministryName}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeletePortfolioOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePortfolio}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
