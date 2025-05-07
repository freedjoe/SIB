import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Activity,
  BarChart,
  Check,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileEdit,
  FileText,
  PlusCircle,
  Trash2,
  TrendingUp,
  Calendar,
  Building,
  Tag,
  Flag,
  AlertCircle,
  LucideIcon,
  CircleDollarSign,
  Info,
  FileCheck,
  Columns,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReusableDataTable } from "@/components/tables/ReusableDataTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { StatCard } from "@/components/ui-custom/StatCard";
import { formatCurrency } from "@/lib/utils";

// Mock ministries data
const MOCK_MINISTRIES = [
  { id: "m1", name_fr: "Ministère des Finances", code: "FIN" },
  { id: "m2", name_fr: "Ministère de l'Éducation", code: "EDU" },
  { id: "m3", name_fr: "Ministère de la Santé", code: "SAN" },
  { id: "m4", name_fr: "Ministère de l'Agriculture", code: "AGR" },
  { id: "m5", name_fr: "Ministère de l'Industrie", code: "IND" },
];

// Mock fiscal years data
const MOCK_FISCAL_YEARS = [
  { id: "fy1", year: 2025, is_current: true },
  { id: "fy2", year: 2024, is_current: false },
  { id: "fy3", year: 2023, is_current: false },
];

// Mock requests data
const MOCK_REQUESTS = [
  {
    id: "r1",
    title: "Renouvellement des équipements informatiques",
    ref: "REQ-FIN-2025-001",
    type: "Payment credit",
    status: "approved",
    priority: "high",
    ae_amount: 2500000,
    cp_amount: 1200000,
    ministry_id: "m1",
    fiscal_year_id: "fy1",
    date_submitted: "2025-02-10T10:30:00Z",
    ministry: MOCK_MINISTRIES[0],
    fiscal_year: MOCK_FISCAL_YEARS[0],
  },
  {
    id: "r2",
    title: "Construction d'écoles primaires",
    ref: "REQ-EDU-2025-003",
    type: "New registration",
    status: "submitted",
    priority: "high",
    ae_amount: 12000000,
    cp_amount: 4000000,
    ministry_id: "m2",
    fiscal_year_id: "fy1",
    date_submitted: "2025-03-05T14:20:00Z",
    ministry: MOCK_MINISTRIES[1],
    fiscal_year: MOCK_FISCAL_YEARS[0],
  },
  {
    id: "r3",
    title: "Modernisation des hôpitaux",
    ref: "REQ-SAN-2025-002",
    type: "Revaluation",
    status: "reviewed",
    priority: "medium",
    ae_amount: 8500000,
    cp_amount: 2800000,
    ministry_id: "m3",
    fiscal_year_id: "fy1",
    date_submitted: "2025-02-28T09:15:00Z",
    ministry: MOCK_MINISTRIES[2],
    fiscal_year: MOCK_FISCAL_YEARS[0],
  },
  {
    id: "r4",
    title: "Subventions agricoles",
    ref: "REQ-AGR-2025-007",
    type: "Allocation",
    status: "rejected",
    priority: "low",
    ae_amount: 5200000,
    cp_amount: 5200000,
    ministry_id: "m4",
    fiscal_year_id: "fy1",
    date_submitted: "2025-01-20T11:45:00Z",
    ministry: MOCK_MINISTRIES[3],
    fiscal_year: MOCK_FISCAL_YEARS[0],
  },
  {
    id: "r5",
    title: "Développement zones industrielles",
    ref: "REQ-IND-2025-004",
    type: "Additional request",
    status: "approved",
    priority: "high",
    ae_amount: 15000000,
    cp_amount: 7500000,
    ministry_id: "m5",
    fiscal_year_id: "fy1",
    date_submitted: "2025-03-15T16:30:00Z",
    ministry: MOCK_MINISTRIES[4],
    fiscal_year: MOCK_FISCAL_YEARS[0],
  },
];

// Constants for dropdowns
const requestTypeOptions = [
  { value: "New registration", label: "Nouvelle inscription" },
  { value: "Revaluation", label: "Réévaluation" },
  { value: "Payment credit", label: "Crédit de paiement" },
  { value: "Additional request", label: "Demande additionnelle" },
  { value: "Transfer", label: "Transfert" },
  { value: "Allocation", label: "Allocation" },
];

const priorityOptions = [
  { value: "high", label: "Haute" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Faible" },
];

// Helper function to get status badge
const getStatusBadge = (status) => {
  const statusMap = {
    approved: <Badge variant="success">Approuvé</Badge>,
    submitted: <Badge variant="default">Soumis</Badge>,
    reviewed: <Badge variant="warning">En révision</Badge>,
    rejected: <Badge variant="destructive">Rejeté</Badge>,
    draft: <Badge variant="outline">Brouillon</Badge>,
  };
  return statusMap[status] || status;
};

// Helper component for the info item in view dialog
const InfoItem = ({ icon, label, value, className = "" }) => (
  <div className={`flex items-start gap-2 ${className}`}>
    <div className="mt-0.5 text-muted-foreground">{icon}</div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

const Requests = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle form submission
  const handleAddRequest = (formData) => {
    setIsSubmitting(true);

    // Simulate API request
    setTimeout(() => {
      toast({
        title: "Demande enregistrée",
        description: "La demande a été enregistrée avec succès.",
      });
      setAddDialogOpen(false);
      setIsSubmitting(false);
    }, 1000);
  };

  // Function to handle request update
  const handleUpdateRequest = (requestData) => {
    setIsSubmitting(true);

    // Simulate API request
    setTimeout(() => {
      toast({
        title: "Demande mise à jour",
        description: "La demande a été mise à jour avec succès.",
      });
      setEditDialogOpen(false);
      setIsSubmitting(false);
    }, 1000);
  };

  // Function to handle request deletion
  const handleDeleteRequest = () => {
    // Simulate deletion
    toast({
      title: "Demande supprimée",
      description: "La demande a été supprimée avec succès.",
    });
  };

  // Table columns
  const columns = [
    {
      accessorKey: "ref",
      header: "Référence",
      cell: ({ row }) => <div className="font-medium">{row.getValue("ref")}</div>,
    },
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }) => (
        <div
          className="max-w-[220px] truncate"
          title={row.getValue("title")}>
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "ministry.name_fr",
      header: "Ministère",
      cell: ({ row }) => <div>{row.original.ministry?.name_fr}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <div>{row.getValue("type")}</div>,
    },
    {
      accessorKey: "ae_amount",
      header: "Montant AE",
      cell: ({ row }) => formatCurrency(row.getValue("ae_amount")),
    },
    {
      accessorKey: "cp_amount",
      header: "Montant CP",
      cell: ({ row }) => formatCurrency(row.getValue("cp_amount")),
    },
    {
      accessorKey: "priority",
      header: "Priorité",
      cell: ({ row }) => {
        const priority = row.getValue("priority");
        const priorityMap = {
          high: (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>Haute
            </span>
          ),
          medium: (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>Moyenne
            </span>
          ),
          low: (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>Faible
            </span>
          ),
        };
        return priorityMap[priority] || priority;
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return getStatusBadge(status);
      },
    },
    {
      accessorKey: "date_submitted",
      header: "Date de soumission",
      cell: ({ row }) => format(new Date(row.getValue("date_submitted")), "dd/MM/yyyy"),
    },
  ];

  // Action handlers for the table
  const actionHandlers = {
    onView: (data) => {
      setSelectedRequest(data);
      setViewDialogOpen(true);
    },
    onEdit: (data) => {
      setSelectedRequest(data);
      setEditDialogOpen(true);
    },
    onDelete: (data) => {
      setSelectedRequest(data);
      handleDeleteRequest();
    },
  };

  return (
    <Dashboard>
      <DashboardHeader
        title="Demandes des Ministères"
        description="Gestion des demandes de financement des ministères">
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle Demande
          </Button>
        </div>
      </DashboardHeader>

      {/* Beautiful Mini Dashboard */}
      <div className="mb-6 mt-2">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-0">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row">
              {/* Summary Section */}
              <div className="p-6 flex-1">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Aperçu des Demandes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Total Demandes</span>
                    <span className="text-2xl font-bold">{MOCK_REQUESTS.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">En Attente</span>
                    <span className="text-2xl font-bold">{MOCK_REQUESTS.filter((r) => r.status === "submitted").length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Approuvées</span>
                    <span className="text-2xl font-bold text-green-600">{MOCK_REQUESTS.filter((r) => r.status === "approved").length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Rejetées</span>
                    <span className="text-2xl font-bold text-red-600">{MOCK_REQUESTS.filter((r) => r.status === "rejected").length}</span>
                  </div>
                </div>
              </div>

              {/* Financial Stats Section */}
              <div className="p-6 flex-1 border-t md:border-t-0 md:border-l border-border">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Aperçu Financier
                </h3>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Montant AE Total:</span>
                    <span className="font-medium">{formatCurrency(MOCK_REQUESTS.reduce((sum, r) => sum + (r.ae_amount || 0), 0))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Montant CP Total:</span>
                    <span className="font-medium">{formatCurrency(MOCK_REQUESTS.reduce((sum, r) => sum + (r.cp_amount || 0), 0))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Budget Approuvé (AE):</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(MOCK_REQUESTS.filter((r) => r.status === "approved").reduce((sum, r) => sum + (r.ae_amount || 0), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Budget Approuvé (CP):</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(MOCK_REQUESTS.filter((r) => r.status === "approved").reduce((sum, r) => sum + (r.cp_amount || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Ministries Section */}
              <div className="p-6 flex-1 border-t md:border-t-0 md:border-l border-border">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-primary" />
                  Ministères Principaux
                </h3>
                <div className="space-y-3">
                  {Array.from(new Set(MOCK_REQUESTS.map((r) => r.ministry_id)))
                    .slice(0, 3)
                    .map((ministryId) => {
                      const ministry = MOCK_MINISTRIES.find((m) => m.id === ministryId) || { name_fr: "Inconnu", code: "?" };
                      const ministryRequests = MOCK_REQUESTS.filter((r) => r.ministry_id === ministryId);
                      const totalAmount = ministryRequests.reduce((sum, r) => sum + (r.ae_amount || 0), 0);
                      const approvalPercent = Math.round(
                        (ministryRequests.filter((r) => r.status === "approved").length / ministryRequests.length) * 100
                      );

                      return (
                        <div
                          key={ministryId}
                          className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{ministry.name_fr}</span>
                            <span className="text-sm">{formatCurrency(totalAmount)}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${approvalPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{ministryRequests.length} demandes</span>
                            <span>{approvalPercent}% approuvées</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats */}
      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title="Total AE Demandées"
            value={formatCurrency(MOCK_REQUESTS.reduce((sum, r) => sum + (r.ae_amount || 0), 0))}
            description="Montant total AE demandé"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="Total CP Demandées"
            value={formatCurrency(MOCK_REQUESTS.reduce((sum, r) => sum + (r.cp_amount || 0), 0))}
            description="Montant total CP demandé"
            icon={<CreditCard className="h-4 w-4" />}
          />
          <StatCard
            title="Demandes en Cours"
            value={MOCK_REQUESTS.filter((r) => r.status === "submitted" || r.status === "reviewed").length.toString()}
            description="En attente de révision"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Taux d'Approbation"
            value={`${
              MOCK_REQUESTS.length > 0 ? Math.round((MOCK_REQUESTS.filter((r) => r.status === "approved").length / MOCK_REQUESTS.length) * 100) : 0
            }%`}
            description="Demandes approuvées"
            icon={<Check className="h-4 w-4" />}
          />
        </DashboardGrid>
      </DashboardSection>

      {/* Requests Table */}
      <DashboardSection>
        <Card>
          <CardHeader>
            <CardTitle>Liste des Demandes</CardTitle>
            <CardDescription>Suivi des demandes de financement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <Input
                placeholder="Rechercher des demandes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="pending">Soumises</TabsTrigger>
                  <TabsTrigger value="approved">Approuvées</TabsTrigger>
                  <TabsTrigger value="rejected">Rejetées</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Data Table with Mock Data */}
            <ReusableDataTable
              columns={columns}
              data={MOCK_REQUESTS}
              actionHandlers={actionHandlers}
              tableName="Demandes des Ministères"
            />
          </CardContent>
        </Card>
      </DashboardSection>

      {/* Add Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Nouvelle Demande
            </DialogTitle>
            <DialogDescription>Remplissez les informations suivantes pour ajouter une nouvelle demande de financement.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddRequest(new FormData(e.target));
            }}>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 py-4">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Informations de Base
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="ministry_id"
                        className="text-sm">
                        Ministère
                      </Label>
                      <Select
                        name="ministry_id"
                        required>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un ministère" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_MINISTRIES.map((ministry) => (
                            <SelectItem
                              key={ministry.id}
                              value={ministry.id}>
                              {ministry.name_fr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="fiscal_year_id"
                        className="text-sm">
                        Année Fiscale
                      </Label>
                      <Select
                        name="fiscal_year_id"
                        required>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner une année" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_FISCAL_YEARS.map((year) => (
                            <SelectItem
                              key={year.id}
                              value={year.id}>
                              {year.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Label
                        htmlFor="title"
                        className="text-sm">
                        Titre de la Demande
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Ex: Renouvellement des équipements informatiques"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="ref"
                        className="text-sm">
                        Référence
                      </Label>
                      <Input
                        id="ref"
                        name="ref"
                        placeholder="Ex: REQ-MIN-2025-001"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Laissez vide pour générer automatiquement</p>
                    </div>
                    <div>
                      <Label
                        htmlFor="date_submitted"
                        className="text-sm">
                        Date de Soumission
                      </Label>
                      <Input
                        id="date_submitted"
                        name="date_submitted"
                        type="date"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Classification Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-primary" />
                    Classification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="type"
                        className="text-sm">
                        Type de Demande
                      </Label>
                      <Select
                        id="type"
                        name="type"
                        required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {requestTypeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="priority"
                        className="text-sm">
                        Niveau de Priorité
                      </Label>
                      <Select
                        id="priority"
                        name="priority"
                        required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="status"
                        className="text-sm">
                        Statut Initial
                      </Label>
                      <Select
                        id="status"
                        name="status"
                        defaultValue="draft">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="submitted">Soumis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Financial Information Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold flex items-center">
                    <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
                    Informations Financières
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="ae_amount"
                        className="text-sm flex items-center">
                        Montant AE (DZD)
                        <span
                          className="ml-1 text-xs text-primary"
                          title="Autorisation d'Engagement">
                          ℹ️
                        </span>
                      </Label>
                      <Input
                        id="ae_amount"
                        name="ae_amount"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="cp_amount"
                        className="text-sm flex items-center">
                        Montant CP (DZD)
                        <span
                          className="ml-1 text-xs text-primary"
                          title="Crédit de Paiement">
                          ℹ️
                        </span>
                      </Label>
                      <Input
                        id="cp_amount"
                        name="cp_amount"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-primary" />
                    Informations Supplémentaires
                  </h3>
                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm">
                      Description Détaillée
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Description détaillée de la demande de financement..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="comments"
                      className="text-sm">
                      Commentaires
                    </Label>
                    <Textarea
                      id="comments"
                      name="comments"
                      placeholder="Commentaires ou notes supplémentaires..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-6 pt-4 border-t">
              <Button
                variant="outline"
                type="button"
                onClick={() => setAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Enregistrer la Demande
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileEdit className="mr-2 h-5 w-5 text-primary" />
              Modifier la Demande
            </DialogTitle>
            <DialogDescription>Modifiez les informations de la demande sélectionnée.</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateRequest(new FormData(e.target));
              }}>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 py-4">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold flex items-center">
                      <Info className="h-4 w-4 mr-2 text-primary" />
                      Informations de Base
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="ministry_id"
                          className="text-sm">
                          Ministère
                        </Label>
                        <Select
                          name="ministry_id"
                          defaultValue={selectedRequest.ministry_id}
                          required>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner un ministère" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_MINISTRIES.map((ministry) => (
                              <SelectItem
                                key={ministry.id}
                                value={ministry.id}>
                                {ministry.name_fr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="fiscal_year_id"
                          className="text-sm">
                          Année Fiscale
                        </Label>
                        <Select
                          name="fiscal_year_id"
                          defaultValue={selectedRequest.fiscal_year_id}
                          required>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner une année" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_FISCAL_YEARS.map((year) => (
                              <SelectItem
                                key={year.id}
                                value={year.id}>
                                {year.year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <Label
                          htmlFor="title"
                          className="text-sm">
                          Titre de la Demande
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={selectedRequest.title}
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="ref"
                          className="text-sm">
                          Référence
                        </Label>
                        <Input
                          id="ref"
                          name="ref"
                          defaultValue={selectedRequest.ref}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground mt-1">La référence ne peut pas être modifiée</p>
                      </div>
                      <div>
                        <Label
                          htmlFor="date_submitted"
                          className="text-sm">
                          Date de Soumission
                        </Label>
                        <Input
                          id="date_submitted"
                          name="date_submitted"
                          type="date"
                          defaultValue={
                            selectedRequest.date_submitted ? new Date(selectedRequest.date_submitted).toISOString().split("T")[0] : undefined
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Classification Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-primary" />
                      Classification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label
                          htmlFor="type"
                          className="text-sm">
                          Type de Demande
                        </Label>
                        <Select
                          id="type"
                          name="type"
                          defaultValue={selectedRequest.type}
                          required>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                          <SelectContent>
                            {requestTypeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="priority"
                          className="text-sm">
                          Niveau de Priorité
                        </Label>
                        <Select
                          id="priority"
                          name="priority"
                          defaultValue={selectedRequest.priority}
                          required>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une priorité" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="status"
                          className="text-sm">
                          Statut Actuel
                        </Label>
                        <Select
                          id="status"
                          name="status"
                          defaultValue={selectedRequest.status}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="submitted">Soumis</SelectItem>
                            <SelectItem value="reviewed">En Révision</SelectItem>
                            <SelectItem value="approved">Approuvé</SelectItem>
                            <SelectItem value="rejected">Rejeté</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Financial Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold flex items-center">
                      <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
                      Informations Financières
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="ae_amount"
                          className="text-sm flex items-center">
                          Montant AE (DZD)
                          <span
                            className="ml-1 text-xs text-primary"
                            title="Autorisation d'Engagement">
                            ℹ️
                          </span>
                        </Label>
                        <Input
                          id="ae_amount"
                          name="ae_amount"
                          type="number"
                          min="0"
                          step="1000"
                          defaultValue={selectedRequest.ae_amount}
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="cp_amount"
                          className="text-sm flex items-center">
                          Montant CP (DZD)
                          <span
                            className="ml-1 text-xs text-primary"
                            title="Crédit de Paiement">
                            ℹ️
                          </span>
                        </Label>
                        <Input
                          id="cp_amount"
                          name="cp_amount"
                          type="number"
                          min="0"
                          step="1000"
                          defaultValue={selectedRequest.cp_amount}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold flex items-center">
                      <FileCheck className="h-4 w-4 mr-2 text-primary" />
                      Informations Supplémentaires
                    </h3>
                    <div>
                      <Label
                        htmlFor="description"
                        className="text-sm">
                        Description Détaillée
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Description détaillée de la demande de financement..."
                        defaultValue={selectedRequest.description}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="comments"
                        className="text-sm">
                        Commentaires
                      </Label>
                      <Textarea
                        id="comments"
                        name="comments"
                        placeholder="Commentaires ou notes supplémentaires..."
                        defaultValue={selectedRequest.comments}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Mettre à jour
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5 text-primary" />
              Détails de la Demande
            </DialogTitle>
            <DialogDescription>Consultez les informations détaillées de la demande sélectionnée.</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <>
              <div className="space-y-6 py-4 max-h-[65vh] overflow-y-auto pr-1">
                {/* Header with Title and Status */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{selectedRequest.title}</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <p className="text-sm text-muted-foreground -mt-4">{selectedRequest.ref}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50 py-3">
                      <CardTitle className="text-base flex items-center">
                        <Building className="mr-2 h-4 w-4 text-primary" />
                        Informations de Base
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ministère:</span>
                        <span className="font-medium">{selectedRequest.ministry?.name_fr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Année Fiscale:</span>
                        <span className="font-medium">{selectedRequest.fiscal_year?.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="font-medium">
                          {requestTypeOptions.find((o) => o.value === selectedRequest.type)?.label || selectedRequest.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Priorité:</span>
                        <span className="font-medium flex items-center">
                          <span
                            className={`h-2 w-2 rounded-full mr-2 ${
                              selectedRequest.priority === "high"
                                ? "bg-red-500"
                                : selectedRequest.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}></span>
                          {priorityOptions.find((o) => o.value === selectedRequest.priority)?.label || selectedRequest.priority}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Soumission:</span>
                        <span className="font-medium">
                          {selectedRequest.date_submitted ? format(new Date(selectedRequest.date_submitted), "dd/MM/yyyy") : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50 py-3">
                      <CardTitle className="text-base flex items-center">
                        <CircleDollarSign className="mr-2 h-4 w-4 text-primary" />
                        Informations Financières
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Montant AE:</span>
                          <div className="text-xl font-semibold text-primary">{formatCurrency(selectedRequest.ae_amount)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Montant CP:</span>
                          <div className="text-xl font-semibold">{formatCurrency(selectedRequest.cp_amount)}</div>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ratio CP/AE</span>
                            <span className="font-medium">
                              {selectedRequest.ae_amount ? Math.round((selectedRequest.cp_amount / selectedRequest.ae_amount) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${
                                  selectedRequest.ae_amount ? Math.round((selectedRequest.cp_amount / selectedRequest.ae_amount) * 100) : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 py-3">
                    <CardTitle className="text-base flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedRequest.description || "Aucune description fournie."}</p>
                  </CardContent>
                </Card>

                {/* Comments */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 py-3">
                    <CardTitle className="text-base flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      Commentaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedRequest.comments || "Aucun commentaire fourni."}</p>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="mt-4 pt-4 border-t">
                <div className="flex justify-between w-full">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleDeleteRequest();
                    }}
                    size="sm">
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="default"
                      onClick={() => {
                        setViewDialogOpen(false);
                        setEditDialogOpen(true);
                      }}
                      size="sm">
                      <FileEdit className="h-4 w-4 mr-2" /> Modifier
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setViewDialogOpen(false)}
                      size="sm">
                      Fermer
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default Requests;
