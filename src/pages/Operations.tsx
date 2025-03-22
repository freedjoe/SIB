
import { useState } from "react";
import { 
  Dashboard, 
  DashboardHeader, 
  DashboardSection 
} from "@/components/layout/Dashboard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileCog, SearchIcon, Eye } from "lucide-react";

// Mock data
interface Operation {
  id: string;
  name: string;
  description: string;
  actionId: string;
  actionName: string;
  programId: string;
  programName: string;
  allocatedAmount: number;
  usedAmount: number;
  progress: number;
  engagements: number;
  payments: number;
  status: "in_progress" | "completed" | "planned";
}

const mockOperations: Operation[] = [
  {
    id: "op1",
    name: "Construction École Primaire de Koné",
    description: "Construction d'une école primaire de 12 classes",
    actionId: "a1",
    actionName: "Infrastructures Scolaires",
    programId: "prog1",
    programName: "Programme d'Éducation Nationale",
    allocatedAmount: 120000000,
    usedAmount: 95000000,
    progress: 79,
    engagements: 4,
    payments: 3,
    status: "in_progress"
  },
  {
    id: "op2",
    name: "Équipement Hôpital Central",
    description: "Acquisition d'équipement médical pour l'hôpital central",
    actionId: "a5",
    actionName: "Équipements Sanitaires",
    programId: "prog2",
    programName: "Santé Publique",
    allocatedAmount: 85000000,
    usedAmount: 70000000,
    progress: 82,
    engagements: 3,
    payments: 2,
    status: "in_progress"
  },
  {
    id: "op3",
    name: "Rénovation Route Nationale 1",
    description: "Travaux de rénovation sur 50km de la RN1",
    actionId: "a8",
    actionName: "Entretien Routier",
    programId: "prog3",
    programName: "Infrastructure Routière",
    allocatedAmount: 180000000,
    usedAmount: 95000000,
    progress: 53,
    engagements: 5,
    payments: 3,
    status: "in_progress"
  },
  {
    id: "op4",
    name: "Distribution Semences Améliorées",
    description: "Distribution de semences aux agriculteurs",
    actionId: "a12",
    actionName: "Soutien aux Agriculteurs",
    programId: "prog4",
    programName: "Développement Agricole",
    allocatedAmount: 45000000,
    usedAmount: 45000000,
    progress: 100,
    engagements: 2,
    payments: 2,
    status: "completed"
  },
  {
    id: "op5",
    name: "Formation des Enseignants",
    description: "Programme de formation continue des enseignants",
    actionId: "a2",
    actionName: "Qualité de l'Enseignement",
    programId: "prog1",
    programName: "Programme d'Éducation Nationale",
    allocatedAmount: 35000000,
    usedAmount: 25000000,
    progress: 71,
    engagements: 3,
    payments: 2,
    status: "in_progress"
  },
  {
    id: "op6",
    name: "Campagne de Vaccination",
    description: "Vaccination contre la méningite dans les zones rurales",
    actionId: "a6",
    actionName: "Prévention Sanitaire",
    programId: "prog2",
    programName: "Santé Publique",
    allocatedAmount: 50000000,
    usedAmount: 45000000,
    progress: 90,
    engagements: 2,
    payments: 2,
    status: "in_progress"
  },
  {
    id: "op7",
    name: "Construction Pont Sud",
    description: "Construction d'un pont reliant deux provinces",
    actionId: "a9",
    actionName: "Nouvelles Infrastructures",
    programId: "prog3",
    programName: "Infrastructure Routière",
    allocatedAmount: 250000000,
    usedAmount: 0,
    progress: 0,
    engagements: 0,
    payments: 0,
    status: "planned"
  },
  {
    id: "op8",
    name: "Modernisation Systèmes d'Irrigation",
    description: "Installation de systèmes d'irrigation modernes",
    actionId: "a13",
    actionName: "Infrastructure Agricole",
    programId: "prog4",
    programName: "Développement Agricole",
    allocatedAmount: 75000000,
    usedAmount: 20000000,
    progress: 27,
    engagements: 2,
    payments: 1,
    status: "in_progress"
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

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredOperations = mockOperations.filter(operation => {
    return (
      (searchTerm === "" || 
        operation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (programFilter === "" || operation.programId === programFilter) &&
      (statusFilter === "" || operation.status === statusFilter)
    );
  });

  const getStatusBadge = (status: Operation["status"]) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400">En cours</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">Terminé</Badge>;
      case "planned":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-400">Planifié</Badge>;
      default:
        return null;
    }
  };

  const uniquePrograms = Array.from(new Set(mockOperations.map(op => op.programId))).map(id => {
    const operation = mockOperations.find(op => op.programId === id);
    return {
      id: operation?.programId || "",
      name: operation?.programName || ""
    };
  });

  return (
    <Dashboard>
      <DashboardHeader 
        title="Gestion des Opérations" 
        description="Suivez et gérez les opérations dans le cadre des actions budgétaires"
      >
        <Button className="shadow-subtle">
          <FileCog className="mr-2 h-4 w-4" />
          Nouvelle opération
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list">Liste des opérations</TabsTrigger>
            <TabsTrigger value="engagements">Engagements</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="animate-fade-in">
            <Card className="budget-card mb-6">
              <CardHeader>
                <CardTitle className="text-base">Filtrer les opérations</CardTitle>
                <CardDescription>
                  Recherchez et filtrez par programme ou statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={programFilter} onValueChange={setProgramFilter}>
                    <SelectTrigger className="w-full md:w-[250px]">
                      <SelectValue placeholder="Programme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les programmes</SelectItem>
                      {uniquePrograms.map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les statuts</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="planned">Planifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="budget-card">
              <CardHeader>
                <CardTitle>Liste des Opérations</CardTitle>
                <CardDescription>
                  {filteredOperations.length} opération{filteredOperations.length !== 1 ? 's' : ''} trouvée{filteredOperations.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Opération</TableHead>
                        <TableHead>Programme / Action</TableHead>
                        <TableHead className="text-right">Budget</TableHead>
                        <TableHead className="text-right">Utilisé</TableHead>
                        <TableHead className="text-center">Progression</TableHead>
                        <TableHead className="text-right">Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOperations.length > 0 ? (
                        filteredOperations.map((operation) => (
                          <TableRow key={operation.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                              <div>
                                <p className="font-medium">{operation.name}</p>
                                <p className="text-sm text-muted-foreground">{operation.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{operation.programName}</p>
                                <p className="text-sm text-muted-foreground">{operation.actionName}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(operation.allocatedAmount)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(operation.usedAmount)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span 
                                  className={cn(
                                    "text-xs font-medium mb-1",
                                    operation.progress < 40 
                                      ? "text-budget-danger" 
                                      : operation.progress < 70 
                                        ? "text-budget-warning" 
                                        : "text-budget-success"
                                  )}
                                >
                                  {operation.progress}%
                                </span>
                                <div className="w-16 bg-secondary rounded-full h-1.5">
                                  <div 
                                    className={cn(
                                      "h-1.5 rounded-full",
                                      operation.progress < 40 
                                        ? "bg-budget-danger" 
                                        : operation.progress < 70 
                                          ? "bg-budget-warning" 
                                          : "bg-budget-success"
                                    )}
                                    style={{ width: `${operation.progress}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{getStatusBadge(operation.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Aucune opération trouvée.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagements" className="animate-fade-in">
            <Card className="budget-card p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileCog className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestion des Engagements</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Cette section permet de gérer les autorisations d'engagement (AE) liées aux opérations.
                </p>
                <Button>Voir les engagements</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="animate-fade-in">
            <Card className="budget-card p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileCog className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestion des Paiements</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Cette section permet de gérer les crédits de paiement (CP) liés aux opérations.
                </p>
                <Button>Voir les paiements</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </Dashboard>
  );
}
