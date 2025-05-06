import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditPayment } from "@/pages/CreditPayments";
import { Eye, Edit, Trash2, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreditPaymentTableProps {
  creditPayments: CreditPayment[];
  formatCurrency: (value: number | undefined | null) => string;
  formatDate: (date: string | undefined | null) => string;
  onView: (creditPayment: CreditPayment) => void;
  onEdit: (creditPayment: CreditPayment) => void;
  onDelete: (creditPayment: CreditPayment) => void;
  onApprove?: (creditPayment: CreditPayment) => void;
  onReject?: (creditPayment: CreditPayment) => void;
}

export function CreditPaymentTable({
  creditPayments,
  formatCurrency,
  formatDate,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: CreditPaymentTableProps) {
  const { t } = useTranslation();

  // Function to render status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">{t("creditPayments.status.draft") || "Brouillon"}</Badge>;
      case "submitted":
        return <Badge variant="warning">{t("creditPayments.status.submitted") || "Soumis"}</Badge>;
      case "reviewed":
        return <Badge variant="secondary">{t("creditPayments.status.reviewed") || "En revue"}</Badge>;
      case "approved":
        return <Badge className="bg-green-500">{t("creditPayments.status.approved") || "Approuvé"}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{t("creditPayments.status.rejected") || "Rejeté"}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("creditPayments.table.code") || "Code"}</TableHead>
            <TableHead>{t("creditPayments.table.operation") || "Opération"}</TableHead>
            <TableHead className="text-right">{t("creditPayments.table.amount") || "Montant"}</TableHead>
            <TableHead>{t("creditPayments.table.fiscalYear") || "Année Fiscale"}</TableHead>
            <TableHead>{t("creditPayments.table.status") || "Statut"}</TableHead>
            <TableHead>{t("creditPayments.table.createdAt") || "Date de création"}</TableHead>
            <TableHead className="text-right">{t("creditPayments.table.actions") || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditPayments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-10">
                {t("creditPayments.noPayments") || "Aucun paiement de crédit trouvé"}
              </TableCell>
            </TableRow>
          ) : (
            creditPayments.map((payment) => (
              <TableRow
                key={payment.id}
                className="group">
                <TableCell className="font-medium">{payment.code}</TableCell>
                <TableCell>{payment.operation?.title || t("creditPayments.unknownOperation") || "Opération inconnue"}</TableCell>
                <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{payment.fiscal_year?.year || t("creditPayments.unknownYear") || "Année inconnue"}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell>{formatDate(payment.created_at)}</TableCell>
                <TableCell>
                  <div className="flex justify-end items-center gap-1 opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(payment)}
                      title={t("common.viewDetails") || "Voir les détails"}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(payment)}
                      title={t("common.edit") || "Modifier"}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(payment)}
                      title={t("common.delete") || "Supprimer"}>
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Conditionally render approve/reject buttons based on status and provided handlers */}
                    {payment.status === "submitted" && onApprove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApprove(payment)}
                        title={t("common.approve") || "Approuver"}
                        className="text-green-600 hover:text-green-700">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {payment.status === "submitted" && onReject && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReject(payment)}
                        title={t("common.reject") || "Rejeter"}
                        className="text-red-600 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
