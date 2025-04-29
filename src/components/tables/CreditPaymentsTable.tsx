import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { CreditPaymentWithRelations } from "@/types/credit_payments";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Trash2, Check, X, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreditPaymentsTableProps {
  creditPayments: CreditPaymentWithRelations[];
  formatCurrency: (amount: number | null) => string;
  formatDate: (date: string | null) => string;
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
  formatCurrency,
  formatDate,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRefresh,
  onAddNew,
}: CreditPaymentsTableProps) {
  const columns: ColumnDef<CreditPaymentWithRelations, unknown>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("code") || `CP-${row.original.id.substring(0, 8)}`}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "operation",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opération" />,
      cell: ({ row }) => <div>{row.original.operation?.title || "N/A"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "fiscal_year",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Année fiscale" />,
      cell: ({ row }) => <div>{row.original.fiscal_year?.year || "N/A"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant" />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("amount"))}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        switch (status) {
          case "approved":
            return <Badge className="bg-green-500">Approuvé</Badge>;
          case "rejected":
            return <Badge variant="destructive">Rejeté</Badge>;
          case "submitted":
            return <Badge className="bg-blue-500">Soumis</Badge>;
          case "reviewed":
            return <Badge className="bg-purple-500">Révisé</Badge>;
          case "draft":
            return <Badge variant="outline">Brouillon</Badge>;
          default:
            return <Badge variant="secondary">{status}</Badge>;
        }
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date de création" />,
      cell: ({ row }) => formatDate(row.getValue("created_at")),
      filterFn: "includesString",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const creditPayment = row.original;
        const isPending = creditPayment.status === "submitted";

        return (
          <div className="flex items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onView(creditPayment)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(creditPayment)}>
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(creditPayment)}>
              <Trash2 className="h-4 w-4" />
            </Button>

            {isPending && onApprove && onReject && (
              <>
                <Button variant="ghost" size="icon" className="text-green-600" onClick={() => onApprove(creditPayment)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onReject(creditPayment)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const actionHandlers: ActionHandlers<CreditPaymentWithRelations> = {
    onView,
    onEdit,
    onDelete,
    onRefresh,
    onAddNew,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={creditPayments}
      searchField="operation.title"
      placeholderText="Rechercher un crédit de paiement..."
      actionHandlers={actionHandlers}
    />
  );
}
