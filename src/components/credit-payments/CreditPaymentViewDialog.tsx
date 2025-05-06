import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditPayment, Operation, FiscalYear } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CreditPaymentViewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  creditPayment: CreditPayment | null;
  operationsData: Operation[];
  fiscalYearsData: FiscalYear[];
  onEdit?: (creditPayment: CreditPayment) => void;
}

export function CreditPaymentViewDialog({ isOpen, setIsOpen, creditPayment, operationsData, fiscalYearsData, onEdit }: CreditPaymentViewDialogProps) {
  if (!creditPayment) {
    return null;
  }

  // Helper function to get operation name by ID
  const getOperationName = (id: string) => {
    const operation = operationsData.find((op) => op.id === id);
    return operation ? operation.name : "Opération inconnue";
  };

  // Helper function to get fiscal year by ID
  const getFiscalYearName = (id: string) => {
    const year = fiscalYearsData.find((fy) => fy.id === id);
    return year ? year.year.toString() : "Année inconnue";
  };

  // Function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      case "submitted":
        return <Badge variant="warning">Soumis</Badge>;
      case "reviewed":
        return <Badge variant="secondary">En revue</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails du paiement de crédit</DialogTitle>
          <DialogDescription>Informations détaillées sur le paiement de crédit.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="font-semibold">Code:</div>
            <div>{creditPayment.code}</div>

            <div className="font-semibold">Opération:</div>
            <div>{getOperationName(creditPayment.operation_id)}</div>

            <div className="font-semibold">Année fiscale:</div>
            <div>{getFiscalYearName(creditPayment.fiscal_year_id)}</div>

            <div className="font-semibold">Montant:</div>
            <div>{formatCurrency(creditPayment.amount)}</div>

            <div className="font-semibold">Statut:</div>
            <div>{getStatusBadge(creditPayment.status)}</div>

            <div className="font-semibold col-span-2 pt-2">Description:</div>
            <div className="col-span-2 bg-muted p-2 rounded-md">{creditPayment.description || "Aucune description fournie."}</div>
          </div>
        </div>

        <DialogFooter>
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(creditPayment)}>
              Modifier
            </Button>
          )}
          <Button onClick={() => setIsOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
