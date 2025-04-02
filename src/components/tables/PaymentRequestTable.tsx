
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Trash2, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PaymentRequest {
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
}

interface PaymentRequestTableProps {
  paymentRequests: PaymentRequest[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | null) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  onView: (request: PaymentRequest) => void;
  onEdit?: (request: PaymentRequest) => void;
  onDelete?: (request: PaymentRequest) => void;
  onApprove?: (request: PaymentRequest) => void;
  onReject?: (request: PaymentRequest) => void;
  showApprovalActions?: boolean;
}

export function PaymentRequestTable({
  paymentRequests,
  formatCurrency,
  formatDate,
  getStatusBadge,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showApprovalActions = false
}: PaymentRequestTableProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programme</TableHead>
              <TableHead>Opération</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Fréquence</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de demande</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Aucune demande de paiement trouvée
                </TableCell>
              </TableRow>
            ) : (
              paymentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.programName}</TableCell>
                  <TableCell>{request.operationName}</TableCell>
                  <TableCell>{request.beneficiary}</TableCell>
                  <TableCell className="text-right">{formatCurrency(request.amount)}</TableCell>
                  <TableCell>
                    {request.frequency === "monthly" ? "Mensuel" : 
                     request.frequency === "quarterly" ? "Trimestriel" : "Annuel"}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{formatDate(request.requestDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(request)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(request)}
                          title="Modifier"
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(request)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {showApprovalActions && onApprove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(request)}
                          title="Approuver"
                          className="text-green-600 hover:text-green-700"
                          disabled={request.status === "approved"}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {showApprovalActions && onReject && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(request)}
                          title="Rejeter"
                          className="text-red-600 hover:text-red-700"
                          disabled={request.status === "rejected"}
                        >
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
      </CardContent>
    </Card>
  );
}
