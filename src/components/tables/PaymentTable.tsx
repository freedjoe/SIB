import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";

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
  onRefresh?: () => void;
}

export function PaymentTable({ payments, formatCurrency, formatDate, getStatusBadge, onView, onEdit, onDelete, onRefresh }: PaymentTableProps) {
  const columns: ColumnDef<Payment, unknown>[] = [
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
  ];

  const actionHandlers: ActionHandlers<Payment> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={payments}
      actionHandlers={actionHandlers}
      filterColumn="operationName"
      onRefresh={onRefresh}
      tableName="Paiements"
    />
  );
}
