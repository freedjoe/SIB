import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar, Check, Clock, Edit, Plus, Trash2, FileText, BarChart, PlusCircle, Eye } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReusableDataTable, type ActionHandlers } from "@/components/tables/ReusableDataTable";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { useEffect } from "react";
import { StatCard } from "@/components/ui-custom/StatCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type MinistryRequest = {
  id: string;
  ministry_id: string;
  ministry_name: string;
  fiscal_year: number;
  request_type: string;
  amount: number;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  priority: string;
  submission_date: string;
  decision_date: string | null;
  description: string;
  justification: string;
  attachments: string[];
};

const mockRequests: MinistryRequest[] = [
  {
    id: "req1",
    ministry_id: "min1",
    ministry_name: "Ministère de l'Éducation",
    request_type: "budget",
    amount: 150000000,
    fiscal_year: 2024,
    status: "under_review",
    priority: "high",
    submission_date: "2024-01-15",
    decision_date: null,
    description: "Augmentation du budget pour la construction d'écoles",
    justification: "Croissance démographique dans les zones rurales",
    attachments: ["rapport_demographique.pdf", "plan_construction.pdf"],
  },
  {
    id: "req2",
    ministry_id: "min2",
    ministry_name: "Ministère de la Santé",
    request_type: "allocation",
    amount: 80000000,
    fiscal_year: 2024,
    status: "approved",
    priority: "high",
    submission_date: "2024-01-10",
    decision_date: "2024-01-20",
    description: "Allocation d'urgence pour l'achat d'équipements médicaux",
    justification: "Renouvellement des équipements obsolètes",
    attachments: ["liste_equipements.pdf"],
  },
];

const MinistryRequests = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MinistryRequest | null>(null);
  const [loading, setLoading] = useState(false); // Add if not already present

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: MinistryRequest["status"]) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "secondary" },
      submitted: { label: "Soumis", variant: "default" },
      under_review: { label: "En révision", variant: "warning" },
      approved: { label: "Approuvé", variant: "success" },
      rejected: { label: "Rejeté", variant: "destructive" },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  // Table columns for ReusableDataTable
  // Table columns for ReusableDataTable
  // Options for request type and priority
  const requestTypeOptions = [
    { value: "New registration", label: "Nouvelle inscription" },
    { value: "Revaluation", label: "Réévaluation" },
    { value: "Payment credit", label: "Crédit de paiement" },
  ];
  const priorityOptions = [
    { value: "low", label: "Faible" },
    { value: "medium", label: "Moyenne" },
    { value: "high", label: "Haute" },
  ];

  const columns = [
    {
      accessorKey: "ministry_name",
      header: ({ column }: any) => <span>Ministère</span>,
      cell: ({ row }: any) => <div className="font-medium">{row.getValue("ministry_name")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "request_type",
      header: ({ column }: any) => <span>Type</span>,
      cell: ({ row }: any) => {
        const typeOption = requestTypeOptions.find((opt) => opt.value === row.getValue("request_type"));
        return <span className="capitalize">{typeOption ? typeOption.label : row.getValue("request_type")}</span>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "amount",
      header: ({ column }: any) => <span>Montant</span>,
      cell: ({ row }: any) => formatCurrency(row.getValue("amount")),
      filterFn: "includesString",
    },
    {
      accessorKey: "priority",
      header: ({ column }: any) => <span>Priorité</span>,
      cell: ({ row }: any) => <span className="capitalize">{row.getValue("priority")}</span>,
      filterFn: "includesString",
    },
    {
      accessorKey: "submission_date",
      header: ({ column }: any) => <span>Date de Soumission</span>,
      cell: ({ row }: any) => format(new Date(row.getValue("submission_date")), "dd/MM/yyyy"),
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
  const actionHandlers: ActionHandlers<MinistryRequest> = {
    onView: (request) => {
      setSelectedRequest(request);
      setViewDialogOpen(true);
    },
    onEdit: (request) => {
      setSelectedRequest(request);
      setEditDialogOpen(true);
    },
    onDelete: (request) => {
      // You can add a confirmation dialog here
      // For now, just log
      console.log("Delete request", request);
    },
  };

  // Filter logic for table data
  const filteredRequests = mockRequests.filter((req) => {
    const matchesSearch =
      req.ministry_name.toLowerCase().includes(searchTerm.toLowerCase()) || req.request_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear ? req.fiscal_year.toString() === selectedYear : true;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && req.status === "under_review") ||
      (activeTab === "approved" && req.status === "approved") ||
      (activeTab === "rejected" && req.status === "rejected");
    return matchesSearch && matchesYear && matchesTab;
  });

  if (loading) {
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
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle Demande
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title="Total des Demandes"
            value={formatCurrency(230000000)}
            description="Montant total demandé"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard title="Demandes en Cours" value="12" description="En attente de révision" icon={<Clock className="h-4 w-4" />} />
          <StatCard title="Taux d'Approbation" value="75%" description="Demandes approuvées" icon={<Check className="h-4 w-4" />} />
          <StatCard title="Temps Moyen de Traitement" value="8 jours" description="Délai de réponse moyen" icon={<Calendar className="h-4 w-4" />} />
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
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Rechercher des demandes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Année fiscale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="pending">En cours</TabsTrigger>
                  <TabsTrigger value="approved">Approuvées</TabsTrigger>
                  <TabsTrigger value="rejected">Rejetées</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ReusableDataTable
              columns={columns}
              data={filteredRequests}
              actionHandlers={actionHandlers}
              filterColumn="ministry_name"
              tableName="Demandes Ministérielles"
            />
          </CardContent>
        </Card>
      </DashboardSection>
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Demande</DialogTitle>
            <DialogDescription>Informations complètes sur la demande de financement.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ministère</Label>
                  <p className="text-sm">{selectedRequest.ministry_name}</p>
                </div>
                <div>
                  <Label>Type de demande</Label>
                  <p className="text-sm capitalize">{selectedRequest.request_type.replace("_", " ")}</p>
                </div>
                <div>
                  <Label>Montant</Label>
                  <p className="text-sm">{formatCurrency(selectedRequest.amount)}</p>
                </div>
                <div>
                  <Label>Priorité</Label>
                  <p className="text-sm capitalize">{selectedRequest.priority}</p>
                </div>
                <div>
                  <Label>Date de soumission</Label>
                  <p className="text-sm">{format(new Date(selectedRequest.submission_date), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <p className="text-sm">{getStatusBadge(selectedRequest.status)}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>
              <div>
                <Label>Justification</Label>
                <p className="text-sm">{selectedRequest.justification}</p>
              </div>
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div>
                  <Label>Pièces jointes</Label>
                  <div className="flex gap-2">
                    {selectedRequest.attachments.map((attachment, index) => (
                      <Button key={index} variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        {attachment}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
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
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Ministère</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un ministère" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="min1">Ministère de l'Éducation</SelectItem>
                    <SelectItem value="min2">Ministère de la Santé</SelectItem>
                    <SelectItem value="min3">Ministère des Finances</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Année fiscale</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Titre</Label>
                <Input placeholder="Titre de la demande" />
              </div>
              <div>
                <Label>Référence</Label>
                <Input placeholder="Référence de la demande" />
              </div>
              <div>
                <Label>Type de demande</Label>
                <Select>
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
                <Label>Priorité</Label>
                <Select>
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
                <Label>Date de soumission</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Montant AE (Autorisation d'Engagement)</Label>
                <Input type="number" placeholder="Montant AE" />
              </div>
              <div>
                <Label>Montant CP (Crédit de Paiement)</Label>
                <Input type="number" placeholder="Montant CP" />
              </div>
              <div>
                <Label>Statut</Label>
                <Select>
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
                <Label>Description</Label>
                <Textarea placeholder="Description détaillée de la demande" className="min-h-[100px]" />
              </div>
              <div className="col-span-2">
                <Label>Commentaires</Label>
                <Textarea placeholder="Commentaires additionnels" className="min-h-[100px]" />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button type="submit">Ajouter</Button>
          </DialogFooter>
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
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Ministère</Label>
                  <Select defaultValue={selectedRequest.ministry_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un ministère" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="min1">Ministère de l'Éducation</SelectItem>
                      <SelectItem value="min2">Ministère de la Santé</SelectItem>
                      <SelectItem value="min3">Ministère des Finances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Année fiscale</Label>
                  <Select defaultValue={selectedRequest.fiscal_year ? String(selectedRequest.fiscal_year) : undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Titre</Label>
                  <Input placeholder="Titre de la demande" defaultValue={selectedRequest.title || ""} />
                </div>
                <div>
                  <Label>Référence</Label>
                  <Input defaultValue={selectedRequest.ministry_id || ""} placeholder="Référence de la demande" />
                </div>
                <div>
                  <Label>Type de demande</Label>
                  <Select defaultValue={selectedRequest.request_type}>
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
                  <Label>Priorité</Label>
                  <Select defaultValue={selectedRequest.priority}>
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
                  <Label>Date de soumission</Label>
                  <Input type="date" defaultValue={selectedRequest.submission_date || ""} />
                </div>
                <div>
                  <Label>Montant</Label>
                  <Input type="number" defaultValue={selectedRequest.amount ? String(selectedRequest.amount) : ""} placeholder="Montant" />
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select defaultValue={selectedRequest.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="submitted">Soumis</SelectItem>
                      <SelectItem value="under_review">En révision</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    defaultValue={selectedRequest.description || ""}
                    placeholder="Description détaillée de la demande"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Justification</Label>
                  <Textarea defaultValue={selectedRequest.justification || ""} placeholder="Justification de la demande" className="min-h-[100px]" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
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
                    <div className="mt-1 font-medium">{selectedRequest.ministry_name}</div>
                  </div>
                  <div>
                    <Label>Référence</Label>
                    <div className="mt-1 font-medium">{selectedRequest.ref}</div>
                  </div>
                  <div>
                    <Label>Titre</Label>
                    <div className="mt-1 font-medium">{selectedRequest.title}</div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="mt-1 font-medium">{selectedRequest.type}</div>
                  </div>
                  <div>
                    <Label>Année fiscale</Label>
                    <div className="mt-1 font-medium">{selectedRequest.fiscal_year_id}</div>
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
                    <div className="mt-1 whitespace-pre-wrap">{selectedRequest.description}</div>
                  </div>
                  <div>
                    <Label>Commentaires</Label>
                    <div className="mt-1 whitespace-pre-wrap">{selectedRequest.comments}</div>
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
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la Demande</DialogTitle>
            <DialogDescription>Modifiez les champs de la demande.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Ministère</Label>
                  <Select defaultValue={selectedRequest.ministry_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un ministère" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="min1">Ministère de l'Éducation</SelectItem>
                      <SelectItem value="min2">Ministère de la Santé</SelectItem>
                      <SelectItem value="min3">Ministère des Finances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Année fiscale</Label>
                  <Select defaultValue={selectedRequest.fiscal_year_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Titre</Label>
                  <Input defaultValue={selectedRequest.title} placeholder="Titre de la demande" />
                </div>
                <div>
                  <Label>Référence</Label>
                  <Input defaultValue={selectedRequest.ref} placeholder="Référence de la demande" />
                </div>
                <div>
                  <Label>Type de demande</Label>
                  <Select defaultValue={selectedRequest.request_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de demande" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New registration">Nouvelle inscription</SelectItem>
                      <SelectItem value="Revaluation">Réévaluation</SelectItem>
                      <SelectItem value="Payment credit">Crédit de paiement</SelectItem>
                      <SelectItem value="Allocation">Allocation</SelectItem>
                      <SelectItem value="Reallocation">Réallocation</SelectItem>
                      <SelectItem value="Transfer">Transfert</SelectItem>
                      <SelectItem value="Additional request">Demande supplémentaire</SelectItem>
                      <SelectItem value="Previous commitments">Engagements antérieurs</SelectItem>
                      <SelectItem value="Balance to regularize">Solde à régulariser</SelectItem>
                      <SelectItem value="Other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date de soumission</Label>
                  <Input type="date" defaultValue={selectedRequest.date_submitted} />
                </div>
                <div>
                  <Label>Montant AE (Autorisation d'Engagement)</Label>
                  <Input type="number" defaultValue={selectedRequest.ae_amount} placeholder="Montant AE" />
                </div>
                <div>
                  <Label>Montant CP (Crédit de Paiement)</Label>
                  <Input type="number" defaultValue={selectedRequest.cp_amount} placeholder="Montant CP" />
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select defaultValue={selectedRequest.status}>
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
              </div>
              <div>
                <Label>Description</Label>
                <Input defaultValue={selectedRequest.description} placeholder="Description détaillée de la demande" />
              </div>
            </form>
          )}
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default MinistryRequests;
