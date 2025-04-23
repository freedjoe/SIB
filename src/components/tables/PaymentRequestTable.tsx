import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";

export interface PaymentRequest {
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
  onRefresh?: () => void;
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
  onRefresh,
}: PaymentRequestTableProps) {
  const columns: ColumnDef<PaymentRequest, unknown>[] = [
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
  ];

  const actionHandlers: ActionHandlers<PaymentRequest> = {
    onView,
    onEdit,
    onDelete,
    onApprove: showApprovalActions ? onApprove : undefined,
    onReject: showApprovalActions ? onReject : undefined,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={paymentRequests}
      actionHandlers={actionHandlers}
      filterColumn="operationName"
      onRefresh={onRefresh}
      tableName="Demandes de Paiement"
    />
  );
}
