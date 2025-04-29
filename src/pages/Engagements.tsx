import { useState } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit, Trash2, Search, Eye, Check, X, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReevaluationDialog } from "@/components/dialogs/ReevaluationDialog";
import { useEffect } from "react";
import { ReevaluationsTable } from "@/components/tables/ReevaluationsTable";
import { getAllEngagementReevaluations, EngagementReevaluationWithRelations } from "@/services/engagementReevaluationsService";
import { EngagementsTable } from "@/components/tables/EngagementsTable";
import { useEngagements, useOperations, useMinistries, useEngagementMutation } from "@/hooks/useSupabaseData";
import { Engagement, Operation, Ministry } from "@/types/database.types";

export default function Engagements() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("liste");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isReevaluationDialogOpen, setIsReevaluationDialogOpen] = useState(false);
  const [selectedEngagementForReevaluation, setSelectedEngagementForReevaluation] = useState<Engagement | null>(null);
  const [currentEngagement, setCurrentEngagement] = useState<Engagement | null>(null);
  const [newEngagement, setNewEngagement] = useState<Partial<Engagement>>({
    operation: "",
    beneficiaire: "",
    montant_demande: 0,
    statut: "En attente",
    priorite: "Moyenne",
    demande_par: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [approvalAmount, setApprovalAmount] = useState<number | "">(0);
  const [reevaluations, setReevaluations] = useState<EngagementReevaluationWithRelations[]>([]);
  const [reevaluationSearchTerm, setReevaluationSearchTerm] = useState("");

  // Use our custom React Query hooks with staleTime configurations for local storage persistence
  const {
    data: engagementsData = [],
    isLoading: isLoadingEngagements,
    refetch: refetchEngagements,
  } = useEngagements({
    staleTime: 1000 * 60 * 10, // 10 minutes - engagements change moderately often
  });

  const { data: operationsData = [], isLoading: isLoadingOperations } = useOperations({
    staleTime: 1000 * 60 * 30, // 30 minutes - operations change less frequently
  });

  const { data: ministriesData = [], isLoading: isLoadingMinistries } = useMinistries({
    staleTime: 1000 * 60 * 60, // 60 minutes - ministries rarely change
  });

  // Use mutation hook for engagement operations
  const engagementMutation = useEngagementMutation({
    onSuccess: () => {
      refetchEngagements();
      toast({
        title: "Succès",
        description: "L'opération a été effectuée avec succès",
      });
    },
  });

  const filteredReevaluations = reevaluations.filter(
    (reevaluation) =>
      reevaluation.engagement?.reference?.toLowerCase().includes(reevaluationSearchTerm.toLowerCase()) ||
      reevaluation.engagement?.operation?.name?.toLowerCase().includes(reevaluationSearchTerm.toLowerCase())
  );

  // Filter engagements based on search term
  const filteredEngagements = engagementsData.filter((engagement) => {
    const operationText = typeof engagement.operation === "string" ? engagement.operation.toLowerCase() : String(engagement.operation).toLowerCase();

    const beneficiaireText =
      typeof engagement.beneficiaire === "string" ? engagement.beneficiaire.toLowerCase() : String(engagement.beneficiaire).toLowerCase();

    const statutText = typeof engagement.statut === "string" ? engagement.statut.toLowerCase() : String(engagement.statut).toLowerCase();

    return (
      operationText.includes(searchTerm.toLowerCase()) ||
      beneficiaireText.includes(searchTerm.toLowerCase()) ||
      statutText.includes(searchTerm.toLowerCase())
    );
  });

  const pendingApprovals = engagementsData.filter((engagement) => engagement.statut === "En attente");

  const handleOpenAddDialog = () => {
    setNewEngagement({
      operation: "",
      beneficiaire: "",
      montant_demande: 0,
      statut: "En attente",
      priorite: "Moyenne",
      demande_par: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setNewEngagement({
      operation: engagement.operation,
      beneficiaire: engagement.beneficiaire,
      montant_demande: engagement.montant_demande,
      statut: engagement.statut,
      priorite: engagement.priorite,
      demande_par: engagement.demande_par,
      date: engagement.date,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenViewDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setIsViewDialogOpen(true);
  };

  const handleOpenApproveDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setApprovalAmount(engagement.montant_demande);
    setIsApproveDialogOpen(true);
  };

  const handleOpenReevaluationDialog = (engagement: Engagement) => {
    setSelectedEngagementForReevaluation(engagement);
    setIsReevaluationDialogOpen(true);
  };

  const handleAddEngagement = () => {
    if (!newEngagement.operation || !newEngagement.beneficiaire || !newEngagement.demande_par) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    // Create new engagement with data from state
    const engagement: Partial<Engagement> = {
      operation: newEngagement.operation!,
      beneficiaire: newEngagement.beneficiaire!,
      montant_demande: Number(newEngagement.montant_demande) || 0,
      montant_approuve: null,
      statut: "En attente",
      date: newEngagement.date!,
      priorite: newEngagement.priorite as "Haute" | "Moyenne" | "Basse",
      demande_par: newEngagement.demande_par!,
    };

    // Use our mutation hook to add the engagement
    engagementMutation.mutateAsync({
      type: "INSERT",
      data: engagement,
    });

    setIsAddDialogOpen(false);
  };

  const handleEditEngagement = () => {
    if (!currentEngagement) return;

    if (!newEngagement.operation || !newEngagement.beneficiaire || !newEngagement.demande_par) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    // Use our mutation hook to update the engagement
    engagementMutation.mutateAsync({
      type: "UPDATE",
      id: currentEngagement.id,
      data: {
        operation: newEngagement.operation!,
        beneficiaire: newEngagement.beneficiaire!,
        montant_demande: Number(newEngagement.montant_demande) || 0,
        priorite: newEngagement.priorite as "Haute" | "Moyenne" | "Basse",
        demande_par: newEngagement.demande_par!,
        date: newEngagement.date!,
      },
    });

    setIsEditDialogOpen(false);
  };

  const handleDeleteEngagement = () => {
    if (!currentEngagement) return;

    // Use our mutation hook to delete the engagement
    engagementMutation.mutateAsync({
      type: "DELETE",
      id: currentEngagement.id,
    });

    setIsDeleteDialogOpen(false);
  };

  const handleApproveEngagement = () => {
    if (!currentEngagement) return;

    const amount = typeof approvalAmount === "string" ? parseFloat(approvalAmount) : approvalAmount;

    if (isNaN(Number(amount))) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide.",
        variant: "destructive",
      });
      return;
    }

    // Use our mutation hook to update the engagement
    engagementMutation.mutateAsync({
      type: "UPDATE",
      id: currentEngagement.id,
      data: {
        montant_approuve: Number(amount),
        statut: "Approuvé" as const,
      },
    });

    setIsApproveDialogOpen(false);
  };

  const handleRejectEngagement = (engagement: Engagement) => {
    // Use our mutation hook to reject the engagement
    engagementMutation.mutateAsync({
      type: "UPDATE",
      id: engagement.id,
      data: {
        montant_approuve: 0,
        statut: "Rejeté" as const,
      },
    });

    toast({
      title: "Engagement rejeté",
      description: `L'engagement pour "${engagement.operation}" a été rejeté.`,
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approuvé":
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case "Rejeté":
        return <Badge variant="destructive">Rejeté</Badge>;
      case "En attente":
        return <Badge variant="warning">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Haute":
        return <Badge className="bg-red-500">Haute</Badge>;
      case "Moyenne":
        return <Badge className="bg-yellow-500">Moyenne</Badge>;
      case "Basse":
        return <Badge className="bg-blue-500">Basse</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const handleReevaluationSuccess = () => {
    setIsReevaluationDialogOpen(false);
    setSelectedEngagementForReevaluation(null);
    toast({
      title: "Réévaluation d'engagement",
      description: "La demande de réévaluation a été soumise avec succès.",
    });

    // Refresh the reevaluations list
    getAllEngagementReevaluations()
      .then((res) => {
        setReevaluations(res);
      })
      .catch((error) => {
        console.error("Error fetching reevaluations:", error);
      });
  };

  if (isLoadingEngagements || isLoadingOperations || isLoadingMinistries) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des engagements...</span>
      </div>
    );
  }

  // Extract operation names from operationsData
  const operations = operationsData.map((operation) => operation.name);

  // Extract ministry names to use as departments
  const departments = ministriesData.map((ministry) => ministry.name_fr);

  // Mock beneficiaries until we have a proper API endpoint
  const beneficiaires = [
    "Entreprise Nationale de Travaux Publics",
    "SONATRACH",
    "SONELGAZ",
    "Ministère de la Défense Nationale",
    "Office National des Statistiques",
    "Direction Générale des Impôts",
  ];

  return (
    <Dashboard className="p-6">
      <DashboardHeader title={t("app.navigation.engagements")} description="Gestion des engagements budgétaires" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="liste">Liste des Engagements</TabsTrigger>
          <TabsTrigger value="approbations">
            Approbations en Attente
            {pendingApprovals.length > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historique">Historique des réévaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="liste" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des engagements..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleOpenAddDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un engagement
                </Button>
              </div>

              <EngagementsTable
                engagements={filteredEngagements}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                onEdit={handleOpenEditDialog}
                onDelete={handleOpenDeleteDialog}
                onView={handleOpenViewDialog}
                onReevaluate={handleOpenReevaluationDialog}
                onApprove={handleOpenApproveDialog}
                onReject={handleRejectEngagement}
                onRefresh={() => {
                  refetchEngagements();
                  toast({
                    title: "Données actualisées",
                    description: "La liste des engagements a été actualisée",
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Détail engagement</TableHead>
                    <TableHead>Demandé par</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucune approbation en attente
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingApprovals.map((engagement) => (
                      <TableRow key={engagement.id}>
                        <TableCell>{getPriorityBadge(engagement.priorite)}</TableCell>
                        <TableCell className="font-medium">
                          {engagement.operation} - {engagement.beneficiaire}
                        </TableCell>
                        <TableCell>{engagement.demande_par}</TableCell>
                        <TableCell className="text-right">{formatCurrency(engagement.montant_demande)}</TableCell>
                        <TableCell>{formatDate(engagement.date)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleOpenApproveDialog(engagement)}
                            >
                              <Check className="mr-1 h-4 w-4" /> Approuver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleRejectEngagement(engagement)}
                            >
                              <X className="mr-1 h-4 w-4" /> Rejeter
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historique" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des réévaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-72 mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par engagement..."
                  className="pl-8"
                  value={reevaluationSearchTerm}
                  onChange={(e) => setReevaluationSearchTerm(e.target.value)}
                />
              </div>
              <ReevaluationsTable reevaluations={filteredReevaluations} formatCurrency={formatCurrency} formatDate={formatDate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel engagement</DialogTitle>
            <DialogDescription>Complétez le formulaire pour ajouter un nouvel engagement budgétaire.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operation" className="text-right">
                Opération
              </Label>
              <Select value={newEngagement.operation} onValueChange={(value) => setNewEngagement({ ...newEngagement, operation: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une opération" />
                </SelectTrigger>
                <SelectContent>
                  {operations.map((operation) => (
                    <SelectItem key={operation} value={operation}>
                      {operation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="beneficiaire" className="text-right">
                Bénéficiaire
              </Label>
              <Select value={newEngagement.beneficiaire} onValueChange={(value) => setNewEngagement({ ...newEngagement, beneficiaire: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un bénéficiaire" />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaires.map((beneficiaire) => (
                    <SelectItem key={beneficiaire} value={beneficiaire}>
                      {beneficiaire}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="montant" className="text-right">
                Montant demandé
              </Label>
              <Input
                id="montant"
                type="number"
                className="col-span-3"
                value={newEngagement.montant_demande || ""}
                onChange={(e) =>
                  setNewEngagement({
                    ...newEngagement,
                    montant_demande: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="demande_par" className="text-right">
                Demandé par
              </Label>
              <Select value={newEngagement.demande_par} onValueChange={(value) => setNewEngagement({ ...newEngagement, demande_par: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priorite" className="text-right">
                Priorité
              </Label>
              <Select
                value={newEngagement.priorite}
                onValueChange={(value) =>
                  setNewEngagement({
                    ...newEngagement,
                    priorite: value as "Haute" | "Moyenne" | "Basse",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Haute">Haute</SelectItem>
                  <SelectItem value="Moyenne">Moyenne</SelectItem>
                  <SelectItem value="Basse">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={newEngagement.date || ""}
                onChange={(e) => setNewEngagement({ ...newEngagement, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddEngagement}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'engagement</DialogTitle>
            <DialogDescription>Modifiez les détails de l'engagement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-operation" className="text-right">
                Opération
              </Label>
              <Select value={newEngagement.operation} onValueChange={(value) => setNewEngagement({ ...newEngagement, operation: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une opération" />
                </SelectTrigger>
                <SelectContent>
                  {operations.map((operation) => (
                    <SelectItem key={operation} value={operation}>
                      {operation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-beneficiaire" className="text-right">
                Bénéficiaire
              </Label>
              <Select value={newEngagement.beneficiaire} onValueChange={(value) => setNewEngagement({ ...newEngagement, beneficiaire: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un bénéficiaire" />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaires.map((beneficiaire) => (
                    <SelectItem key={beneficiaire} value={beneficiaire}>
                      {beneficiaire}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-montant" className="text-right">
                Montant demandé
              </Label>
              <Input
                id="edit-montant"
                type="number"
                className="col-span-3"
                value={newEngagement.montant_demande || ""}
                onChange={(e) =>
                  setNewEngagement({
                    ...newEngagement,
                    montant_demande: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-demande-par" className="text-right">
                Demandé par
              </Label>
              <Select value={newEngagement.demande_par} onValueChange={(value) => setNewEngagement({ ...newEngagement, demande_par: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-priorite" className="text-right">
                Priorité
              </Label>
              <Select
                value={newEngagement.priorite}
                onValueChange={(value) =>
                  setNewEngagement({
                    ...newEngagement,
                    priorite: value as "Haute" | "Moyenne" | "Basse",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Haute">Haute</SelectItem>
                  <SelectItem value="Moyenne">Moyenne</SelectItem>
                  <SelectItem value="Basse">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Date
              </Label>
              <Input
                id="edit-date"
                type="date"
                className="col-span-3"
                value={newEngagement.date || ""}
                onChange={(e) => setNewEngagement({ ...newEngagement, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditEngagement}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer cet engagement? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {currentEngagement && (
            <div className="py-4">
              <p>
                <strong>ID:</strong> {currentEngagement.id}
              </p>
              <p>
                <strong>Opération:</strong> {currentEngagement.operation}
              </p>
              <p>
                <strong>Bénéficiaire:</strong> {currentEngagement.beneficiaire}
              </p>
              <p>
                <strong>Montant demandé:</strong> {formatCurrency(currentEngagement.montant_demande)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteEngagement}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l'engagement</DialogTitle>
          </DialogHeader>
          {currentEngagement && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID:</div>
                <div>{currentEngagement.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Opération:</div>
                <div>{currentEngagement.operation}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Bénéficiaire:</div>
                <div>{currentEngagement.beneficiaire}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Montant demandé:</div>
                <div>{formatCurrency(currentEngagement.montant_demande)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Montant approuvé:</div>
                <div>{formatCurrency(currentEngagement.montant_approuve)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Statut:</div>
                <div>{getStatusBadge(currentEngagement.statut)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Date:</div>
                <div>{formatDate(currentEngagement.date)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Priorité:</div>
                <div>{getPriorityBadge(currentEngagement.priorite)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Demandé par:</div>
                <div>{currentEngagement.demande_par}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approuver l'engagement</DialogTitle>
            <DialogDescription>Confirmez le montant approuvé pour cet engagement.</DialogDescription>
          </DialogHeader>
          {currentEngagement && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <p>
                  <strong>Opération:</strong> {currentEngagement.operation}
                </p>
                <p>
                  <strong>Bénéficiaire:</strong> {currentEngagement.beneficiaire}
                </p>
                <p>
                  <strong>Montant demandé:</strong> {formatCurrency(currentEngagement.montant_demande)}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="approval-amount" className="text-right">
                  Montant approuvé
                </Label>
                <Input
                  id="approval-amount"
                  type="number"
                  className="col-span-3"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApproveEngagement}>Approuver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedEngagementForReevaluation && (
        <ReevaluationDialog
          isOpen={isReevaluationDialogOpen}
          onClose={() => setIsReevaluationDialogOpen(false)}
          engagement={{
            id: selectedEngagementForReevaluation.id,
            reference: selectedEngagementForReevaluation.id,
            beneficiary: selectedEngagementForReevaluation.beneficiaire,
            montant_initial: selectedEngagementForReevaluation.montant_demande,
          }}
          onSuccess={handleReevaluationSuccess}
        />
      )}
    </Dashboard>
  );
}
