import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar, Check, Clock, Edit, Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
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

const ForecastedExpenses = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ForecastedExpense | null>(null);
  const [activeTab, setActiveTab] = useState("planned");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dashboard>
      <DashboardHeader title="Prévisions de Dépenses" description="Planifiez et suivez les prévisions de dépenses budgétaires">
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
          <StatCard title="Taux d'Exécution Prévu" value="68%" description="Trimestre en cours" icon={<BarChart className="h-4 w-4" />} />
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="planned">Planifiées</TabsTrigger>
                  <TabsTrigger value="inProgress">En cours</TabsTrigger>
                  <TabsTrigger value="completed">Terminées</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Tabs value={activeTab} className="mt-0">
              <TabsContent value="planned">
                <div className="text-center py-10 text-muted-foreground">
                  Aucune prévision planifiée disponible.
                  <div className="mt-4">
                    <Button onClick={handleAddClick}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter une prévision
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inProgress">
                <div className="text-center py-10 text-muted-foreground">Aucune prévision en cours disponible.</div>
              </TabsContent>

              <TabsContent value="completed">
                <div className="text-center py-10 text-muted-foreground">Aucune prévision terminée disponible.</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DashboardSection>

      {/* Add Forecast Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Label htmlFor="program_id" className="text-sm font-medium">
                  Programme *
                </Label>
                <Select value={formData.program_id} onValueChange={(value) => setFormData({ ...formData, program_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ministry_id" className="text-sm font-medium">
                  Ministère
                </Label>
                <Select value={formData.ministry_id} onValueChange={(value) => setFormData({ ...formData, ministry_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un ministère" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministries.map((ministry) => (
                      <SelectItem key={ministry.id} value={ministry.id}>
                        {ministry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="forecasted_amount" className="text-sm font-medium">
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
                <Label htmlFor="mobilized_amount" className="text-sm font-medium">
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
                <Label htmlFor="period" className="text-sm font-medium">
                  Période *
                </Label>
                <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
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
                <Label htmlFor="category" className="text-sm font-medium">
                  Catégorie *
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {ExpenseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
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
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default ForecastedExpenses;
