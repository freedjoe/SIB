import { Eye, FileEdit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";

interface Payment {
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

interface PaymentTableProps {
  payments: Payment[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | null) => string;
  getStatusBadge: (status: Payment["status"]) => React.ReactNode;
  onView: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

export function PaymentTable({ payments, formatCurrency, formatDate, getStatusBadge, onView, onEdit, onDelete }: PaymentTableProps) {
  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "engagementRef",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Référence" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("engagementRef")}</div>,
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
      accessorKey: "paymentDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date de paiement" />,
      cell: ({ row }) => formatDate(row.getValue("paymentDate")),
      filterFn: "includesString",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => onView(payment)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(payment)}>
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(payment)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable columns={columns} data={payments} />
      </CardContent>
    </Card>
  );
}
