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

  // Use our custom React Query hooks with staleTime configurations for local storage persistence
  const {
    data: engagementsData = [] as Engagement[],
    isLoading: isLoadingEngagements,
    refetch: refetchEngagements,
  } = useEngagements({
    staleTime: 1000 * 60 * 10, // 10 minutes - engagements change moderately often
  });

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

  // Filter engagements based on search term
  const filteredEngagements = engagementsData.filter((engagement) => {
    return (
      engagement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engagement.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const pendingApprovals = engagementsData.filter((engagement) => engagement.status === "submitted" || engagement.status === "reviewed");

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
          <Badge variant="outline" className="border-blue-500 text-blue-500">
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

  // Extract ministry names to use as departments
  const departments = ministriesData.map((ministry) => ministry.name_fr);

  // Mock beneficiaries until we have a proper API endpoint
  const beneficiaires = [
    "Enterprise Nationale de Travaux Publics",
    "SONATRACH",
    "SONELGAZ",
    "Ministère de la Défense Nationale",
    "Office National des Statistiques",
    "Direction Générale des Impôts",
  ];

  return (
    <Dashboard className="p-6">
      <DashboardHeader title={t("app.navigation.engagements")} description={t("engagements.description")} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="liste">{t("engagements.list")}</TabsTrigger>
          <TabsTrigger value="approbations">
            {t("engagements.pendingApprovals")}
            {pendingApprovals.length > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historique">{t("engagements.reevaluationHistory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="liste" className="mt-6">
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

        <TabsContent value="approbations" className="mt-6">
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
                      <TableCell colSpan={6} className="text-center py-4">
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
                              onClick={() => handleOpenApproveDialog(engagement)}
                            >
                              <Check className="mr-1 h-4 w-4" /> {t("engagements.approve")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleRejectEngagement(engagement)}
                            >
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

        <TabsContent value="historique" className="mt-6">
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
              <ReevaluationsTable reevaluations={filteredReevaluations} formatCurrency={formatCurrency} formatDate={formatDate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("engagements.addNew")}</DialogTitle>
            <DialogDescription>{t("engagements.addNewDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operation" className="text-right">
                {t("engagements.operation")}
              </Label>
              <Select value={newEngagement.operation_id} onValueChange={(value) => setNewEngagement({ ...newEngagement, operation_id: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("engagements.selectOperation")} />
                </SelectTrigger>
                <SelectContent>
                  {operationsData.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      {operation.name || operation.title || "Opération sans nom"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendor" className="text-right">
                {t("engagements.beneficiary")}
              </Label>
              <Select value={newEngagement.vendor} onValueChange={(value) => setNewEngagement({ ...newEngagement, vendor: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("engagements.selectBeneficiary")} />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaires.map((beneficiaire) => (
                    <SelectItem key={beneficiaire} value={beneficiaire}>
                      {beneficiaire}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                {t("engagements.requestedAmount")}
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={newEngagement.amount || ""}
                onChange={(e) =>
                  setNewEngagement({
                    ...newEngagement,
                    amount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                {t("engagements.requestedBy")}
              </Label>
              <Select value={newEngagement.code} onValueChange={(value) => setNewEngagement({ ...newEngagement, code: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("engagements.selectDepartment")} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                {t("engagements.date")}
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={newEngagement.date || ""}
                onChange={(e) => setNewEngagement({ ...newEngagement, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t("engagements.status")}
              </Label>
              <Select value={newEngagement.status || "draft"} onValueChange={(value) => setNewEngagement({ ...newEngagement, status: value })}>
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                {t("engagements.reference")}
              </Label>
              <Input
                id="reference"
                type="text"
                className="col-span-3"
                value={newEngagement.reference || ""}
                onChange={(e) => setNewEngagement({ ...newEngagement, reference: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddEngagement}>{t("common.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("engagements.edit")}</DialogTitle>
            <DialogDescription>{t("engagements.editDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-operation" className="text-right">
                {t("engagements.operation")}
              </Label>
              <Select value={newEngagement.operation_id} onValueChange={(value) => setNewEngagement({ ...newEngagement, operation_id: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("engagements.selectOperation")} />
                </SelectTrigger>
                <SelectContent>
                  {operationsData.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      {operation.name || operation.title || "Opération sans nom"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-vendor" className="text-right">
                {t("engagements.beneficiary")}
              </Label>
              <Select value={newEngagement.vendor} onValueChange={(value) => setNewEngagement({ ...newEngagement, vendor: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("engagements.selectBeneficiary")} />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaires.map((beneficiaire) => (
                    <SelectItem key={beneficiaire} value={beneficiaire}>
                      {beneficiaire}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                {t("engagements.requestedAmount")}
              </Label>
              <Input
                id="edit-amount"
                type="number"
                className="col-span-3"
                value={newEngagement.amount || ""}
                onChange={(e) =>
                  setNewEngagement({
                    ...newEngagement,
                    amount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                {t("engagements.requestedBy")}
              </Label>
              <Select value={newEngagement.code} onValueChange={(value) => setNewEngagement({ ...newEngagement, code: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("engagements.selectDepartment")} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                {t("engagements.date")}
              </Label>
              <Input
                id="edit-date"
                type="date"
                className="col-span-3"
                value={newEngagement.date || ""}
                onChange={(e) => setNewEngagement({ ...newEngagement, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t("engagements.status")}
              </Label>
              <Select value={newEngagement.status || "draft"} onValueChange={(value) => setNewEngagement({ ...newEngagement, status: value })}>
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                {t("engagements.reference")}
              </Label>
              <Input
                id="reference"
                type="text"
                className="col-span-3"
                value={newEngagement.reference || ""}
                onChange={(e) => setNewEngagement({ ...newEngagement, reference: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEditEngagement}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                <strong>{t("engagements.beneficiary")}:</strong> {currentEngagement.vendor}
              </p>
              <p>
                <strong>{t("engagements.requestedAmount")}:</strong> {formatCurrency(currentEngagement.amount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteEngagement}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("engagements.details")}</DialogTitle>
          </DialogHeader>
          {currentEngagement && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID:</div>
                <div>{currentEngagement.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">{t("engagements.operation")}:</div>
                <div>{currentEngagement.operation_id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">{t("engagements.beneficiary")}:</div>
                <div>{currentEngagement.vendor}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">{t("engagements.requestedAmount")}:</div>
                <div>{formatCurrency(currentEngagement.amount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">{t("engagements.approvedAmount")}:</div>
                <div>{formatCurrency(currentEngagement.amount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">{t("engagements.status")}:</div>
                <div>{getStatusBadge(currentEngagement.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">{t("engagements.date")}:</div>
                <div>{formatDate(currentEngagement.date)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">{t("engagements.priority")}:</div>
                <div>{getPriorityBadge(currentEngagement.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">{t("engagements.requestedBy")}:</div>
                <div>{currentEngagement.code}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("engagements.approve")}</DialogTitle>
            <DialogDescription>{t("engagements.approveDescription")}</DialogDescription>
          </DialogHeader>
          {currentEngagement && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <p>
                  <strong>{t("engagements.operation")}:</strong> {currentEngagement.operation_id}
                </p>
                <p>
                  <strong>{t("engagements.beneficiary")}:</strong> {currentEngagement.vendor}
                </p>
                <p>
                  <strong>{t("engagements.requestedAmount")}:</strong> {formatCurrency(currentEngagement.amount)}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="approval-amount" className="text-right">
                  {t("engagements.approvedAmount")}
                </Label>
                <Input
                  id="approval-amount"
                  type="number"
                  className="col-span-3"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
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
