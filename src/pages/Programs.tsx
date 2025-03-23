
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
import { cn } from "@/lib/utils";
import { ChevronRight, FolderPlus, ClipboardEdit } from "lucide-react";

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
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProgramsPage() {
  const [portfolioFilter, setPortfolioFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);

  useEffect(() => {
    let result = mockPrograms;
    
    if (portfolioFilter && portfolioFilter !== "all") {
      result = result.filter(program => program.portfolioId === portfolioFilter);
    }
    
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(program => program.status === statusFilter);
    }
    
    setFilteredPrograms(result);
  }, [portfolioFilter, statusFilter]);

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

  return (
    <Dashboard>
      <DashboardHeader 
        title="Portefeuille des Programmes" 
        description="Gérez les programmes et leurs actions associées"
      >
        <Button className="shadow-subtle">
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
                <CardTitle className="text-base">Filtrer les programmes</CardTitle>
                <CardDescription>
                  Filtrez par portefeuille ou par statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un portefeuille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les portefeuilles</SelectItem>
                      {mockPortfolios.map(portfolio => (
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
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span>Voir les détails</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </DashboardGrid>
          </TabsContent>
          
          <TabsContent value="portfolios" className="animate-fade-in">
            <DashboardGrid columns={2}>
              {mockPortfolios.map(portfolio => (
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
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span>Voir les programmes</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </DashboardGrid>
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </Dashboard>
  );
}
