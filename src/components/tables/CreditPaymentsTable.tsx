import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, RefreshCw, Check, X } from "lucide-react";
import { CreditPayment, Operation } from "@/types/database.types";
import { CreditPaymentWithRelations } from "@/types/credit_payments";

interface CreditPaymentsTableProps {
  creditPayments: CreditPaymentWithRelations[];
  operations?: Operation[];
  formatCurrency: (value: number | undefined | null) => string;
  formatDate?: (date: string | undefined | null) => string;
  onView: (creditPayment: CreditPaymentWithRelations) => void;
  onEdit: (creditPayment: CreditPaymentWithRelations) => void;
  onDelete: (creditPayment: CreditPaymentWithRelations) => void;
  onApprove?: (creditPayment: CreditPaymentWithRelations) => void;
  onReject?: (creditPayment: CreditPaymentWithRelations) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function CreditPaymentsTable({
  creditPayments,
  operations = [],
  formatCurrency,
  formatDate = (date) => date || "",
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRefresh,
  onAddNew,
}: CreditPaymentsTableProps) {
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

  // Find operation name from operations list
  const getOperationName = (operationId: string) => {
    const operation = operations.find((op) => op.id === operationId);
    return operation ? operation.name : creditPayments.find((cp) => cp.operation_id === operationId)?.operation?.title || "Opération inconnue";
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        {onAddNew && (
          <Button variant="default" size="sm" onClick={onAddNew}>
            <Eye className="mr-2 h-4 w-4" /> Ajouter un crédit de paiement
          </Button>
        )}
        {onRefresh && (
          <Button variant="outline" size="sm" className={onAddNew ? "" : "ml-auto"} onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Actualiser
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Opération</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creditPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Aucun paiement de crédit trouvé.
                </TableCell>
              </TableRow>
            ) : (
              creditPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.code}</TableCell>
                  <TableCell>{payment.operation?.title || getOperationName(payment.operation_id)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(payment)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {onApprove && payment.status === "submitted" && (
                        <Button variant="ghost" size="icon" onClick={() => onApprove(payment)}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {onReject && payment.status === "submitted" && (
                        <Button variant="ghost" size="icon" onClick={() => onReject(payment)}>
                          <X className="h-4 w-4 text-red-500" />
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
    </div>
  );
}
