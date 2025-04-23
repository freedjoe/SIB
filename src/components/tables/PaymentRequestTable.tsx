import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Trash2, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";

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
  showApprovalActions = false,
}: PaymentRequestTableProps) {
  const columns: ColumnDef<PaymentRequest>[] = [
    {
      accessorKey: "programName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Programme" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("programName")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "operationName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opération" />,
      cell: ({ row }) => row.getValue("operationName"),
      filterFn: "includesString",
    },
    {
      accessorKey: "beneficiary",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bénéficiaire" />,
      cell: ({ row }) => row.getValue("beneficiary"),
      filterFn: "includesString",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant" />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("amount"))}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "frequency",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fréquence" />,
      cell: ({ row }) => {
        const frequency = row.getValue("frequency") as PaymentRequest["frequency"];
        return frequency === "monthly" ? "Mensuel" : frequency === "quarterly" ? "Trimestriel" : "Annuel";
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: "includesString",
    },
    {
      accessorKey: "requestDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date de demande" />,
      cell: ({ row }) => formatDate(row.getValue("requestDate")),
      filterFn: "includesString",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => onView(request)} title="Voir les détails">
              <Eye className="h-4 w-4" />
            </Button>

            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(request)} title="Modifier">
                <FileEdit className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(request)} title="Supprimer">
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
        );
      },
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={columns} data={paymentRequests} />
      </CardContent>
    </Card>
  );
}
