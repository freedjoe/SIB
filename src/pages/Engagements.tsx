import { useState } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit, Trash2, Search, Eye, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock data for engagements
interface Engagement {
  id: string;
  operation: string;
  beneficiaire: string;
  montant_demande: number;
  montant_approuve: number | null;
  statut: "En attente" | "Approuvé" | "Rejeté";
  date: string;
  priorite: "Haute" | "Moyenne" | "Basse";
  demande_par: string;
}

const mockEngagements: Engagement[] = [
  {
    id: "ENG001",
    operation: "Rénovation des routes nationales",
    beneficiaire: "Entreprise de construction ABC",
    montant_demande: 2500000,
    montant_approuve: 2200000,
    statut: "Approuvé",
    date: "2023-08-15",
    priorite: "Haute",
    demande_par: "Département des travaux publics",
  },
  {
    id: "ENG002",
    operation: "Équipement des laboratoires universitaires",
    beneficiaire: "Université des Sciences",
    montant_demande: 1200000,
    montant_approuve: null,
    statut: "En attente",
    date: "2023-09-02",
    priorite: "Moyenne",
    demande_par: "Ministère de l'Enseignement Supérieur",
  },
  {
    id: "ENG003",
    operation: "Construction d'un hôpital",
    beneficiaire: "Entreprise de BTP XYZ",
    montant_demande: 5000000,
    montant_approuve: null,
    statut: "En attente",
    date: "2023-09-05",
    priorite: "Haute",
    demande_par: "Ministère de la Santé",
  },
  {
    id: "ENG004",
    operation: "Achat de matériel informatique",
    beneficiaire: "Fournisseur Informatique DEF",
    montant_demande: 800000,
    montant_approuve: 750000,
    statut: "Approuvé",
    date: "2023-08-25",
    priorite: "Moyenne",
    demande_par: "Direction des Systèmes d'Information",
  },
  {
    id: "ENG005",
    operation: "Programme de formation continue",
    beneficiaire: "Centre de Formation Professionnelle",
    montant_demande: 350000,
    montant_approuve: 0,
    statut: "Rejeté",
    date: "2023-08-10",
    priorite: "Basse",
    demande_par: "Direction des Ressources Humaines",
  },
  {
    id: "ENG006",
    operation: "Équipement médical",
    beneficiaire: "Fournisseur Médical MediPlus",
    montant_demande: 1800000,
    montant_approuve: null,
    statut: "En attente",
    date: "2023-09-08",
    priorite: "Haute",
    demande_par: "Direction Centrale des Hôpitaux",
  },
];

// Beneficiaries for select dropdown
const beneficiaires = [
  "Entreprise de construction ABC",
  "Université des Sciences",
  "Entreprise de BTP XYZ",
  "Fournisseur Informatique DEF",
  "Centre de Formation Professionnelle",
  "Fournisseur Médical MediPlus",
];

// Operations for select dropdown
const operations = [
  "Rénovation des routes nationales",
  "Équipement des laboratoires universitaires",
  "Construction d'un hôpital",
  "Achat de matériel informatique",
  "Programme de formation continue",
  "Équipement médical",
];

// Departments for select dropdown
const departments = [
  "Département des travaux publics",
  "Ministère de l'Enseignement Supérieur",
  "Ministère de la Santé",
  "Direction des Systèmes d'Information",
  "Direction des Ressources Humaines",
  "Direction Centrale des Hôpitaux",
];

export default function Engagements() {
  const { t } = useTranslation();
  const [engagements, setEngagements] = useState<Engagement[]>(mockEngagements);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("liste");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
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

  // Filter engagements based on search term
  const filteredEngagements = engagements.filter(
    (engagement) =>
      engagement.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.beneficiaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get pending approvals
  const pendingApprovals = engagements.filter(
    (engagement) => engagement.statut === "En attente"
  );

  // Open add dialog
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

  // Open edit dialog
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

  // Open delete dialog
  const handleOpenDeleteDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setIsDeleteDialogOpen(true);
  };

  // Open view dialog
  const handleOpenViewDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setIsViewDialogOpen(true);
  };

  // Open approve dialog
  const handleOpenApproveDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setApprovalAmount(engagement.montant_demande);
    setIsApproveDialogOpen(true);
  };

  // Add new engagement
  const handleAddEngagement = () => {
    if (
      !newEngagement.operation ||
      !newEngagement.beneficiaire ||
      !newEngagement.demande_par
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const engagement: Engagement = {
      id: `ENG${String(engagements.length + 1).padStart(3, "0")}`,
      operation: newEngagement.operation!,
      beneficiaire: newEngagement.beneficiaire!,
      montant_demande: Number(newEngagement.montant_demande) || 0,
      montant_approuve: null,
      statut: "En attente",
      date: newEngagement.date!,
      priorite: newEngagement.priorite as "Haute" | "Moyenne" | "Basse",
      demande_par: newEngagement.demande_par!,
    };

    setEngagements([...engagements, engagement]);
    setIsAddDialogOpen(false);
    toast({
      title: "Engagement ajouté",
      description: `L'engagement pour "${engagement.operation}" a été ajouté avec succès.`,
    });
  };

  // Edit engagement
  const handleEditEngagement = () => {
    if (!currentEngagement) return;

    if (
      !newEngagement.operation ||
      !newEngagement.beneficiaire ||
      !newEngagement.demande_par
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const updatedEngagements = engagements.map((engagement) =>
      engagement.id === currentEngagement.id
        ? {
            ...engagement,
            operation: newEngagement.operation!,
            beneficiaire: newEngagement.beneficiaire!,
            montant_demande: Number(newEngagement.montant_demande) || 0,
            priorite: newEngagement.priorite as "Haute" | "Moyenne" | "Basse",
            demande_par: newEngagement.demande_par!,
            date: newEngagement.date!,
          }
        : engagement
    );

    setEngagements(updatedEngagements);
    setIsEditDialogOpen(false);
    toast({
      title: "Engagement modifié",
      description: `L'engagement pour "${currentEngagement.operation}" a été modifié avec succès.`,
    });
  };

  // Delete engagement
  const handleDeleteEngagement = () => {
    if (!currentEngagement) return;

    const updatedEngagements = engagements.filter(
      (engagement) => engagement.id !== currentEngagement.id
    );
    setEngagements(updatedEngagements);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Engagement supprimé",
      description: `L'engagement pour "${currentEngagement.operation}" a été supprimé avec succès.`,
    });
  };

  // Approve engagement
  const handleApproveEngagement = () => {
    if (!currentEngagement) return;

    const amount = typeof approvalAmount === "string" 
      ? parseFloat(approvalAmount) 
      : approvalAmount;

    if (isNaN(Number(amount))) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide.",
        variant: "destructive",
      });
      return;
    }

    const updatedEngagements = engagements.map((engagement) =>
      engagement.id === currentEngagement.id
        ? {
            ...engagement,
            montant_approuve: Number(amount),
            statut: "Approuvé" as const,
          }
        : engagement
    );

    setEngagements(updatedEngagements);
    setIsApproveDialogOpen(false);
    toast({
      title: "Engagement approuvé",
      description: `L'engagement pour "${currentEngagement.operation}" a été approuvé avec succès.`,
    });
  };

  // Reject engagement
  const handleRejectEngagement = (engagement: Engagement) => {
    const updatedEngagements = engagements.map((e) =>
      e.id === engagement.id
        ? {
            ...e,
            montant_approuve: 0,
            statut: "Rejeté" as const,
          }
        : e
    );

    setEngagements(updatedEngagements);
    toast({
      title: "Engagement rejeté",
      description: `L'engagement pour "${engagement.operation}" a été rejeté.`,
    });
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approuvé":
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case "Rejeté":
        return <Badge variant="destructive">Rejeté</Badge>;
      case "En attente":
        return <Badge variant="outline">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Priority badge styling
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

  
  return (
    <Dashboard className="p-6">
      <DashboardHeader
        title={t("app.navigation.engagements")}
        description="Gestion des engagements budgétaires"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="liste">Liste des Engagements</TabsTrigger>
          <TabsTrigger value="approbations">
            Approbations en Attente
            {pendingApprovals.length > 0 && (
              <Badge variant="secondary" className="ml-2">
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

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Opération</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead className="text-right">Montant demandé</TableHead>
                    <TableHead className="text-right">Montant approuvé</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEngagements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Aucun engagement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEngagements.map((engagement) => (
                      <TableRow key={engagement.id}>
                        <TableCell>{engagement.id}</TableCell>
                        <TableCell className="font-medium">
                          {engagement.operation}
                        </TableCell>
                        <TableCell>{engagement.beneficiaire}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(engagement.montant_demande)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(engagement.montant_approuve)}
                        </TableCell>
                        <TableCell>{getStatusBadge(engagement.statut)}</TableCell>
                        <TableCell>{formatDate(engagement.date)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenViewDialog(engagement)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditDialog(engagement)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDeleteDialog(engagement)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                        <TableCell>
                          {getPriorityBadge(engagement.priorite)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {engagement.operation} - {engagement.beneficiaire}
                        </TableCell>
                        <TableCell>{engagement.demande_par}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(engagement.montant_demande)}
                        </TableCell>
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
      </Tabs>

      {/* Add Engagement Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel engagement</DialogTitle>
            <DialogDescription>
              Complétez le formulaire pour ajouter un nouvel engagement budgétaire.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operation" className="text-right">
                Opération
              </Label>
              <Select
                value={newEngagement.operation}
                onValueChange={(value) =>
                  setNewEngagement({ ...newEngagement, operation: value })
                }
              >
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
              <Select
                value={newEngagement.beneficiaire}
                onValueChange={(value) =>
                  setNewEngagement({ ...newEngagement, beneficiaire: value })
                }
              >
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
              <Select
                value={newEngagement.demande_par}
                onValueChange={(value) =>
                  setNewEngagement({ ...newEngagement, demande_par: value })
                }
              >
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
                onChange={(e) =>
                  setNewEngagement({ ...newEngagement, date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleAddEngagement}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Engagement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'engagement</DialogTitle>
            <DialogDescription>
              Modifiez les détails de l'engagement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-operation" className="text-right">
                Opération
              </Label>
              <Select
                value={newEngagement.operation}
                onValueChange={(value) =>
                  setNewEngagement({ ...newEngagement, operation: value })
                }
              >
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
              <Select
                value={newEngagement.beneficiaire}
                onValueChange={(value) =>
                  setNewEngagement({ ...newEngagement, beneficiaire: value })
                }
              >
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
              <Select
                value={newEngagement.demande_par}
                onValueChange={(value) =>
                  setNewEngagement({ ...newEngagement, demande_par: value })
                }
              >
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
                onChange={(e) =>
                  setNewEngagement({ ...newEngagement, date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleEditEngagement}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Engagement Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet engagement? Cette action est
              irréversible.
            </DialogDescription>
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
                <strong>Montant demandé:</strong>{" "}
                {formatCurrency(currentEngagement.montant_demande)}
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
            <Button variant="destructive" onClick={handleDeleteEngagement}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Engagement Dialog */}
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
                <div>{getStatus
