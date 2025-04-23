import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { EngagementReevaluationWithRelations } from "@/services/engagementReevaluationsService";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";

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
  showActions?: boolean;
}

export function ReevaluationsTable({ reevaluations, formatCurrency, formatDate, onApprove, onReject, showActions = false }: ReevaluationsTableProps) {
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

  if (showActions) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const reevaluation = row.original;
        return (
          <div className="flex justify-end gap-2">
            {reevaluation.statut_reevaluation === "en_attente" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => onApprove?.(reevaluation)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => onReject?.(reevaluation)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    });
  }

  return <DataTable columns={columns} data={reevaluations} />;
}
