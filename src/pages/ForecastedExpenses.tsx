import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar, Check, Clock, Edit, Plus, Trash2, Eye } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

import { ForecastedExpenseDialog } from "@/components/dialogs/ForecastedExpenseDialog";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { StatCard } from "@/components/ui-custom/StatCard";
import { PlusCircle, FileText, BarChart } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type ForecastedExpense = {
  id: string;
  program_id: string;
  program_name?: string;
  forecasted_amount: number;
  mobilized_amount: number;
  period: string;
  start_date: string;
  end_date: string;
  ministry_id: string | null;
  ministry_name?: string;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type Program = {
  id: string;
  name: string;
  budget: number;
  allocated: number;
  ministry_id: string | null;
};

type Ministry = {
  id: string;
  name: string;
  code: string;
};

const ExpenseCategories = [
  { value: "personnel", label: "Personnel" },
  { value: "operations", label: "Opérations" },
  { value: "investment", label: "Investissement" },
  { value: "development", label: "Développement" },
  { value: "emergency", label: "Urgence" },
];

// Mock data for forecasted expenses
const mockForecastedExpenses: ForecastedExpense[] = [
  {
    id: "1",
    program_id: "prog1",
    program_name: "Infrastructure Urbaine",
    forecasted_amount: 25000000,
    mobilized_amount: 15000000,
    period: "Q2",
    start_date: "2025-04-01",
    end_date: "2025-06-30",
    ministry_id: "min1",
    ministry_name: "Ministère des Finances",
    category: "investment",
    description: "Développement des infrastructures routières",
    created_at: "2025-03-15T00:00:00Z",
    updated_at: "2025-03-15T00:00:00Z",
  },
  {
    id: "2",
    program_id: "prog2",
    program_name: "Éducation",
    forecasted_amount: 15000000,
    mobilized_amount: 12000000,
    period: "Q2",
    start_date: "2025-04-01",
    end_date: "2025-06-30",
    ministry_id: "min2",
    ministry_name: "Ministère de l'Éducation",
    category: "operations",
    description: "Fournitures scolaires et maintenance",
    created_at: "2025-03-20T00:00:00Z",
    updated_at: "2025-03-20T00:00:00Z",
  },
  {
    id: "3",
    program_id: "prog3",
    program_name: "Santé",
    forecasted_amount: 35000000,
    mobilized_amount: 20000000,
    period: "Q2",
    start_date: "2025-04-01",
    end_date: "2025-06-30",
    ministry_id: "min3",
    ministry_name: "Ministère de la Santé",
    category: "development",
    description: "Équipement des hôpitaux",
    created_at: "2025-03-25T00:00:00Z",
    updated_at: "2025-03-25T00:00:00Z",
  },
];

const ForecastedExpenses = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ForecastedExpense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<ForecastedExpense | null>(null);
  const [activeTab, setActiveTab] = useState("planned");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false); // Add this if not already present

  // New forecast expense form state
  const [formData, setFormData] = useState({
    program_id: "",
    forecasted_amount: 0,
    mobilized_amount: 0,
    period: "Q1",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    ministry_id: "",
    category: "",
    description: "",
  });

  // Mock data for dropdowns
  const programs = [
    { id: "prog1", name: "Infrastructure Urbaine" },
    { id: "prog2", name: "Éducation" },
    { id: "prog3", name: "Santé" },
  ];

  const ministries = [
    { id: "min1", name: "Ministère des Finances" },
    { id: "min2", name: "Ministère de l'Éducation" },
    { id: "min3", name: "Ministère de la Santé" },
  ];

  // Mock function for form submission
  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    toast({
      title: "Prévision ajoutée",
      description: "La prévision de dépense a été ajoutée avec succès.",
    });
    setIsDialogOpen(false);
    // Here you would normally add API call to save the data
  };

  // Handle opening the dialog when clicking on the add button
  const handleAddClick = () => {
    setEditingExpense(null);
    setIsDialogOpen(true);
  };

  const ViewExpenseDialog = ({
    expense,
    open,
    onOpenChange,
  }: {
    expense: ForecastedExpense | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => {
    if (!expense) return null;

    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de la Prévision</DialogTitle>
            <DialogDescription>Informations détaillées sur la prévision de dépense</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <Label className="text-sm text-muted-foreground">Programme</Label>
                <p className="text-sm font-medium">{expense.program_name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Ministère</Label>
                <p className="text-sm font-medium">{expense.ministry_name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Montant Prévu</Label>
                <p className="text-sm font-medium">{formatCurrency(expense.forecasted_amount)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Montant Mobilisé</Label>
                <p className="text-sm font-medium">{formatCurrency(expense.mobilized_amount)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Période</Label>
                <p className="text-sm font-medium">{expense.period}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Catégorie</Label>
                <p className="text-sm font-medium">
                  <Badge variant="outline">{ExpenseCategories.find((cat) => cat.value === expense.category)?.label || expense.category}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Date de Début</Label>
                <p className="text-sm font-medium">{format(new Date(expense.start_date), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Date de Fin</Label>
                <p className="text-sm font-medium">{format(new Date(expense.end_date), "dd/MM/yyyy")}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Description</Label>
              <p className="text-sm font-medium mt-1">{expense.description || "Aucune description fournie"}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Progression</Label>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={(expense.mobilized_amount / expense.forecasted_amount) * 100} />
                <span className="text-xs text-muted-foreground">{Math.round((expense.mobilized_amount / expense.forecasted_amount) * 100)}%</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg
          className="animate-spin h-10 w-10 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des prévisions de dépenses...</span>
      </div>
    );
  }

  return (
    <Dashboard>
      <DashboardHeader
        title="Prévisions de Dépenses"
        description="Planifiez et suivez les prévisions de dépenses budgétaires">
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une prévision
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title="Total Prévisions"
            value={formatCurrency(125000000)}
            description="Budget total prévu"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="Prévisions Trimestrielles"
            value={formatCurrency(42000000)}
            description="Trimestre en cours"
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Taux d'Exécution Prévu"
            value="68%"
            description="Trimestre en cours"
            icon={<BarChart className="h-4 w-4" />}
          />
          <StatCard
            title="Écart Prévisionnel"
            value={formatCurrency(5600000)}
            description="Par rapport au budget réel"
            icon={<BarChart className="h-4 w-4" />}
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prévisions de Dépenses</CardTitle>
                <CardDescription>Gérez les prévisions de dépenses par programme et par période</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <Input
                placeholder="Rechercher des prévisions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-auto">
                <TabsList>
                  <TabsTrigger value="planned">Planifiées</TabsTrigger>
                  <TabsTrigger value="inProgress">En cours</TabsTrigger>
                  <TabsTrigger value="completed">Terminées</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Tabs
              value={activeTab}
              className="mt-0">
              <TabsContent value="planned">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Programme</TableHead>
                      <TableHead>Ministère</TableHead>
                      <TableHead>Montant Prévu</TableHead>
                      <TableHead>Montant Mobilisé</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockForecastedExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.program_name}</TableCell>
                        <TableCell>{expense.ministry_name}</TableCell>
                        <TableCell>{formatCurrency(expense.forecasted_amount)}</TableCell>
                        <TableCell>{formatCurrency(expense.mobilized_amount)}</TableCell>
                        <TableCell>{expense.period}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ExpenseCategories.find((cat) => cat.value === expense.category)?.label || expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setViewingExpense(expense);
                              }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingExpense(expense);
                                setIsDialogOpen(true);
                              }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="inProgress">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Programme</TableHead>
                      <TableHead>Ministère</TableHead>
                      <TableHead>Montant Prévu</TableHead>
                      <TableHead>Montant Mobilisé</TableHead>
                      <TableHead>Progression</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockForecastedExpenses.slice(0, 2).map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.program_name}</TableCell>
                        <TableCell>{expense.ministry_name}</TableCell>
                        <TableCell>{formatCurrency(expense.forecasted_amount)}</TableCell>
                        <TableCell>{formatCurrency(expense.mobilized_amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(expense.mobilized_amount / expense.forecasted_amount) * 100} />
                            <span className="text-xs text-muted-foreground">
                              {Math.round((expense.mobilized_amount / expense.forecasted_amount) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingExpense(expense)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="completed">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Programme</TableHead>
                      <TableHead>Ministère</TableHead>
                      <TableHead>Montant Final</TableHead>
                      <TableHead>Date de Fin</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockForecastedExpenses.slice(-1).map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.program_name}</TableCell>
                        <TableCell>{expense.ministry_name}</TableCell>
                        <TableCell>{formatCurrency(expense.mobilized_amount)}</TableCell>
                        <TableCell>{format(new Date(expense.end_date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Terminé
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DashboardSection>

      {/* Add Forecast Expense Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter une prévision de dépense</DialogTitle>
            <DialogDescription>
              Entrez les détails de la nouvelle prévision de dépense. Tous les champs marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="program_id"
                  className="text-sm font-medium">
                  Programme *
                </Label>
                <Select
                  value={formData.program_id}
                  onValueChange={(value) => setFormData({ ...formData, program_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem
                        key={program.id}
                        value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="ministry_id"
                  className="text-sm font-medium">
                  Ministère
                </Label>
                <Select
                  value={formData.ministry_id}
                  onValueChange={(value) => setFormData({ ...formData, ministry_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un ministère" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministries.map((ministry) => (
                      <SelectItem
                        key={ministry.id}
                        value={ministry.id}>
                        {ministry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="forecasted_amount"
                  className="text-sm font-medium">
                  Montant prévu (DZD) *
                </Label>
                <Input
                  id="forecasted_amount"
                  type="number"
                  value={formData.forecasted_amount}
                  onChange={(e) => setFormData({ ...formData, forecasted_amount: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mobilized_amount"
                  className="text-sm font-medium">
                  Montant mobilisé (DZD)
                </Label>
                <Input
                  id="mobilized_amount"
                  type="number"
                  value={formData.mobilized_amount}
                  onChange={(e) => setFormData({ ...formData, mobilized_amount: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="period"
                  className="text-sm font-medium">
                  Période *
                </Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => setFormData({ ...formData, period: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Trimestre 1</SelectItem>
                    <SelectItem value="Q2">Trimestre 2</SelectItem>
                    <SelectItem value="Q3">Trimestre 3</SelectItem>
                    <SelectItem value="Q4">Trimestre 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium">
                  Catégorie *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {ExpenseCategories.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date de début *</Label>
                <Input
                  type="date"
                  value={formData.start_date.split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value).toISOString() })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Date de fin *</Label>
                <Input
                  type="date"
                  value={formData.end_date.split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, end_date: new Date(e.target.value).toISOString() })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ViewExpenseDialog
        expense={viewingExpense}
        open={viewingExpense !== null}
        onOpenChange={(open) => !open && setViewingExpense(null)}
      />
    </Dashboard>
  );
};

export default ForecastedExpenses;
