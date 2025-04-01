
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Type definitions
interface ExpenseForecast {
  id: string;
  programName: string;
  forecastedAmount: number;
  period: "monthly" | "quarterly" | "annual";
  ministry: string;
  category: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  mobilizedAmount: number;
  remainingAmount: number;
}

const ExpenseForecastsPage = () => {
  const { t } = useTranslation();
  const [forecasts, setForecasts] = useState<ExpenseForecast[]>([
    {
      id: "fc-001",
      programName: "Infrastructure Development",
      forecastedAmount: 500000,
      period: "quarterly",
      ministry: "Ministry of Public Works",
      category: "Construction",
      createdAt: "2023-04-15",
      status: "approved",
      mobilizedAmount: 200000,
      remainingAmount: 300000,
    },
    {
      id: "fc-002",
      programName: "Education Reform",
      forecastedAmount: 750000,
      period: "annual",
      ministry: "Ministry of Education",
      category: "Education",
      createdAt: "2023-05-22",
      status: "pending",
      mobilizedAmount: 0,
      remainingAmount: 750000,
    },
    {
      id: "fc-003",
      programName: "Healthcare Initiative",
      forecastedAmount: 1200000,
      period: "monthly",
      ministry: "Ministry of Health",
      category: "Healthcare",
      createdAt: "2023-06-10",
      status: "approved",
      mobilizedAmount: 400000,
      remainingAmount: 800000,
    },
    {
      id: "fc-004",
      programName: "Digital Transformation",
      forecastedAmount: 950000,
      period: "quarterly",
      ministry: "Ministry of Technology",
      category: "IT",
      createdAt: "2023-07-05",
      status: "rejected",
      mobilizedAmount: 0,
      remainingAmount: 950000,
    },
    {
      id: "fc-005",
      programName: "Agricultural Subsidies",
      forecastedAmount: 680000,
      period: "annual",
      ministry: "Ministry of Agriculture",
      category: "Agriculture",
      createdAt: "2023-08-18",
      status: "approved",
      mobilizedAmount: 340000,
      remainingAmount: 340000,
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentForecast, setCurrentForecast] = useState<ExpenseForecast | null>(null);
  const [currentTab, setCurrentTab] = useState("all");

  // New forecast form state
  const [newForecast, setNewForecast] = useState({
    programName: "",
    forecastedAmount: 0,
    period: "monthly",
    ministry: "",
    category: "",
  });

  // Filter forecasts based on period type
  const filteredForecasts = forecasts.filter((forecast) => {
    if (currentTab === "all") return true;
    return forecast.period === currentTab;
  });

  // Calculate CP stats
  const totalForecastedAmount = forecasts.reduce(
    (acc, forecast) => acc + forecast.forecastedAmount,
    0
  );
  
  const totalMobilizedAmount = forecasts.reduce(
    (acc, forecast) => acc + forecast.mobilizedAmount,
    0
  );
  
  const totalRemainingAmount = forecasts.reduce(
    (acc, forecast) => acc + forecast.remainingAmount,
    0
  );

  // Add new forecast
  const handleAddForecast = () => {
    const id = `fc-${(forecasts.length + 1).toString().padStart(3, "0")}`;
    
    const forecast: ExpenseForecast = {
      id,
      programName: newForecast.programName,
      forecastedAmount: Number(newForecast.forecastedAmount),
      period: newForecast.period as "monthly" | "quarterly" | "annual",
      ministry: newForecast.ministry,
      category: newForecast.category,
      createdAt: new Date().toISOString().slice(0, 10),
      status: "pending",
      mobilizedAmount: 0,
      remainingAmount: Number(newForecast.forecastedAmount)
    };
    
    setForecasts([...forecasts, forecast]);
    setIsAddDialogOpen(false);
    setNewForecast({
      programName: "",
      forecastedAmount: 0,
      period: "monthly",
      ministry: "",
      category: "",
    });
  };

  // Edit forecast
  const handleEditForecast = () => {
    if (!currentForecast) return;
    
    const updatedForecasts = forecasts.map((f) => 
      f.id === currentForecast.id ? currentForecast : f
    );
    
    setForecasts(updatedForecasts);
    setIsEditDialogOpen(false);
    setCurrentForecast(null);
  };

  // Delete forecast
  const handleDeleteForecast = () => {
    if (!currentForecast) return;
    
    const updatedForecasts = forecasts.filter((f) => f.id !== currentForecast.id);
    setForecasts(updatedForecasts);
    setIsDeleteDialogOpen(false);
    setCurrentForecast(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prévisions des Dépenses - CP à Mobiliser</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>Ajouter une Prévision</Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CP Prévus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalForecastedAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total des montants prévisionnels
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CP Mobilisés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMobilizedAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalMobilizedAmount / totalForecastedAmount) * 100)}% du total prévu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CP à Mobiliser</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemainingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Restant à mobiliser
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Tabs */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="monthly">Mensuel</TabsTrigger>
          <TabsTrigger value="quarterly">Trimestriel</TabsTrigger>
          <TabsTrigger value="annual">Annuel</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Forecasts Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-muted-foreground">
              <th className="h-12 px-4 text-left">Programme</th>
              <th className="h-12 px-4 text-left">Ministère</th>
              <th className="h-12 px-4 text-left">Catégorie</th>
              <th className="h-12 px-4 text-left">Période</th>
              <th className="h-12 px-4 text-left">Montant Prévu</th>
              <th className="h-12 px-4 text-left">Montant Mobilisé</th>
              <th className="h-12 px-4 text-left">À Mobiliser</th>
              <th className="h-12 px-4 text-left">Status</th>
              <th className="h-12 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredForecasts.map((forecast) => (
              <tr key={forecast.id} className="border-b">
                <td className="p-4">{forecast.programName}</td>
                <td className="p-4">{forecast.ministry}</td>
                <td className="p-4">{forecast.category}</td>
                <td className="p-4">{
                  forecast.period === "monthly" ? "Mensuel" :
                  forecast.period === "quarterly" ? "Trimestriel" : "Annuel"
                }</td>
                <td className="p-4">{formatCurrency(forecast.forecastedAmount)}</td>
                <td className="p-4">{formatCurrency(forecast.mobilizedAmount)}</td>
                <td className="p-4">{formatCurrency(forecast.remainingAmount)}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${forecast.status === "approved" ? "bg-green-100 text-green-800" : 
                      forecast.status === "rejected" ? "bg-red-100 text-red-800" : 
                      "bg-yellow-100 text-yellow-800"}`}>
                    {forecast.status === "approved" ? "Approuvé" : 
                      forecast.status === "rejected" ? "Rejeté" : "En Attente"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentForecast(forecast);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setCurrentForecast(forecast);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Forecast Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter une Prévision</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="programName">Nom du Programme</Label>
                <Input
                  id="programName"
                  value={newForecast.programName}
                  onChange={(e) => setNewForecast({ ...newForecast, programName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ministry">Ministère</Label>
                <Input
                  id="ministry"
                  value={newForecast.ministry}
                  onChange={(e) => setNewForecast({ ...newForecast, ministry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={newForecast.category}
                  onChange={(e) => setNewForecast({ ...newForecast, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Montant Prévisionnel</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newForecast.forecastedAmount}
                  onChange={(e) => setNewForecast({ ...newForecast, forecastedAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Période</Label>
                <Select
                  onValueChange={(value: "monthly" | "quarterly" | "annual") => 
                    setNewForecast({ ...newForecast, period: value })
                  }
                  defaultValue={newForecast.period}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                    <SelectItem value="annual">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddForecast}>
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Edit Forecast Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Modifier la Prévision</h2>
            {currentForecast && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-programName">Nom du Programme</Label>
                  <Input
                    id="edit-programName"
                    value={currentForecast.programName}
                    onChange={(e) => setCurrentForecast({ ...currentForecast, programName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ministry">Ministère</Label>
                  <Input
                    id="edit-ministry"
                    value={currentForecast.ministry}
                    onChange={(e) => setCurrentForecast({ ...currentForecast, ministry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Catégorie</Label>
                  <Input
                    id="edit-category"
                    value={currentForecast.category}
                    onChange={(e) => setCurrentForecast({ ...currentForecast, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Montant Prévisionnel</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={currentForecast.forecastedAmount}
                    onChange={(e) => {
                      const newAmount = parseFloat(e.target.value) || 0;
                      setCurrentForecast({
                        ...currentForecast,
                        forecastedAmount: newAmount,
                        remainingAmount: newAmount - currentForecast.mobilizedAmount
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mobilized">Montant Mobilisé</Label>
                  <Input
                    id="edit-mobilized"
                    type="number"
                    value={currentForecast.mobilizedAmount}
                    onChange={(e) => {
                      const newMobilized = parseFloat(e.target.value) || 0;
                      setCurrentForecast({
                        ...currentForecast,
                        mobilizedAmount: newMobilized,
                        remainingAmount: currentForecast.forecastedAmount - newMobilized
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-period">Période</Label>
                  <Select
                    onValueChange={(value: "monthly" | "quarterly" | "annual") => 
                      setCurrentForecast({ ...currentForecast, period: value })
                    }
                    defaultValue={currentForecast.period}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {currentForecast.period === "monthly" ? "Mensuel" :
                         currentForecast.period === "quarterly" ? "Trimestriel" : "Annuel"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                      <SelectItem value="annual">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select
                    onValueChange={(value: "pending" | "approved" | "rejected") => 
                      setCurrentForecast({ ...currentForecast, status: value })
                    }
                    defaultValue={currentForecast.status}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {currentForecast.status === "approved" ? "Approuvé" :
                         currentForecast.status === "rejected" ? "Rejeté" : "En Attente"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En Attente</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditForecast}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer cette prévision de dépense? Cette action ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteForecast}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ExpenseForecastsPage;
