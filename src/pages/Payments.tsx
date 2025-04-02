
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dashboard, DashboardHeader, DashboardSection } from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { PaymentTable } from "@/components/tables/PaymentTable";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getAllPayments, PaymentWithRelations } from "@/services/paymentsService";
import { useQuery } from "@tanstack/react-query";

// Type pour le format attendu par le composant PaymentTable
interface FormattedPayment {
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
}

const Payments = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FormattedPayment | null>(null);
  
  // Utilisation de React Query pour récupérer les données de paiements
  const { data: paymentsData, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments,
  });

  // Formatage des données pour le composant PaymentTable
  const formattedPayments: FormattedPayment[] = paymentsData?.map(payment => ({
    id: payment.id,
    engagementId: payment.engagement_id,
    engagementRef: `ENG-${payment.engagement_id.substring(0, 8).toUpperCase()}`,
    operationId: payment.engagement?.operation_id || "",
    operationName: payment.engagement?.operation?.name || "Non spécifié",
    amount: Number(payment.amount),
    requestDate: payment.created_at || new Date().toISOString(),
    paymentDate: payment.payment_date,
    status: payment.status as "pending" | "approved" | "rejected" | "paid",
    beneficiary: payment.engagement?.beneficiary || "Non spécifié",
    description: `Paiement pour ${payment.engagement?.beneficiary || "bénéficiaire non spécifié"}`
  })) || [];

  // Fonction pour formater la devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">{t("Paid")}</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{t("Pending")}</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{t("Approved")}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{t("Rejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Fonctions pour gérer les actions sur les paiements
  const handleView = (payment: FormattedPayment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const handleEdit = (payment: FormattedPayment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const handleDelete = (payment: FormattedPayment) => {
    toast.warning(t("Delete confirmation"), {
      description: t("Are you sure you want to delete this payment?"),
      action: {
        label: t("Delete"),
        onClick: () => {
          toast.success(t("Payment deleted"), {
            description: t("The payment has been successfully deleted.")
          });
        }
      }
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleSavePayment = (paymentData: any) => {
    toast.success(t("Payment saved"), {
      description: t("The payment has been successfully saved.")
    });
    setIsDialogOpen(false);
    setSelectedPayment(null);
  };

  if (isLoading) {
    return (
      <Dashboard>
        <DashboardHeader title={t("Payments")} />
        <div className="flex items-center justify-center min-h-[400px]">
          <p>{t("Loading payments...")}</p>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard>
        <DashboardHeader title={t("Payments")} />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-500">{t("Error loading payments. Please try again.")}</p>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <DashboardHeader title={t("Payments")}>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("New Payment")}
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle>{t("Payment Statistics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Total Payments")}</p>
                <p className="text-2xl font-semibold">{formattedPayments.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Total Amount")}</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(formattedPayments.reduce((sum, payment) => sum + payment.amount, 0))}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Paid Payments")}</p>
                <p className="text-2xl font-semibold">
                  {formattedPayments.filter(p => p.status === "paid").length}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Pending Payments")}</p>
                <p className="text-2xl font-semibold">
                  {formattedPayments.filter(p => p.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardSection>

      <DashboardSection>
        <PaymentTable
          payments={formattedPayments}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </DashboardSection>

      <PaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedPayment}
        onSave={handleSavePayment}
        onClose={handleDialogClose}
      />
    </Dashboard>
  );
};

export default Payments;
