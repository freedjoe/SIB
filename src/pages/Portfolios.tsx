
import { useState } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit, Trash2, Search, Eye } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data for portfolios
interface Portfolio {
  id: string;
  nom: string;
  description: string;
  responsable: string;
  budget_total: number;
  programmes: string[];
}

const mockPortfolios: Portfolio[] = [
  {
    id: "PRT001",
    nom: "Infrastructure Nationale",
    description: "Portefeuille des projets d'infrastructure nationale",
    responsable: "Ministère des Travaux Publics",
    budget_total: 5000000,
    programmes: ["Infrastructure Urbaine", "Routes Nationales", "Ponts et Tunnels"],
  },
  {
    id: "PRT002",
    nom: "Éducation",
    description: "Portefeuille des projets éducatifs",
    responsable: "Ministère de l'Éducation Nationale",
    budget_total: 3500000,
    programmes: ["Éducation Supérieure", "Formation Professionnelle", "Bourses d'Études"],
  },
  {
    id: "PRT003",
    nom: "Santé",
    description: "Portefeuille des projets de santé publique",
    responsable: "Ministère de la Santé",
    budget_total: 4200000,
    programmes: ["Santé Publique", "Hôpitaux", "Vaccination"],
  },
  {
    id: "PRT004",
    nom: "Environnement",
    description: "Portefeuille des projets environnementaux",
    responsable: "Ministère de l'Environnement",
    budget_total: 1800000,
    programmes: ["Environnement", "Énergies Renouvelables", "Protection de la Nature"],
  },
];

export default function Portfolios() {
  const { t } = useTranslation();
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [newPortfolio, setNewPortfolio] = useState<Partial<Portfolio>>({
    nom: "",
    description: "",
    responsable: "",
    budget_total: 0,
    programmes: [],
  });

  // Filter portfolios based on search term
  const filteredPortfolios = portfolios.filter(
    (portfolio) =>
      portfolio.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open add dialog
  const handleOpenAddDialog = () => {
    setNewPortfolio({
      nom: "",
      description: "",
      responsable: "",
      budget_total: 0,
      programmes: [],
    });
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);
    setNewPortfolio({
      nom: portfolio.nom,
      description: portfolio.description,
      responsable: portfolio.responsable,
      budget_total: portfolio.budget_total,
      programmes: [...portfolio.programmes],
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);
    setIsDeleteDialogOpen(true);
  };

  // Open view dialog
  const handleOpenViewDialog = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);
    setIsViewDialogOpen(true);
  };

  // Add new portfolio
  const handleAddPortfolio = () => {
    if (!newPortfolio.nom || !newPortfolio.responsable) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const portfolio: Portfolio = {
      id: `PRT${String(portfolios.length + 1).padStart(3, "0")}`,
      nom: newPortfolio.nom!,
      description: newPortfolio.description || "",
      responsable: newPortfolio.responsable!,
      budget_total: Number(newPortfolio.budget_total) || 0,
      programmes: newPortfolio.programmes || [],
    };

    setPortfolios([...portfolios, portfolio]);
    setIsAddDialogOpen(false);
    toast({
      title: "Portefeuille ajouté",
      description: `Le portefeuille "${portfolio.nom}" a été ajouté avec succès.`,
    });
  };

  // Edit portfolio
  const handleEditPortfolio = () => {
    if (!currentPortfolio || !newPortfolio.nom || !newPortfolio.responsable) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const updatedPortfolios = portfolios.map((portfolio) =>
      portfolio.id === currentPortfolio.id
        ? {
            ...portfolio,
            nom: newPortfolio.nom!,
            description: newPortfolio.description || portfolio.description,
            responsable: newPortfolio.responsable!,
            budget_total: Number(newPortfolio.budget_total) || 0,
            programmes: newPortfolio.programmes || [],
          }
        : portfolio
    );

    setPortfolios(updatedPortfolios);
    setIsEditDialogOpen(false);
    toast({
      title: "Portefeuille modifié",
      description: `Le portefeuille "${currentPortfolio.nom}" a été modifié avec succès.`,
    });
  };

  // Delete portfolio
  const handleDeletePortfolio = () => {
    if (!currentPortfolio) return;

    const updatedPortfolios = portfolios.filter(
      (portfolio) => portfolio.id !== currentPortfolio.id
    );
    setPortfolios(updatedPortfolios);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Portefeuille supprimé",
      description: `Le portefeuille "${currentPortfolio.nom}" a été supprimé avec succès.`,
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

  // Handle programmes input change
  const handleProgrammesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const programmesText = e.target.value;
    const programmesList = programmesText
      .split('\n')
      .map(prog => prog.trim())
      .filter(prog => prog.length > 0);
    
    setNewPortfolio({ ...newPortfolio, programmes: programmesList });
  };

  return (
    <Dashboard className="p-6">
      <DashboardHeader
        title={t("app.navigation.portfolios")}
        description="Gestion des portefeuilles de programmes"
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des portefeuilles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un portefeuille
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Programmes</TableHead>
                <TableHead className="text-right">Budget Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPortfolios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucun portefeuille trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredPortfolios.map((portfolio) => (
                  <TableRow key={portfolio.id}>
                    <TableCell>{portfolio.id}</TableCell>
                    <TableCell className="font-medium">{portfolio.nom}</TableCell>
                    <TableCell>{portfolio.responsable}</TableCell>
                    <TableCell>{portfolio.programmes.length} programmes</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(portfolio.budget_total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenViewDialog(portfolio)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(portfolio)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(portfolio)}
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

      {/* Add Portfolio Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau portefeuille</DialogTitle>
            <DialogDescription>
              Complétez le formulaire pour ajouter un nouveau portefeuille de programmes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">
                Nom
              </Label>
              <Input
                id="nom"
                className="col-span-3"
                value={newPortfolio.nom || ""}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, nom: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={newPortfolio.description || ""}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="responsable" className="text-right">
                Responsable
              </Label>
              <Input
                id="responsable"
                className="col-span-3"
                value={newPortfolio.responsable || ""}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, responsable: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget Total
              </Label>
              <Input
                id="budget"
                type="number"
                className="col-span-3"
                value={newPortfolio.budget_total || ""}
                onChange={(e) =>
                  setNewPortfolio({
                    ...newPortfolio,
                    budget_total: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="programmes" className="text-right pt-2">
                Programmes
              </Label>
              <div className="col-span-3">
                <textarea
                  id="programmes"
                  className="w-full h-24 px-3 py-2 border rounded-md resize-none"
                  placeholder="Entrez chaque programme sur une nouvelle ligne"
                  value={newPortfolio.programmes?.join("\n") || ""}
                  onChange={handleProgrammesChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Entrez un programme par ligne
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleAddPortfolio}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Portfolio Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le portefeuille</DialogTitle>
            <DialogDescription>
              Modifiez les détails du portefeuille.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nom" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-nom"
                className="col-span-3"
                value={newPortfolio.nom || ""}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, nom: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                className="col-span-3"
                value={newPortfolio.description || ""}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-responsable" className="text-right">
                Responsable
              </Label>
              <Input
                id="edit-responsable"
                className="col-span-3"
                value={newPortfolio.responsable || ""}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, responsable: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-budget" className="text-right">
                Budget Total
              </Label>
              <Input
                id="edit-budget"
                type="number"
                className="col-span-3"
                value={newPortfolio.budget_total || ""}
                onChange={(e) =>
                  setNewPortfolio({
                    ...newPortfolio,
                    budget_total: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-programmes" className="text-right pt-2">
                Programmes
              </Label>
              <div className="col-span-3">
                <textarea
                  id="edit-programmes"
                  className="w-full h-24 px-3 py-2 border rounded-md resize-none"
                  placeholder="Entrez chaque programme sur une nouvelle ligne"
                  value={newPortfolio.programmes?.join("\n") || ""}
                  onChange={handleProgrammesChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Entrez un programme par ligne
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleEditPortfolio}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Portfolio Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce portefeuille? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          {currentPortfolio && (
            <div className="py-4">
              <p>
                <strong>ID:</strong> {currentPortfolio.id}
              </p>
              <p>
                <strong>Nom:</strong> {currentPortfolio.nom}
              </p>
              <p>
                <strong>Responsable:</strong> {currentPortfolio.responsable}
              </p>
              <p>
                <strong>Budget total:</strong>{" "}
                {formatCurrency(currentPortfolio.budget_total)}
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
            <Button variant="destructive" onClick={handleDeletePortfolio}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Portfolio Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du portefeuille</DialogTitle>
          </DialogHeader>
          {currentPortfolio && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID:</div>
                <div>{currentPortfolio.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Nom:</div>
                <div>{currentPortfolio.nom}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Description:</div>
                <div>{currentPortfolio.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Responsable:</div>
                <div>{currentPortfolio.responsable}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Budget total:</div>
                <div>{formatCurrency(currentPortfolio.budget_total)}</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Programmes:</div>
                <ul className="list-disc pl-5">
                  {currentPortfolio.programmes.map((programme, index) => (
                    <li key={index}>{programme}</li>
                  ))}
                </ul>
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
