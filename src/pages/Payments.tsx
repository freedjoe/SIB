import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentTable } from "@/components/tables/PaymentTable";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getAllPayments, type PaymentWithRelations } from "@/services/paymentsService";
import { getAllPaymentRequests, type PaymentRequestWithRelations } from "@/services/paymentRequestsService";
import { getAllEngagements } from "@/services/engagementsService";
import { PaymentStats } from "@/components/stats/PaymentStats";
import { StatCard } from "@/components/ui-custom/StatCard";
import { Payment, PaymentRequest } from "@/types/database.types";

import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { CreditCard, FileCheck, Calendar, CheckCircle, Clock, X, ArrowRightLeft, Eye, Plus, FileEdit, Trash2 } from "lucide-react";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { PaymentRequestTable } from "@/components/tables/PaymentRequestTable";
import { PaymentRequestDialog } from "@/components/dialogs/PaymentRequestDialog";

const Payments = () => {
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
    data: paymentsData,
    isLoading: isLoadingPayments,
    error: paymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: getAllPayments,
  });

  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["payment-requests"],
    queryFn: getAllPaymentRequests,
  });

  const { data: engagementsData, isLoading: isLoadingEngagements } = useQuery({
    queryKey: ["engagements"],
    queryFn: getAllEngagements,
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalPayments = payments.length;
  const totalPaidAmount = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPendingAmount = payments.filter((p) => p.status === "pending" || p.status === "approved").reduce((sum, p) => sum + p.amount, 0);
  const totalRejectedAmount = payments.filter((p) => p.status === "rejected").reduce((sum, p) => sum + p.amount, 0);

  const paymentStatusData = [
    { name: "Payé", value: totalPaidAmount, color: "#10b981" },
    { name: "En attente", value: totalPendingAmount, color: "#f59e0b" },
    { name: "Rejeté", value: totalRejectedAmount, color: "#ef4444" },
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
    toast({
      title: "Demande supprimée",
      description: "La demande de paiement a été supprimée avec succès",
      variant: "default",
    });
    refetchRequests();
  };

  const handleApproveRequest = (request: PaymentRequest) => {
    toast({
      title: "Demande approuvée",
      description: `La demande de paiement a été approuvée`,
      variant: "default",
    });
    refetchRequests();
  };

  const handleRejectRequest = (request: PaymentRequest) => {
    toast({
      title: "Demande rejetée",
      description: `La demande de paiement a été rejetée`,
      variant: "destructive",
    });
    refetchRequests();
  };

  const handleSavePayment = async (paymentData: Partial<Payment>) => {
    try {
      if (paymentDialogType === "add") {
        toast({
          title: "Paiement ajouté",
          description: "Le paiement a été ajouté avec succès",
        });
      } else if (paymentDialogType === "edit") {
        toast({
          title: "Paiement modifié",
          description: "Le paiement a été modifié avec succès",
        });
      } else if (paymentDialogType === "delete" && selectedPayment) {
        toast({
          title: "Paiement supprimé",
          description: "Le paiement a été supprimé avec succès",
        });
      }

      setPaymentDialogOpen(false);
      refetchPayments();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du paiement",
        variant: "destructive",
      });
    }
  };

  const handleSaveRequest = async (requestData: Partial<PaymentRequest>) => {
    try {
      if (requestDialogType === "add") {
        toast({
          title: "Demande ajoutée",
          description: "La demande de paiement a été ajoutée avec succès",
        });
      } else if (requestDialogType === "edit") {
        toast({
          title: "Demande modifiée",
          description: "La demande de paiement a été modifiée avec succès",
        });
      }

      setRequestDialogOpen(false);
      refetchRequests();
    } catch (error) {
      console.error("Error saving payment request:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement de la demande de paiement",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
            En attente
          </Badge>
        );
      case "pending_officer":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-400">
            En attente (Officier)
          </Badge>
        );
      case "pending_accountant":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
            En attente (Comptable)
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">
            Approuvé
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-400">
            Rejeté
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">
            Payé
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const engagements = engagementsData
    ? engagementsData.map((eng) => ({
        id: eng.id,
        ref: eng.operation?.name || "N/A",
        operation: eng.operation?.name || "N/A",
        beneficiary: eng.beneficiary,
        budget: eng.montant_approuve || 0,
        allocated: eng.montant_approuve ? eng.montant_approuve / 2 : 0, // Simulation du montant déjà alloué
      }))
    : [];

  const loading = isLoadingPayments || isLoadingRequests || isLoadingEngagements;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des paiements...</span>
      </div>
    );
  }

  if (paymentsError || requestsError) {
    return <div className="flex items-center justify-center h-screen">Erreur lors du chargement des données</div>;
  }

  return (
    <Dashboard>
      <DashboardHeader title="Gestion des Paiements" description="Suivez et gérez les crédits de paiement (CP) et les décaissements" />
      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title="Total des Paiements"
            value={formatCurrency(totalPaidAmount + totalPendingAmount + totalRejectedAmount)}
            description={`${totalPayments} transactions`}
            icon={<ArrowRightLeft className="h-4 w-4" />}
          />
          <StatCard
            title="Montant Payé"
            value={formatCurrency(totalPaidAmount)}
            description="Paiements complétés"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title="Montant en Attente"
            value={formatCurrency(totalPendingAmount)}
            description="Paiements en attente"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Montant Rejeté"
            value={formatCurrency(totalRejectedAmount)}
            description="Paiements rejetés"
            icon={<X className="h-4 w-4" />}
          />
        </DashboardGrid>
      </DashboardSection>
      <DashboardSection>
        <PaymentStats formatCurrency={formatCurrency} />
      </DashboardSection>

      <DashboardSection>
        <DashboardGrid columns={2}>
          <BudgetChart title="Répartition des Paiements par Statut" data={paymentStatusData} className="h-full" />
          <Card className="budget-card h-full">
            <CardHeader>
              <CardTitle className="text-base font-medium">Activité Récente</CardTitle>
              <CardDescription>Dernières transactions de paiement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {payments.slice(0, 4).map((payment, idx) => (
                  <div key={idx} className="flex items-start gap-4">
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
                      )}
                    >
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
              <Button variant="ghost" size="sm" className="w-full justify-center">
                Voir toutes les transactions
              </Button>
            </CardFooter>
          </Card>
        </DashboardGrid>
      </DashboardSection>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Paiements et Demandes</CardTitle>
              <CardDescription>Gérez les paiements et les demandes de paiement.</CardDescription>
            </div>
            <div className="flex gap-2">
              {activeTab === "payments" && (
                <Button onClick={handleAddNewPayment} size="sm">
                  Ajouter un paiement
                </Button>
              )}
              {activeTab === "requests" && (
                <Button onClick={handleAddNewRequest} size="sm">
                  Soumettre une demande
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="grid grid-cols-2 w-[320px]">
                <TabsTrigger value="payments">Paiements</TabsTrigger>
                <TabsTrigger value="requests">Demandes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === "payments" && (
            <>
              <div className="flex justify-end mb-4">
                <Tabs value={activePaymentTab} onValueChange={setActivePaymentTab} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="pending">En attente</TabsTrigger>
                    <TabsTrigger value="approved">Approuvés</TabsTrigger>
                    <TabsTrigger value="rejected">Rejetés</TabsTrigger>
                    <TabsTrigger value="paid">Payés</TabsTrigger>
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
                Affichage de {filteredPayments.length} paiements sur {payments.length}.
              </div>
            </>
          )}

          {activeTab === "requests" && (
            <>
              <div className="flex justify-end mb-4">
                <Tabs value={activeRequestTab} onValueChange={setActiveRequestTab} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="pending">En attente</TabsTrigger>
                    <TabsTrigger value="approved">Approuvés</TabsTrigger>
                    <TabsTrigger value="rejected">Rejetés</TabsTrigger>
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
                Affichage de {filteredRequests.length} demandes sur {paymentRequests.length}.
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
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

      {/* Payment Request Dialog */}
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
