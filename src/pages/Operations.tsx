import { useState } from "react";
import { Dashboard, DashboardHeader, DashboardSection } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileCog, SearchIcon, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { OperationsTable, Operation } from "@/components/tables/OperationsTable";

// Mock data
const mockOperations: Operation[] = [
  {
    id: "op1",
    name: "Construction École Primaire de Koné",
    description: "Construction d'une école primaire de 12 classes",
    actionId: "a1",
    actionName: "Infrastructures Scolaires",
    programId: "prog1",
    programName: "Programme d'Éducation Nationale",
    code_operation: "OP-001",
    wilaya: "Alger",
    titre_budgetaire: 2,
    origine_financement: "budget_national",
    allocatedAmount: 120000000,
    usedAmount: 95000000,
    montant_consomme: 95000000,
    progress: 79,
    taux_physique: 75,
    taux_financier: 79,
    engagements: 4,
    payments: 3,
    status: "in_progress",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
  },
  {
    id: "op2",
    name: "Équipement Hôpital Central",
    description: "Acquisition d'équipement médical pour l'hôpital central",
    actionId: "a5",
    actionName: "Équipements Sanitaires",
    programId: "prog2",
    programName: "Santé Publique",
    code_operation: "OP-002",
    wilaya: "Oran",
    titre_budgetaire: 2,
    origine_financement: "budget_national",
    allocatedAmount: 85000000,
    usedAmount: 70000000,
    montant_consomme: 70000000,
    progress: 82,
    taux_physique: 82,
    taux_financier: 82,
    engagements: 3,
    payments: 2,
    status: "in_progress",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
  },
  {
    id: "op3",
    name: "Rénovation Route Nationale 1",
    description: "Travaux de rénovation sur 50km de la RN1",
    actionId: "a8",
    actionName: "Entretien Routier",
    programId: "prog3",
    programName: "Infrastructure Routière",
    code_operation: "OP-003",
    wilaya: "Constantine",
    titre_budgetaire: 2,
    origine_financement: "budget_national",
    allocatedAmount: 180000000,
    usedAmount: 95000000,
    montant_consomme: 95000000,
    progress: 53,
    taux_physique: 53,
    taux_financier: 53,
    engagements: 5,
    payments: 3,
    status: "in_progress",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
  },
  {
    id: "op4",
    name: "Distribution Semences Améliorées",
    description: "Distribution de semences aux agriculteurs",
    actionId: "a12",
    actionName: "Soutien aux Agriculteurs",
    programId: "prog4",
    programName: "Développement Agricole",
    code_operation: "OP-004",
    wilaya: "Sétif",
    titre_budgetaire: 1,
    origine_financement: "budget_national",
    allocatedAmount: 45000000,
    usedAmount: 45000000,
    montant_consomme: 45000000,
    progress: 100,
    taux_physique: 100,
    taux_financier: 100,
    engagements: 2,
    payments: 2,
    status: "completed",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
  },
  {
    id: "op5",
    name: "Formation des Enseignants",
    description: "Programme de formation continue des enseignants",
    actionId: "a2",
    actionName: "Qualité de l'Enseignement",
    programId: "prog1",
    programName: "Programme d'Éducation Nationale",
    code_operation: "OP-005",
    wilaya: "Alger",
    titre_budgetaire: 1,
    origine_financement: "budget_national",
    allocatedAmount: 35000000,
    usedAmount: 25000000,
    montant_consomme: 25000000,
    progress: 71,
    taux_physique: 71,
    taux_financier: 71,
    engagements: 3,
    payments: 2,
    status: "in_progress",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
  },
  {
    id: "op6",
    name: "Campagne de Vaccination",
    description: "Vaccination contre la méningite dans les zones rurales",
    actionId: "a6",
    actionName: "Prévention Sanitaire",
    programId: "prog2",
    programName: "Santé Publique",
    code_operation: "OP-006",
    wilaya: "Tlemcen",
    titre_budgetaire: 1,
    origine_financement: "financement_exterieur",
    allocatedAmount: 50000000,
    usedAmount: 45000000,
    montant_consomme: 45000000,
    progress: 90,
    taux_physique: 90,
    taux_financier: 90,
    engagements: 2,
    payments: 2,
    status: "in_progress",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
  },
  {
    id: "op7",
    name: "Construction Pont Sud",
    description: "Construction d'un pont reliant deux provinces",
    actionId: "a9",
    actionName: "Nouvelles Infrastructures",
    programId: "prog3",
    programName: "Infrastructure Routière",
    code_operation: "OP-007",
    wilaya: "Béchar",
    titre_budgetaire: 2,
    origine_financement: "budget_national",
    allocatedAmount: 250000000,
    usedAmount: 0,
    montant_consomme: 0,
    progress: 0,
    taux_physique: 0,
    taux_financier: 0,
    engagements: 0,
    payments: 0,
    status: "planned",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
  },
  {
    id: "op8",
    name: "Modernisation Systèmes d'Irrigation",
    description: "Installation de systèmes d'irrigation modernes",
    actionId: "a13",
    actionName: "Infrastructure Agricole",
    programId: "prog4",
    programName: "Développement Agricole",
    code_operation: "OP-008",
    wilaya: "Biskra",
    titre_budgetaire: 2,
    origine_financement: "financement_exterieur",
    allocatedAmount: 75000000,
    usedAmount: 20000000,
    montant_consomme: 20000000,
    progress: 27,
    taux_physique: 27,
    taux_financier: 27,
    engagements: 2,
    payments: 1,
    status: "in_progress",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
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

// Mock data for wilayas dropdown
const mockWilayas = [
  { id: "1", name: "Adrar" },
  { id: "2", name: "Chlef" },
  { id: "3", name: "Laghouat" },
  { id: "4", name: "Oum El Bouaghi" },
  { id: "5", name: "Batna" },
  { id: "6", name: "Béjaïa" },
  { id: "7", name: "Biskra" },
  { id: "8", name: "Béchar" },
  { id: "9", name: "Blida" },
  { id: "10", name: "Bouira" },
  { id: "11", name: "Tamanrasset" },
  { id: "12", name: "Tébessa" },
  { id: "13", name: "Tlemcen" },
  { id: "14", name: "Tiaret" },
  { id: "15", name: "Tizi Ouzou" },
  { id: "16", name: "Alger" },
  { id: "17", name: "Djelfa" },
  { id: "18", name: "Jijel" },
  { id: "19", name: "Sétif" },
  { id: "20", name: "Saïda" },
  { id: "21", name: "Skikda" },
  { id: "22", name: "Sidi Bel Abbès" },
  { id: "23", name: "Annaba" },
  { id: "24", name: "Guelma" },
  { id: "25", name: "Constantine" },
  { id: "26", name: "Médéa" },
  { id: "27", name: "Mostaganem" },
  { id: "28", name: "M'Sila" },
  { id: "29", name: "Mascara" },
  { id: "30", name: "Ouargla" },
  { id: "31", name: "Oran" },
  { id: "32", name: "El Bayadh" },
  { id: "33", name: "Illizi" },
  { id: "34", name: "Bordj Bou Arréridj" },
  { id: "35", name: "Boumerdès" },
  { id: "36", name: "El Tarf" },
  { id: "37", name: "Tindouf" },
  { id: "38", name: "Tissemsilt" },
  { id: "39", name: "El Oued" },
  { id: "40", name: "Khenchela" },
  { id: "41", name: "Souk Ahras" },
  { id: "42", name: "Tipaza" },
  { id: "43", name: "Mila" },
  { id: "44", name: "Aïn Defla" },
  { id: "45", name: "Naâma" },
  { id: "46", name: "Aïn Témouchent" },
  { id: "47", name: "Ghardaïa" },
  { id: "48", name: "Relizane" },
  { id: "49", name: "El M'Ghair" },
  { id: "50", name: "El Meniaa" },
  { id: "51", name: "Ouled Djellal" },
  { id: "52", name: "Bordj Baji Mokhtar" },
  { id: "53", name: "Béni Abbès" },
  { id: "54", name: "Timimoun" },
  { id: "55", name: "Touggourt" },
  { id: "56", name: "Djanet" },
  { id: "57", name: "El N'Dhala" },
  { id: "58", name: "El Goléa" },
];

// Mock data for titre_budgetaire dropdown
const mockTitresBudgetaires = [
  { id: 1, name: "Dépenses de fonctionnement", shortLabel: "T1" },
  { id: 2, name: "Dépenses d'équipement public", shortLabel: "T2" },
  { id: 3, name: "Dépenses en capital (ou transferts)", shortLabel: "T3" },
  { id: 4, name: "Charge de la dette publique", shortLabel: "T4" },
  { id: 5, name: "Dépenses exceptionnelles", shortLabel: "T5" },
];

// Add CSS for progress bar
const getProgressBarColor = (progress: number) => {
  if (progress >= 90) return "bg-green-600";
  if (progress >= 50) return "bg-yellow-500";
  return "bg-blue-600";
};

const getProgressTextColor = (progress: number) => {
  if (progress >= 90) return "text-green-600";
  if (progress >= 50) return "text-yellow-600";
  return "text-blue-600";
};

// Helper function to format titre budgétaire as T1, T2, etc.
const formatTitreBudgetaire = (titre: number) => {
  return `T${titre}`;
};

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [titreBudgetaireFilter, setTitreBudgetaireFilter] = useState("all");
  const [origineFinancementFilter, setOrigineFinancementFilter] = useState("all");
  const [operations, setOperations] = useState<Operation[]>(mockOperations);
  const [loading, setLoading] = useState(false); // Add this if not already present

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
    code_operation: "",
    wilaya: "",
    titre_budgetaire: 1,
    origine_financement: "budget_national",
    allocatedAmount: 0,
    usedAmount: 0,
    montant_consomme: 0,
    progress: 0,
    taux_physique: 0,
    taux_financier: 0,
    engagements: 0,
    payments: 0,
    status: "planned",
    start_date: "",
    end_date: "",
  });

  const filteredOperations = operations.filter((operation) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      operation.name.toLowerCase().includes(searchLower) ||
      operation.code_operation.toLowerCase().includes(searchLower) ||
      operation.description.toLowerCase().includes(searchLower) ||
      operation.wilaya.toLowerCase().includes(searchLower);

    // Program filter
    const matchesProgram = programFilter === "all" || operation.programId === programFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || operation.status === statusFilter;

    // Titre budgétaire filter
    const matchesTitreBudgetaire = titreBudgetaireFilter === "all" || operation.titre_budgetaire.toString() === titreBudgetaireFilter;

    // Origine financement filter
    const matchesOrigineFinancement = origineFinancementFilter === "all" || operation.origine_financement === origineFinancementFilter;

    // Return true if all filters match
    return matchesSearch && matchesProgram && matchesStatus && matchesTitreBudgetaire && matchesOrigineFinancement;
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
      code_operation: "",
      wilaya: "",
      titre_budgetaire: 1,
      origine_financement: "budget_national",
      allocatedAmount: 0,
      usedAmount: 0,
      montant_consomme: 0,
      progress: 0,
      taux_physique: 0,
      taux_financier: 0,
      engagements: 0,
      payments: 0,
      status: "planned",
      start_date: "",
      end_date: "",
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
      code_operation: operation.code_operation,
      wilaya: operation.wilaya,
      titre_budgetaire: operation.titre_budgetaire,
      origine_financement: operation.origine_financement,
      allocatedAmount: operation.allocatedAmount,
      usedAmount: operation.usedAmount,
      montant_consomme: operation.montant_consomme,
      progress: operation.progress,
      taux_physique: operation.taux_physique,
      taux_financier: operation.taux_financier,
      engagements: operation.engagements,
      payments: operation.payments,
      status: operation.status,
      start_date: operation.start_date,
      end_date: operation.end_date,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenViewDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setIsViewDialogOpen(true);
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 90) return "bg-green-600";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-600";
  };

  const getProgressTextColor = (progress: number) => {
    if (progress >= 90) return "text-green-600";
    if (progress >= 50) return "text-yellow-600";
    return "text-blue-600";
  };

  // Données fictives pour les tableaux dans la vue détaillée
  const mockEngagementsHistory = [
    {
      id: "eng1",
      date: "2023-02-15",
      reference: "ENG-2023-001",
      montant_initial: 35000000,
      montant_actuel: 35000000,
      statut: "Approuvé",
      beneficiaire: "Entreprise de construction ABC",
    },
    {
      id: "eng2",
      date: "2023-04-20",
      reference: "ENG-2023-002",
      montant_initial: 25000000,
      montant_actuel: 30000000,
      statut: "Réévalué",
      beneficiaire: "Fournisseur XYZ",
    },
    {
      id: "eng3",
      date: "2023-06-10",
      reference: "ENG-2023-003",
      montant_initial: 15000000,
      montant_actuel: 15000000,
      statut: "En cours",
      beneficiaire: "Consultant DEF",
    },
  ];

  const mockReevaluations = [
    {
      id: "reev1",
      date: "2023-05-10",
      engagement_ref: "ENG-2023-002",
      montant_initial: 25000000,
      montant_reevalue: 30000000,
      motif: "Augmentation du périmètre des travaux",
      statut: "Approuvée",
    },
  ];

  const mockCPAnnuels = [
    {
      id: "cp1",
      annee: "2023",
      montant_alloue: 50000000,
      montant_consomme: 35000000,
      taux_consommation: 70,
      statut: "En cours",
    },
    {
      id: "cp2",
      annee: "2024",
      montant_alloue: 40000000,
      montant_consomme: 0,
      taux_consommation: 0,
      statut: "Planifié",
    },
  ];

  const mockDemandesCP = [
    {
      id: "dcp1",
      date: "2023-01-20",
      montant: 30000000,
      motif: "Démarrage des travaux",
      statut: "Approuvée",
    },
    {
      id: "dcp2",
      date: "2023-05-15",
      montant: 20000000,
      motif: "Phase intermédiaire",
      statut: "En attente",
    },
  ];

  const mockContrats = [
    {
      id: "cont1",
      reference: "CTR-2023-001",
      entreprise: "Entreprise de construction ABC",
      date_signature: "2023-02-01",
      montant: 35000000,
      objet: "Construction principale",
      statut: "En cours",
    },
    {
      id: "cont2",
      reference: "CTR-2023-002",
      entreprise: "Fournisseur XYZ",
      date_signature: "2023-04-05",
      montant: 25000000,
      objet: "Fourniture d'équipements",
      statut: "En cours",
    },
  ];

  const handleOpenDeleteDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  // Dialogue de visualisation détaillée
  const ViewDialog = () => {
    if (!currentOperation) return null;

    return (
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCog className="h-6 w-6" />
              {currentOperation.name}
            </DialogTitle>
            <DialogDescription>{currentOperation.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Code opération</Label>
                    <div className="mt-1 font-medium">{currentOperation.code_operation}</div>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <div className="mt-1">{getStatusBadge(currentOperation.status)}</div>
                  </div>
                  <div>
                    <Label>Programme</Label>
                    <div className="mt-1 font-medium">{currentOperation.programName}</div>
                  </div>
                  <div>
                    <Label>Action</Label>
                    <div className="mt-1 font-medium">{currentOperation.actionName}</div>
                  </div>
                  <div>
                    <Label>Wilaya</Label>
                    <div className="mt-1 font-medium">{currentOperation.wilaya}</div>
                  </div>
                  <div>
                    <Label>Titre budgétaire</Label>
                    <div className="mt-1 font-medium">T{currentOperation.titre_budgetaire}</div>
                  </div>
                  <div>
                    <Label>Date de début</Label>
                    <div className="mt-1 font-medium">{currentOperation.start_date}</div>
                  </div>
                  <div>
                    <Label>Date de fin</Label>
                    <div className="mt-1 font-medium">{currentOperation.end_date}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicateurs de performance */}
            <Card>
              <CardHeader>
                <CardTitle>Indicateurs de performance</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-3 gap-4">
                  {/* Taux d'avancement global */}
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Taux d'avancement global</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{currentOperation.progress}%</div>
                        <div className={cn("text-sm", getProgressTextColor(currentOperation.progress))}>
                          {currentOperation.progress >= 100 ? "Complété" : "En cours"}
                        </div>
                      </div>
                      <Progress
                        value={currentOperation.progress}
                        className="mt-2"
                        indicatorClassName={getProgressBarColor(currentOperation.progress)}
                      />
                    </CardContent>
                  </Card>

                  {/* Taux d'avancement physique */}
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Taux d'avancement physique</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{currentOperation.taux_physique}%</div>
                        <div className={cn("text-sm", getProgressTextColor(currentOperation.taux_physique))}>
                          {currentOperation.taux_physique >= 100 ? "Complété" : "En cours"}
                        </div>
                      </div>
                      <Progress
                        value={currentOperation.taux_physique}
                        className="mt-2"
                        indicatorClassName={getProgressBarColor(currentOperation.taux_physique)}
                      />
                    </CardContent>
                  </Card>

                  {/* Taux d'avancement financier */}
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Taux d'avancement financier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{currentOperation.taux_financier}%</div>
                        <div className={cn("text-sm", getProgressTextColor(currentOperation.taux_financier))}>
                          {currentOperation.taux_financier >= 100 ? "Complété" : "En cours"}
                        </div>
                      </div>
                      <Progress
                        value={currentOperation.taux_financier}
                        className="mt-2"
                        indicatorClassName={getProgressBarColor(currentOperation.taux_financier)}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Indicateurs financiers */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Montant alloué</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(currentOperation.allocatedAmount)}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Montant consommé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(currentOperation.montant_consomme)}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Montant restant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(currentOperation.allocatedAmount - currentOperation.montant_consomme)}</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Historique des engagements */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des engagements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Bénéficiaire</TableHead>
                        <TableHead>Montant initial</TableHead>
                        <TableHead>Montant actuel</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEngagementsHistory.map((engagement) => (
                        <TableRow key={engagement.id}>
                          <TableCell className="font-medium">{engagement.reference}</TableCell>
                          <TableCell>{engagement.date}</TableCell>
                          <TableCell>{engagement.beneficiaire}</TableCell>
                          <TableCell>{formatCurrency(engagement.montant_initial)}</TableCell>
                          <TableCell>{formatCurrency(engagement.montant_actuel)}</TableCell>
                          <TableCell>{engagement.statut}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Historique des réévaluations */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des réévaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Montant initial</TableHead>
                        <TableHead>Montant réévalué</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockReevaluations.map((reevaluation) => (
                        <TableRow key={reevaluation.id}>
                          <TableCell>{reevaluation.date}</TableCell>
                          <TableCell className="font-medium">{reevaluation.engagement_ref}</TableCell>
                          <TableCell>{formatCurrency(reevaluation.montant_initial)}</TableCell>
                          <TableCell>{formatCurrency(reevaluation.montant_reevalue)}</TableCell>
                          <TableCell>{reevaluation.motif}</TableCell>
                          <TableCell>{reevaluation.statut}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Crédits de paiement */}
            <Card>
              <CardHeader>
                <CardTitle>Crédits de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="annuels" className="w-full">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="annuels">CP Annuels</TabsTrigger>
                    <TabsTrigger value="demandes">Demandes de CP</TabsTrigger>
                  </TabsList>
                  <TabsContent value="annuels">
                    <div className="rounded-md border mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Année</TableHead>
                            <TableHead>Montant alloué</TableHead>
                            <TableHead>Montant consommé</TableHead>
                            <TableHead>Taux de consommation</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockCPAnnuels.map((cp) => (
                            <TableRow key={cp.id}>
                              <TableCell className="font-medium">{cp.annee}</TableCell>
                              <TableCell>{formatCurrency(cp.montant_alloue)}</TableCell>
                              <TableCell>{formatCurrency(cp.montant_consomme)}</TableCell>
                              <TableCell>{cp.taux_consommation}%</TableCell>
                              <TableCell>{cp.statut}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  <TabsContent value="demandes">
                    <div className="rounded-md border mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Motif</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockDemandesCP.map((demande) => (
                            <TableRow key={demande.id}>
                              <TableCell>{demande.date}</TableCell>
                              <TableCell>{formatCurrency(demande.montant)}</TableCell>
                              <TableCell>{demande.motif}</TableCell>
                              <TableCell>{demande.statut}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Contrats */}
            <Card>
              <CardHeader>
                <CardTitle>Contrats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>Date de signature</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Objet</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockContrats.map((contrat) => (
                        <TableRow key={contrat.id}>
                          <TableCell className="font-medium">{contrat.reference}</TableCell>
                          <TableCell>{contrat.entreprise}</TableCell>
                          <TableCell>{contrat.date_signature}</TableCell>
                          <TableCell>{formatCurrency(contrat.montant)}</TableCell>
                          <TableCell>{contrat.objet}</TableCell>
                          <TableCell>{contrat.statut}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const handleAddOperation = () => {
    if (
      !newOperation.name ||
      !newOperation.actionId ||
      !newOperation.programId ||
      !newOperation.code_operation ||
      !newOperation.wilaya ||
      !newOperation.titre_budgetaire
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const actionDetails = mockActions.find((a) => a.id === newOperation.actionId);
    const programDetails = mockPrograms.find((p) => p.id === newOperation.programId);
    const wilayaDetails = mockWilayas.find((w) => w.id === newOperation.wilaya);
    const titreDetails = mockTitresBudgetaires.find((t) => t.id === newOperation.titre_budgetaire);

    if (!actionDetails || !programDetails || !wilayaDetails || !titreDetails) {
      toast({
        title: "Erreur",
        description: "Données invalides.",
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
      code_operation: newOperation.code_operation,
      wilaya: wilayaDetails.name,
      titre_budgetaire: newOperation.titre_budgetaire,
      origine_financement: newOperation.origine_financement as "budget_national" | "financement_exterieur",
      allocatedAmount: Number(newOperation.allocatedAmount) || 0,
      usedAmount: 0,
      montant_consomme: Number(newOperation.montant_consomme) || 0,
      progress: 0,
      taux_physique: Number(newOperation.taux_physique) || 0,
      taux_financier: Number(newOperation.taux_financier) || 0,
      engagements: 0,
      payments: 0,
      status: newOperation.status as "planned" | "in_progress" | "completed",
      start_date: newOperation.start_date || "",
      end_date: newOperation.end_date || "",
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

    if (
      !newOperation.name ||
      !newOperation.actionId ||
      !newOperation.programId ||
      !newOperation.code_operation ||
      !newOperation.wilaya ||
      !newOperation.titre_budgetaire
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const actionDetails = mockActions.find((a) => a.id === newOperation.actionId);
    const programDetails = mockPrograms.find((p) => p.id === newOperation.programId);
    const wilayaDetails = mockWilayas.find((w) => w.id === newOperation.wilaya);
    const titreDetails = mockTitresBudgetaires.find((t) => t.id === newOperation.titre_budgetaire);

    if (!actionDetails || !programDetails || !wilayaDetails || !titreDetails) {
      toast({
        title: "Erreur",
        description: "Données invalides.",
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
            code_operation: newOperation.code_operation,
            wilaya: wilayaDetails.name,
            titre_budgetaire: newOperation.titre_budgetaire,
            origine_financement: newOperation.origine_financement as "budget_national" | "financement_exterieur",
            allocatedAmount: Number(newOperation.allocatedAmount) || 0,
            usedAmount: Number(newOperation.usedAmount) || 0,
            montant_consomme: Number(newOperation.montant_consomme) || 0,
            progress: Number(newOperation.progress) || 0,
            taux_physique: Number(newOperation.taux_physique) || 0,
            taux_financier: Number(newOperation.taux_financier) || 0,
            engagements: Number(newOperation.engagements) || 0,
            payments: Number(newOperation.payments) || 0,
            status: newOperation.status as "planned" | "in_progress" | "completed",
            start_date: newOperation.start_date || "",
            end_date: newOperation.end_date || "",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des opérations...</span>
      </div>
    );
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
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-64">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Rechercher une opération..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={programFilter} onValueChange={setProgramFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrer par programme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les programmes</SelectItem>
                        {mockPrograms.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrer par statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="planned">Planifié</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="en_pause">En pause</SelectItem>
                        <SelectItem value="arreter">Arrêté</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={titreBudgetaireFilter} onValueChange={setTitreBudgetaireFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrer par titre budgétaire" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les titres</SelectItem>
                        {mockTitresBudgetaires.map((titre) => (
                          <SelectItem key={titre.id} value={titre.id.toString()}>
                            {titre.shortLabel} - {titre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={origineFinancementFilter} onValueChange={setOrigineFinancementFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrer par origine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les origines</SelectItem>
                        <SelectItem value="budget_national">Budget national</SelectItem>
                        <SelectItem value="financement_exterieur">Financement extérieur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <OperationsTable
                  operations={filteredOperations}
                  formatCurrency={formatCurrency}
                  onView={handleOpenViewDialog}
                  onEdit={handleOpenEditDialog}
                  onDelete={handleOpenDeleteDialog}
                  onRefresh={() => {
                    // Simulate refresh
                    toast({
                      title: "Données actualisées",
                      description: "La liste des opérations a été actualisée",
                    });
                    setOperations([...mockOperations]);
                  }}
                />
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une opération</DialogTitle>
            <DialogDescription>Remplissez les informations pour créer une nouvelle opération.</DialogDescription>
            <Button
              variant="ghost"
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              onClick={() => setIsAddDialogOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'opération</Label>
                <Input
                  id="name"
                  value={newOperation.name}
                  onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                  placeholder="Nom de l'opération"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code_operation">Code opération</Label>
                <Input
                  id="code_operation"
                  value={newOperation.code_operation}
                  onChange={(e) => setNewOperation({ ...newOperation, code_operation: e.target.value })}
                  placeholder="Code opération"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newOperation.description}
                onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                placeholder="Description de l'opération"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Programme</Label>
                <Select value={newOperation.programId} onValueChange={(value) => setNewOperation({ ...newOperation, programId: value })}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={newOperation.actionId} onValueChange={(value) => setNewOperation({ ...newOperation, actionId: value })}>
                  <SelectTrigger>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wilaya">Wilaya</Label>
                <Select value={newOperation.wilaya} onValueChange={(value) => setNewOperation({ ...newOperation, wilaya: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWilayas.map((wilaya) => (
                      <SelectItem key={wilaya.id} value={wilaya.id}>
                        {wilaya.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titre_budgetaire">Titre budgétaire</Label>
                <Select
                  value={newOperation.titre_budgetaire?.toString()}
                  onValueChange={(value) => setNewOperation({ ...newOperation, titre_budgetaire: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un titre budgétaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTitresBudgetaires.map((titre) => (
                      <SelectItem key={titre.id} value={titre.id.toString()}>
                        {titre.shortLabel} - {titre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origine_financement">Origine du financement</Label>
                <Select
                  value={newOperation.origine_financement}
                  onValueChange={(value) =>
                    setNewOperation({ ...newOperation, origine_financement: value as "budget_national" | "financement_exterieur" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'origine du financement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget_national">Budget national</SelectItem>
                    <SelectItem value="financement_exterieur">Financement extérieur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocatedAmount">AE Allouées</Label>
                <Input
                  id="allocatedAmount"
                  type="number"
                  value={newOperation.allocatedAmount}
                  onChange={(e) => setNewOperation({ ...newOperation, allocatedAmount: parseFloat(e.target.value) })}
                  placeholder="AE Allouées"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="montant_consomme">AE Engagées</Label>
              <Input
                id="montant_consomme"
                type="number"
                value={newOperation.montant_consomme}
                onChange={(e) => setNewOperation({ ...newOperation, montant_consomme: parseFloat(e.target.value) })}
                placeholder="AE Engagées"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={newOperation.status}
                onValueChange={(value) =>
                  setNewOperation({ ...newOperation, status: value as "planned" | "in_progress" | "completed" | "en_pause" | "arreter" | "draft" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="en_pause">En pause</SelectItem>
                  <SelectItem value="arreter">Arrêté</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taux_physique">Taux physique (%)</Label>
                <Input
                  id="taux_physique"
                  type="number"
                  min="0"
                  max="100"
                  value={newOperation.taux_physique}
                  onChange={(e) => setNewOperation({ ...newOperation, taux_physique: parseFloat(e.target.value) })}
                  placeholder="Taux physique"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taux_financier">Taux financier (%)</Label>
                <Input
                  id="taux_financier"
                  type="number"
                  min="0"
                  max="100"
                  value={newOperation.taux_financier}
                  onChange={(e) => setNewOperation({ ...newOperation, taux_financier: parseFloat(e.target.value) })}
                  placeholder="Taux financier"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newOperation.start_date}
                  onChange={(e) => setNewOperation({ ...newOperation, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newOperation.end_date}
                  onChange={(e) => setNewOperation({ ...newOperation, end_date: e.target.value })}
                />
              </div>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'opération</DialogTitle>
            <DialogDescription>Modifiez les informations de l'opération.</DialogDescription>
            <Button
              variant="ghost"
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              onClick={() => setIsEditDialogOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom de l'opération</Label>
                <Input
                  id="edit-name"
                  value={newOperation.name}
                  onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                  placeholder="Nom de l'opération"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code_operation">Code opération</Label>
                <Input
                  id="edit-code_operation"
                  value={newOperation.code_operation}
                  onChange={(e) => setNewOperation({ ...newOperation, code_operation: e.target.value })}
                  placeholder="Code opération"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={newOperation.description}
                onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                placeholder="Description de l'opération"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-program">Programme</Label>
                <Select value={newOperation.programId} onValueChange={(value) => setNewOperation({ ...newOperation, programId: value })}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="edit-action">Action</Label>
                <Select value={newOperation.actionId} onValueChange={(value) => setNewOperation({ ...newOperation, actionId: value })}>
                  <SelectTrigger>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-wilaya">Wilaya</Label>
                <Select value={newOperation.wilaya} onValueChange={(value) => setNewOperation({ ...newOperation, wilaya: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWilayas.map((wilaya) => (
                      <SelectItem key={wilaya.id} value={wilaya.id}>
                        {wilaya.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-titre_budgetaire">Titre budgétaire</Label>
                <Select
                  value={newOperation.titre_budgetaire?.toString()}
                  onValueChange={(value) => setNewOperation({ ...newOperation, titre_budgetaire: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un titre budgétaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTitresBudgetaires.map((titre) => (
                      <SelectItem key={titre.id} value={titre.id.toString()}>
                        {titre.shortLabel} - {titre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-origine_financement">Origine du financement</Label>
                <Select
                  value={newOperation.origine_financement}
                  onValueChange={(value) =>
                    setNewOperation({ ...newOperation, origine_financement: value as "budget_national" | "financement_exterieur" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'origine du financement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget_national">Budget national</SelectItem>
                    <SelectItem value="financement_exterieur">Financement extérieur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-allocatedAmount">Montant alloué</Label>
                <Input
                  id="edit-allocatedAmount"
                  type="number"
                  value={newOperation.allocatedAmount}
                  onChange={(e) => setNewOperation({ ...newOperation, allocatedAmount: parseFloat(e.target.value) })}
                  placeholder="Montant alloué"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-montant_consomme">Montant consommé</Label>
              <Input
                id="edit-montant_consomme"
                type="number"
                value={newOperation.montant_consomme}
                onChange={(e) => setNewOperation({ ...newOperation, montant_consomme: parseFloat(e.target.value) })}
                placeholder="Montant consommé"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Statut</Label>
              <Select
                value={newOperation.status}
                onValueChange={(value) =>
                  setNewOperation({ ...newOperation, status: value as "planned" | "in_progress" | "completed" | "en_pause" | "arreter" | "draft" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="planned">Planifié</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="en_pause">En pause</SelectItem>
                  <SelectItem value="arreter">Arrêté</SelectItem>
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
                <strong>Code opération:</strong> {currentOperation.code_operation}
              </p>
              <p>
                <strong>Programme:</strong> {currentOperation.programName}
              </p>
              <p>
                <strong>Action:</strong> {currentOperation.actionName}
              </p>
              <p>
                <strong>Wilaya:</strong> {currentOperation.wilaya}
              </p>
              <p>
                <strong>Titre budgétaire:</strong>{" "}
                {mockTitresBudgetaires.find((t) => t.id === currentOperation.titre_budgetaire)?.shortLabel || `T${currentOperation.titre_budgetaire}`}{" "}
                -{" "}
                {mockTitresBudgetaires.find((t) => t.id === currentOperation.titre_budgetaire)?.name || `Titre ${currentOperation.titre_budgetaire}`}
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

      <ViewDialog />
    </Dashboard>
  );
}
