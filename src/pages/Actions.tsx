import { useState, useEffect } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit, Trash2, Search, Eye, Filter, Loader2, CalendarIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionsTable } from "@/components/tables/ActionsTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useActions, usePrograms, usePortfolios, useFiscalYears, useActionMutation, useUsers } from "@/hooks/supabase";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
// Import types from types folder
import { Portfolio, Ministry, FiscalYear, Action, Program, User } from "@/types/database.types";

// Helper function to map between API and UI states
const mapActionToMutation = (action: Action, type: "INSERT" | "UPDATE" | "DELETE" | "UPSERT") => ({
  type,
  data: action,
});

// Simple inline Spinner component
const Spinner = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

export default function Actions() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [programmeFilter, setProgrammeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<Action | null>(null);
  const [newAction, setNewAction] = useState<Partial<Action>>({
    code: "",
    program_id: "",
    responsible_id: null,
    name: "",
    description: "",
    type: "Centralized",
    objectives: [],
    indicators: null,
    start_date: null,
    end_date: null,
    montant_ae_total: 0,
    montant_cp_total: 0,
    allocated_ae: 0,
    allocated_cp: 0,
    status: "draft",
    commentaires: "",
    nb_operations: 0,
    taux_execution_cp: 0,
    taux_execution_physique: 0,
  });
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [viewAction, setViewAction] = useState<Action | null>(null);

  // Filter Select components content
  const actionTypes: Action["type"][] = ["Centralized", "Decentralized", "Unique", "Programmed", "Complementary"];
  const statusOptions: Array<{ value: Action["status"]; label: string }> = [
    { value: "active", label: "Actif" },
    { value: "archived", label: "Archivé" },
    { value: "draft", label: "Brouillon" },
  ];

  // Use our custom React Query hooks with staleTime configurations for local storage persistence
  const actionsData = useActions().data as Action[];
  const programsData = usePrograms().data as Program[];
  const portfoliosData = usePortfolios().data as Portfolio[];
  const fiscalYearsData = useFiscalYears().data as FiscalYear[];

  // Use mutation hook for action operations
  const actionMutation = useActionMutation({
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "L'opération a été effectuée avec succès",
      });
    },
  });

  // Show loading spinner when data is being fetched
  if (!actionsData || !programsData || !portfoliosData || !fiscalYearsData) {
    return <PageLoadingSpinner message="Chargement des actions..." />;
  }

  // Filter actions based on all filters
  const filteredActions = actionsData.filter((action) => {
    const matchesSearch =
      (action.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (action.code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (action.type?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesProgram = programmeFilter === "all" || action.program_id === programmeFilter;

    const matchesPortfolio =
      portfolioFilter === "all" ||
      (portfolioFilter === "PORT001" && action.program_id === "PRG001") ||
      (portfolioFilter === "PORT002" && action.program_id === "PRG002") ||
      (portfolioFilter === "PORT003" && action.program_id === "PRG003") ||
      (portfolioFilter === "PORT004" && action.program_id === "PRG004");

    const matchesType = typeFilter === "all" || action.type === typeFilter;
    const matchesStatus = statusFilter === "all" || action.status === statusFilter;

    return matchesSearch && matchesProgram && matchesPortfolio && matchesType && matchesStatus;
  });

  // Open add dialog
  const handleOpenAddDialog = () => {
    setNewAction({
      code: "",
      program_id: "",
      responsible_id: null,
      name: "",
      description: "",
      type: "Centralized",
      objectives: [],
      indicators: null,
      start_date: null,
      end_date: null,
      montant_ae_total: 0,
      montant_cp_total: 0,
      allocated_ae: 0,
      allocated_cp: 0,
      status: "draft",
      commentaires: "",
      nb_operations: 0,
      taux_execution_cp: 0,
      taux_execution_physique: 0,
    });
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (action: Action) => {
    setCurrentAction(action);
    setNewAction({
      code: action.code,
      program_id: action.program_id,
      responsible_id: action.responsible_id,
      name: action.name,
      description: action.description,
      type: action.type,
      objectives: action.objectives,
      indicators: action.indicators,
      start_date: action.start_date,
      end_date: action.end_date,
      montant_ae_total: action.montant_ae_total,
      montant_cp_total: action.montant_cp_total,
      allocated_ae: action.allocated_ae,
      allocated_cp: action.allocated_cp,
      status: action.status,
      commentaires: action.commentaires,
      nb_operations: action.nb_operations,
      taux_execution_cp: action.taux_execution_cp,
      taux_execution_physique: action.taux_execution_physique,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (action: Action) => {
    setCurrentAction(action);
    setIsDeleteDialogOpen(true);
  };

  // Open view dialog
  const handleOpenViewDialog = (action: Action) => {
    setCurrentAction(action);
    setIsViewDialogOpen(true);
  };

  // Helper function to get status badge
  const getStatusBadge = (status: Action["status"]) => {
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

  // Add new action
  const handleAddAction = () => {
    if (!newAction.code || !newAction.program_id || !newAction.name || !newAction.type || !newAction.status) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis (*)",
        variant: "destructive",
      });
      return;
    }

    const selectedProgram = programsData.find((p) => p.id === newAction.program_id);

    const action: Action = {
      id: `ACT${String(actionsData.length + 1).padStart(3, "0")}`,
      code: newAction.code,
      program_id: newAction.program_id,
      responsible_id: newAction.responsible_id,
      name: newAction.name,
      description: newAction.description,
      type: newAction.type,
      objectives: newAction.objectives,
      indicators: newAction.indicators,
      start_date: newAction.start_date,
      end_date: newAction.end_date,
      montant_ae_total: newAction.montant_ae_total ?? 0,
      montant_cp_total: newAction.montant_cp_total ?? 0,
      allocated_ae: newAction.allocated_ae ?? 0,
      allocated_cp: newAction.allocated_cp ?? 0,
      status: newAction.status,
      commentaires: newAction.commentaires,
      nb_operations: newAction.nb_operations ?? 0,
      taux_execution_cp: newAction.taux_execution_cp ?? 0,
      taux_execution_physique: newAction.taux_execution_physique ?? 0,
    };

    actionMutation.mutate(mapActionToMutation(action, "INSERT"));
    setIsAddDialogOpen(false);
    toast({
      title: "Action ajoutée",
      description: `L'action "${action.name}" a été ajoutée avec succès.`,
    });
  };

  // Edit action
  const handleEditAction = () => {
    if (!currentAction || !newAction.code || !newAction.program_id || !newAction.name || !newAction.type || !newAction.status) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis (*)",
        variant: "destructive",
      });
      return;
    }

    const selectedProgram = programsData.find((p) => p.id === newAction.program_id);

    const updatedAction: Action = {
      ...currentAction,
      code: newAction.code,
      program_id: newAction.program_id,
      responsible_id: newAction.responsible_id,
      name: newAction.name,
      description: newAction.description,
      type: newAction.type,
      objectives: newAction.objectives,
      indicators: newAction.indicators,
      start_date: newAction.start_date,
      end_date: newAction.end_date,
      montant_ae_total: newAction.montant_ae_total ?? 0,
      montant_cp_total: newAction.montant_cp_total ?? 0,
      allocated_ae: newAction.allocated_ae ?? 0,
      allocated_cp: newAction.allocated_cp ?? 0,
      status: newAction.status,
      commentaires: newAction.commentaires,
      nb_operations: newAction.nb_operations ?? 0,
      taux_execution_cp: newAction.taux_execution_cp ?? 0,
      taux_execution_physique: newAction.taux_execution_physique ?? 0,
    };

    actionMutation.mutate(mapActionToMutation(updatedAction, "UPDATE"));
    setIsEditDialogOpen(false);
    toast({
      title: "Action modifiée",
      description: `L'action "${currentAction.name}" a été modifiée avec succès.`,
    });
  };

  // Delete action
  const handleDeleteAction = () => {
    if (!currentAction) return;

    actionMutation.mutate(mapActionToMutation(currentAction, "DELETE"));
    setIsDeleteDialogOpen(false);
    toast({
      title: "Action supprimée",
      description: `L'action "${currentAction.name}" a été supprimée avec succès.`,
    });
  };

  const handleTypeActionChange = (value: string) => {
    setNewAction({ ...newAction, type: value as Action["type"] });
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
                  {portfoliosData.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Program Filter */}
            <div>
              <Label htmlFor="program-filter" className="mb-2 block">
                Programme
              </Label>
              <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
                <SelectTrigger id="program-filter" className="w-full">
                  <SelectValue placeholder="Tous les programmes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les programmes</SelectItem>
                  {programsData.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div>
              <Label htmlFor="type-filter" className="mb-2 block">
                Type
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
                  {statusOptions.map((status) => (
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
                  <TableHead>Montant Alloué</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Aucune action ne correspond aux critères de recherche
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{action.code}</TableCell>
                      <TableCell>{action.name}</TableCell>
                      <TableCell>{programsData.find((p) => p.id === action.program_id)?.name || "Non spécifié"}</TableCell>
                      <TableCell>{action.type}</TableCell>
                      <TableCell>{formatCurrency(action.allocated_ae)}</TableCell>
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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une action</DialogTitle>
            <DialogDescription>Créez une nouvelle action budgétaire</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Programme Select */}
            <div className="grid gap-2">
              <Label htmlFor="program">Programme *</Label>
              <Select value={newAction.program_id} onValueChange={(value) => setNewAction({ ...newAction, program_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un programme" />
                </SelectTrigger>
                <SelectContent>
                  {programsData.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsible Select */}
            <div className="grid gap-2">
              <Label htmlFor="responsible">Responsable</Label>
              <Select value={newAction.responsible_id || ""} onValueChange={(value) => setNewAction({ ...newAction, responsible_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un responsable" />
                </SelectTrigger>
                <SelectContent>{/* Add your users data mapping here */}</SelectContent>
              </Select>
            </div>

            {/* Code Input */}
            <div className="grid gap-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" value={newAction.code || ""} onChange={(e) => setNewAction({ ...newAction, code: e.target.value })} />
            </div>

            {/* Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nom *</Label>
              <Input id="name" value={newAction.name || ""} onChange={(e) => setNewAction({ ...newAction, name: e.target.value })} />
            </div>

            {/* Type Select */}
            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={newAction.type} onValueChange={handleTypeActionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
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

            {/* Objectives Input */}
            <div className="grid gap-2">
              <Label htmlFor="objectives">Objectifs</Label>
              <Textarea
                id="objectives"
                placeholder="Entrez les objectifs séparés par des virgules"
                value={newAction.objectives ? newAction.objectives.join(", ") : ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    objectives: e.target.value.split(",").map((obj) => obj.trim()),
                  })
                }
              />
            </div>

            {/* Start Date */}
            <div className="grid gap-2">
              <Label htmlFor="start_date">Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="start_date" variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newAction.start_date ? format(new Date(newAction.start_date), "PPP") : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newAction.start_date ? new Date(newAction.start_date) : undefined}
                    onSelect={(date) =>
                      setNewAction({
                        ...newAction,
                        start_date: date ? date.toISOString() : null,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="grid gap-2">
              <Label htmlFor="end_date">Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="end_date" variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newAction.end_date ? format(new Date(newAction.end_date), "PPP") : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newAction.end_date ? new Date(newAction.end_date) : undefined}
                    onSelect={(date) =>
                      setNewAction({
                        ...newAction,
                        end_date: date ? date.toISOString() : null,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status Select */}
            <div className="grid gap-2">
              <Label htmlFor="status">Statut *</Label>
              <Select value={newAction.status} onValueChange={(value) => setNewAction({ ...newAction, status: value as Action["status"] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Montant AE Total Input */}
            <div className="grid gap-2">
              <Label htmlFor="montant_ae_total">Montant AE Total</Label>
              <Input
                id="montant_ae_total"
                type="number"
                value={newAction.montant_ae_total || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    montant_ae_total: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            {/* Montant CP Total Input */}
            <div className="grid gap-2">
              <Label htmlFor="montant_cp_total">Montant CP Total</Label>
              <Input
                id="montant_cp_total"
                type="number"
                value={newAction.montant_cp_total || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    montant_cp_total: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            {/* Allocated AE Input */}
            <div className="grid gap-2">
              <Label htmlFor="allocated_ae">Montant AE alloué</Label>
              <Input
                id="allocated_ae"
                type="number"
                value={newAction.allocated_ae || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    allocated_ae: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            {/* Allocated CP Input */}
            <div className="grid gap-2">
              <Label htmlFor="allocated_cp">Montant CP alloué</Label>
              <Input
                id="allocated_cp"
                type="number"
                value={newAction.allocated_cp || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    allocated_cp: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            {/* Description Input */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAction.description || ""}
                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
              />
            </div>

            {/* Commentaires Input */}
            <div className="grid gap-2">
              <Label htmlFor="commentaires">Commentaires</Label>
              <Textarea
                id="commentaires"
                value={newAction.commentaires || ""}
                onChange={(e) => setNewAction({ ...newAction, commentaires: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddAction}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Action Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentAction && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="truncate">{currentAction.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">({currentAction.code})</span>
                  </div>
                  <div className="text-sm font-normal text-muted-foreground">
                    Programme: {programsData.find((p) => p.id === currentAction.program_id)?.name}
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
                      {currentAction.type}
                    </Badge>
                    {getStatusBadge(currentAction.status)}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {currentAction && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* AE/CP Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Allocation budgétaire</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Autorisations d'engagement (AE)</h4>
                      <div className="text-2xl font-bold">{formatCurrency(currentAction.allocated_ae || 0)}</div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Crédits de paiement (CP)</h4>
                      <div className="text-2xl font-bold">{formatCurrency(currentAction.allocated_cp || 0)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => window.print()}>
              Imprimer
            </Button>
            <Button variant="outline">Générer Rapport</Button>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
              <Label htmlFor="edit-program" className="text-right">
                Programme*
              </Label>
              <Select value={newAction.program_id || ""} onValueChange={(value) => setNewAction({ ...newAction, program_id: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un programme" />
                </SelectTrigger>
                <SelectContent>
                  {programsData.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-responsible" className="text-right">
                Responsable
              </Label>
              <Select value={newAction.responsible_id || ""} onValueChange={(value) => setNewAction({ ...newAction, responsible_id: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un responsable" />
                </SelectTrigger>
                <SelectContent>{/* Add your users data mapping here */}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom de l'action*
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                value={newAction.name || ""}
                onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                className="col-span-3 min-h-[80px]"
                value={newAction.description || ""}
                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type*
              </Label>
              <Select value={newAction.type || ""} onValueChange={handleTypeActionChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
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

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-objectives" className="text-right pt-2">
                Objectifs
              </Label>
              <Textarea
                id="edit-objectives"
                className="col-span-3 min-h-[80px]"
                placeholder="Entrez les objectifs séparés par des virgules"
                value={newAction.objectives ? newAction.objectives.join(", ") : ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    objectives: e.target.value.split(",").map((obj) => obj.trim()),
                  })
                }
              />
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-start-date" className="text-right">
                Date de début
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="edit-start-date" variant={"outline"} className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newAction.start_date ? format(new Date(newAction.start_date), "PPP") : <span>Sélectionner une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newAction.start_date ? new Date(newAction.start_date) : undefined}
                      onSelect={(date) =>
                        setNewAction({
                          ...newAction,
                          start_date: date ? date.toISOString() : null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* End Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-end-date" className="text-right">
                Date de fin
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="edit-end-date" variant={"outline"} className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newAction.end_date ? format(new Date(newAction.end_date), "PPP") : <span>Sélectionner une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newAction.end_date ? new Date(newAction.end_date) : undefined}
                      onSelect={(date) =>
                        setNewAction({
                          ...newAction,
                          end_date: date ? date.toISOString() : null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-montant-ae-total" className="text-right">
                Montant AE Total
              </Label>
              <Input
                id="edit-montant-ae-total"
                type="number"
                className="col-span-3"
                value={newAction.montant_ae_total || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    montant_ae_total: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-montant-cp-total" className="text-right">
                Montant CP Total
              </Label>
              <Input
                id="edit-montant-cp-total"
                type="number"
                className="col-span-3"
                value={newAction.montant_cp_total || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    montant_cp_total: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-allocated-ae" className="text-right">
                Montant AE alloué*
              </Label>
              <Input
                id="edit-allocated-ae"
                type="number"
                className="col-span-3"
                value={newAction.allocated_ae || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    allocated_ae: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-allocated-cp" className="text-right">
                Montant CP alloué*
              </Label>
              <Input
                id="edit-allocated-cp"
                type="number"
                className="col-span-3"
                value={newAction.allocated_cp || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    allocated_cp: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nb-operations" className="text-right">
                Nombre d'opérations
              </Label>
              <Input
                id="edit-nb-operations"
                type="number"
                className="col-span-3"
                value={newAction.nb_operations || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    nb_operations: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-taux-execution-cp" className="text-right">
                Taux d'exécution CP
              </Label>
              <Input
                id="edit-taux-execution-cp"
                type="number"
                className="col-span-3"
                value={newAction.taux_execution_cp || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    taux_execution_cp: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-taux-execution-physique" className="text-right">
                Taux d'exécution physique
              </Label>
              <Input
                id="edit-taux-execution-physique"
                type="number"
                className="col-span-3"
                value={newAction.taux_execution_physique || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    taux_execution_physique: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Statut*
              </Label>
              <Select value={newAction.status || ""} onValueChange={(value) => setNewAction({ ...newAction, status: value as Action["status"] })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-commentaires" className="text-right pt-2">
                Commentaires
              </Label>
              <Textarea
                id="edit-commentaires"
                className="col-span-3 min-h-[80px]"
                value={newAction.commentaires || ""}
                onChange={(e) => setNewAction({ ...newAction, commentaires: e.target.value })}
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'action</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer cette action ?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
            {currentAction && (
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Code:</strong> {currentAction.code}
                </p>
                <p>
                  <strong>Programme:</strong> {programsData.find((p) => p.id === currentAction.program_id)?.name}
                </p>
                <p>
                  <strong>Nom:</strong> {currentAction.name}
                </p>
                <p>
                  <strong>Montant AE alloué:</strong> {formatCurrency(currentAction.allocated_ae)}
                </p>
                <p>
                  <strong>Montant CP alloué:</strong> {formatCurrency(currentAction.allocated_cp)}
                </p>
              </div>
            )}
          </div>
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
    </Dashboard>
  );
}
