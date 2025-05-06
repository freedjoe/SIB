import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { Check, File, AlertTriangle } from "lucide-react";

export interface Engagement {
  id: string;
  operation_id: string;
  reference: string | null;
  date: string | null;
  vendor: string | null;
  amount: number | null;
  status: "proposed" | "validated" | "liquidated" | "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  code: string | null;
  inscription_date: string | null;
  year: number | null;
  type: string | null;
  history: string | null;
  description: string | null;
  operation?: {
    name: string;
    id: string;
  };
}

interface EngagementsTableProps {
  engagements: Engagement[];
  formatCurrency: (amount: number | null) => string;
  formatDate: (date: string) => string;
  onView: (engagement: Engagement) => void;
  onEdit: (engagement: Engagement) => void;
  onDelete: (engagement: Engagement) => void;
  onApprove?: (engagement: Engagement) => void;
  onReject?: (engagement: Engagement) => void;
  onReevaluate?: (engagement: Engagement) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function EngagementsTable({
  engagements,
  formatCurrency,
  formatDate,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onReevaluate,
  onRefresh,
  onAddNew,
}: EngagementsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Brouillon
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Soumis
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Révisé
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Approuvé
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Rejeté
          </Badge>
        );
      case "proposed":
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
            Proposé
          </Badge>
        );
      case "validated":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Validé
          </Badge>
        );
      case "liquidated":
        return (
          <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-300">
            Liquidé
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const columns: ColumnDef<Engagement, unknown>[] = [
    {
      accessorKey: "reference",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Référence" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("reference")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "operation",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opération" />,
      cell: ({ row }) => {
        const engagement = row.original;
        const displayValue = engagement.operation?.name || engagement.operation_id;
        return (
          <div className="max-w-[250px] truncate" title={String(displayValue)}>
            {displayValue}
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "vendor",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bénéficiaire" />,
      cell: ({ row }) => {
        const vendor = row.getValue("vendor");
        return (
          <div className="max-w-[200px] truncate" title={String(vendor)}>
            {vendor}
          </div>
        );
      },
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
        const status = row.getValue("status");
        const statusStr = typeof status === "object" ? (status ? JSON.stringify(status) : "Inconnu") : String(status);
        return getStatusBadge(statusStr);
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => {
        const date = row.getValue("date");
        const dateStr =
          typeof date === "object" ? (date && "toISOString" in date ? (date as Date).toISOString() : JSON.stringify(date)) : String(date);
        return formatDate(dateStr);
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <div>{row.getValue("type")}</div>,
      filterFn: "includesString",
    },
  ];

  // Define custom actions based on engagement status
  const customActions = [];

  if (onApprove) {
    customActions.push({
      label: "Approuver",
      icon: <Check className="h-4 w-4" />,
      variant: "ghost" as const,
      actionType: "approve",
      condition: (engagement: Engagement) => engagement.status === "proposed",
    });
  }

  if (onReject) {
    customActions.push({
      label: "Rejeter",
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: "ghost" as const,
      actionType: "reject",
      condition: (engagement: Engagement) => engagement.status === "proposed",
    });
  }

  if (onReevaluate) {
    customActions.push({
      label: "Réévaluer",
      icon: <File className="h-4 w-4" />,
      variant: "ghost" as const,
      actionType: "reevaluate",
      condition: (engagement: Engagement) => engagement.status === "approved",
    });
  }

  const actionHandlers: ActionHandlers<Engagement> = {
    onView,
    onEdit,
    onDelete,
    onCustomAction: (engagement, actionType) => {
      if (actionType === "approve" && onApprove) {
        onApprove(engagement);
      } else if (actionType === "reject" && onReject) {
        onReject(engagement);
      } else if (actionType === "reevaluate" && onReevaluate) {
        onReevaluate(engagement);
      }
    },
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={engagements}
      actionHandlers={actionHandlers}
      customActions={customActions}
      filterColumn="operation"
      onRefresh={onRefresh}
      onAddNew={onAddNew}
      addNewLabel="Ajouter un engagement"
      tableName="Engagements"
    />
  );
}
