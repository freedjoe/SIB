import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar, Check, Clock, Edit, Plus, Trash2, FileText, BarChart, PlusCircle, Eye, Download, CreditCard } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReusableDataTable, type ActionHandlers } from "@/components/tables/ReusableDataTable";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { StatCard } from "@/components/ui-custom/StatCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Import types from database.types
import { Request, RequestWithRelations, RequestType, PriorityLevel, RecordStatus } from "@/types/database.types";

// Import the Supabase hooks for fetching real data
import { useRequests, useRequest, useRequestMutation, useMinistries, useFiscalYears } from "@/hooks/supabase";

// Import formatCurrency from utils
import { formatCurrency } from "@/lib/utils";

const Requests = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithRelations | null>(null);

  // Fetch requests from Supabase using our custom React Query hook
  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useRequests({
    filter: (query) => {
      let filteredQuery = query;

      if (selectedYear && selectedYear !== "all") {
        filteredQuery = filteredQuery.eq("fiscal_year.year", parseInt(selectedYear));
      }

      return filteredQuery;
    },
  });

  // Fetch ministries for the select dropdown
  const { data: ministries = [] } = useMinistries();

  // Fetch fiscal years for the select dropdown
  const { data: fiscalYears = [] } = useFiscalYears();

  // Use our mutation hook for data changes
  const requestMutation = useRequestMutation({
    onSuccess: () => {
      refetchRequests();
      toast({
        title: t("Requests.toast.success.title"),
        description: t("Requests.toast.success.description"),
      });
    },
    onError: (error) => {
      console.error("Error with request mutation:", error);
      toast({
        title: t("Requests.toast.error.title"),
        description: t("Requests.toast.error.description"),
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: RecordStatus) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "secondary" },
      submitted: { label: "Soumis", variant: "default" },
      reviewed: { label: "En révision", variant: "warning" },
      approved: { label: "Approuvé", variant: "success" },
      rejected: { label: "Rejeté", variant: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  // Options for request type and priority
  const requestTypeOptions = [
    { value: "New registration", label: "Nouvelle inscription" },
    { value: "Revaluation", label: "Réévaluation" },
    { value: "Payment credit", label: "Crédit de paiement" },
    { value: "Allocation", label: "Allocation" },
    { value: "Reallocation", label: "Réallocation" },
    { value: "Transfer", label: "Transfert" },
    { value: "Additional request", label: "Demande supplémentaire" },
    { value: "Previous commitments", label: "Engagements antérieurs" },
    { value: "Balance to regularize", label: "Solde à régulariser" },
    { value: "Other", label: "Autre" },
  ];

  const priorityOptions = [
    { value: "low", label: "Faible" },
    { value: "medium", label: "Moyenne" },
    { value: "high", label: "Haute" },
  ];

  // Table columns for ReusableDataTable
  const columns = [
    {
      accessorKey: "ministry.name_fr",
      header: ({ column }: any) => <span>Ministère</span>,
      cell: ({ row }: any) => <div className="font-medium">{row.original.ministry?.name_fr || "N/A"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: ({ column }: any) => <span>Type</span>,
      cell: ({ row }: any) => {
        const typeOption = requestTypeOptions.find((opt) => opt.value === row.getValue("type"));
        return <span className="capitalize">{typeOption ? typeOption.label : row.getValue("type") || "N/A"}</span>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "ae_amount",
      header: ({ column }: any) => <span>Montant AE</span>,
      cell: ({ row }: any) => formatCurrency(row.getValue("ae_amount")),
      filterFn: "includesString",
    },
    {
      accessorKey: "cp_amount",
      header: ({ column }: any) => <span>Montant CP</span>,
      cell: ({ row }: any) => formatCurrency(row.getValue("cp_amount")),
      filterFn: "includesString",
    },
    {
      accessorKey: "priority",
      header: ({ column }: any) => <span>Priorité</span>,
      cell: ({ row }: any) => <span className="capitalize">{row.getValue("priority") || "N/A"}</span>,
      filterFn: "includesString",
    },
    {
      accessorKey: "date_submitted",
      header: ({ column }: any) => <span>Date de Soumission</span>,
      cell: ({ row }: any) => (row.getValue("date_submitted") ? format(new Date(row.getValue("date_submitted")), "dd/MM/yyyy") : "N/A"),
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }: any) => <span>Statut</span>,
      cell: ({ row }: any) => getStatusBadge(row.getValue("status")),
      filterFn: "includesString",
    },
  ];

  // Action handlers for ReusableDataTable
  const actionHandlers: ActionHandlers<RequestWithRelations> = {
    onView: (request) => {
      setSelectedRequest(request);
      setViewDialogOpen(true);
    },
    onEdit: (request) => {
      setSelectedRequest(request);
      setEditDialogOpen(true);
    },
    onDelete: (request) => {
      if (window.confirm(t("Requests.confirmDelete"))) {
        handleDeleteRequest(request.id);
      }
    },
  };

  // Handle functions for CRUD operations
  const handleCreateRequest = async (data: Partial<Request>) => {
    try {
      await requestMutation.mutateAsync({
        type: "INSERT",
        data: {
          ...data,
          date_submitted: new Date().toISOString(),
        },
      });
      setAddDialogOpen(false);
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  const handleUpdateRequest = async (data: Partial<Request>) => {
    if (!selectedRequest?.id) return;

    try {
      await requestMutation.mutateAsync({
        type: "UPDATE",
        id: selectedRequest.id,
        data,
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await requestMutation.mutateAsync({
        type: "DELETE",
        id,
      });
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  // Filter logic for table data
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.ministry?.name_fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      req.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && req.status === "submitted") ||
      (activeTab === "reviewing" && req.status === "reviewed") ||
      (activeTab === "approved" && req.status === "approved") ||
      (activeTab === "rejected" && req.status === "rejected");

    return matchesSearch && matchesTab;
  });

  // Calculate total amounts
  const totalAEAmount = filteredRequests.reduce((sum, req) => sum + (req.ae_amount || 0), 0);
  const totalCPAmount = filteredRequests.reduce((sum, req) => sum + (req.cp_amount || 0), 0);
  const pendingRequestsCount = filteredRequests.filter((req) => req.status === "submitted" || req.status === "reviewed").length;
  const approvalRate = requests.length > 0 ? Math.round((requests.filter((req) => req.status === "approved").length / requests.length) * 100) : 0;

  if (isLoadingRequests) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des demandes ministérielles...</span>
      </div>
    );
  }

  return (
    <Dashboard>
      <DashboardHeader title="Demandes des Ministères" description="Gestion des demandes de financement des ministères">
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

      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title="Total AE Demandées"
            value={formatCurrency(totalAEAmount)}
            description="Montant total AE demandé"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="Total CP Demandées"
            value={formatCurrency(totalCPAmount)}
            description="Montant total CP demandé"
            icon={<CreditCard className="h-4 w-4" />}
          />
          <StatCard
            title="Demandes en Cours"
            value={pendingRequestsCount.toString()}
            description="En attente de révision"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard title="Taux d'Approbation" value={`${approvalRate}%`} description="Demandes approuvées" icon={<Check className="h-4 w-4" />} />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Demandes</CardTitle>
                <CardDescription>Suivi des demandes de financement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <Input
                  placeholder="Rechercher des demandes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-[250px]"
                />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Année fiscale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {fiscalYears.map((year) => (
                      <SelectItem key={year.id} value={year.year.toString()}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="pending">Soumises</TabsTrigger>
                  <TabsTrigger value="reviewing">En révision</TabsTrigger>
                  <TabsTrigger value="approved">Approuvées</TabsTrigger>
                  <TabsTrigger value="rejected">Rejetées</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {filteredRequests.length > 0 ? (
              <ReusableDataTable
                columns={columns}
                data={filteredRequests}
                actionHandlers={actionHandlers}
                filterColumn="ministry.name_fr"
                tableName="Demandes Ministérielles"
              />
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Aucune demande trouvée pour les critères sélectionnés.
                <div className="mt-4">
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle demande
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardSection>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Demande</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Générales</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ministère</Label>
                    <div className="mt-1 font-medium">{selectedRequest.ministry?.name_fr || "N/A"}</div>
                  </div>
                  <div>
                    <Label>Référence</Label>
                    <div className="mt-1 font-medium">{selectedRequest.ref || "N/A"}</div>
                  </div>
                  <div>
                    <Label>Titre</Label>
                    <div className="mt-1 font-medium">{selectedRequest.title || "N/A"}</div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="mt-1 font-medium">
                      {requestTypeOptions.find((opt) => opt.value === selectedRequest.type)?.label || selectedRequest.type || "N/A"}
                    </div>
                  </div>
                  <div>
                    <Label>Année fiscale</Label>
                    <div className="mt-1 font-medium">{selectedRequest.fiscal_year?.year || "N/A"}</div>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Montants</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Montant AE</Label>
                    <div className="mt-1 font-medium">{formatCurrency(selectedRequest.ae_amount)}</div>
                  </div>
                  <div>
                    <Label>Montant CP</Label>
                    <div className="mt-1 font-medium">{formatCurrency(selectedRequest.cp_amount)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Détails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <div className="mt-1 whitespace-pre-wrap">{selectedRequest.description || "N/A"}</div>
                  </div>
                  <div>
                    <Label>Commentaires</Label>
                    <div className="mt-1 whitespace-pre-wrap">{selectedRequest.comments || "N/A"}</div>
                  </div>
                  <div>
                    <Label>Date de soumission</Label>
                    <div className="mt-1">
                      {selectedRequest.date_submitted ? format(new Date(selectedRequest.date_submitted), "dd/MM/yyyy") : "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Demande</DialogTitle>
            <DialogDescription>Remplissez les champs pour ajouter une nouvelle demande.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const ministryId = formData.get("ministry_id") as string;
              const fiscalYearId = formData.get("fiscal_year_id") as string;
              const title = formData.get("title") as string;
              const ref = formData.get("ref") as string;
              const type = formData.get("type") as RequestType;
              const priority = formData.get("priority") as PriorityLevel;
              const aeAmount = parseFloat(formData.get("ae_amount") as string);
              const cpAmount = parseFloat(formData.get("cp_amount") as string);
              const status = formData.get("status") as RecordStatus;
              const description = formData.get("description") as string;
              const comments = formData.get("comments") as string;

              handleCreateRequest({
                ministry_id: ministryId,
                fiscal_year_id: fiscalYearId,
                title,
                ref,
                type,
                priority,
                ae_amount: aeAmount,
                cp_amount: cpAmount,
                status,
                description,
                comments,
              });
            }}
          >
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="ministry_id">Ministère</Label>
                <Select name="ministry_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un ministère" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministries.map((ministry) => (
                      <SelectItem key={ministry.id} value={ministry.id}>
                        {ministry.name_fr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fiscal_year_id">Année fiscale</Label>
                <Select name="fiscal_year_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une année" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" placeholder="Titre de la demande" />
              </div>
              <div>
                <Label htmlFor="ref">Référence</Label>
                <Input id="ref" name="ref" placeholder="Référence de la demande" />
              </div>
              <div>
                <Label htmlFor="type">Type de demande</Label>
                <Select name="type">
                  <SelectTrigger>
                    <SelectValue placeholder="Type de demande" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ae_amount">Montant AE (Autorisation d'Engagement)</Label>
                <Input id="ae_amount" name="ae_amount" type="number" placeholder="Montant AE" />
              </div>
              <div>
                <Label htmlFor="cp_amount">Montant CP (Crédit de Paiement)</Label>
                <Input id="cp_amount" name="cp_amount" type="number" placeholder="Montant CP" />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select name="status" defaultValue="draft">
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="submitted">Soumis</SelectItem>
                    <SelectItem value="reviewed">Révisé</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Description détaillée de la demande" className="min-h-[100px]" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="comments">Commentaires</Label>
                <Textarea id="comments" name="comments" placeholder="Commentaires additionnels" className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la Demande</DialogTitle>
            <DialogDescription>Modifiez les champs de la demande.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const ministryId = formData.get("ministry_id") as string;
                const fiscalYearId = formData.get("fiscal_year_id") as string;
                const title = formData.get("title") as string;
                const ref = formData.get("ref") as string;
                const type = formData.get("type") as RequestType;
                const priority = formData.get("priority") as PriorityLevel;
                const aeAmount = parseFloat(formData.get("ae_amount") as string);
                const cpAmount = parseFloat(formData.get("cp_amount") as string);
                const status = formData.get("status") as RecordStatus;
                const description = formData.get("description") as string;
                const comments = formData.get("comments") as string;

                handleUpdateRequest({
                  ministry_id: ministryId,
                  fiscal_year_id: fiscalYearId,
                  title,
                  ref,
                  type,
                  priority,
                  ae_amount: aeAmount,
                  cp_amount: cpAmount,
                  status,
                  description,
                  comments,
                });
              }}
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ministry_id">Ministère</Label>
                  <Select name="ministry_id" defaultValue={selectedRequest.ministry_id || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un ministère" />
                    </SelectTrigger>
                    <SelectContent>
                      {ministries.map((ministry) => (
                        <SelectItem key={ministry.id} value={ministry.id}>
                          {ministry.name_fr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fiscal_year_id">Année fiscale</Label>
                  <Select name="fiscal_year_id" defaultValue={selectedRequest.fiscal_year_id || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {fiscalYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" name="title" placeholder="Titre de la demande" defaultValue={selectedRequest.title || ""} />
                </div>
                <div>
                  <Label htmlFor="ref">Référence</Label>
                  <Input id="ref" name="ref" placeholder="Référence de la demande" defaultValue={selectedRequest.ref || ""} />
                </div>
                <div>
                  <Label htmlFor="type">Type de demande</Label>
                  <Select name="type" defaultValue={selectedRequest.type || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de demande" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select name="priority" defaultValue={selectedRequest.priority || "medium"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ae_amount">Montant AE (Autorisation d'Engagement)</Label>
                  <Input id="ae_amount" name="ae_amount" type="number" placeholder="Montant AE" defaultValue={selectedRequest.ae_amount.toString()} />
                </div>
                <div>
                  <Label htmlFor="cp_amount">Montant CP (Crédit de Paiement)</Label>
                  <Input id="cp_amount" name="cp_amount" type="number" placeholder="Montant CP" defaultValue={selectedRequest.cp_amount.toString()} />
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select name="status" defaultValue={selectedRequest.status || "draft"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="submitted">Soumis</SelectItem>
                      <SelectItem value="reviewed">Révisé</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Description détaillée de la demande"
                    className="min-h-[100px]"
                    defaultValue={selectedRequest.description || ""}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="comments">Commentaires</Label>
                  <Textarea
                    id="comments"
                    name="comments"
                    placeholder="Commentaires additionnels"
                    className="min-h-[100px]"
                    defaultValue={selectedRequest.comments || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default Requests;
