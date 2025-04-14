import { useState } from "react";
import { Dashboard, DashboardHeader, DashboardSection } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileCog, SearchIcon, Eye, Plus, FileEdit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

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
    status: "in_progress",
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
    status: "in_progress",
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
    status: "in_progress",
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
    status: "completed",
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
    status: "in_progress",
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
    status: "in_progress",
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
    status: "planned",
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
    status: "in_progress",
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

// Mock data for actions dropdown
const mockActions = [
  { id: "a1", name: "Infrastructures Scolaires" },
  { id: "a2", name: "Qualité de l'Enseignement" },
  { id: "a5", name: "Équipements Sanitaires" },
  { id: "a6", name: "Prévention Sanitaire" },
  { id: "a8", name: "Entretien Routier" },
  { id: "a9", name: "Nouvelles Infrastructures" },
  { id: "a12", name: "Soutien aux Agriculteurs" },
  { id: "a13", name: "Infrastructure Agricole" },
];

// Mock data for programs dropdown
const mockPrograms = [
  { id: "prog1", name: "Programme d'Éducation Nationale" },
  { id: "prog2", name: "Santé Publique" },
  { id: "prog3", name: "Infrastructure Routière" },
  { id: "prog4", name: "Développement Agricole" },
];

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [operations, setOperations] = useState<Operation[]>(mockOperations);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<Operation | null>(null);
  const [newOperation, setNewOperation] = useState<Partial<Operation>>({
    name: "",
    description: "",
    actionId: "",
    programId: "",
    allocatedAmount: 0,
    status: "planned",
  });

  const filteredOperations = operations.filter((operation) => {
    return (
      (searchTerm === "" ||
        operation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (programFilter === "all" || operation.programId === programFilter) &&
      (statusFilter === "all" || operation.status === statusFilter)
    );
  });

  const getStatusBadge = (status: Operation["status"]) => {
    switch (status) {
      case "in_progress":
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

  const uniquePrograms = Array.from(new Set(operations.map((op) => op.programId))).map((id) => {
    const operation = operations.find((op) => op.programId === id);
    return {
      id: operation?.programId || "",
      name: operation?.programName || "",
    };
  });

  // Handler functions
  const handleOpenAddDialog = () => {
    setNewOperation({
      name: "",
      description: "",
      actionId: "",
      programId: "",
      allocatedAmount: 0,
      status: "planned",
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setNewOperation({
      name: operation.name,
      description: operation.description,
      actionId: operation.actionId,
      programId: operation.programId,
      allocatedAmount: operation.allocatedAmount,
      status: operation.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenViewDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  const handleAddOperation = () => {
    if (!newOperation.name || !newOperation.actionId || !newOperation.programId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const actionDetails = mockActions.find((a) => a.id === newOperation.actionId);
    const programDetails = mockPrograms.find((p) => p.id === newOperation.programId);

    if (!actionDetails || !programDetails) {
      toast({
        title: "Erreur",
        description: "Action ou programme invalide.",
        variant: "destructive",
      });
      return;
    }

    const operation: Operation = {
      id: `op${operations.length + 9}`,
      name: newOperation.name,
      description: newOperation.description || "",
      actionId: newOperation.actionId,
      actionName: actionDetails.name,
      programId: newOperation.programId,
      programName: programDetails.name,
      allocatedAmount: Number(newOperation.allocatedAmount) || 0,
      usedAmount: 0,
      progress: 0,
      engagements: 0,
      payments: 0,
      status: newOperation.status as "planned" | "in_progress" | "completed",
    };

    setOperations([...operations, operation]);
    setIsAddDialogOpen(false);
    toast({
      title: "Opération ajoutée",
      description: `L'opération "${operation.name}" a été ajoutée avec succès.`,
    });
  };

  const handleEditOperation = () => {
    if (!currentOperation) return;

    if (!newOperation.name || !newOperation.actionId || !newOperation.programId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const actionDetails = mockActions.find((a) => a.id === newOperation.actionId);
    const programDetails = mockPrograms.find((p) => p.id === newOperation.programId);

    if (!actionDetails || !programDetails) {
      toast({
        title: "Erreur",
        description: "Action ou programme invalide.",
        variant: "destructive",
      });
      return;
    }

    const updatedOperations = operations.map((op) =>
      op.id === currentOperation.id
        ? {
            ...op,
            name: newOperation.name!,
            description: newOperation.description || "",
            actionId: newOperation.actionId!,
            actionName: actionDetails.name,
            programId: newOperation.programId!,
            programName: programDetails.name,
            allocatedAmount: Number(newOperation.allocatedAmount) || 0,
            status: newOperation.status as "planned" | "in_progress" | "completed",
          }
        : op
    );

    setOperations(updatedOperations);
    setIsEditDialogOpen(false);
    toast({
      title: "Opération modifiée",
      description: `L'opération "${currentOperation.name}" a été modifiée avec succès.`,
    });
  };

  const handleDeleteOperation = () => {
    if (!currentOperation) return;

    const updatedOperations = operations.filter((op) => op.id !== currentOperation.id);
    setOperations(updatedOperations);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Opération supprimée",
      description: `L'opération "${currentOperation.name}" a été supprimée avec succès.`,
    });
  };

  return (
    <Dashboard>
      <DashboardHeader title="Gestion des Opérations" description="Suivez et gérez les opérations dans le cadre des actions budgétaires">
        <Button className="shadow-subtle" onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle opération
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/*<TabsList className="mb-6">
            <TabsTrigger value="list">Liste des opérations</TabsTrigger>
            <TabsTrigger value="engagements">Engagements</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
          </TabsList>*/}

          <TabsContent value="list" className="animate-fade-in">
            <Card className="budget-card mb-6">
              <CardHeader>
                <CardTitle className="text-base">Filtrer les opérations</CardTitle>
                <CardDescription>Recherchez et filtrez par programme ou statut</CardDescription>
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
                      <SelectItem value="all">Tous les programmes</SelectItem>
                      {uniquePrograms.map((program) => (
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
                      <SelectItem value="all">Tous les statuts</SelectItem>
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
                  {filteredOperations.length} opération{filteredOperations.length !== 1 ? "s" : ""} trouvée
                  {filteredOperations.length !== 1 ? "s" : ""}
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
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenViewDialog(operation)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(operation)}>
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(operation)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
                <p className="text-muted-foreground max-w-md mb-6">Cette section permet de gérer les crédits de paiement (CP) liés aux opérations.</p>
                <Button>Voir les paiements</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>

      {/* Add Operation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle opération</DialogTitle>
            <DialogDescription>Complétez le formulaire pour ajouter une nouvelle opération.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newOperation.name || ""}
                onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={newOperation.description || ""}
                onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program" className="text-right">
                Programme
              </Label>
              <Select value={newOperation.programId} onValueChange={(value) => setNewOperation({ ...newOperation, programId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un programme" />
                </SelectTrigger>
                <SelectContent>
                  {mockPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action" className="text-right">
                Action
              </Label>
              <Select value={newOperation.actionId} onValueChange={(value) => setNewOperation({ ...newOperation, actionId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une action" />
                </SelectTrigger>
                <SelectContent>
                  {mockActions.map((action) => (
                    <SelectItem key={action.id} value={action.id}>
                      {action.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant alloué
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={newOperation.allocatedAmount || ""}
                onChange={(e) =>
                  setNewOperation({
                    ...newOperation,
                    allocatedAmount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Statut
              </Label>
              <Select
                value={newOperation.status}
                onValueChange={(value) =>
                  setNewOperation({
                    ...newOperation,
                    status: value as "planned" | "in_progress" | "completed",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddOperation}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Operation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'opération</DialogTitle>
            <DialogDescription>Modifiez les détails de l'opération.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                value={newOperation.name || ""}
                onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                className="col-span-3"
                value={newOperation.description || ""}
                onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-program" className="text-right">
                Programme
              </Label>
              <Select value={newOperation.programId} onValueChange={(value) => setNewOperation({ ...newOperation, programId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un programme" />
                </SelectTrigger>
                <SelectContent>
                  {mockPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-action" className="text-right">
                Action
              </Label>
              <Select value={newOperation.actionId} onValueChange={(value) => setNewOperation({ ...newOperation, actionId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une action" />
                </SelectTrigger>
                <SelectContent>
                  {mockActions.map((action) => (
                    <SelectItem key={action.id} value={action.id}>
                      {action.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                Montant alloué
              </Label>
              <Input
                id="edit-amount"
                type="number"
                className="col-span-3"
                value={newOperation.allocatedAmount || ""}
                onChange={(e) =>
                  setNewOperation({
                    ...newOperation,
                    allocatedAmount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Statut
              </Label>
              <Select
                value={newOperation.status}
                onValueChange={(value) =>
                  setNewOperation({
                    ...newOperation,
                    status: value as "planned" | "in_progress" | "completed",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditOperation}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Operation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer cette opération? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {currentOperation && (
            <div className="py-4">
              <p>
                <strong>Nom:</strong> {currentOperation.name}
              </p>
              <p>
                <strong>Programme:</strong> {currentOperation.programName}
              </p>
              <p>
                <strong>Action:</strong> {currentOperation.actionName}
              </p>
              <p>
                <strong>Budget alloué:</strong> {formatCurrency(currentOperation.allocatedAmount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteOperation}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Operation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l'opération</DialogTitle>
          </DialogHeader>
          {currentOperation && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Nom:</div>
                <div>{currentOperation.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Description:</div>
                <div>{currentOperation.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Programme:</div>
                <div>{currentOperation.programName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Action:</div>
                <div>{currentOperation.actionName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Budget alloué:</div>
                <div>{formatCurrency(currentOperation.allocatedAmount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Budget utilisé:</div>
                <div>{formatCurrency(currentOperation.usedAmount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Progression:</div>
                <div>{currentOperation.progress}%</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Engagements:</div>
                <div>{currentOperation.engagements}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Paiements:</div>
                <div>{currentOperation.payments}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Statut:</div>
                <div>{getStatusBadge(currentOperation.status)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
