import { useState, useEffect } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit, Trash2, Search, Eye, Filter, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionsTable, Action } from "@/components/tables/ActionsTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Simple inline Spinner component
const Spinner = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

// Extended Action interface
interface EnhancedAction extends Action {
  code: string;
  description?: string;
  type_action: "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary";
  status: "active" | "archived" | "planned" | "draft";
  consumption_rate: number;
  fiscal_year_id?: string;
}

// Mock data for actions
const mockActions: EnhancedAction[] = [
  {
    id: "ACT001",
    code: "A1.2.3",
    programme_id: "PRG001",
    programme_name: "Infrastructure Urbaine",
    nom: "Rénovation des routes",
    type_action: "Centralized",
    description: "Rénovation et maintenance des routes urbaines principales",
    montant_alloue: 1500000,
    status: "active",
    consumption_rate: 65,
  },
  {
    id: "ACT002",
    code: "A2.1.1",
    programme_id: "PRG002",
    programme_name: "Éducation Supérieure",
    nom: "Équipement des laboratoires",
    type_action: "Decentralized",
    description: "Fourniture d'équipements de laboratoire aux universités",
    montant_alloue: 750000,
    status: "active",
    consumption_rate: 45,
  },
  {
    id: "ACT003",
    code: "A1.3.1",
    programme_id: "PRG001",
    programme_name: "Infrastructure Urbaine",
    nom: "Construction des ponts",
    type_action: "Unique",
    description: "Construction de nouveaux ponts urbains",
    montant_alloue: 3000000,
    status: "planned",
    consumption_rate: 0,
  },
  {
    id: "ACT004",
    code: "A3.1.2",
    programme_id: "PRG003",
    programme_name: "Santé Publique",
    nom: "Équipement hospitalier",
    type_action: "Programmed",
    description: "Modernisation des équipements hospitaliers",
    montant_alloue: 1200000,
    status: "active",
    consumption_rate: 78,
  },
  {
    id: "ACT005",
    code: "A4.2.1",
    programme_id: "PRG004",
    programme_name: "Environnement",
    nom: "Reboisement urbain",
    type_action: "Complementary",
    description: "Programme de reboisement dans les zones urbaines",
    montant_alloue: 500000,
    status: "draft",
    consumption_rate: 12,
  },
];

// Mock data for programme selection
const programmes = [
  { id: "PRG001", name: "Infrastructure Urbaine" },
  { id: "PRG002", name: "Éducation Supérieure" },
  { id: "PRG003", name: "Santé Publique" },
  { id: "PRG004", name: "Environnement" },
];

// Mock data for portfolios
const portfolios = [
  { id: "PORT001", name: "Infrastructure" },
  { id: "PORT002", name: "Éducation" },
  { id: "PORT003", name: "Santé" },
  { id: "PORT004", name: "Environnement" },
];

// Mock data for fiscal years
const fiscalYears = [
  { id: "FY2022", name: "Année Fiscale 2022" },
  { id: "FY2023", name: "Année Fiscale 2023" },
  { id: "FY2024", name: "Année Fiscale 2024" },
];

// Action types (the only types now)
const actionTypes = ["Centralized", "Decentralized", "Unique", "Programmed", "Complementary"] as const;
type ActionType = (typeof actionTypes)[number];

// Status types
const statusTypes = [
  { value: "active", label: "Actif" },
  { value: "archived", label: "Archivé" },
  { value: "planned", label: "Planifié" },
  { value: "draft", label: "Brouillon" },
];

type ActionStatus = "active" | "archived" | "planned" | "draft";

// Define translations for action types
const actionTypeTranslations = {
  Centralized: "Centralisée",
  Decentralized: "Décentralisée",
  Unique: "Unique",
  Programmed: "Programmée",
  Complementary: "Complémentaire",
};

export default function Actions() {
  const { t } = useTranslation();
  const [actions, setActions] = useState<EnhancedAction[]>(mockActions);
  const [searchTerm, setSearchTerm] = useState("");
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [programmeFilter, setProgrammeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<EnhancedAction | null>(null);
  const [newAction, setNewAction] = useState<Partial<EnhancedAction>>({
    code: "",
    programme_id: "",
    nom: "",
    description: "",
    type_action: "Centralized",
    montant_alloue: 0,
    status: "active",
    consumption_rate: 0,
  });
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [viewAction, setViewAction] = useState<EnhancedAction | null>(null);

  // Filter actions based on all filters
  const filteredActions = actions.filter((action) => {
    const matchesSearch =
      action.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.type_action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.programme_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgram = programmeFilter === "all" || action.programme_id === programmeFilter;

    // Simplified portfolio matching (in a real app, would need correct relation)
    const matchesPortfolio =
      portfolioFilter === "all" ||
      (portfolioFilter === "PORT001" && action.programme_id === "PRG001") ||
      (portfolioFilter === "PORT002" && action.programme_id === "PRG002") ||
      (portfolioFilter === "PORT003" && action.programme_id === "PRG003") ||
      (portfolioFilter === "PORT004" && action.programme_id === "PRG004");

    const matchesType = typeFilter === "all" || action.type_action === typeFilter;
    const matchesStatus = statusFilter === "all" || action.status === statusFilter;

    return matchesSearch && matchesProgram && matchesPortfolio && matchesType && matchesStatus;
  });

  // Open add dialog
  const handleOpenAddDialog = () => {
    setNewAction({
      code: "",
      programme_id: "",
      nom: "",
      description: "",
      type_action: "Centralized",
      montant_alloue: 0,
      status: "active",
      consumption_rate: 0,
    });
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (action: EnhancedAction) => {
    setCurrentAction(action);
    setNewAction({
      code: action.code,
      programme_id: action.programme_id,
      nom: action.nom,
      description: action.description,
      type_action: action.type_action,
      montant_alloue: action.montant_alloue,
      status: action.status,
      consumption_rate: action.consumption_rate,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (action: EnhancedAction) => {
    setCurrentAction(action);
    setIsDeleteDialogOpen(true);
  };

  // Open view dialog
  const handleOpenViewDialog = (action: EnhancedAction) => {
    setCurrentAction(action);
    setIsViewDialogOpen(true);
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">
            Actif
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">
            Archivé
          </Badge>
        );
      case "planned":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">
            Planifié
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
            Brouillon
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Add new action
  const handleAddAction = () => {
    if (!newAction.code || !newAction.programme_id || !newAction.nom || !newAction.type_action || !newAction.status) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis (*)",
        variant: "destructive",
      });
      return;
    }

    const selectedProgramme = programmes.find((p) => p.id === newAction.programme_id);

    const action: EnhancedAction = {
      id: `ACT${String(actions.length + 1).padStart(3, "0")}`,
      code: newAction.code!,
      programme_id: newAction.programme_id!,
      programme_name: selectedProgramme?.name || "",
      nom: newAction.nom!,
      description: newAction.description,
      type_action: newAction.type_action!,
      status: newAction.status!,
      montant_alloue: Number(newAction.montant_alloue) || 0,
      consumption_rate: 0, // New actions start at 0% consumption
    };

    setActions([...actions, action]);
    setIsAddDialogOpen(false);
    toast({
      title: "Action ajoutée",
      description: `L'action "${action.nom}" a été ajoutée avec succès.`,
    });
  };

  // Edit action
  const handleEditAction = () => {
    if (!currentAction || !newAction.code || !newAction.programme_id || !newAction.nom || !newAction.type_action || !newAction.status) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis (*)",
        variant: "destructive",
      });
      return;
    }

    const selectedProgramme = programmes.find((p) => p.id === newAction.programme_id);

    const updatedActions = actions.map((action) =>
      action.id === currentAction.id
        ? {
            ...action,
            code: newAction.code!,
            programme_id: newAction.programme_id!,
            programme_name: selectedProgramme?.name || action.programme_name,
            nom: newAction.nom!,
            description: newAction.description,
            type_action: newAction.type_action!,
            status: newAction.status!,
            montant_alloue: Number(newAction.montant_alloue) || 0,
            consumption_rate: Number(newAction.consumption_rate) || 0,
          }
        : action
    );

    setActions(updatedActions);
    setIsEditDialogOpen(false);
    toast({
      title: "Action modifiée",
      description: `L'action "${currentAction.nom}" a été modifiée avec succès.`,
    });
  };

  // Delete action
  const handleDeleteAction = () => {
    if (!currentAction) return;

    const updatedActions = actions.filter((action) => action.id !== currentAction.id);
    setActions(updatedActions);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Action supprimée",
      description: `L'action "${currentAction.nom}" a été supprimée avec succès.`,
    });
  };

  const handleTypeActionChange = (value: string) => {
    setNewAction({ ...newAction, type_action: value as ActionType });
  };

  // View Dialog Component
  const ViewActionDialog = () => {
    const [viewAction, setViewAction] = useState<EnhancedAction | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
      if (currentAction && isViewDialogOpen) {
        setViewAction(currentAction);
        // If fiscal_year_id exists in the model, use it, otherwise default to first year
        if (currentAction.fiscal_year_id) {
          setSelectedYear(currentAction.fiscal_year_id);
        } else if (fiscalYears.length > 0) {
          setSelectedYear(fiscalYears[0].id);
        }
      }
    }, [currentAction, isViewDialogOpen]);

    // Fetch action data when fiscal year changes
    const handleFiscalYearChange = (fiscalYearId: string) => {
      setSelectedYear(fiscalYearId);
      setLoading(true);

      // Simulating data fetch for the selected fiscal year
      setTimeout(() => {
        // In a real implementation, you would fetch data from API
        setLoading(false);
      }, 500);
    };

    if (!viewAction) {
      return null;
    }

    return (
      <>
        <div className="flex items-center justify-end mb-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Année fiscale:</span>
            <Select value={selectedYear} onValueChange={handleFiscalYearChange} className="w-[180px]">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une année" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="py-6 space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">AE Allouées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(viewAction.montant_alloue)}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-secondary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">CP Alloués</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(viewAction.montant_alloue * 0.8)}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">AE Consommées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency((viewAction.montant_alloue * viewAction.consumption_rate) / 100)}</div>
                    <div className="text-sm text-muted-foreground mt-1">{viewAction.consumption_rate}% utilisés</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">CP Consommés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency((viewAction.montant_alloue * 0.8 * (viewAction.consumption_rate - 5)) / 100)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{Math.max(0, viewAction.consumption_rate - 5)}% utilisés</div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Charts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progression de la Consommation (2024)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* AE Progress Circle */}
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
                            strokeDasharray={`${viewAction.consumption_rate * 2.51} 251.2`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xl font-bold">{viewAction.consumption_rate}%</div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium">Consommation AE</p>
                    </div>

                    {/* CP Progress Circle */}
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
                            strokeDasharray={`${Math.max(0, viewAction.consumption_rate - 5) * 2.51} 251.2`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xl font-bold">{Math.max(0, viewAction.consumption_rate - 5)}%</div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium">Consommation CP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opérations Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Opérations Associées (2024)</CardTitle>
                  <CardDescription>Liste des opérations liées à cette action pour l'année fiscale sélectionnée.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                          <th className="py-3 px-4 text-left font-medium">Code</th>
                          <th className="py-3 px-4 text-left font-medium">Nom Opération</th>
                          <th className="py-3 px-4 text-right font-medium">AE Allouées</th>
                          <th className="py-3 px-4 text-right font-medium">CP Alloués</th>
                          <th className="py-3 px-4 text-right font-medium">AE Consommées</th>
                          <th className="py-3 px-4 text-right font-medium">CP Consommés</th>
                          <th className="py-3 px-4 text-center font-medium">Taux Physique (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Mock data for operations */}
                        {[
                          {
                            code: "OP1",
                            name: "Réhabilitation Route R10",
                            ae: viewAction.montant_alloue * 0.4,
                            cp: viewAction.montant_alloue * 0.3,
                            aeUsed: viewAction.montant_alloue * 0.4 * 0.7,
                            cpUsed: viewAction.montant_alloue * 0.3 * 0.6,
                            physicalRate: 65,
                          },
                          {
                            code: "OP2",
                            name: "Réparation Pont P3",
                            ae: viewAction.montant_alloue * 0.25,
                            cp: viewAction.montant_alloue * 0.2,
                            aeUsed: viewAction.montant_alloue * 0.25 * 0.5,
                            cpUsed: viewAction.montant_alloue * 0.2 * 0.4,
                            physicalRate: 40,
                          },
                          {
                            code: "OP3",
                            name: "Entretien Voirie",
                            ae: viewAction.montant_alloue * 0.35,
                            cp: viewAction.montant_alloue * 0.3,
                            aeUsed: viewAction.montant_alloue * 0.35 * 0.8,
                            cpUsed: viewAction.montant_alloue * 0.3 * 0.7,
                            physicalRate: 75,
                          },
                        ].map((op, index) => {
                          const tauxAE = op.ae > 0 ? Math.round((op.aeUsed / op.ae) * 100) : 0;
                          return (
                            <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4">{op.code}</td>
                              <td className="py-3 px-4">{op.name}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(op.ae)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(op.cp)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(op.aeUsed)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(op.cpUsed)}</td>
                              <td className="py-3 px-4 text-center">{op.physicalRate}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Engagements Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagements (2024)</CardTitle>
                  <CardDescription>Liste des engagements liés à cette action.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                          <th className="py-3 px-4 text-left font-medium">N° Engagement</th>
                          <th className="py-3 px-4 text-left font-medium">Opération</th>
                          <th className="py-3 px-4 text-left font-medium">Date</th>
                          <th className="py-3 px-4 text-right font-medium">Montant</th>
                          <th className="py-3 px-4 text-right font-medium">CP Payés</th>
                          <th className="py-3 px-4 text-left font-medium">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Mock data for engagements */}
                        {[
                          {
                            code: "ENG2024-001",
                            op: "OP1",
                            date: "12/02/2024",
                            amount: viewAction.montant_alloue * 0.25,
                            paid: viewAction.montant_alloue * 0.15,
                            status: "Validé",
                          },
                          {
                            code: "ENG2024-002",
                            op: "OP3",
                            date: "20/03/2024",
                            amount: viewAction.montant_alloue * 0.3,
                            paid: viewAction.montant_alloue * 0.1,
                            status: "En cours",
                          },
                          {
                            code: "ENG2024-003",
                            op: "OP2",
                            date: "05/04/2024",
                            amount: viewAction.montant_alloue * 0.2,
                            paid: 0,
                            status: "En attente",
                          },
                        ].map((eng, index) => (
                          <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">{eng.code}</td>
                            <td className="py-3 px-4">{eng.op}</td>
                            <td className="py-3 px-4">{eng.date}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(eng.amount)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(eng.paid)}</td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  eng.status === "Validé"
                                    ? "bg-green-100 text-green-800 border-green-400"
                                    : eng.status === "En cours"
                                      ? "bg-blue-100 text-blue-800 border-blue-400"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-400"
                                }
                              >
                                {eng.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Credit de Paiement evolution chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Évolution des crédits de paiement</CardTitle>
                  <CardDescription>Prévision et paiements par trimestre</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {/* Mock chart with CSS */}
                  <div className="w-full h-full flex items-end justify-between gap-2 pt-10 pb-5 px-4 relative">
                    {/* Y-axis and X-axis lines */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                    <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-300"></div>

                    {/* Mock columns */}
                    {["T1", "T2", "T3", "T4"].map((trimester, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 z-10" style={{ width: "22%" }}>
                        <div className="w-full flex justify-center gap-2">
                          <div className="w-8 rounded-t-md bg-blue-500" style={{ height: `${[30, 60, 85, 95][i]}%` }}></div>
                          <div className="w-8 rounded-t-md bg-green-500" style={{ height: `${[20, 45, 65, 85][i]}%` }}></div>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">{trimester}</div>
                      </div>
                    ))}

                    {/* Legend */}
                    <div className="absolute top-2 right-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500"></div>
                        <span className="text-xs">Prévisions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500"></div>
                        <span className="text-xs">Réalisations</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => window.print()}>
                Imprimer
              </Button>
              <Button variant="outline">Générer Rapport</Button>
              <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
            </DialogFooter>
          </>
        )}
      </>
    );
  };

  return (
    <Dashboard className="p-6">
      <DashboardHeader title={t("app.navigation.actions")} description="Gestion des actions budgétaires">
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une action
        </Button>
      </DashboardHeader>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtrer les actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Search Filter */}
            <div>
              <Label htmlFor="search-filter" className="mb-2 block">
                Recherche
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-filter"
                  placeholder="Rechercher par nom ou code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>

            {/* Portfolio Filter */}
            <div>
              <Label htmlFor="portfolio-filter" className="mb-2 block">
                Portefeuille
              </Label>
              <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
                <SelectTrigger id="portfolio-filter" className="w-full">
                  <SelectValue placeholder="Tous les portefeuilles" />
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
            </div>

            {/* Programme Filter */}
            <div>
              <Label htmlFor="programme-filter" className="mb-2 block">
                Programme
              </Label>
              <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
                <SelectTrigger id="programme-filter" className="w-full">
                  <SelectValue placeholder="Tous les programmes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les programmes</SelectItem>
                  {programmes.map((programme) => (
                    <SelectItem key={programme.id} value={programme.id}>
                      {programme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div>
              <Label htmlFor="type-filter" className="mb-2 block">
                Type d'action
              </Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter" className="w-full">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status-filter" className="mb-2 block">
                Statut
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {statusTypes.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead>Montant Alloué</TableHead>
                  <TableHead>Consommation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      Aucune action ne correspond aux critères de recherche
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{action.code}</TableCell>
                      <TableCell>{action.nom}</TableCell>
                      <TableCell>{action.programme_name}</TableCell>
                      <TableCell>{action.type_action}</TableCell>
                      <TableCell>{action.type_action}</TableCell>
                      <TableCell>{formatCurrency(action.montant_alloue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={action.consumption_rate} className="h-2 w-24" />
                          <span className="text-xs font-medium">{action.consumption_rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenViewDialog(action)} title="Voir les détails">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(action)} title="Modifier">
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(action)} title="Supprimer">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Action Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle action</DialogTitle>
            <DialogDescription>Complétez le formulaire pour ajouter une nouvelle action budgétaire.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code*
              </Label>
              <Input
                id="code"
                className="col-span-3"
                value={newAction.code || ""}
                onChange={(e) => setNewAction({ ...newAction, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="programme" className="text-right">
                Programme*
              </Label>
              <Select value={newAction.programme_id} onValueChange={(value) => setNewAction({ ...newAction, programme_id: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un programme" />
                </SelectTrigger>
                <SelectContent>
                  {programmes.map((programme) => (
                    <SelectItem key={programme.id} value={programme.id}>
                      {programme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">
                Nom de l'action*
              </Label>
              <Input
                id="nom"
                className="col-span-3"
                value={newAction.nom || ""}
                onChange={(e) => setNewAction({ ...newAction, nom: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <textarea
                id="description"
                className="col-span-3 min-h-[80px] px-3 py-2 rounded-md border border-input bg-transparent text-sm shadow-sm"
                value={newAction.description || ""}
                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type d'action*
              </Label>
              <Select value={newAction.type_action} onValueChange={handleTypeActionChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type d'action" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Statut*
              </Label>
              <Select value={newAction.status} onValueChange={(value) => setNewAction({ ...newAction, status: value as ActionStatus })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusTypes.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="montant" className="text-right">
                Montant alloué*
              </Label>
              <Input
                id="montant"
                type="number"
                className="col-span-3"
                value={newAction.montant_alloue || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    montant_alloue: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            {isEditDialogOpen && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="consumption" className="text-right">
                  Taux de consommation (%)
                </Label>
                <Input
                  id="consumption"
                  type="number"
                  min="0"
                  max="100"
                  className="col-span-3"
                  value={newAction.consumption_rate || ""}
                  onChange={(e) =>
                    setNewAction({
                      ...newAction,
                      consumption_rate: Math.min(100, Math.max(0, parseFloat(e.target.value))),
                    })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddAction}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Action Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'action</DialogTitle>
            <DialogDescription>Modifiez les détails de l'action.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Code*
              </Label>
              <Input
                id="edit-code"
                className="col-span-3"
                value={newAction.code || ""}
                onChange={(e) => setNewAction({ ...newAction, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-programme" className="text-right">
                Programme*
              </Label>
              <Select value={newAction.programme_id} onValueChange={(value) => setNewAction({ ...newAction, programme_id: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un programme" />
                </SelectTrigger>
                <SelectContent>
                  {programmes.map((programme) => (
                    <SelectItem key={programme.id} value={programme.id}>
                      {programme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nom" className="text-right">
                Nom de l'action*
              </Label>
              <Input
                id="edit-nom"
                className="col-span-3"
                value={newAction.nom || ""}
                onChange={(e) => setNewAction({ ...newAction, nom: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <textarea
                id="edit-description"
                className="col-span-3 min-h-[80px] px-3 py-2 rounded-md border border-input bg-transparent text-sm shadow-sm"
                value={newAction.description || ""}
                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type d'action*
              </Label>
              <Select value={newAction.type_action} onValueChange={handleTypeActionChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type d'action" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Statut*
              </Label>
              <Select value={newAction.status} onValueChange={(value) => setNewAction({ ...newAction, status: value as ActionStatus })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusTypes.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-montant" className="text-right">
                Montant alloué*
              </Label>
              <Input
                id="edit-montant"
                type="number"
                className="col-span-3"
                value={newAction.montant_alloue || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    montant_alloue: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-consumption" className="text-right">
                Taux de consommation (%)
              </Label>
              <Input
                id="edit-consumption"
                type="number"
                min="0"
                max="100"
                className="col-span-3"
                value={newAction.consumption_rate || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    consumption_rate: Math.min(100, Math.max(0, parseFloat(e.target.value))),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditAction}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Action Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer cette action? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {currentAction && (
            <div className="py-4">
              <p>
                <strong>Code:</strong> {currentAction.code}
              </p>
              <p>
                <strong>Programme:</strong> {currentAction.programme_name}
              </p>
              <p>
                <strong>Nom:</strong> {currentAction.nom}
              </p>
              <p>
                <strong>Montant alloué:</strong> {formatCurrency(currentAction.montant_alloue)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteAction}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Action Dialog - Enhanced with beautiful UI */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentAction && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="truncate">{currentAction.nom}</span>
                    <span className="text-sm font-normal text-muted-foreground">({currentAction.code})</span>
                  </div>
                  <div className="text-sm font-normal text-muted-foreground">
                    Programme: {currentAction.programme_name} • Portefeuille:{" "}
                    {portfolios.find((p) => p.id === `PORT00${currentAction.programme_id.slice(-1)}`)?.name || "Non spécifié"}
                  </div>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {currentAction && (
                <div className="flex items-center justify-between mt-1">
                  <div>{currentAction.description || "Aucune description fournie"}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">
                      {actionTypeTranslations[currentAction.type_action] || currentAction.type_action}
                    </Badge>
                    {getStatusBadge(currentAction.status)}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <ViewActionDialog />
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
