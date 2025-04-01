
import { useState } from "react";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui-custom/StatCard";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { 
  BarChart3, CalendarDays, ChevronDown, Eye, FileSpreadsheet, 
  FilterX, LineChart, ListFilter, Plus, RefreshCw, Trash2, 
  TrendingUp, Edit
} from "lucide-react";
import { ExpenseForecastDialog } from "@/components/dialogs/ExpenseForecastDialog";

// Types
interface ExpenseForecast {
  id: string;
  programId: string;
  programName: string;
  ministryId: string;
  ministryName: string;
  amount: number;
  period: "monthly" | "quarterly" | "annually";
  startDate: string;
  endDate: string;
  category: string;
  mobilizedAmount: number;
  remaining: number;
  status: "draft" | "active" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface Program {
  id: string;
  name: string;
  budget: number;
  allocated: number;
  ministryId: string;
  ministryName: string;
}

interface Ministry {
  id: string;
  name: string;
  code: string;
}

// Mock Data
const mockPrograms: Program[] = [
  { 
    id: "p1", 
    name: "Programme de Développement Rural", 
    budget: 1200000000, 
    allocated: 800000000,
    ministryId: "m1",
    ministryName: "Ministère de l'Agriculture"
  },
  { 
    id: "p2", 
    name: "Plan National de Santé", 
    budget: 2500000000, 
    allocated: 1500000000,
    ministryId: "m2",
    ministryName: "Ministère de la Santé"
  },
  { 
    id: "p3", 
    name: "Programme d'Infrastructure Routière", 
    budget: 3000000000, 
    allocated: 2200000000,
    ministryId: "m3",
    ministryName: "Ministère des Travaux Publics"
  },
  { 
    id: "p4", 
    name: "Plan National d'Éducation", 
    budget: 1800000000, 
    allocated: 1200000000,
    ministryId: "m4",
    ministryName: "Ministère de l'Éducation"
  },
];

const mockMinistries: Ministry[] = [
  { id: "m1", name: "Ministère de l'Agriculture", code: "MAGR" },
  { id: "m2", name: "Ministère de la Santé", code: "MSAN" },
  { id: "m3", name: "Ministère des Travaux Publics", code: "MTRP" },
  { id: "m4", name: "Ministère de l'Éducation", code: "MEDU" },
  { id: "m5", name: "Ministère de l'Économie", code: "MECO" },
];

const mockForecasts: ExpenseForecast[] = [
  {
    id: "ef1",
    programId: "p1",
    programName: "Programme de Développement Rural",
    ministryId: "m1",
    ministryName: "Ministère de l'Agriculture",
    amount: 350000000,
    period: "quarterly",
    startDate: "2023-10-01",
    endDate: "2023-12-31",
    category: "Infrastructures",
    mobilizedAmount: 200000000,
    remaining: 150000000,
    status: "active",
    createdAt: "2023-09-15",
    updatedAt: "2023-09-15"
  },
  {
    id: "ef2",
    programId: "p2",
    programName: "Plan National de Santé",
    ministryId: "m2",
    ministryName: "Ministère de la Santé",
    amount: 650000000,
    period: "quarterly",
    startDate: "2023-10-01",
    endDate: "2023-12-31",
    category: "Matériel Médical",
    mobilizedAmount: 400000000,
    remaining: 250000000,
    status: "active",
    createdAt: "2023-09-10",
    updatedAt: "2023-09-15"
  },
  {
    id: "ef3",
    programId: "p3",
    programName: "Programme d'Infrastructure Routière",
    ministryId: "m3",
    ministryName: "Ministère des Travaux Publics",
    amount: 800000000,
    period: "annually",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    category: "Construction",
    mobilizedAmount: 600000000,
    remaining: 200000000,
    status: "active",
    createdAt: "2023-01-15",
    updatedAt: "2023-09-20"
  },
  {
    id: "ef4",
    programId: "p4",
    programName: "Plan National d'Éducation",
    ministryId: "m4",
    ministryName: "Ministère de l'Éducation",
    amount: 450000000,
    period: "monthly",
    startDate: "2023-10-01",
    endDate: "2023-10-31",
    category: "Équipement scolaire",
    mobilizedAmount: 100000000,
    remaining: 350000000,
    status: "active",
    createdAt: "2023-09-25",
    updatedAt: "2023-09-25"
  },
];

// Utility Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getPeriodLabel = (period: string) => {
  switch(period) {
    case "monthly": return "Mensuel";
    case "quarterly": return "Trimestriel";
    case "annually": return "Annuel";
    default: return period;
  }
};

const getStatusBadge = (status: string, mobilized: number, total: number) => {
  const percentage = (mobilized / total) * 100;
  
  if (status === "completed") {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">
        Complété
      </Badge>
    );
  } else if (percentage >= 75) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">
        {Math.round(percentage)}% mobilisé
      </Badge>
    );
  } else if (percentage >= 50) {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">
        {Math.round(percentage)}% mobilisé
      </Badge>
    );
  } else if (percentage >= 25) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
        {Math.round(percentage)}% mobilisé
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-400">
        {Math.round(percentage)}% mobilisé
      </Badge>
    );
  }
};

export default function ExpenseForecastsPage() {
  const [forecasts, setForecasts] = useState<ExpenseForecast[]>(mockForecasts);
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [ministryFilter, setMinistryFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [currentForecast, setCurrentForecast] = useState<ExpenseForecast | null>(null);
  
  // Calculate statistics
  const totalForecasted = forecasts.reduce((sum, f) => sum + f.amount, 0);
  const totalMobilized = forecasts.reduce((sum, f) => sum + f.mobilizedAmount, 0);
  const totalRemaining = totalForecasted - totalMobilized;
  const mobilizationPercentage = totalForecasted > 0 ? (totalMobilized / totalForecasted) * 100 : 0;
  
  // Filter forecasts based on selected filters
  const filteredForecasts = forecasts.filter(forecast => {
    const matchesPeriod = periodFilter === "all" || forecast.period === periodFilter;
    const matchesMinistry = ministryFilter === "all" || forecast.ministryId === ministryFilter;
    const matchesCategory = categoryFilter === "all" || forecast.category === categoryFilter;
    
    return matchesPeriod && matchesMinistry && matchesCategory;
  });
  
  // Get unique categories for filter
  const categories = [...new Set(forecasts.map(f => f.category))];
  
  // Chart data
  const mobilizationData = [
    { name: "Mobilisé", value: totalMobilized, color: "#10b981" },
    { name: "Restant", value: totalRemaining, color: "#f59e0b" },
  ];
  
  const handleOpenAddDialog = () => {
    setCurrentForecast(null);
    setIsAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (forecast: ExpenseForecast) => {
    setCurrentForecast(forecast);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenViewDialog = (forecast: ExpenseForecast) => {
    setCurrentForecast(forecast);
    setIsViewDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (forecast: ExpenseForecast) => {
    setCurrentForecast(forecast);
    setIsDeleteDialogOpen(true);
  };
  
  const handleAddForecast = (forecastData: Partial<ExpenseForecast>) => {
    if (!forecastData.programId || !forecastData.amount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    const program = mockPrograms.find(p => p.id === forecastData.programId);
    if (!program) {
      toast({
        title: "Erreur",
        description: "Programme invalide",
        variant: "destructive",
      });
      return;
    }
    
    const available = program.budget - program.allocated;
    if ((forecastData.amount || 0) > available) {
      toast({
        title: "Erreur",
        description: "Le montant prévu dépasse le budget disponible",
        variant: "destructive",
      });
      return;
    }
    
    const newForecast: ExpenseForecast = {
      id: `ef${forecasts.length + 1}`,
      programId: forecastData.programId || "",
      programName: program.name,
      ministryId: program.ministryId,
      ministryName: program.ministryName,
      amount: Number(forecastData.amount),
      period: forecastData.period as "monthly" | "quarterly" | "annually",
      startDate: forecastData.startDate || new Date().toISOString().split("T")[0],
      endDate: forecastData.endDate || new Date().toISOString().split("T")[0],
      category: forecastData.category || "Autre",
      mobilizedAmount: 0,
      remaining: Number(forecastData.amount),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setForecasts([...forecasts, newForecast]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Prévision ajoutée",
      description: `La prévision pour "${program.name}" a été ajoutée avec succès.`,
    });
  };
  
  const handleEditForecast = (forecastData: Partial<ExpenseForecast>) => {
    if (!currentForecast) return;
    
    const program = mockPrograms.find(p => p.id === forecastData.programId);
    if (!program && forecastData.programId) {
      toast({
        title: "Erreur",
        description: "Programme invalide",
        variant: "destructive",
      });
      return;
    }
    
    const updatedForecasts = forecasts.map(f => 
      f.id === currentForecast.id
        ? {
            ...f,
            programId: forecastData.programId || f.programId,
            programName: program ? program.name : f.programName,
            ministryId: program ? program.ministryId : f.ministryId,
            ministryName: program ? program.ministryName : f.ministryName,
            amount: forecastData.amount || f.amount,
            period: forecastData.period as "monthly" | "quarterly" | "annually" || f.period,
            startDate: forecastData.startDate || f.startDate,
            endDate: forecastData.endDate || f.endDate,
            category: forecastData.category || f.category,
            remaining: (forecastData.amount || f.amount) - f.mobilizedAmount,
            updatedAt: new Date().toISOString(),
          }
        : f
    );
    
    setForecasts(updatedForecasts);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Prévision modifiée",
      description: `La prévision pour "${currentForecast.programName}" a été modifiée avec succès.`,
    });
  };
  
  const handleDeleteForecast = () => {
    if (!currentForecast) return;
    
    const updatedForecasts = forecasts.filter(f => f.id !== currentForecast.id);
    setForecasts(updatedForecasts);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Prévision supprimée",
      description: `La prévision pour "${currentForecast.programName}" a été supprimée avec succès.`,
    });
  };
  
  const resetFilters = () => {
    setPeriodFilter("all");
    setMinistryFilter("all");
    setCategoryFilter("all");
  };
  
  return (
    <Dashboard>
      <DashboardHeader 
        title="Prévisions des Dépenses" 
        description="Gérez les prévisions de dépenses et les CP à mobiliser"
      >
        <Button className="shadow-subtle" onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle prévision
        </Button>
      </DashboardHeader>
      
      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title="Montant Total Prévu"
            value={formatCurrency(totalForecasted)}
            description={`${forecasts.length} prévisions`}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <StatCard
            title="CP Mobilisé"
            value={formatCurrency(totalMobilized)}
            description={`${mobilizationPercentage.toFixed(1)}% du total`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="CP à Mobiliser"
            value={formatCurrency(totalRemaining)}
            description="Montant restant"
            icon={<LineChart className="h-4 w-4" />}
          />
          <Card className="flex items-center justify-center p-6">
            <Button variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exporter en Excel
            </Button>
          </Card>
        </DashboardGrid>
      </DashboardSection>
      
      <DashboardSection>
        <DashboardGrid columns={2}>
          <BudgetChart
            title="CP Mobilisé vs. CP à Mobiliser"
            data={mobilizationData}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Filtres</CardTitle>
              <CardDescription>Filtrer les prévisions par période, ministère et catégorie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period-filter">Période</Label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger id="period-filter">
                    <SelectValue placeholder="Toutes les périodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                    <SelectItem value="annually">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ministry-filter">Ministère</Label>
                <Select value={ministryFilter} onValueChange={setMinistryFilter}>
                  <SelectTrigger id="ministry-filter">
                    <SelectValue placeholder="Tous les ministères" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les ministères</SelectItem>
                    {mockMinistries.map(ministry => (
                      <SelectItem key={ministry.id} value={ministry.id}>
                        {ministry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category-filter">Catégorie</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={resetFilters}
              >
                <FilterX className="mr-2 h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        </DashboardGrid>
      </DashboardSection>
      
      <DashboardSection>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Liste des Prévisions de Dépenses</CardTitle>
              <CardDescription>
                {filteredForecasts.length} prévision{filteredForecasts.length !== 1 ? 's' : ''} trouvée{filteredForecasts.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm">
                <ListFilter className="mr-2 h-4 w-4" />
                Filtres avancés
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programme</TableHead>
                  <TableHead>Ministère</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Mobilisé</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForecasts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Aucune prévision trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForecasts.map(forecast => (
                    <TableRow key={forecast.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {forecast.programName}
                      </TableCell>
                      <TableCell>{forecast.ministryName}</TableCell>
                      <TableCell>{formatCurrency(forecast.amount)}</TableCell>
                      <TableCell>{formatCurrency(forecast.mobilizedAmount)}</TableCell>
                      <TableCell>{getPeriodLabel(forecast.period)}</TableCell>
                      <TableCell>{forecast.category}</TableCell>
                      <TableCell>
                        {getStatusBadge(forecast.status, forecast.mobilizedAmount, forecast.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenViewDialog(forecast)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEditDialog(forecast)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleOpenDeleteDialog(forecast)}
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
      </DashboardSection>
      
      <ExpenseForecastDialog
        type="add"
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        forecast={null}
        programs={mockPrograms}
        ministries={mockMinistries}
        formatCurrency={formatCurrency}
        onSave={handleAddForecast}
      />
      
      <ExpenseForecastDialog
        type="edit"
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        forecast={currentForecast}
        programs={mockPrograms}
        ministries={mockMinistries}
        formatCurrency={formatCurrency}
        onSave={handleEditForecast}
      />
      
      <ExpenseForecastDialog
        type="view"
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        forecast={currentForecast}
        programs={mockPrograms}
        ministries={mockMinistries}
        formatCurrency={formatCurrency}
        onSave={() => {}}
      />
      
      <ExpenseForecastDialog
        type="delete"
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        forecast={currentForecast}
        programs={mockPrograms}
        ministries={mockMinistries}
        formatCurrency={formatCurrency}
        onSave={() => {}}
        onDelete={handleDeleteForecast}
      />
    </Dashboard>
  );
}
