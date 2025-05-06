import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { CreditPayment } from "@/pages/CreditPayments";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreditPaymentApproveDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  creditPayment: CreditPayment;
  onApprove: () => void;
  onReject: () => void;
}

export function CreditPaymentApproveDialog({ isOpen, setIsOpen, creditPayment, onApprove, onReject }: CreditPaymentApproveDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            {t("creditPayments.approveDialogTitle") || "Approbation du paiement de crédit"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">{t("creditPayments.approval.confirmation") || "Confirmation d'approbation"}</AlertTitle>
            <AlertDescription className="text-amber-700">
              {t("creditPayments.approval.confirmationText") ||
                "Voulez-vous approuver ou rejeter ce paiement de crédit? Cette action est irréversible."}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* Payment Summary Card */}
            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              {/* Code & Operation */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{creditPayment.code}</h3>
                  <p className="text-sm text-muted-foreground">
                    {creditPayment.operation?.title || t("creditPayments.unknownOperation") || "Opération inconnue"}
                  </p>
                </div>
                <Badge className="bg-amber-500">{t("creditPayments.status.submitted") || "Soumis"}</Badge>
              </div>

              {/* Amount & Year */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("creditPayments.amount") || "Montant"}</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(creditPayment.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">{t("creditPayments.fiscalYear") || "Année Fiscale"}</p>
                  <p>{creditPayment.fiscal_year?.year || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Action buttons description */}
            <div className="text-sm space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{t("creditPayments.approval.approveAction") || "Approuver: confirme le paiement et permet son traitement."}</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-500" />
                <span>{t("creditPayments.approval.rejectAction") || "Rejeter: refuse le paiement et le renvoie pour révision."}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between space-x-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1">
            {t("common.cancel") || "Annuler"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onReject();
              setIsOpen(false);
            }}
            className="flex-1">
            <X className="h-4 w-4 mr-1" />
            {t("common.reject") || "Rejeter"}
          </Button>
          <Button
            onClick={() => {
              onApprove();
              setIsOpen(false);
            }}
            className="flex-1 bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-1" />
            {t("common.approve") || "Approuver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
