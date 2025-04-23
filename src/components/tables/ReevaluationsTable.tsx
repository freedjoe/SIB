import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { EngagementReevaluationWithRelations } from "@/services/engagementReevaluationsService";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";

interface Engagement {
  reference: string;
  operation?: {
    name: string;
  };
}

interface ReevaluationsTableProps {
  reevaluations: EngagementReevaluationWithRelations[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onApprove?: (reevaluation: EngagementReevaluationWithRelations) => void;
  onReject?: (reevaluation: EngagementReevaluationWithRelations) => void;
  onRefresh?: () => void;
  showActions?: boolean;
}

export function ReevaluationsTable({
  reevaluations,
  formatCurrency,
  formatDate,
  onApprove,
  onReject,
  onRefresh,
  showActions = false,
}: ReevaluationsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approuvee":
        return <Badge className="bg-green-500">Approuvée</Badge>;
      case "rejetee":
        return <Badge variant="destructive">Rejetée</Badge>;
      case "en_attente":
        return <Badge variant="warning">En attente</Badge>;
      case "modifiee":
        return <Badge variant="secondary">Modifiée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: ColumnDef<EngagementReevaluationWithRelations>[] = [
    {
      accessorKey: "date_reevaluation",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => formatDate(row.getValue("date_reevaluation")),
      filterFn: "includesString",
    },
    {
      accessorKey: "engagement",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Engagement" />,
      cell: ({ row }) => {
        const engagement = row.getValue("engagement") as Engagement | undefined;
        return `${engagement?.reference || "-"} - ${engagement?.operation?.name || "-"}`;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "montant_initial",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant initial" />,
      cell: ({ row }) => formatCurrency(row.getValue("montant_initial")),
      filterFn: "includesString",
    },
    {
      accessorKey: "montant_reevalue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant réévalué" />,
      cell: ({ row }) => formatCurrency(row.getValue("montant_reevalue")),
      filterFn: "includesString",
    },
    {
      accessorKey: "motif_reevaluation",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Motif" />,
      cell: ({ row }) => row.getValue("motif_reevaluation"),
      filterFn: "includesString",
    },
    {
      accessorKey: "statut_reevaluation",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => getStatusBadge(row.getValue("statut_reevaluation")),
      filterFn: "includesString",
    },
    {
      accessorKey: "valide_par",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Validé par" />,
      cell: ({ row }) => row.getValue("valide_par") || "-",
      filterFn: "includesString",
    },
  ];

  // Only create action handlers if showActions is true
  const actionHandlers: ActionHandlers<EngagementReevaluationWithRelations> | undefined = showActions
    ? {
        onApprove: (reevaluation) => {
          if (reevaluation.statut_reevaluation === "en_attente" && onApprove) {
            onApprove(reevaluation);
          }
        },
        onReject: (reevaluation) => {
          if (reevaluation.statut_reevaluation === "en_attente" && onReject) {
            onReject(reevaluation);
          }
        },
      }
    : undefined;

  return (
    <ReusableDataTable
      columns={columns}
      data={reevaluations}
      actionHandlers={actionHandlers}
      filterColumn="engagement"
      onRefresh={onRefresh}
      tableName="Réévaluations d'engagements"
    />
  );
}
