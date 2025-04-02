
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentTable } from "@/components/tables/PaymentTable";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getAllPayments, type PaymentWithRelations } from "@/services/paymentsService";

type FormattedPayment = {
  id: string;
  engagementId: string;
  engagementRef: string;
  operationId: string;
  operationName: string;
  amount: number;
  requestDate: string;
  paymentDate: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  beneficiary: string;
  description: string;
};

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "view" | "delete">("add");
  const [selectedPayment, setSelectedPayment] = useState<FormattedPayment | null>(null);

  const { data: paymentsData, isLoading, error, refetch } = useQuery({
    queryKey: ["payments"],
    queryFn: getAllPayments
  });

  const formatPayments = (payments: PaymentWithRelations[]): FormattedPayment[] => {
    return payments.map(payment => ({
      id: payment.id,
      engagementId: payment.engagement_id,
      engagementRef: payment.engagement?.operation?.name || "Unknown",
      operationId: payment.engagement?.operation_id || "",
      operationName: payment.engagement?.operation?.name || "Unknown",
      amount: payment.amount,
      requestDate: payment.created_at || new Date().toISOString(),
      paymentDate: payment.payment_date,
      status: payment.status as "pending" | "approved" | "rejected" | "paid",
      beneficiary: payment.engagement?.beneficiary || "Unknown",
      description: payment.engagement?.operation?.name || "Payment description"
    }));
  };

  const payments = paymentsData ? formatPayments(paymentsData) : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { 
      style: 'currency', 
      currency: 'DZD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.operationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.beneficiary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatCurrency(payment.amount).includes(searchQuery);
      
    if (activeTab === "all") return matchesSearch;
    return payment.status === activeTab && matchesSearch;
  });

  const handleAddNewClick = () => {
    setDialogType("add");
    setSelectedPayment(null);
    setDialogOpen(true);
  };

  const handleViewPayment = (payment: FormattedPayment) => {
    setDialogType("view");
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleEditPayment = (payment: FormattedPayment) => {
    setDialogType("edit");
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleDeletePayment = (payment: FormattedPayment) => {
    setDialogType("delete");
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleSavePayment = async (paymentData: Partial<FormattedPayment>) => {
    try {
      if (dialogType === "add") {
        // Logic for adding payment would go here
        toast({
          title: "Paiement ajouté",
          description: "Le paiement a été ajouté avec succès"
        });
      } else if (dialogType === "edit") {
        // Logic for editing payment would go here
        toast({
          title: "Paiement modifié",
          description: "Le paiement a été modifié avec succès"
        });
      } else if (dialogType === "delete" && selectedPayment) {
        // Logic for deleting payment would go here
        toast({
          title: "Paiement supprimé",
          description: "Le paiement a été supprimé avec succès"
        });
      }

      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du paiement",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">En attente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-400">Rejeté</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">Payé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Mock engagements for the dialog
  const mockEngagements = [
    { id: "eng1", ref: "ENG-001", operation: "Construction École Koné", beneficiary: "Entreprise ABC Construction" },
    { id: "eng2", ref: "ENG-002", operation: "Réhabilitation École Tizi", beneficiary: "Entreprise XYZ Rénovation" },
    { id: "eng3", ref: "ENG-003", operation: "Achat Équipements Médicaux", beneficiary: "MedEquip International" }
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement des paiements...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Erreur lors du chargement des paiements</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
        <Button onClick={handleAddNewClick} size="sm">Ajouter un paiement</Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Paiements</CardTitle>
          <CardDescription>
            Gérez les paiements liés aux engagements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
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
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredPayments.length} paiements sur {payments.length}.
          </div>
        </CardFooter>
      </Card>

      {/* Payment Dialog */}
      {dialogOpen && (
        <PaymentDialog
          type={dialogType}
          payment={selectedPayment}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSavePayment}
          onDelete={() => handleSavePayment({})}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          engagements={mockEngagements}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
};

export default Payments;
