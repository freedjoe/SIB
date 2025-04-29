import { useState } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCreditPaymentMutation, useCreditPayments, useFiscalYears, useOperations } from "@/hooks/useSupabaseData";
import { CreditPaymentWithRelations } from "@/types/credit_payments";
import { CreditPaymentsTable } from "@/components/tables/CreditPaymentsTable";
import { Textarea } from "@/components/ui/textarea";

export default function CreditPayments() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("liste");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [currentCreditPayment, setCurrentCreditPayment] = useState<CreditPaymentWithRelations | null>(null);
  const [newCreditPayment, setNewCreditPayment] = useState<Partial<CreditPaymentWithRelations>>({
    code: "",
    operation_id: "",
    fiscal_year_id: "",
    amount: 0,
    status: "draft",
    description: "",
  });

  // Use our custom React Query hooks
  const {
    data: creditPaymentsData = [],
    isLoading: isLoadingCreditPayments,
    refetch: refetchCreditPayments,
  } = useCreditPayments({
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const { data: operationsData = [], isLoading: isLoadingOperations } = useOperations({
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: fiscalYearsData = [], isLoading: isLoadingFiscalYears } = useFiscalYears({
    staleTime: 1000 * 60 * 60, // 60 minutes
  });

  // Use mutation hook for credit payment operations
  const creditPaymentMutation = useCreditPaymentMutation({
    onSuccess: () => {
      refetchCreditPayments();
      toast({
        title: "Succès",
        description: "L'opération a été effectuée avec succès",
      });
    },
  });

  // Filter credit payments based on search term and status
  const filteredCreditPayments = creditPaymentsData.filter((creditPayment) => {
    const operationTitle = creditPayment.operation?.title?.toLowerCase() || "";
    const code = creditPayment.code?.toLowerCase() || "";
    return operationTitle.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
  });

  const pendingApprovals = creditPaymentsData.filter((creditPayment) => creditPayment.status === "submitted");

  const handleOpenAddDialog = () => {
    setNewCreditPayment({
      code: `CP-${new Date().getTime().toString().slice(-8)}`,
      operation_id: "",
      fiscal_year_id: "",
      amount: 0,
      status: "draft",
      description: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (creditPayment: CreditPaymentWithRelations) => {
    setCurrentCreditPayment(creditPayment);
    setNewCreditPayment({
      code: creditPayment.code,
      operation_id: creditPayment.operation_id,
      fiscal_year_id: creditPayment.fiscal_year_id,
      amount: creditPayment.amount,
      status: creditPayment.status,
      description: creditPayment.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (creditPayment: CreditPaymentWithRelations) => {
    setCurrentCreditPayment(creditPayment);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenViewDialog = (creditPayment: CreditPaymentWithRelations) => {
    setCurrentCreditPayment(creditPayment);
    setIsViewDialogOpen(true);
  };

  const handleOpenApproveDialog = (creditPayment: CreditPaymentWithRelations) => {
    setCurrentCreditPayment(creditPayment);
    setIsApproveDialogOpen(true);
  };

  const handleAddCreditPayment = () => {
    if (!newCreditPayment.operation_id || !newCreditPayment.fiscal_year_id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    // Create new credit payment with data from state
    const creditPayment = {
      code: newCreditPayment.code,
      operation_id: newCreditPayment.operation_id,
      fiscal_year_id: newCreditPayment.fiscal_year_id,
      amount: Number(newCreditPayment.amount) || 0,
      status: "draft" as const,
      description: newCreditPayment.description || null,
    };

    // Use our mutation hook to add the credit payment
    creditPaymentMutation.mutateAsync({
      type: "INSERT",
      data: creditPayment,
    });

    setIsAddDialogOpen(false);
  };

  const handleEditCreditPayment = () => {
    if (!currentCreditPayment) return;

    if (!newCreditPayment.operation_id || !newCreditPayment.fiscal_year_id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    // Use our mutation hook to update the credit payment
    creditPaymentMutation.mutateAsync({
      type: "UPDATE",
      id: currentCreditPayment.id,
      data: {
        code: newCreditPayment.code,
        operation_id: newCreditPayment.operation_id,
        fiscal_year_id: newCreditPayment.fiscal_year_id,
        amount: Number(newCreditPayment.amount) || 0,
        description: newCreditPayment.description || null,
      },
    });

    setIsEditDialogOpen(false);
  };

  const handleDeleteCreditPayment = () => {
    if (!currentCreditPayment) return;

    // Use our mutation hook to delete the credit payment
    creditPaymentMutation.mutateAsync({
      type: "DELETE",
      id: currentCreditPayment.id,
    });

    setIsDeleteDialogOpen(false);
  };

  const handleApproveCreditPayment = () => {
    if (!currentCreditPayment) return;

    // Use our mutation hook to approve the credit payment
    creditPaymentMutation.mutateAsync({
      type: "UPDATE",
      id: currentCreditPayment.id,
      data: {
        status: "approved" as const,
      },
    });

    setIsApproveDialogOpen(false);
  };

  const handleRejectCreditPayment = (creditPayment: CreditPaymentWithRelations) => {
    // Use our mutation hook to reject the credit payment
    creditPaymentMutation.mutateAsync({
      type: "UPDATE",
      id: creditPayment.id,
      data: {
        status: "rejected" as const,
      },
    });

    toast({
      title: "Crédit de paiement rejeté",
      description: `Le crédit de paiement pour "${creditPayment.operation?.title || creditPayment.code}" a été rejeté.`,
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500">Soumis</Badge>;
      case "reviewed":
        return <Badge className="bg-purple-500">Révisé</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoadingCreditPayments || isLoadingOperations || isLoadingFiscalYears) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des crédits de paiement...</span>
      </div>
    );
  }

  return (
    <Dashboard className="p-6">
      <DashboardHeader title={t("app.navigation.creditPayments") || "Crédits de Paiement"} description="Gestion des crédits de paiement" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="liste">Liste des Crédits de Paiement</TabsTrigger>
          <TabsTrigger value="approbations">
            Approbations en Attente
            {pendingApprovals.length > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liste" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des crédits de paiement..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleOpenAddDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un crédit de paiement
                </Button>
              </div>

              <CreditPaymentsTable
                creditPayments={filteredCreditPayments}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                onEdit={handleOpenEditDialog}
                onDelete={handleOpenDeleteDialog}
                onView={handleOpenViewDialog}
                onApprove={handleOpenApproveDialog}
                onReject={handleRejectCreditPayment}
                onRefresh={() => {
                  refetchCreditPayments();
                  toast({
                    title: "Données actualisées",
                    description: "La liste des crédits de paiement a été actualisée",
                  });
                }}
                onAddNew={handleOpenAddDialog}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approbations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Approbations en attente</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune approbation en attente</p>
                </div>
              ) : (
                <CreditPaymentsTable
                  creditPayments={pendingApprovals}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  onEdit={handleOpenEditDialog}
                  onDelete={handleOpenDeleteDialog}
                  onView={handleOpenViewDialog}
                  onApprove={handleOpenApproveDialog}
                  onReject={handleRejectCreditPayment}
                  onRefresh={() => {
                    refetchCreditPayments();
                    toast({
                      title: "Données actualisées",
                      description: "La liste des approbations a été actualisée",
                    });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un crédit de paiement</DialogTitle>
            <DialogDescription>Complétez le formulaire pour ajouter un crédit de paiement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                value={newCreditPayment.code || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operation" className="text-right">
                Opération
              </Label>
              <Select
                value={newCreditPayment.operation_id}
                onValueChange={(value) => setNewCreditPayment({ ...newCreditPayment, operation_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une opération" />
                </SelectTrigger>
                <SelectContent>
                  {operationsData.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      {operation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fiscal_year" className="text-right">
                Année Fiscale
              </Label>
              <Select
                value={newCreditPayment.fiscal_year_id}
                onValueChange={(value) => setNewCreditPayment({ ...newCreditPayment, fiscal_year_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une année fiscale" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYearsData.map((fiscalYear) => (
                    <SelectItem key={fiscalYear.id} value={fiscalYear.id}>
                      {fiscalYear.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={newCreditPayment.amount || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={newCreditPayment.description || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCreditPayment}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le crédit de paiement</DialogTitle>
            <DialogDescription>Modifiez les détails du crédit de paiement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Code
              </Label>
              <Input
                id="edit-code"
                value={newCreditPayment.code || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-operation" className="text-right">
                Opération
              </Label>
              <Select
                value={newCreditPayment.operation_id}
                onValueChange={(value) => setNewCreditPayment({ ...newCreditPayment, operation_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une opération" />
                </SelectTrigger>
                <SelectContent>
                  {operationsData.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      {operation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fiscal_year" className="text-right">
                Année Fiscale
              </Label>
              <Select
                value={newCreditPayment.fiscal_year_id}
                onValueChange={(value) => setNewCreditPayment({ ...newCreditPayment, fiscal_year_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une année fiscale" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYearsData.map((fiscalYear) => (
                    <SelectItem key={fiscalYear.id} value={fiscalYear.id}>
                      {fiscalYear.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                Montant
              </Label>
              <Input
                id="edit-amount"
                type="number"
                className="col-span-3"
                value={newCreditPayment.amount || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Statut
              </Label>
              <Select value={newCreditPayment.status} onValueChange={(value: any) => setNewCreditPayment({ ...newCreditPayment, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="submitted">Soumis</SelectItem>
                  <SelectItem value="reviewed">Révisé</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                className="col-span-3"
                value={newCreditPayment.description || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditCreditPayment}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer ce crédit de paiement? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {currentCreditPayment && (
            <div className="py-4">
              <p>
                <strong>ID:</strong> {currentCreditPayment.id}
              </p>
              <p>
                <strong>Code:</strong> {currentCreditPayment.code}
              </p>
              <p>
                <strong>Opération:</strong> {currentCreditPayment.operation?.title}
              </p>
              <p>
                <strong>Montant:</strong> {formatCurrency(currentCreditPayment.amount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteCreditPayment}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du crédit de paiement</DialogTitle>
          </DialogHeader>
          {currentCreditPayment && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID:</div>
                <div>{currentCreditPayment.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Code:</div>
                <div>{currentCreditPayment.code}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Opération:</div>
                <div>{currentCreditPayment.operation?.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Année fiscale:</div>
                <div>{currentCreditPayment.fiscal_year?.year}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Montant:</div>
                <div>{formatCurrency(currentCreditPayment.amount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Statut:</div>
                <div>{getStatusBadge(currentCreditPayment.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Date de création:</div>
                <div>{formatDate(currentCreditPayment.created_at)}</div>
              </div>
              {currentCreditPayment.description && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Description:</div>
                  <div>{currentCreditPayment.description}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approuver le crédit de paiement</DialogTitle>
            <DialogDescription>Confirmez l'approbation de ce crédit de paiement.</DialogDescription>
          </DialogHeader>
          {currentCreditPayment && (
            <div className="py-4 space-y-4">
              <p>
                <strong>Opération:</strong> {currentCreditPayment.operation?.title}
              </p>
              <p>
                <strong>Code:</strong> {currentCreditPayment.code}
              </p>
              <p>
                <strong>Année fiscale:</strong> {currentCreditPayment.fiscal_year?.year}
              </p>
              <p>
                <strong>Montant:</strong> {formatCurrency(currentCreditPayment.amount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApproveCreditPayment}>Approuver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
