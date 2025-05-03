import { useState } from "react";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, CircleDollarSign, FileCheck, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { OperationsTable } from "@/components/tables/OperationsTable";
import { Operation } from "@/types/database.types";
import { useOperations, useOperationMutation, useWilayas, usePrograms, useActions } from "@/hooks/supabase";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";
import { filterOperations } from "@/components/operations/OperationsUtils";
import { OperationsFilter } from "@/components/operations/OperationsFilter";
import { OperationViewDialog } from "@/components/operations/OperationViewDialog";
import { OperationFormDialogs } from "@/components/operations/OperationFormDialogs";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui-custom/StatCard";

// New component for Operations Dashboard
const OperationsDashboard = ({ operations }: { operations: Operation[] }) => {
  // Calculate key metrics
  const totalOperations = operations.length;
  const totalAllocatedAE = operations.reduce((sum, op) => sum + (op.allocated_ae || 0), 0);
  const totalAllocatedCP = operations.reduce((sum, op) => sum + (op.allocated_cp || 0), 0);
  const totalConsumedAE = operations.reduce((sum, op) => sum + (op.consumed_ae || 0), 0);
  const totalConsumedCP = operations.reduce((sum, op) => sum + (op.consumed_cp || 0), 0);

  const completionRate = operations.length > 0 ? Math.round(operations.reduce((sum, op) => sum + (op.physical_rate || 0), 0) / operations.length) : 0;

  // Count operations by status
  const statusCounts = operations.reduce((acc, op) => {
    const status = op.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare status distribution data for visualization
  const statusDistribution = [
    { status: "planned", count: statusCounts.planned || 0, color: "bg-gray-300" },
    { status: "in_progress", count: statusCounts.in_progress || 0, color: "bg-blue-400" },
    { status: "completed", count: statusCounts.completed || 0, color: "bg-green-400" },
    { status: "delayed", count: statusCounts.delayed || 0, color: "bg-yellow-400" },
    { status: "cancelled", count: statusCounts.cancelled || 0, color: "bg-red-400" },
  ];

  // Format currency
  const formatCurrency = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "DZD" }).format(value);

  // Calculate total for percentages
  const total = statusDistribution.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="space-y-6">
      <DashboardGrid columns={4}>
        <StatCard
          title="Total Opérations"
          value={totalOperations}
          description="Opérations d'investissement actives"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          title="Budget Total"
          value={formatCurrency(totalAllocatedCP)}
          description="Budget CP alloué pour toutes les opérations"
          icon={<CircleDollarSign className="h-4 w-4" />}
          trend={{ value: totalAllocatedCP > 0 ? Math.round((totalConsumedCP / totalAllocatedCP) * 100) : 0, isPositive: true }}
        />
        <StatCard
          title="Taux de Réalisation"
          value={`${completionRate}%`}
          description="Taux moyen de réalisation physique"
          icon={<FileCheck className="h-4 w-4" />}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Opérations En Cours"
          value={statusCounts.in_progress || 0}
          description="Opérations en cours d'exécution"
          icon={<Calendar className="h-4 w-4" />}
        />
      </DashboardGrid>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Répartition des statuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full ${item.color} mr-2`} />
                      <span>
                        {item.status === "planned" && "Planifiée"}
                        {item.status === "in_progress" && "En cours"}
                        {item.status === "completed" && "Terminée"}
                        {item.status === "delayed" && "En retard"}
                        {item.status === "cancelled" && "Annulée"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-muted-foreground">({total > 0 ? Math.round((item.count / total) * 100) : 0}%)</span>
                    </div>
                  </div>
                  <Progress value={total > 0 ? (item.count / total) * 100 : 0} className={`h-2 ${item.color.replace("bg-", "bg-opacity-70 bg-")}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Aperçu du Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="total">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="total">Total</TabsTrigger>
                <TabsTrigger value="ae">AE</TabsTrigger>
                <TabsTrigger value="cp">CP</TabsTrigger>
              </TabsList>
              <TabsContent value="total" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Total AE</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalAllocatedAE)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Total CP</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalAllocatedCP)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AE Consommés</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalConsumedAE)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CP Consommés</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalConsumedCP)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="ae" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalAllocatedAE)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Consommé</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalConsumedAE)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Restant</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalAllocatedAE - totalConsumedAE)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taux de Consommation</p>
                      <p className="text-2xl font-bold">{totalAllocatedAE > 0 ? Math.round((totalConsumedAE / totalAllocatedAE) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="cp" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalAllocatedCP)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Consommé</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalConsumedCP)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Restant</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalAllocatedCP - totalConsumedCP)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taux de Consommation</p>
                      <p className="text-2xl font-bold">{totalAllocatedCP > 0 ? Math.round((totalConsumedCP / totalAllocatedCP) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [titreBudgetaireFilter, setTitreBudgetaireFilter] = useState("all");
  const [origineFinancementFilter, setOrigineFinancementFilter] = useState("all");
  const [currentOperation, setCurrentOperation] = useState<Operation | null>(null);

  // Fetch operations data using the useOperations hook
  const {
    data: operationsData = [],
    isLoading: operationsLoading,
    refetch: refetchOperations,
  } = useOperations({
    select: "*, action:action_id(*), wilaya:wilaya_id(*), budget_title:budget_title_id(*), ministry:ministry_id(*)",
  });

  // Fetch wilayas data
  const { data: wilayasData = [] } = useWilayas({
    sort: { column: "name", ascending: true },
  });

  // Fetch programs data
  const { data: programsData = [] } = usePrograms({
    sort: { column: "name", ascending: true },
  });

  // Fetch actions data
  const { data: actionsData = [] } = useActions({
    sort: { column: "name", ascending: true },
  });

  // Setup mutation for operations
  const operationMutation = useOperationMutation({
    onSuccess: () => {
      refetchOperations();
      toast({
        title: "Opération réussie",
        description: "La base de données a été mise à jour avec succès.",
      });
    },
  });

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newOperation, setNewOperation] = useState<Partial<Operation>>({
    name: "",
    description: "",
    action_id: "",
    code: "",
    wilaya_id: "",
    titre_budgetaire: 1,
    origine_financement: "budget_national",
    allocated_ae: 0,
    allocated_cp: 0,
    consumed_ae: 0,
    consumed_cp: 0,
    physical_rate: 0,
    financial_rate: 0,
    status: "planned",
    inscription_date: new Date().toISOString(),
  });

  // Filter operations based on search and filter criteria
  const filteredOperations = filterOperations(
    operationsData,
    searchTerm,
    programFilter,
    wilayaFilter,
    statusFilter,
    titreBudgetaireFilter,
    origineFinancementFilter
  );

  // Handler functions
  const handleOpenAddDialog = () => {
    setNewOperation({
      name: "",
      description: "",
      action_id: "",
      code: "",
      wilaya_id: "",
      titre_budgetaire: 1,
      origine_financement: "budget_national",
      allocated_ae: 0,
      allocated_cp: 0,
      consumed_ae: 0,
      consumed_cp: 0,
      physical_rate: 0,
      financial_rate: 0,
      status: "planned",
      inscription_date: new Date().toISOString(),
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setNewOperation({
      name: operation.name,
      description: operation.description,
      action_id: operation.action_id,
      code: operation.code,
      wilaya_id: operation.wilaya_id,
      titre_budgetaire: operation.titre_budgetaire,
      origine_financement: operation.origine_financement,
      allocated_ae: operation.allocated_ae,
      allocated_cp: operation.allocated_cp,
      consumed_ae: operation.consumed_ae,
      consumed_cp: operation.consumed_cp,
      physical_rate: operation.physical_rate,
      financial_rate: operation.financial_rate,
      status: operation.status,
      inscription_date: operation.inscription_date,
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

  // Handler for adding a new operation
  const handleAddOperation = async () => {
    if (!newOperation.name || !newOperation.action_id || !newOperation.code || !newOperation.wilaya_id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      await operationMutation.mutateAsync({
        type: "INSERT",
        data: newOperation,
      });

      setIsAddDialogOpen(false);
      toast({
        title: "Opération ajoutée",
        description: `L'opération "${newOperation.name}" a été ajoutée avec succès.`,
      });
    } catch (error) {
      console.error("Error adding operation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de l'opération.",
        variant: "destructive",
      });
    }
  };

  // Handler for editing an operation
  const handleEditOperation = async () => {
    if (!currentOperation) return;

    if (!newOperation.name || !newOperation.action_id || !newOperation.code) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      await operationMutation.mutateAsync({
        type: "UPDATE",
        id: currentOperation.id,
        data: newOperation,
      });

      setIsEditDialogOpen(false);
      toast({
        title: "Opération modifiée",
        description: `L'opération a été modifiée avec succès.`,
      });
    } catch (error) {
      console.error("Error updating operation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification de l'opération.",
        variant: "destructive",
      });
    }
  };

  // Handler for deleting an operation
  const handleDeleteOperation = async () => {
    if (!currentOperation) return;

    try {
      await operationMutation.mutateAsync({
        type: "DELETE",
        id: currentOperation.id,
      });

      setIsDeleteDialogOpen(false);
      toast({
        title: "Opération supprimée",
        description: `L'opération a été supprimée avec succès.`,
      });
    } catch (error) {
      console.error("Error deleting operation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de l'opération.",
        variant: "destructive",
      });
    }
  };

  if (operationsLoading) {
    return <PageLoadingSpinner message="Chargement des opérations..." />;
  }

  return (
    <Dashboard>
      <DashboardHeader title="Gestion des Opérations" description="Suivez et gérez les opérations dans le cadre des actions budgétaires">
        <Button className="shadow-subtle" onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle opération
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <OperationsDashboard operations={operationsData} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="list" className="animate-fade-in">
            {/* Operations filter component */}
            <OperationsFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              programFilter={programFilter}
              setProgramFilter={setProgramFilter}
              wilayaFilter={wilayaFilter}
              setWilayaFilter={setWilayaFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              titreBudgetaireFilter={titreBudgetaireFilter}
              setTitreBudgetaireFilter={setTitreBudgetaireFilter}
              origineFinancementFilter={origineFinancementFilter}
              setOrigineFinancementFilter={setOrigineFinancementFilter}
              programsData={programsData}
              wilayasData={wilayasData}
            />

            <Card className="budget-card">
              <CardHeader>
                <CardTitle>Liste des Opérations</CardTitle>
                <CardDescription>
                  {filteredOperations.length} opération{filteredOperations.length !== 1 ? "s" : ""} trouvée
                  {filteredOperations.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OperationsTable
                  operations={filteredOperations}
                  formatCurrency={(value) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "DZD" }).format(value)}
                  onView={handleOpenViewDialog}
                  onEdit={handleOpenEditDialog}
                  onDelete={handleOpenDeleteDialog}
                  onRefresh={() => {
                    // Simulate refresh
                    toast({
                      title: "Données actualisées",
                      description: "La liste des opérations a été actualisée",
                    });
                    refetchOperations();
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional tabs can be added here */}
        </Tabs>
      </DashboardSection>

      {/* Operation form dialogs component */}
      <OperationFormDialogs
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        newOperation={newOperation}
        setNewOperation={setNewOperation}
        handleAddOperation={handleAddOperation}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        currentOperation={currentOperation}
        handleEditOperation={handleEditOperation}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        handleDeleteOperation={handleDeleteOperation}
        actionsData={actionsData}
        wilayasData={wilayasData}
      />

      {/* Operation view dialog component */}
      <OperationViewDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        operation={currentOperation}
        programsData={programsData}
        onEdit={handleOpenEditDialog}
      />
    </Dashboard>
  );
}
