import { useState } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit, Trash2, Search, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionsTable, Action } from "@/components/tables/ActionsTable";

// Mock data for actions
const mockActions: Action[] = [
  {
    id: "ACT001",
    programme_id: "PRG001",
    programme_name: "Infrastructure Urbaine",
    nom: "Rénovation des routes",
    type_action: "Infrastructure",
    montant_alloue: 1500000,
  },
  {
    id: "ACT002",
    programme_id: "PRG002",
    programme_name: "Éducation Supérieure",
    nom: "Équipement des laboratoires",
    type_action: "Équipement",
    montant_alloue: 750000,
  },
  {
    id: "ACT003",
    programme_id: "PRG001",
    programme_name: "Infrastructure Urbaine",
    nom: "Construction des ponts",
    type_action: "Infrastructure",
    montant_alloue: 3000000,
  },
  {
    id: "ACT004",
    programme_id: "PRG003",
    programme_name: "Santé Publique",
    nom: "Équipement hospitalier",
    type_action: "Équipement",
    montant_alloue: 1200000,
  },
  {
    id: "ACT005",
    programme_id: "PRG004",
    programme_name: "Environnement",
    nom: "Reboisement urbain",
    type_action: "Environnement",
    montant_alloue: 500000,
  },
];

// Mock data for programme selection
const programmes = [
  { id: "PRG001", name: "Infrastructure Urbaine" },
  { id: "PRG002", name: "Éducation Supérieure" },
  { id: "PRG003", name: "Santé Publique" },
  { id: "PRG004", name: "Environnement" },
];

// Action types
const actionTypes = ["Infrastructure", "Équipement", "Formation", "Recherche", "Environnement", "Autre"];

export default function Actions() {
  const { t } = useTranslation();
  const [actions, setActions] = useState<Action[]>(mockActions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<Action | null>(null);
  const [newAction, setNewAction] = useState<Partial<Action>>({
    programme_id: "",
    nom: "",
    type_action: "",
    montant_alloue: 0,
  });

  // Filter actions based on search term
  const filteredActions = actions.filter(
    (action) =>
      action.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.type_action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.programme_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open add dialog
  const handleOpenAddDialog = () => {
    setNewAction({
      programme_id: "",
      nom: "",
      type_action: "",
      montant_alloue: 0,
    });
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (action: Action) => {
    setCurrentAction(action);
    setNewAction({
      programme_id: action.programme_id,
      nom: action.nom,
      type_action: action.type_action,
      montant_alloue: action.montant_alloue,
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

  // Add new action
  const handleAddAction = () => {
    if (!newAction.programme_id || !newAction.nom || !newAction.type_action) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const selectedProgramme = programmes.find((p) => p.id === newAction.programme_id);

    const action: Action = {
      id: `ACT${String(actions.length + 1).padStart(3, "0")}`,
      programme_id: newAction.programme_id!,
      programme_name: selectedProgramme?.name || "",
      nom: newAction.nom!,
      type_action: newAction.type_action!,
      montant_alloue: Number(newAction.montant_alloue) || 0,
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
    if (!currentAction || !newAction.nom || !newAction.type_action) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const selectedProgramme = programmes.find((p) => p.id === newAction.programme_id);

    const updatedActions = actions.map((action) =>
      action.id === currentAction.id
        ? {
            ...action,
            programme_id: newAction.programme_id!,
            programme_name: selectedProgramme?.name || action.programme_name,
            nom: newAction.nom!,
            type_action: newAction.type_action!,
            montant_alloue: Number(newAction.montant_alloue) || 0,
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dashboard className="p-6">
      <DashboardHeader title={t("app.navigation.actions")} description="Gestion des actions budgétaires" />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher des actions..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une action
            </Button>
          </div>

          <ActionsTable
            actions={filteredActions}
            formatCurrency={formatCurrency}
            onView={handleOpenViewDialog}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
            onRefresh={() => {
              // Simulate refreshing data
              toast({
                title: "Données actualisées",
                description: "La liste des actions a été actualisée.",
              });
              setActions([...mockActions]);
            }}
            onAddNew={handleOpenAddDialog}
          />
        </CardContent>
      </Card>

      {/* Add Action Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle action</DialogTitle>
            <DialogDescription>Complétez le formulaire pour ajouter une nouvelle action budgétaire.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="programme" className="text-right">
                Programme
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
                Nom de l'action
              </Label>
              <Input
                id="nom"
                className="col-span-3"
                value={newAction.nom || ""}
                onChange={(e) => setNewAction({ ...newAction, nom: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type d'action
              </Label>
              <Select value={newAction.type_action} onValueChange={(value) => setNewAction({ ...newAction, type_action: value })}>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="montant" className="text-right">
                Montant alloué
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'action</DialogTitle>
            <DialogDescription>Modifiez les détails de l'action.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-programme" className="text-right">
                Programme
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
                Nom de l'action
              </Label>
              <Input
                id="edit-nom"
                className="col-span-3"
                value={newAction.nom || ""}
                onChange={(e) => setNewAction({ ...newAction, nom: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type d'action
              </Label>
              <Select value={newAction.type_action} onValueChange={(value) => setNewAction({ ...newAction, type_action: value })}>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-montant" className="text-right">
                Montant alloué
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
                <strong>ID:</strong> {currentAction.id}
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

      {/* View Action Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l'action</DialogTitle>
          </DialogHeader>
          {currentAction && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID:</div>
                <div>{currentAction.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Programme:</div>
                <div>{currentAction.programme_name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Nom de l'action:</div>
                <div>{currentAction.nom}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Type d'action:</div>
                <div>{currentAction.type_action}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Montant alloué:</div>
                <div>{formatCurrency(currentAction.montant_alloue)}</div>
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
