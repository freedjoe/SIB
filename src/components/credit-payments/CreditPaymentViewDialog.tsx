import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditPayment } from "@/pages/CreditPayments";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { CalendarIcon, FileText, Landmark, Tag } from "lucide-react";

interface CreditPaymentViewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  creditPayment: CreditPayment;
  operationsData: Array<{ id: string; title: string; code: string }>;
  fiscalYearsData: Array<{ id: string; year: number }>;
  onEdit?: (creditPayment: CreditPayment) => void;
}

export function CreditPaymentViewDialog({ isOpen, setIsOpen, creditPayment, operationsData, fiscalYearsData, onEdit }: CreditPaymentViewDialogProps) {
  const { t } = useTranslation();

  const getOperationName = (operationId: string): string => {
    const operation = operationsData.find((op) => op.id === operationId);
    return operation?.title || creditPayment.operation?.title || t("creditPayments.unknownOperation") || "Opération inconnue";
  };

  const getFiscalYearName = (fiscalYearId: string): string => {
    const fiscalYear = fiscalYearsData.find((fy) => fy.id === fiscalYearId);
    return fiscalYear?.year?.toString() || creditPayment.fiscal_year?.year?.toString() || t("creditPayments.unknownYear") || "Année inconnue";
  };

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t("creditPayments.viewDialogTitle") || "Détails du crédit de paiement"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {/* Payment information in a card-like design */}
          <div className="bg-muted/40 rounded-lg p-4 space-y-6">
            {/* Header section with code and status */}
            <div className="flex justify-between items-center border-b pb-3">
              <div className="font-semibold text-lg">{creditPayment.code}</div>
              <div>{getStatusBadge(creditPayment.status)}</div>
            </div>

            {/* Main info section */}
            <div className="space-y-4">
              {/* Operation info */}
              <div className="flex items-start gap-3">
                <Landmark className="h-5 w-5 mt-1 text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="font-medium">{t("creditPayments.operation") || "Opération"}</h3>
                  <div className="text-sm bg-muted/60 p-2 rounded-md">
                    <p className="font-semibold">{getOperationName(creditPayment.operation_id)}</p>
                    <p className="text-xs text-muted-foreground">{creditPayment.operation?.code}</p>
                  </div>
                </div>
              </div>

              {/* Fiscal info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-sm">{t("creditPayments.fiscalYear") || "Année Fiscale"}</h3>
                    <p>{getFiscalYearName(creditPayment.fiscal_year_id)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-semibold text-lg bg-green-50 text-green-700 py-1 px-2 rounded-md w-full text-right">
                    {formatCurrency(creditPayment.amount)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                <div className="space-y-1 w-full">
                  <h3 className="font-medium">{t("creditPayments.description") || "Description"}</h3>
                  <div className="bg-muted/60 p-3 rounded-md min-h-[80px] w-full">
                    {creditPayment.description || (
                      <span className="text-muted-foreground italic">{t("creditPayments.noDescription") || "Aucune description fournie"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates info */}
            <div className="border-t pt-3 flex justify-between text-sm text-muted-foreground">
              <div>
                {t("creditPayments.createdAt") || "Créé le"}: {formatDate(creditPayment.created_at)}
              </div>
              <div>
                {t("creditPayments.updatedAt") || "Mis à jour le"}: {formatDate(creditPayment.updated_at)}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          {onEdit && creditPayment.status !== "approved" && (
            <Button
              variant="outline"
              onClick={() => onEdit(creditPayment)}>
              {t("common.edit") || "Modifier"}
            </Button>
          )}
          <Button onClick={() => setIsOpen(false)}>{t("common.close") || "Fermer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
