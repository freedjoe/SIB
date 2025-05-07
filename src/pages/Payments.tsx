import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentTable } from "@/components/tables/PaymentTable";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { usePayments, usePaymentMutation } from "@/hooks/supabase/entities/payments";
import { usePaymentRequests, usePaymentRequestMutation } from "@/hooks/supabase/entities/payment_requests";
import { useEngagements } from "@/hooks/supabase/entities/engagements";
import { type PaymentWithRelations } from "@/services/paymentsService";
import { type PaymentRequestWithRelations } from "@/services/paymentRequestsService";
import { PaymentStats } from "@/components/stats/PaymentStats";
import { StatCard } from "@/components/ui-custom/StatCard";
import { Payment, PaymentRequest } from "@/types/database.types";

import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { CreditCard, FileCheck, Calendar, CheckCircle, Clock, X, ArrowRightLeft, Eye, Plus, FileEdit, Trash2 } from "lucide-react";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { PaymentRequestTable } from "@/components/tables/PaymentRequestTable";
import { PaymentRequestDialog } from "@/components/dialogs/PaymentRequestDialog";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";

// Mock data for visualization
const MOCK_PAYMENTS: PaymentWithRelations[] = [
  {
    id: "pay-001",
    engagement_id: "eng-001",
    operation_id: "op-001",
    amount: 250000,
    payment_date: new Date(2025, 3, 15).toISOString(),
    status: "paid",
    beneficiary: "Entreprise Nationale d'Électricité",
    description: "Paiement pour infrastructure électrique",
    created_at: new Date(2025, 3, 10).toISOString(),
    engagement: {
      id: "eng-001",
      operation_id: "op-001",
      beneficiary: "Entreprise Nationale d'Électricité",
      operation: {
        id: "op-001",
        name: "Infrastructure électrique",
      },
    },
  },
  {
    id: "pay-002",
    engagement_id: "eng-002",
    operation_id: "op-002",
    amount: 175000,
    payment_date: new Date(2025, 3, 20).toISOString(),
    status: "pending",
    beneficiary: "Constructions Algériennes",
    description: "Avance pour projet routier",
    created_at: new Date(2025, 3, 18).toISOString(),
    engagement: {
      id: "eng-002",
      operation_id: "op-002",
      beneficiary: "Constructions Algériennes",
      operation: {
        id: "op-002",
        name: "Projet routier",
      },
    },
  },
  {
    id: "pay-003",
    engagement_id: "eng-003",
    operation_id: "op-003",
    amount: 320000,
    payment_date: new Date(2025, 3, 5).toISOString(),
    status: "approved",
    beneficiary: "Société Hydraulique du Sud",
    description: "Paiement pour réseau d'irrigation",
    created_at: new Date(2025, 3, 2).toISOString(),
    engagement: {
      id: "eng-003",
      operation_id: "op-003",
      beneficiary: "Société Hydraulique du Sud",
      operation: {
        id: "op-003",
        name: "Réseau d'irrigation",
      },
    },
  },
  {
    id: "pay-004",
    engagement_id: "eng-004",
    operation_id: "op-004",
    amount: 95000,
    payment_date: new Date(2025, 3, 25).toISOString(),
    status: "rejected",
    beneficiary: "École Nationale Polytechnique",
    description: "Équipement informatique",
    created_at: new Date(2025, 3, 22).toISOString(),
    engagement: {
      id: "eng-004",
      operation_id: "op-004",
      beneficiary: "École Nationale Polytechnique",
      operation: {
        id: "op-004",
        name: "Équipement éducatif",
      },
    },
  },
  {
    id: "pay-005",
    engagement_id: "eng-005",
    operation_id: "op-005",
    amount: 128000,
    payment_date: new Date(2025, 4, 2).toISOString(),
    status: "paid",
    beneficiary: "Hôpital Universitaire d'Alger",
    description: "Équipement médical",
    created_at: new Date(2025, 3, 30).toISOString(),
    engagement: {
      id: "eng-005",
      operation_id: "op-005",
      beneficiary: "Hôpital Universitaire d'Alger",
      operation: {
        id: "op-005",
        name: "Infrastructure sanitaire",
      },
    },
  },
];

const MOCK_PAYMENT_REQUESTS: PaymentRequestWithRelations[] = [
  {
    id: "req-001",
    engagement_id: "eng-001",
    operation_id: "op-001",
    amount: 125000,
    created_at: new Date(2025, 3, 5).toISOString(),
    period: "Q2 2025",
    frequency: "quarterly",
    justification: "Deuxième phase du projet d'électrification",
    status: "approved",
    beneficiary: "Entreprise Nationale d'Électricité",
    description: "Demande de paiement pour phase 2",
    document: "doc-001.pdf",
    engagement: {
      id: "eng-001",
      operation_id: "op-001",
      beneficiary: "Entreprise Nationale d'Électricité",
      operation: {
        id: "op-001",
        name: "Infrastructure électrique",
      },
    },
  },
  {
    id: "req-002",
    engagement_id: "eng-002",
    operation_id: "op-002",
    amount: 87500,
    created_at: new Date(2025, 3, 12).toISOString(),
    period: "Mai 2025",
    frequency: "monthly",
    justification: "Matériaux pour la construction de routes",
    status: "pending",
    beneficiary: "Constructions Algériennes",
    description: "Demande d'avance pour achat de matériaux",
    document: "doc-002.pdf",
    engagement: {
      id: "eng-002",
      operation_id: "op-002",
      beneficiary: "Constructions Algériennes",
      operation: {
        id: "op-002",
        name: "Projet routier",
      },
    },
  },
  {
    id: "req-003",
    engagement_id: "eng-003",
    operation_id: "op-003",
    amount: 160000,
    created_at: new Date(2025, 2, 28).toISOString(),
    period: "Q1-Q2 2025",
    frequency: "quarterly",
    justification: "Installation de pompes pour le réseau d'irrigation",
    status: "pending_accountant",
    beneficiary: "Société Hydraulique du Sud",
    description: "Demande pour achat d'équipement",
    document: "doc-003.pdf",
    engagement: {
      id: "eng-003",
      operation_id: "op-003",
      beneficiary: "Société Hydraulique du Sud",
      operation: {
        id: "op-003",
        name: "Réseau d'irrigation",
      },
    },
  },
  {
    id: "req-004",
    engagement_id: "eng-004",
    operation_id: "op-004",
    amount: 95000,
    created_at: new Date(2025, 3, 18).toISOString(),
    period: "Année académique 2025",
    frequency: "annual",
    justification: "Renouvellement des équipements informatiques",
    status: "rejected",
    beneficiary: "École Nationale Polytechnique",
    description: "Demande pour équipement informatique",
    document: "doc-004.pdf",
    engagement: {
      id: "eng-004",
      operation_id: "op-004",
      beneficiary: "École Nationale Polytechnique",
      operation: {
        id: "op-004",
        name: "Équipement éducatif",
      },
    },
  },
];

const MOCK_ENGAGEMENTS = [
  {
    id: "eng-001",
    operation_id: "op-001",
    beneficiary: "Entreprise Nationale d'Électricité",
    montant_approuve: 500000,
    operation: {
      id: "op-001",
      name: "Infrastructure électrique",
    },
  },
  {
    id: "eng-002",
    operation_id: "op-002",
    beneficiary: "Constructions Algériennes",
    montant_approuve: 350000,
    operation: {
      id: "op-002",
      name: "Projet routier",
    },
  },
  {
    id: "eng-003",
    operation_id: "op-003",
    beneficiary: "Société Hydraulique du Sud",
    montant_approuve: 640000,
    operation: {
      id: "op-003",
      name: "Réseau d'irrigation",
    },
  },
  {
    id: "eng-004",
    operation_id: "op-004",
    beneficiary: "École Nationale Polytechnique",
    montant_approuve: 190000,
    operation: {
      id: "op-004",
      name: "Équipement éducatif",
    },
  },
  {
    id: "eng-005",
    operation_id: "op-005",
    beneficiary: "Hôpital Universitaire d'Alger",
    montant_approuve: 256000,
    operation: {
      id: "op-005",
      name: "Infrastructure sanitaire",
    },
  },
];

const Payments = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("payments");
  const [activePaymentTab, setActivePaymentTab] = useState("all");
  const [activeRequestTab, setActiveRequestTab] = useState("all");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogType, setPaymentDialogType] = useState<"add" | "edit" | "view" | "delete">("add");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestDialogType, setRequestDialogType] = useState<"add" | "edit" | "view">("add");
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);

  const {
    data: paymentsDataFromAPI = [],
    isLoading: isLoadingPayments,
    refetch: refetchPayments,
  } = usePayments({
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: requestsDataFromAPI = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = usePaymentRequests({
    staleTime: 1000 * 60 * 5,
  });

  const { data: engagementsDataFromAPI = [], isLoading: isLoadingEngagements } = useEngagements({
    staleTime: 1000 * 60 * 10,
  });

  // Use mock data if API returns empty arrays, otherwise use the real data
  const paymentsData = paymentsDataFromAPI.length > 0 ? paymentsDataFromAPI : MOCK_PAYMENTS;
  const requestsData = requestsDataFromAPI.length > 0 ? requestsDataFromAPI : MOCK_PAYMENT_REQUESTS;
  const engagementsData = engagementsDataFromAPI.length > 0 ? engagementsDataFromAPI : MOCK_ENGAGEMENTS;

  const paymentMutation = usePaymentMutation({
    onSuccess: () => {
      refetchPayments();
      if (paymentDialogType === "add") {
        toast({
          title: t("payments.added.title"),
          description: t("payments.added.description"),
        });
      } else if (paymentDialogType === "edit") {
        toast({
          title: t("payments.edited.title"),
          description: t("payments.edited.description"),
        });
      } else if (paymentDialogType === "delete") {
        toast({
          title: t("payments.deleted.title"),
          description: t("payments.deleted.description"),
        });
      }
      setPaymentDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error with payment mutation:", error);
      toast({
        title: t("common.error.title"),
        description: t("common.error.description"),
        variant: "destructive",
      });
    },
  });

  const paymentRequestMutation = usePaymentRequestMutation({
    onSuccess: () => {
      refetchRequests();
      if (requestDialogType === "add") {
        toast({
          title: t("requests.added.title"),
          description: t("requests.added.description"),
        });
      } else if (requestDialogType === "edit") {
        toast({
          title: t("requests.edited.title"),
          description: t("requests.edited.description"),
        });
      }
      setRequestDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error with payment request mutation:", error);
      toast({
        title: t("common.error.title"),
        description: t("common.error.description"),
        variant: "destructive",
      });
    },
  });

  if (isLoadingPayments || isLoadingRequests || isLoadingEngagements) {
    return <PageLoadingSpinner message={t("payments.loading")} />;
  }

  const formatPayments = (payments: PaymentWithRelations[]): Payment[] => {
    return payments.map((payment) => ({
      id: payment.id,
      engagement_id: payment.engagement_id,
      operation_id: payment.operation_id || payment.engagement?.operation_id || "",
      amount: payment.amount,
      payment_date: payment.payment_date,
      status: payment.status as "pending" | "approved" | "rejected" | "paid" | "draft",
      beneficiary: payment.engagement?.beneficiary || payment.beneficiary || "Unknown",
      description: payment.description || payment.engagement?.operation?.name || "Payment description",
      created_at: payment.created_at || new Date().toISOString(),
    }));
  };

  const formatPaymentRequests = (requests: PaymentRequestWithRelations[]): PaymentRequest[] => {
    return requests.map((request) => ({
      id: request.id,
      engagement_id: request.engagement_id,
      operation_id: request.operation_id || request.engagement?.operation_id || "",
      requested_amount: request.amount,
      requestDate: request.created_at || new Date().toISOString(),
      period: request.period || "",
      frequency: request.frequency as "monthly" | "quarterly" | "annual",
      justification: request.justification || null,
      status: request.status as "draft" | "pending" | "reviewed" | "approved" | "rejected",
      document: request.document || null,
      beneficiary: request.engagement?.beneficiary || request.beneficiary || "Unknown",
      description: request.description || "",
      created_at: request.created_at || new Date().toISOString(),
    }));
  };

  const payments = paymentsData ? formatPayments(paymentsData) : [];
  const paymentRequests = requestsData ? formatPaymentRequests(requestsData) : [];

  const totalPayments = payments.length;
  const totalPaidAmount = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPendingAmount = payments.filter((p) => p.status === "pending" || p.status === "approved").reduce((sum, p) => sum + p.amount, 0);
  const totalRejectedAmount = payments.filter((p) => p.status === "rejected").reduce((sum, p) => sum + p.amount, 0);

  const paymentStatusData = [
    { name: t("payments.status.paid"), value: totalPaidAmount, color: "#10b981" },
    { name: t("payments.status.pending"), value: totalPendingAmount, color: "#f59e0b" },
    { name: t("payments.status.rejected"), value: totalRejectedAmount, color: "#ef4444" },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      ((payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) &&
        payment.beneficiary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      formatCurrency(payment.amount).includes(searchQuery);

    if (activePaymentTab === "all") return matchesSearch;
    return payment.status === activePaymentTab && matchesSearch;
  });

  const filteredRequests = paymentRequests.filter((request) => {
    const matchesSearch =
      ((request.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) &&
        request.beneficiary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      formatCurrency(request.requested_amount).includes(searchQuery);

    if (activeRequestTab === "all") return matchesSearch;
    if (activeRequestTab === "pending") return (request.status === "pending_officer" || request.status === "pending_accountant") && matchesSearch;
    return request.status === activeRequestTab && matchesSearch;
  });

  const handleAddNewPayment = () => {
    setPaymentDialogType("add");
    setSelectedPayment(null);
    setPaymentDialogOpen(true);
  };

  const handleViewPayment = (payment: Payment) => {
    setPaymentDialogType("view");
    setSelectedPayment(payment);
    setPaymentDialogOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setPaymentDialogType("edit");
    setSelectedPayment(payment);
    setPaymentDialogOpen(true);
  };

  const handleDeletePayment = (payment: Payment) => {
    setPaymentDialogType("delete");
    setSelectedPayment(payment);
    setPaymentDialogOpen(true);
  };

  const handleAddNewRequest = () => {
    setRequestDialogType("add");
    setSelectedRequest(null);
    setRequestDialogOpen(true);
  };

  const handleViewRequest = (request: PaymentRequest) => {
    setRequestDialogType("view");
    setSelectedRequest(request);
    setRequestDialogOpen(true);
  };

  const handleEditRequest = (request: PaymentRequest) => {
    setRequestDialogType("edit");
    setSelectedRequest(request);
    setRequestDialogOpen(true);
  };

  const handleDeleteRequest = (request: PaymentRequest) => {
    paymentRequestMutation.mutate({
      type: "DELETE",
      id: request.id,
    });
  };

  const handleApproveRequest = (request: PaymentRequest) => {
    paymentRequestMutation.mutate({
      type: "UPDATE",
      id: request.id,
      data: {
        status: "approved",
        approved_date: new Date().toISOString(),
      },
    });
  };

  const handleRejectRequest = (request: PaymentRequest) => {
    paymentRequestMutation.mutate({
      type: "UPDATE",
      id: request.id,
      data: {
        status: "rejected",
      },
    });
  };

  const handleSavePayment = async (paymentData: Partial<Payment>) => {
    try {
      if (paymentDialogType === "add") {
        await paymentMutation.mutateAsync({
          type: "INSERT",
          data: paymentData,
        });
      } else if (paymentDialogType === "edit" && selectedPayment) {
        await paymentMutation.mutateAsync({
          type: "UPDATE",
          id: selectedPayment.id,
          data: paymentData,
        });
      } else if (paymentDialogType === "delete" && selectedPayment) {
        await paymentMutation.mutateAsync({
          type: "DELETE",
          id: selectedPayment.id,
        });
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        title: t("common.error.title"),
        description: t("common.error.description"),
        variant: "destructive",
      });
    }
  };

  const handleSaveRequest = async (requestData: Partial<PaymentRequest>) => {
    try {
      if (requestDialogType === "add") {
        await paymentRequestMutation.mutateAsync({
          type: "INSERT",
          data: requestData,
        });
      } else if (requestDialogType === "edit" && selectedRequest) {
        await paymentRequestMutation.mutateAsync({
          type: "UPDATE",
          id: selectedRequest.id,
          data: requestData,
        });
      }
    } catch (error) {
      console.error("Error saving payment request:", error);
      toast({
        title: t("common.error.title"),
        description: t("common.error.description"),
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-400">
            {t("status.pending")}
          </Badge>
        );
      case "pending_officer":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 border-orange-400">
            {t("status.pendingOfficer")}
          </Badge>
        );
      case "pending_accountant":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-400">
            {t("status.pendingAccountant")}
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-400">
            {t("status.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-400">
            {t("status.rejected")}
          </Badge>
        );
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-400">
            {t("status.paid")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("status.unknown")}</Badge>;
    }
  };

  const engagements = engagementsData
    ? engagementsData.map((eng) => ({
        id: eng.id,
        ref: eng.operation?.name || "N/A",
        operation: eng.operation?.name || "N/A",
        beneficiary: eng.beneficiary,
        budget: eng.montant_approuve || 0,
        allocated: eng.montant_approuve ? eng.montant_approuve / 2 : 0,
      }))
    : [];

  const loading = isLoadingPayments || isLoadingRequests || isLoadingEngagements;

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
        <span className="ml-4 text-lg text-muted-foreground">{t("payments.loading")}</span>
      </div>
    );
  }

  return (
    <Dashboard>
      <DashboardHeader
        title={t("payments.title")}
        description={t("payments.description")}
      />
      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title={t("payments.stats.total")}
            value={formatCurrency(totalPaidAmount + totalPendingAmount + totalRejectedAmount)}
            description={t("payments.stats.transactions", { count: totalPayments })}
            icon={<ArrowRightLeft className="h-4 w-4" />}
          />
          <StatCard
            title={t("payments.stats.amountPaid")}
            value={formatCurrency(totalPaidAmount)}
            description={t("payments.stats.completed")}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title={t("payments.stats.amountPending")}
            value={formatCurrency(totalPendingAmount)}
            description={t("payments.stats.pending")}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title={t("payments.stats.amountRejected")}
            value={formatCurrency(totalRejectedAmount)}
            description={t("payments.stats.rejected")}
            icon={<X className="h-4 w-4" />}
          />
        </DashboardGrid>
      </DashboardSection>
      <DashboardSection>
        <PaymentStats formatCurrency={formatCurrency} />
      </DashboardSection>

      <DashboardSection>
        <DashboardGrid columns={2}>
          <BudgetChart
            title={t("payments.chart.title")}
            data={paymentStatusData}
            className="h-full"
          />
          <Card className="budget-card h-full">
            <CardHeader>
              <CardTitle className="text-base font-medium">{t("payments.recentActivity.title")}</CardTitle>
              <CardDescription>{t("payments.recentActivity.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {payments.slice(0, 4).map((payment, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        payment.status === "paid"
                          ? "bg-green-100 text-green-600"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : payment.status === "approved"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      )}>
                      {payment.status === "paid" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : payment.status === "pending" ? (
                        <Clock className="h-5 w-5" />
                      ) : payment.status === "approved" ? (
                        <FileCheck className="h-5 w-5" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">{payment.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(payment.payment_date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{payment.beneficiary.slice(0, 15)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center">
                {t("payments.recentActivity.viewAll")}
              </Button>
            </CardFooter>
          </Card>
        </DashboardGrid>
      </DashboardSection>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("paymentsAndRequests.title")}</CardTitle>
              <CardDescription>{t("paymentsAndRequests.description")}</CardDescription>
            </div>
            <div className="flex gap-2">
              {activeTab === "payments" && (
                <Button
                  onClick={handleAddNewPayment}
                  size="sm">
                  {t("payments.add")}
                </Button>
              )}
              {activeTab === "requests" && (
                <Button
                  onClick={handleAddNewRequest}
                  size="sm">
                  {t("requests.submit")}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-auto">
              <TabsList className="grid grid-cols-2 w-[320px]">
                <TabsTrigger value="payments">{t("payments.tab")}</TabsTrigger>
                <TabsTrigger value="requests">{t("requests.tab")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === "payments" && (
            <>
              <div className="flex justify-end mb-4">
                <Tabs
                  value={activePaymentTab}
                  onValueChange={setActivePaymentTab}
                  className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
                    <TabsTrigger value="pending">{t("status.pending")}</TabsTrigger>
                    <TabsTrigger value="approved">{t("status.approved")}</TabsTrigger>
                    <TabsTrigger value="rejected">{t("status.rejected")}</TabsTrigger>
                    <TabsTrigger value="paid">{t("status.paid")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <PaymentTable
                payments={filteredPayments}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                onView={handleViewPayment}
                onEdit={handleEditPayment}
                onDelete={handleDeletePayment}
              />
              <div className="mt-4 text-sm text-muted-foreground">
                {t("payments.displaying", { count: filteredPayments.length, total: payments.length })}
              </div>
            </>
          )}

          {activeTab === "requests" && (
            <>
              <div className="flex justify-end mb-4">
                <Tabs
                  value={activeRequestTab}
                  onValueChange={setActiveRequestTab}
                  className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
                    <TabsTrigger value="pending">{t("status.pending")}</TabsTrigger>
                    <TabsTrigger value="approved">{t("status.approved")}</TabsTrigger>
                    <TabsTrigger value="rejected">{t("status.rejected")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <PaymentRequestTable
                paymentRequests={filteredRequests}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                onView={handleViewRequest}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
                showApprovalActions={true}
                onRefresh={refetchRequests}
              />
              <div className="mt-4 text-sm text-muted-foreground">
                {t("requests.displaying", { count: filteredRequests.length, total: paymentRequests.length })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {paymentDialogOpen && (
        <PaymentDialog
          type={paymentDialogType}
          payment={selectedPayment}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onSave={handleSavePayment}
          onDelete={() => handleSavePayment({})}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          engagements={engagements}
          getStatusBadge={getStatusBadge}
        />
      )}

      {requestDialogOpen && (
        <PaymentRequestDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          onSave={handleSaveRequest}
          type={requestDialogType}
          request={selectedRequest}
          engagements={engagements}
          formatCurrency={formatCurrency}
        />
      )}
    </Dashboard>
  );
};

export default Payments;
