import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getAllPaymentRequests, type PaymentRequestWithRelations } from "@/services/paymentRequestsService";
import { getAllEngagements } from "@/services/engagementsService";
import { PaymentRequestTable } from "@/components/tables/PaymentRequestTable";
import { PaymentRequestDialog } from "@/components/dialogs/PaymentRequestDialog";
import { Dashboard, DashboardHeader, DashboardSection } from "@/components/layout/Dashboard";
import { PaymentStats } from "@/components/stats/PaymentStats";
import { formatCurrency } from "@/lib/utils";

type FormattedPaymentRequest = {
  id: string;
  engagementId: string;
  engagementRef: string;
  programName: string;
  operationName: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
  startDate: string;
  requestDate: string;
  approvedDate: string | null;
  status: "pending_officer" | "pending_accountant" | "approved" | "rejected";
  requestedBy: string;
  beneficiary: string;
  description: string;
};

const PaymentRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "view">("add");
  const [selectedRequest, setSelectedRequest] = useState<FormattedPaymentRequest | null>(null);

  const {
    data: requestsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payment-requests"],
    queryFn: getAllPaymentRequests,
  });

  const { data: engagementsData, isLoading: isLoadingEngagements } = useQuery({
    queryKey: ["engagements"],
    queryFn: getAllEngagements,
  });

  const formatPaymentRequests = (requests: PaymentRequestWithRelations[]): FormattedPaymentRequest[] => {
    return requests.map((request) => ({
      id: request.id,
      engagementId: request.engagement_id,
      engagementRef: request.engagement?.operation?.name || "Unknown",
      programName: request.engagement?.operation?.action?.program?.name || "Unknown",
      operationName: request.engagement?.operation?.name || "Unknown",
      amount: request.amount,
      frequency: request.frequency as "monthly" | "quarterly" | "annual",
      startDate: request.start_date || "",
      requestDate: request.created_at || new Date().toISOString(),
      approvedDate: request.approved_date || null,
      status: request.status as "pending_officer" | "pending_accountant" | "approved" | "rejected",
      requestedBy: request.requested_by,
      beneficiary: request.engagement?.beneficiary || "Unknown",
      description: request.description || "",
    }));
  };

  const paymentRequests = requestsData ? formatPaymentRequests(requestsData) : [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const filteredRequests = paymentRequests.filter((request) => {
    const matchesSearch =
      request.operationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.beneficiary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatCurrency(request.amount).includes(searchQuery);

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return (request.status === "pending_officer" || request.status === "pending_accountant") && matchesSearch;
    return request.status === activeTab && matchesSearch;
  });

  const handleAddNewRequest = () => {
    setDialogType("add");
    setSelectedRequest(null);
    setDialogOpen(true);
  };

  const handleViewRequest = (request: FormattedPaymentRequest) => {
    setDialogType("view");
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleEditRequest = (request: FormattedPaymentRequest) => {
    setDialogType("edit");
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleDeleteRequest = (request: FormattedPaymentRequest) => {
    // Implement deletion logic here
    toast({
      title: "Demande supprimée",
      description: "La demande de paiement a été supprimée avec succès",
    });
    refetch();
  };

  const handleApproveRequest = (request: FormattedPaymentRequest) => {
    // Implement approval logic here
    toast({
      title: "Demande approuvée",
      description: `La demande de paiement ${request.operationName} a été approuvée`,
    });
    refetch();
  };

  const handleRejectRequest = (request: FormattedPaymentRequest) => {
    // Implement rejection logic here
    toast({
      title: "Demande rejetée",
      description: `La demande de paiement ${request.operationName} a été rejetée`,
      variant: "destructive",
    });
    refetch();
  };

  const handleSaveRequest = async (requestData: Partial<FormattedPaymentRequest>) => {
    try {
      if (dialogType === "add") {
        // Logic for adding request would go here
        toast({
          title: "Demande ajoutée",
          description: "La demande de paiement a été ajoutée avec succès",
        });
      } else if (dialogType === "edit") {
        // Logic for editing request would go here
        toast({
          title: "Demande modifiée",
          description: "La demande de paiement a été modifiée avec succès",
        });
      }

      setDialogOpen(false);
      refetch();
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

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement des demandes de paiement...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Erreur lors du chargement des demandes de paiement</div>;
  }

  return (
    <Dashboard>
      <DashboardHeader title="Demandes de Paiement" description="Gérez les demandes de paiement" />

      <DashboardSection title="Tableau de bord des demandes" description="Aperçu des demandes de paiement">
        <PaymentStats formatCurrency={formatCurrency} />
      </DashboardSection>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Demandes de Paiement</CardTitle>
            <CardDescription>Gérez les demandes de paiement pour les différentes opérations.</CardDescription>
          </div>
          <Button onClick={handleAddNewRequest} size="sm">
            Soumettre une demande
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
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
          />
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredRequests.length} demandes sur {paymentRequests.length}.
          </div>
        </CardFooter>
      </Card>

      {/* Payment Request Dialog */}
      {dialogOpen && (
        <PaymentRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveRequest}
          type={dialogType}
          request={selectedRequest}
          engagements={engagements}
          formatCurrency={formatCurrency}
        />
      )}
    </Dashboard>
  );
};

export default PaymentRequests;
