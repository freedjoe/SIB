import React, { useState } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit, Trash2, Search, Eye, Check, X, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReevaluationDialog } from "@/components/dialogs/ReevaluationDialog";
import { useEffect } from "react";
import { ReevaluationsTable } from "@/components/tables/ReevaluationsTable";
import { getAllEngagementReevaluations, EngagementReevaluationWithRelations } from "@/services/engagementReevaluationsService";
import { EngagementsTable } from "@/components/tables/EngagementsTable";
import { useEngagements, useOperations, useMinistries, useEngagementMutation } from "@/hooks/supabase";
import { Engagement, Operation, Ministry } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";

export default function Engagements() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("liste");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isReevaluationDialogOpen, setIsReevaluationDialogOpen] = useState(false);
  const [selectedEngagementForReevaluation, setSelectedEngagementForReevaluation] = useState<Engagement | null>(null);
  const [currentEngagement, setCurrentEngagement] = useState<Engagement | null>(null);
  const [newEngagement, setNewEngagement] = useState<Partial<Engagement>>({
    operation_id: "",
    reference: "",
    date: new Date().toISOString().split("T")[0],
    vendor: "",
    amount: 0,
    status: "draft",
    code: "",
    inscription_date: new Date().toISOString().split("T")[0],
    year: new Date().getFullYear(),
    type: "",
    description: "",
    history: "",
  });
  const [approvalAmount, setApprovalAmount] = useState<number | "">(0);
  const [reevaluations, setReevaluations] = useState<EngagementReevaluationWithRelations[]>([]);
  const [reevaluationSearchTerm, setReevaluationSearchTerm] = useState("");

  // Mock data for demonstration purposes
  const mockEngagements: Engagement[] = [
    {
      id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      operation_id: "op-001",
      reference: "REF-2025-0001",
      code: "ENG-2025-001",
      date: "2025-05-01",
      vendor: "Entreprise Nationale de Travaux Publics (ENTP)",
      amount: 2500000,
      status: "approved",
      inscription_date: "2025-04-15",
      year: 2025,
      type: "legal",
      description: "Construction d'une nouvelle école primaire dans la commune de Bab Ezzouar",
      history: JSON.stringify([
        { date: "2025-04-15", status: "draft", user: "Ahmed Benali" },
        { date: "2025-04-18", status: "submitted", user: "Ahmed Benali" },
        { date: "2025-04-25", status: "reviewed", user: "Mohammed Hassani" },
        { date: "2025-05-01", status: "approved", user: "Karim Boudiaf" },
      ]),
    },
    {
      id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
      operation_id: "op-002",
      reference: "REF-2025-0002",
      code: "ENG-2025-002",
      date: "2025-04-20",
      vendor: "SONELGAZ - Société Nationale d'Électricité et du Gaz",
      amount: 1800000,
      status: "liquidated",
      inscription_date: "2025-03-25",
      year: 2025,
      type: "multiannual",
      description: "Équipement électrique pour le nouveau campus universitaire d'Alger",
      history: JSON.stringify([
        { date: "2025-03-25", status: "draft", user: "Fatima Zahra" },
        { date: "2025-04-01", status: "submitted", user: "Fatima Zahra" },
        { date: "2025-04-10", status: "reviewed", user: "Mohammed Hassani" },
        { date: "2025-04-15", status: "approved", user: "Karim Boudiaf" },
        { date: "2025-04-18", status: "validated", user: "Leila Hamdi" },
        { date: "2025-04-20", status: "liquidated", user: "Sofiane Merabet" },
      ]),
    },
    {
      id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
      operation_id: "op-003",
      reference: "REF-2025-0003",
      code: "ENG-2025-003",
      date: "2025-05-03",
      vendor: "Bureau d'Études Techniques et Économiques (BETE)",
      amount: 750000,
      status: "submitted",
      inscription_date: "2025-04-30",
      year: 2025,
      type: "technical",
      description: "Étude statistique sur le développement économique des wilayas du sud",
      history: JSON.stringify([
        { date: "2025-04-30", status: "draft", user: "Youcef Kadri" },
        { date: "2025-05-03", status: "submitted", user: "Youcef Kadri" },
      ]),
    },
    {
      id: "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
      operation_id: "op-004",
      reference: "REF-2025-0004",
      code: "ENG-2025-004",
      date: "2025-04-25",
      vendor: "SONATRACH",
      amount: 4250000,
      status: "rejected",
      inscription_date: "2025-04-10",
      year: 2025,
      type: "provisional",
      description: "Projet d'extension des capacités de stockage à Hassi Messaoud",
      history: JSON.stringify([
        { date: "2025-04-10", status: "draft", user: "Nassima Belhadj" },
        { date: "2025-04-15", status: "submitted", user: "Nassima Belhadj" },
        { date: "2025-04-20", status: "reviewed", user: "Mohammed Hassani" },
        { date: "2025-04-25", status: "rejected", user: "Karim Boudiaf", reason: "Budget dépassant les limites allouées pour ce trimestre" },
      ]),
    },
    {
      id: "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
      operation_id: "op-005",
      reference: "REF-2025-0005",
      code: "ENG-2025-005",
      date: "2025-05-04",
      vendor: "Fournisseur Algérien de Matériel Informatique (FAMI)",
      amount: 3100000,
      status: "validated",
      inscription_date: "2025-04-05",
      year: 2025,
      type: "carryover",
      description: "Fourniture d'équipements informatiques pour les centres de formation",
      history: JSON.stringify([
        { date: "2025-04-05", status: "draft", user: "Mohamed Djamel" },
        { date: "2025-04-10", status: "submitted", user: "Mohamed Djamel" },
        { date: "2025-04-15", status: "reviewed", user: "Salima Brahimi" },
        { date: "2025-04-25", status: "approved", user: "Hassan Khalifa" },
        { date: "2025-05-04", status: "validated", user: "General Ali Boumediene" },
      ]),
    },
    {
      id: "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
      operation_id: "op-006",
      reference: "REF-2025-0006",
      code: "ENG-2025-006",
      date: "2025-05-06",
      vendor: "Bureau d'Études et de Conseil en Informatique (BECI)",
      amount: 850000,
      status: "draft",
      inscription_date: "2025-05-06",
      year: 2025,
      type: "reallocation",
      description: "Mise à niveau du système informatique pour la déclaration fiscale en ligne",
      history: JSON.stringify([{ date: "2025-05-06", status: "draft", user: "Rachid Benmoussa" }]),
    },
  ];

  // Always use mock data for demonstration purposes
  const displayEngagements = mockEngagements;

  // Get engagements data using hook for consistency
  const {
    data: engagementsData = mockEngagements,
    isLoading: isLoadingEngagements,
    refetch: refetchEngagements,
  } = useEngagements({
    staleTime: 1000 * 60 * 10, // 10 minutes - engagements change moderately often
    // Override with mock data for demonstration
    initialData: mockEngagements,
  });

  // Filter engagements based on search term
  const filteredEngagements = displayEngagements.filter((engagement) => {
    return (
      engagement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const pendingApprovals = displayEngagements.filter((engagement) => engagement.status === "submitted" || engagement.status === "reviewed");

  const { data: operationsData = [] as Operation[], isLoading: isLoadingOperations } = useOperations({
    staleTime: 1000 * 60 * 30, // 30 minutes - operations change less frequently
  });

  const { data: ministriesData = [] as Ministry[], isLoading: isLoadingMinistries } = useMinistries({
    staleTime: 1000 * 60 * 60, // 60 minutes - ministries rarely change
  });

  // Use mutation hook for engagement operations
  const engagementMutation = useEngagementMutation({
    onSuccess: () => {
      refetchEngagements();
      toast({
        title: t("common.success"),
        description: t("engagements.operationSuccess"),
      });
    },
  });

  const filteredReevaluations = reevaluations.filter(
    (reevaluation) =>
      reevaluation.engagement?.reference?.toLowerCase().includes(reevaluationSearchTerm.toLowerCase()) ||
      reevaluation.engagement?.operation?.name?.toLowerCase().includes(reevaluationSearchTerm.toLowerCase())
  );

  const handleOpenAddDialog = () => {
    setNewEngagement({
      operation_id: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
      vendor: "",
      amount: 0,
      status: "draft",
      code: "",
      inscription_date: new Date().toISOString().split("T")[0],
      year: new Date().getFullYear(),
      type: "",
      description: "",
      history: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setNewEngagement({
      operation_id: engagement.operation_id,
      reference: engagement.reference,
      date: engagement.date,
      vendor: engagement.vendor,
      amount: engagement.amount,
      status: engagement.status,
      code: engagement.code,
      inscription_date: engagement.inscription_date,
      year: engagement.year,
      type: engagement.type,
      description: engagement.description,
      history: engagement.history,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenViewDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setIsViewDialogOpen(true);
  };

  const handleOpenApproveDialog = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setApprovalAmount(engagement.amount);
    setIsApproveDialogOpen(true);
  };

  const handleOpenReevaluationDialog = (engagement: Engagement) => {
    setSelectedEngagementForReevaluation(engagement);
    setIsReevaluationDialogOpen(true);
  };

  const handleAddEngagement = () => {
    if (!newEngagement.operation_id || !newEngagement.vendor || !newEngagement.code) {
      toast({
        title: t("common.error"),
        description: t("engagements.fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    // Create new engagement with data from state
    const engagement: Partial<Engagement> = {
      operation_id: newEngagement.operation_id!,
      reference: newEngagement.reference!,
      date: newEngagement.date!,
      vendor: newEngagement.vendor!,
      amount: Number(newEngagement.amount) || 0,
      status: newEngagement.status!,
      code: newEngagement.code!,
      inscription_date: newEngagement.inscription_date!,
      year: newEngagement.year!,
      type: newEngagement.type!,
      description: newEngagement.description!,
      history: newEngagement.history!,
    };

    // Use our mutation hook to add the engagement
    engagementMutation.mutateAsync({
      type: "INSERT",
      data: engagement,
    });

    setIsAddDialogOpen(false);
  };

  const handleEditEngagement = () => {
    if (!currentEngagement) return;

    if (!newEngagement.operation_id || !newEngagement.vendor || !newEngagement.code) {
      toast({
        title: t("common.error"),
        description: t("engagements.fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    // Use our mutation hook to update the engagement
    engagementMutation.mutateAsync({
      type: "UPDATE",
      id: currentEngagement.id,
      data: {
        operation_id: newEngagement.operation_id!,
        reference: newEngagement.reference!,
        date: newEngagement.date!,
        vendor: newEngagement.vendor!,
        amount: Number(newEngagement.amount) || 0,
        status: newEngagement.status!,
        code: newEngagement.code!,
        inscription_date: newEngagement.inscription_date!,
        year: newEngagement.year!,
        type: newEngagement.type!,
        description: newEngagement.description!,
        history: newEngagement.history!,
      },
    });

    setIsEditDialogOpen(false);
  };

  const handleDeleteEngagement = () => {
    if (!currentEngagement) return;

    // Use our mutation hook to delete the engagement
    engagementMutation.mutateAsync({
      type: "DELETE",
      id: currentEngagement.id,
    });

    setIsDeleteDialogOpen(false);
  };

  const handleApproveEngagement = () => {
    if (!currentEngagement) return;

    const amount = typeof approvalAmount === "string" ? parseFloat(approvalAmount) : approvalAmount;

    if (isNaN(Number(amount))) {
      toast({
        title: t("common.error"),
        description: t("engagements.enterValidAmount"),
        variant: "destructive",
      });
      return;
    }

    // Use our mutation hook to update the engagement
    engagementMutation.mutateAsync({
      type: "UPDATE",
      id: currentEngagement.id,
      data: {
        amount: Number(amount),
        status: "approved" as const,
      },
    });

    setIsApproveDialogOpen(false);
  };

  const handleRejectEngagement = (engagement: Engagement) => {
    // Use our mutation hook to reject the engagement
    engagementMutation.mutateAsync({
      type: "UPDATE",
      id: engagement.id,
      data: {
        amount: 0,
        status: "rejected" as const,
      },
    });

    toast({
      title: t("engagements.rejected"),
      description: t("engagements.rejectedDescription", { operation: engagement.operation_id }),
    });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">{t("engagements.draft")}</Badge>;
      case "submitted":
        return <Badge variant="warning">{t("engagements.submitted")}</Badge>;
      case "reviewed":
        return <Badge variant="secondary">{t("engagements.reviewed")}</Badge>;
      case "approved":
        return <Badge className="bg-green-500">{t("engagements.approved")}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{t("engagements.rejected")}</Badge>;
      case "proposed":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-500">
            {t("engagements.proposed")}
          </Badge>
        );
      case "validated":
        return <Badge className="bg-blue-500">{t("engagements.validated")}</Badge>;
      case "liquidated":
        return <Badge className="bg-purple-500">{t("engagements.liquidated")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Haute":
        return <Badge className="bg-red-500">{t("engagements.high")}</Badge>;
      case "Moyenne":
        return <Badge className="bg-yellow-500">{t("engagements.medium")}</Badge>;
      case "Basse":
        return <Badge className="bg-blue-500">{t("engagements.low")}</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const handleReevaluationSuccess = () => {
    setIsReevaluationDialogOpen(false);
    setSelectedEngagementForReevaluation(null);
    toast({
      title: t("engagements.reevaluationSuccess"),
      description: t("engagements.reevaluationSubmitted"),
    });

    // Refresh the reevaluations list
    getAllEngagementReevaluations()
      .then((res) => {
        setReevaluations(res);
      })
      .catch((error) => {
        console.error("Error fetching reevaluations:", error);
      });
  };

  if (isLoadingEngagements || isLoadingOperations || isLoadingMinistries) {
    return <PageLoadingSpinner message={t("engagements.loading")} />;
  }

  // Extract operation names from operationsData
  const operations = operationsData.map((operation) => operation.name);

  // Format ministries data to ensure unique IDs for React keys
  const ministriesList = ministriesData.map((ministry) => ({
    id: ministry.id,
    name: ministry.name_fr,
  }));

  // Mock beneficiaries until we have a proper API endpoint
  const beneficiaires = [
    "Entreprise Nationale de Travaux Publics (ENTP)",
    "SONATRACH",
    "SONELGAZ - Société Nationale d'Électricité et du Gaz",
    "Fournisseur Algérien de Matériel Informatique (FAMI)",
    "Bureau d'Études Techniques et Économiques (BETE)",
    "Bureau d'Études et de Conseil en Informatique (BECI)",
  ];

  return (
    <Dashboard className="p-6">
      <DashboardHeader
        title={t("app.navigation.engagements")}
        description={t("engagements.description")}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-4 h-14">
          <TabsTrigger
            value="liste"
            className="py-3 text-base font-medium">
            {t("engagements.list")}
          </TabsTrigger>
          <TabsTrigger
            value="approbations"
            className="py-3 text-base font-medium">
            {t("engagements.pendingApprovals")}
            {pendingApprovals.length > 0 && (
              <Badge
                variant="warning"
                className="ml-2">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="historique"
            className="py-3 text-base font-medium">
            {t("engagements.reevaluationHistory")}
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="py-3 text-base font-medium">
            {t("engagements.statistics")}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="liste"
          className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("engagements.searchPlaceholder")}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleOpenAddDialog}>
                  <Plus className="mr-2 h-4 w-4" /> {t("engagements.addNew")}
                </Button>
              </div>

              <EngagementsTable
                engagements={filteredEngagements}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                onEdit={handleOpenEditDialog}
                onDelete={handleOpenDeleteDialog}
                onView={handleOpenViewDialog}
                onReevaluate={handleOpenReevaluationDialog}
                onApprove={handleOpenApproveDialog}
                onReject={handleRejectEngagement}
                onRefresh={() => {
                  refetchEngagements();
                  toast({
                    title: t("common.dataRefreshed"),
                    description: t("engagements.listRefreshed"),
                  });
                }}
                onAddNew={handleOpenAddDialog}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="approbations"
          className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("engagements.pendingApprovals")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("engagements.priority")}</TableHead>
                    <TableHead>{t("engagements.details")}</TableHead>
                    <TableHead>{t("engagements.requestedBy")}</TableHead>
                    <TableHead className="text-right">{t("engagements.amount")}</TableHead>
                    <TableHead>{t("engagements.date")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-4">
                        {t("engagements.noPendingApprovals")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingApprovals.map((engagement) => (
                      <TableRow key={engagement.id}>
                        <TableCell>{getPriorityBadge(engagement.type || "Moyenne")}</TableCell>
                        <TableCell className="font-medium">
                          {engagement.operation_id && operationsData.find((op) => op.id === engagement.operation_id)?.name} - {engagement.vendor}
                        </TableCell>
                        <TableCell>{engagement.code}</TableCell>
                        <TableCell className="text-right">{formatCurrency(engagement.amount)}</TableCell>
                        <TableCell>{formatDate(engagement.date)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleOpenApproveDialog(engagement)}>
                              <Check className="mr-1 h-4 w-4" /> {t("engagements.approve")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleRejectEngagement(engagement)}>
                              <X className="mr-1 h-4 w-4" /> {t("engagements.reject")}
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
        </TabsContent>

        <TabsContent
          value="historique"
          className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("engagements.reevaluationHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-72 mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("engagements.searchByEngagement")}
                  className="pl-8"
                  value={reevaluationSearchTerm}
                  onChange={(e) => setReevaluationSearchTerm(e.target.value)}
                />
              </div>
              <ReevaluationsTable
                reevaluations={filteredReevaluations}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="stats"
          className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{engagementsData.length}</div>
                <p className="text-muted-foreground">{t("engagements.totalEngagements")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(engagementsData.reduce((sum, eng) => sum + eng.amount, 0))}</div>
                <p className="text-muted-foreground">{t("engagements.totalAmount")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{pendingApprovals.length}</div>
                <p className="text-muted-foreground">{t("engagements.pendingApprovals")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {engagementsData.filter((eng) => eng.status === "approved" || eng.status === "validated" || eng.status === "liquidated").length}
                </div>
                <p className="text-muted-foreground">{t("engagements.approvedEngagements")}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("engagements.statusDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* Status distribution chart would go here */}
                  <div className="h-full flex flex-col justify-center items-center">
                    <div className="grid grid-cols-4 gap-2 w-full">
                      {["draft", "submitted", "reviewed", "approved", "rejected", "validated", "liquidated"].map((status) => {
                        const count = engagementsData.filter((e) => e.status === status).length;
                        const percentage = engagementsData.length > 0 ? Math.round((count / engagementsData.length) * 100) : 0;
                        return (
                          <div
                            key={status}
                            className="flex flex-col">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(status)}
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                            <div className="h-4 w-full bg-muted rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("engagements.typeDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* Type distribution chart would go here */}
                  <div className="h-full flex flex-col justify-center items-center">
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {["legal", "provisional", "technical", "multiannual", "carryover", "revaluation"].map((type) => {
                        const count = engagementsData.filter((e) => e.type === type).length;
                        const percentage = engagementsData.length > 0 ? Math.round((count / engagementsData.length) * 100) : 0;
                        return (
                          <div
                            key={type}
                            className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{t(`engagements.type.${type}`)}</Badge>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                            <div className="h-4 w-full bg-muted rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-secondary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("engagements.monthlyTrends")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* Monthly trends chart would go here */}
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">{t("engagements.chartComingSoon")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("engagements.topBeneficiaries")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("engagements.beneficiary")}</TableHead>
                      <TableHead className="text-right">{t("engagements.count")}</TableHead>
                      <TableHead className="text-right">{t("engagements.totalAmount")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(
                      engagementsData.reduce((acc, eng) => {
                        const vendor = eng.vendor || "Unknown";
                        if (!acc.has(vendor)) {
                          acc.set(vendor, { count: 0, total: 0 });
                        }
                        const vendorData = acc.get(vendor)!;
                        vendorData.count += 1;
                        vendorData.total += eng.amount;
                        return acc;
                      }, new Map<string, { count: number; total: number }>())
                    )
                      .sort((a, b) => b[1].total - a[1].total)
                      .slice(0, 5)
                      .map(([vendor, data]) => (
                        <TableRow key={vendor}>
                          <TableCell>{vendor}</TableCell>
                          <TableCell className="text-right">{data.count}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.total)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("engagements.addNew")}</DialogTitle>
            <DialogDescription>{t("engagements.addNewDescription")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic information section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                  1
                </span>
                {t("engagements.basicInfo")}
              </h3>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="reference"
                      className="mb-1 block">
                      {t("engagements.reference")}
                    </Label>
                    <Input
                      id="reference"
                      type="text"
                      value={newEngagement.reference || ""}
                      onChange={(e) => setNewEngagement({ ...newEngagement, reference: e.target.value })}
                      placeholder="REF-2025-0XXX"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="code"
                      className="mb-1 block">
                      {t("engagements.code")} *
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      value={newEngagement.code || ""}
                      onChange={(e) => setNewEngagement({ ...newEngagement, code: e.target.value })}
                      placeholder="ENG-2025-0XX"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="operation"
                    className="mb-1 block">
                    {t("engagements.operation")} *
                  </Label>
                  <Select
                    value={newEngagement.operation_id}
                    onValueChange={(value) => setNewEngagement({ ...newEngagement, operation_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("engagements.selectOperation")} />
                    </SelectTrigger>
                    <SelectContent>
                      {operationsData.map((operation) => (
                        <SelectItem
                          key={operation.id}
                          value={operation.id}>
                          {operation.name || operation.title || "Opération sans nom"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Vendor and Amount Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                  2
                </span>
                {t("engagements.vendorDetails")}
              </h3>

              <div className="grid gap-4">
                <div>
                  <Label
                    htmlFor="vendor"
                    className="mb-1 block">
                    {t("engagements.vendor")} *
                  </Label>
                  <Select
                    value={newEngagement.vendor}
                    onValueChange={(value) => setNewEngagement({ ...newEngagement, vendor: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("engagements.selectVendor")} />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaires.map((beneficiaire) => (
                        <SelectItem
                          key={beneficiaire}
                          value={beneficiaire}>
                          {beneficiaire}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">{t("engagements.otherVendor")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newEngagement.vendor === "other" && (
                  <div>
                    <Label
                      htmlFor="custom-vendor"
                      className="mb-1 block">
                      {t("engagements.customVendor")}
                    </Label>
                    <Input
                      id="custom-vendor"
                      type="text"
                      placeholder={t("engagements.enterVendor")}
                      onChange={(e) => setNewEngagement({ ...newEngagement, vendor: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="amount"
                      className="mb-1 block">
                      {t("engagements.amount")} *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newEngagement.amount || ""}
                      onChange={(e) =>
                        setNewEngagement({
                          ...newEngagement,
                          amount: parseFloat(e.target.value),
                        })
                      }
                      placeholder="1000000"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="type"
                      className="mb-1 block">
                      {t("engagements.type")}
                    </Label>
                    <Select
                      value={newEngagement.type || ""}
                      onValueChange={(value) => setNewEngagement({ ...newEngagement, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("engagements.selectType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="legal">{t("engagements.type.legal")}</SelectItem>
                        <SelectItem value="provisional">{t("engagements.type.provisional")}</SelectItem>
                        <SelectItem value="technical">{t("engagements.type.technical")}</SelectItem>
                        <SelectItem value="multiannual">{t("engagements.type.multiannual")}</SelectItem>
                        <SelectItem value="carryover">{t("engagements.type.carryover")}</SelectItem>
                        <SelectItem value="revaluation">{t("engagements.type.revaluation")}</SelectItem>
                        <SelectItem value="disbursement">{t("engagements.type.disbursement")}</SelectItem>
                        <SelectItem value="reallocation">{t("engagements.type.reallocation")}</SelectItem>
                        <SelectItem value="off_budget">{t("engagements.type.off_budget")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates and Status Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                  3
                </span>
                {t("engagements.datesAndStatus")}
              </h3>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="date"
                      className="mb-1 block">
                      {t("engagements.date")}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEngagement.date || ""}
                      onChange={(e) => setNewEngagement({ ...newEngagement, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="inscription_date"
                      className="mb-1 block">
                      {t("engagements.inscriptionDate")}
                    </Label>
                    <Input
                      id="inscription_date"
                      type="date"
                      value={newEngagement.inscription_date || ""}
                      onChange={(e) => setNewEngagement({ ...newEngagement, inscription_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="year"
                      className="mb-1 block">
                      {t("engagements.year")}
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={newEngagement.year || new Date().getFullYear()}
                      onChange={(e) => setNewEngagement({ ...newEngagement, year: parseInt(e.target.value) })}
                      min={2000}
                      max={2050}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="mb-1 block">
                    {t("engagements.status")}
                  </Label>
                  <Select
                    value={newEngagement.status || "draft"}
                    onValueChange={(value) => setNewEngagement({ ...newEngagement, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("engagements.selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("engagements.draft")}</SelectItem>
                      <SelectItem value="submitted">{t("engagements.submitted")}</SelectItem>
                      <SelectItem value="reviewed">{t("engagements.reviewed")}</SelectItem>
                      <SelectItem value="approved">{t("engagements.approved")}</SelectItem>
                      <SelectItem value="rejected">{t("engagements.rejected")}</SelectItem>
                      <SelectItem value="proposed">{t("engagements.proposed")}</SelectItem>
                      <SelectItem value="validated">{t("engagements.validated")}</SelectItem>
                      <SelectItem value="liquidated">{t("engagements.liquidated")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                  4
                </span>
                {t("engagements.additionalInfo")}
              </h3>

              <div>
                <Label
                  htmlFor="description"
                  className="mb-1 block">
                  {t("engagements.description")}
                </Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newEngagement.description || ""}
                  onChange={(e) => setNewEngagement({ ...newEngagement, description: e.target.value })}
                  placeholder={t("engagements.descriptionPlaceholder")}
                />
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-2">* {t("common.requiredFields")}</div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddEngagement}>{t("common.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("engagements.edit")}</DialogTitle>
            <DialogDescription>{t("engagements.editDescription")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic information section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                  1
                </span>
                {t("engagements.basicInfo")}
              </h3>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="edit-reference"
                      className="mb-1 block">
                      {t("engagements.reference")}
                    </Label>
                    <Input
                      id="edit-reference"
                      type="text"
                      value={newEngagement.reference || ""}
                      onChange={(e) => setNewEngagement({ ...newEngagement, reference: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-code"
                      className="mb-1 block">
                      {t("engagements.code")} *
                    </Label>
                    <Input
                      id="edit-code"
                      type="text"
                      value={newEngagement.code || ""}
                      onChange={(e) => setNewEngagement({ ...newEngagement, code: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="edit-operation"
                    className="mb-1 block">
                    {t("engagements.operation")} *
                  </Label>
                  <Select
                    value={newEngagement.operation_id}
                    onValueChange={(value) => setNewEngagement({ ...newEngagement, operation_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("engagements.selectOperation")} />
                    </SelectTrigger>
                    <SelectContent>
                      {operationsData.map((operation) => (
                        <SelectItem
                          key={operation.id}
                          value={operation.id}>
                          {operation.name || operation.title || "Opération sans nom"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Vendor and Amount Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                  2
                </span>
                {t("engagements.vendorDetails")}
              </h3>

              <div className="grid gap-4">
                <div>
                  <Label
                    htmlFor="edit-vendor"
                    className="mb-1 block">
                    {t("engagements.vendor")} *
                  </Label>
                  <Select
                    value={newEngagement.vendor}
                    onValueChange={(value) => setNewEngagement({ ...newEngagement, vendor: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("engagements.selectVendor")} />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaires.map((beneficiaire) => (
                        <SelectItem
                          key={beneficiaire}
                          value={beneficiaire}>
                          {beneficiaire}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">{t("engagements.otherVendor")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newEngagement.vendor === "other" && (
                  <div>
                    <Label
                      htmlFor="edit-custom-vendor"
                      className="mb-1 block">
                      {t("engagements.customVendor")}
                    </Label>
                    <Input
                      id="edit-custom-vendor"
                      type="text"
                      placeholder={t("engagements.enterVendor")}
                      onChange={(e) => setNewEngagement({ ...newEngagement, vendor: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="edit-amount"
                      className="mb-1 block">
                      {t("engagements.amount")} *
                    </Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      value={newEngagement.amount || ""}
                      onChange={(e) =>
                        setNewEngagement({
                          ...newEngagement,
                          amount: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="edit-type"
                      className="mb-1 block">
                      {t("engagements.type")}
                    </Label>
                    <Select
                      value={newEngagement.type || ""}
                      onValueChange={(value) => setNewEngagement({ ...newEngagement, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("engagements.selectType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="legal">{t("engagements.type.legal")}</SelectItem>
                        <SelectItem value="provisional">{t("engagements.type.provisional")}</SelectItem>
                        <SelectItem value="technical">{t("engagements.type.technical")}</SelectItem>
                        <SelectItem value="multiannual">{t("engagements.type.multiannual")}</SelectItem>
                        <SelectItem value="carryover">{t("engagements.type.carryover")}</SelectItem>
                        <SelectItem value="revaluation">{t("engagements.type.revaluation")}</SelectItem>
                        <SelectItem value="disbursement">{t("engagements.type.disbursement")}</SelectItem>
                        <SelectItem value="reallocation">{t("engagements.type.reallocation")}</SelectItem>
                        <SelectItem value="off_budget">{t("engagements.type.off_budget")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates and Status Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                  3
                </span>
                {t("engagements.datesAndStatus")}
              </h3>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="edit-date"
                      className="mb-1 block">
                      {t("engagements.date")}
                    </Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={newEngagement.date || ""}
                      onChange={(e) => setNewEngagement({ ...newEngagement, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="edit-inscription-date"
                      className="mb-1 block">
                      {t("engagements.inscriptionDate")}
                    </Label>
                    <Input
                      id="edit-inscription-date"
                      type="date"
                      value={newEngagement.inscription_date || ""}
                      onChange={(e) => setNewEngagement({ ...newEngagement, inscription_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="edit-year"
                      className="mb-1 block">
                      {t("engagements.year")}
                    </Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={newEngagement.year || new Date().getFullYear()}
                      onChange={(e) => setNewEngagement({ ...newEngagement, year: parseInt(e.target.value) })}
                      min={2000}
                      max={2050}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="edit-status"
                    className="mb-1 block">
                    {t("engagements.status")}
                  </Label>
                  <Select
                    value={newEngagement.status || "draft"}
                    onValueChange={(value) => setNewEngagement({ ...newEngagement, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("engagements.selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("engagements.draft")}</SelectItem>
                      <SelectItem value="submitted">{t("engagements.submitted")}</SelectItem>
                      <SelectItem value="reviewed">{t("engagements.reviewed")}</SelectItem>
                      <SelectItem value="approved">{t("engagements.approved")}</SelectItem>
                      <SelectItem value="rejected">{t("engagements.rejected")}</SelectItem>
                      <SelectItem value="proposed">{t("engagements.proposed")}</SelectItem>
                      <SelectItem value="validated">{t("engagements.validated")}</SelectItem>
                      <SelectItem value="liquidated">{t("engagements.liquidated")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                  4
                </span>
                {t("engagements.additionalInfo")}
              </h3>

              <div>
                <Label
                  htmlFor="edit-description"
                  className="mb-1 block">
                  {t("engagements.description")}
                </Label>
                <textarea
                  id="edit-description"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newEngagement.description || ""}
                  onChange={(e) => setNewEngagement({ ...newEngagement, description: e.target.value })}
                  placeholder={t("engagements.descriptionPlaceholder")}
                />
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-2">* {t("common.requiredFields")}</div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEditEngagement}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("engagements.confirmDelete")}</DialogTitle>
            <DialogDescription>{t("engagements.deleteDescription")}</DialogDescription>
          </DialogHeader>
          {currentEngagement && (
            <div className="py-4">
              <p>
                <strong>ID:</strong> {currentEngagement.id}
              </p>
              <p>
                <strong>{t("engagements.operation")}:</strong> {currentEngagement.operation_id}
              </p>
              <p>
                <strong>{t("engagements.vendor")}:</strong> {currentEngagement.vendor}
              </p>
              <p>
                <strong>{t("engagements.requestedAmount")}:</strong> {formatCurrency(currentEngagement.amount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEngagement}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("engagements.details")}</DialogTitle>
            <DialogDescription>{t("engagements.detailsDescription")}</DialogDescription>
          </DialogHeader>
          {currentEngagement && (
            <div className="py-4">
              <div className="mb-4 rounded-lg border border-muted bg-muted/20 p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">{t("engagements.reference")}</div>
                    <div className="text-xl font-semibold">{currentEngagement.reference || t("common.notAvailable")}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(currentEngagement.status)}
                    <span className="text-muted-foreground text-sm">{currentEngagement.date ? formatDate(currentEngagement.date) : ""}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="border rounded-lg p-4 bg-card">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                        1
                      </span>
                      {t("engagements.basicInfo")}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.code")}</div>
                        <div>{currentEngagement.code || t("common.notAvailable")}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.inscriptionDate")}</div>
                        <div>{currentEngagement.inscription_date ? formatDate(currentEngagement.inscription_date) : t("common.notAvailable")}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.year")}</div>
                        <div>{currentEngagement.year || new Date().getFullYear()}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.date")}</div>
                        <div>{currentEngagement.date ? formatDate(currentEngagement.date) : t("common.notAvailable")}</div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.operation")}</div>
                        <div>
                          {operationsData.find((op) => op.id === currentEngagement.operation_id)?.name ||
                            currentEngagement.operation_id ||
                            t("common.notAvailable")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Information */}
                  <div className="border rounded-lg p-4 bg-card">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                        2
                      </span>
                      {t("engagements.vendorDetails")}
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.vendor")}</div>
                        <div className="text-lg font-medium">{currentEngagement.vendor || t("common.notAvailable")}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.type")}</div>
                        <div className="flex items-center">
                          {currentEngagement.type ? (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {t(`engagements.type.${currentEngagement.type}`)}
                            </div>
                          ) : (
                            t("common.notAvailable")
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {currentEngagement.description && (
                    <div className="border rounded-lg p-4 bg-card">
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                          3
                        </span>
                        {t("engagements.description")}
                      </h3>
                      <div className="p-3 bg-muted rounded-md text-sm">{currentEngagement.description}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Financial Information */}
                  <div className="border rounded-lg p-4 bg-card">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                        4
                      </span>
                      {t("engagements.financialInfo")}
                    </h3>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.requestedAmount")}</div>
                          <div className="font-mono text-lg font-semibold">{formatCurrency(currentEngagement.amount)}</div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.approvedAmount")}</div>
                          <div className="font-mono">
                            {currentEngagement.status === "approved" ||
                            currentEngagement.status === "validated" ||
                            currentEngagement.status === "liquidated"
                              ? formatCurrency(currentEngagement.amount)
                              : "-"}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.consumedAmount")}</div>
                          <div className="font-mono">
                            {currentEngagement.status === "liquidated"
                              ? formatCurrency(currentEngagement.amount)
                              : formatCurrency(currentEngagement.amount * 0.3)}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">{t("engagements.remainingAmount")}</div>
                          <div className="font-mono">
                            {currentEngagement.status !== "liquidated" ? formatCurrency(currentEngagement.amount * 0.7) : "0"}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar showing consumption */}
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span>{t("engagements.consumptionProgress")}</span>
                          <span className="font-medium">{currentEngagement.status === "liquidated" ? "100%" : "30%"}</span>
                        </div>
                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: currentEngagement.status === "liquidated" ? "100%" : "30%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="border rounded-lg p-4 bg-card">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                        5
                      </span>
                      {t("engagements.timeline")}
                    </h3>

                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-1.5 before:h-full before:w-0.5 before:bg-muted pl-7">
                      {/* Mock timeline data - would be replaced with actual status history from the history field */}
                      <div className="relative">
                        <div className="absolute -left-7 mt-1.5 h-3 w-3 rounded-full bg-primary"></div>
                        <div className="text-sm">
                          <p className="font-medium">{t("engagements.created")}</p>
                          <p className="text-muted-foreground">{formatDate(currentEngagement.date)}</p>
                        </div>
                      </div>
                      {currentEngagement.status !== "draft" && (
                        <div className="relative">
                          <div className="absolute -left-7 mt-1.5 h-3 w-3 rounded-full bg-primary"></div>
                          <div className="text-sm">
                            <p className="font-medium">{t("engagements.submitted")}</p>
                            <p className="text-muted-foreground">
                              {formatDate(new Date(new Date(currentEngagement.date).getTime() + 86400000).toISOString())}
                            </p>
                          </div>
                        </div>
                      )}
                      {(currentEngagement.status === "approved" ||
                        currentEngagement.status === "validated" ||
                        currentEngagement.status === "liquidated") && (
                        <div className="relative">
                          <div className="absolute -left-7 mt-1.5 h-3 w-3 rounded-full bg-primary"></div>
                          <div className="text-sm">
                            <p className="font-medium">{t("engagements.approved")}</p>
                            <p className="text-muted-foreground">
                              {formatDate(new Date(new Date(currentEngagement.date).getTime() + 259200000).toISOString())}
                            </p>
                          </div>
                        </div>
                      )}
                      {(currentEngagement.status === "validated" || currentEngagement.status === "liquidated") && (
                        <div className="relative">
                          <div className="absolute -left-7 mt-1.5 h-3 w-3 rounded-full bg-primary"></div>
                          <div className="text-sm">
                            <p className="font-medium">{t("engagements.validated")}</p>
                            <p className="text-muted-foreground">
                              {formatDate(new Date(new Date(currentEngagement.date).getTime() + 432000000).toISOString())}
                            </p>
                          </div>
                        </div>
                      )}
                      {currentEngagement.status === "liquidated" && (
                        <div className="relative">
                          <div className="absolute -left-7 mt-1.5 h-3 w-3 rounded-full bg-primary"></div>
                          <div className="text-sm">
                            <p className="font-medium">{t("engagements.liquidated")}</p>
                            <p className="text-muted-foreground">
                              {formatDate(new Date(new Date(currentEngagement.date).getTime() + 864000000).toISOString())}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Revaluations history */}
              <div className="mt-6 border rounded-lg p-4 bg-card">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                    6
                  </span>
                  {t("engagements.revaluationHistory")}
                </h3>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("engagements.date")}</TableHead>
                      <TableHead>{t("engagements.type")}</TableHead>
                      <TableHead className="text-right">{t("engagements.amount")}</TableHead>
                      <TableHead>{t("engagements.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Mock revaluation data - would be replaced with actual revaluation records */}
                    {currentEngagement.status === "liquidated" ? (
                      <>
                        <TableRow>
                          <TableCell>{formatDate(new Date(new Date(currentEngagement.date).getTime() + 1728000000).toISOString())}</TableCell>
                          <TableCell>{t("engagements.type.revaluation")}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(currentEngagement.amount * 0.15)}</TableCell>
                          <TableCell>{getStatusBadge("approved")}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>{formatDate(new Date(new Date(currentEngagement.date).getTime() + 2592000000).toISOString())}</TableCell>
                          <TableCell>{t("engagements.type.disbursement")}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(currentEngagement.amount * 0.3)}</TableCell>
                          <TableCell>{getStatusBadge("liquidated")}</TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-4 text-muted-foreground">
                          {t("engagements.noRevaluations")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleOpenReevaluationDialog(currentEngagement!)}>
              {t("engagements.reevaluate")}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenEditDialog(currentEngagement!)}>
              {t("common.edit")}
            </Button>
            <Button onClick={() => setIsViewDialogOpen(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("engagements.approve")}</DialogTitle>
            <DialogDescription>{t("engagements.approveDescription")}</DialogDescription>
          </DialogHeader>
          {currentEngagement && (
            <div className="py-4 space-y-4">
              <div className="grid gap-4 border rounded-lg p-4 bg-muted/20">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("engagements.operation")}:</span>
                    <span className="font-medium">
                      {operationsData.find((op) => op.id === currentEngagement.operation_id)?.name || currentEngagement.operation_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("engagements.vendor")}:</span>
                    <span className="font-medium">{currentEngagement.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("engagements.requestedAmount")}:</span>
                    <span className="font-medium font-mono">{formatCurrency(currentEngagement.amount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="approval-amount"
                  className="mb-2 block font-medium">
                  {t("engagements.approvedAmount")}
                </Label>
                <Input
                  id="approval-amount"
                  type="number"
                  className="w-full"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleApproveEngagement}>{t("common.approve")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedEngagementForReevaluation && (
        <ReevaluationDialog
          isOpen={isReevaluationDialogOpen}
          onClose={() => setIsReevaluationDialogOpen(false)}
          engagement={{
            id: selectedEngagementForReevaluation.id,
            reference: selectedEngagementForReevaluation.id,
            beneficiary: selectedEngagementForReevaluation.vendor,
            montant_initial: selectedEngagementForReevaluation.amount,
          }}
          onSuccess={handleReevaluationSuccess}
        />
      )}
    </Dashboard>
  );
}
