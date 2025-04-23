import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { Check, File, AlertTriangle } from "lucide-react";

export interface Engagement {
  id: string;
  operation: string;
  beneficiaire: string;
  montant_demande: number;
  montant_approuve: number | null;
  statut: "En attente" | "Approuvé" | "Rejeté";
  date: string;
  priorite: "Haute" | "Moyenne" | "Basse";
  demande_par: string;
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
      case "En attente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            En attente
          </Badge>
        );
      case "Approuvé":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Approuvé
          </Badge>
        );
      case "Rejeté":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Haute":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Haute
          </Badge>
        );
      case "Moyenne":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Moyenne
          </Badge>
        );
      case "Basse":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Basse
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };

  const columns: ColumnDef<Engagement, unknown>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "operation",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opération" />,
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate" title={row.getValue("operation")}>
          {row.getValue("operation")}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "beneficiaire",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bénéficiaire" />,
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("beneficiaire")}>
          {row.getValue("beneficiaire")}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "montant_demande",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant demandé" />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("montant_demande"))}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "montant_approuve",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant approuvé" />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("montant_approuve"))}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "statut",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => getStatusBadge(row.getValue("statut")),
      filterFn: "includesString",
    },
    {
      accessorKey: "priorite",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Priorité" />,
      cell: ({ row }) => getPriorityBadge(row.getValue("priorite")),
      filterFn: "includesString",
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => formatDate(row.getValue("date")),
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
      condition: (engagement: Engagement) => engagement.statut === "En attente",
    });
  }

  if (onReject) {
    customActions.push({
      label: "Rejeter",
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: "ghost" as const,
      actionType: "reject",
      condition: (engagement: Engagement) => engagement.statut === "En attente",
    });
  }

  if (onReevaluate) {
    customActions.push({
      label: "Réévaluer",
      icon: <File className="h-4 w-4" />,
      variant: "ghost" as const,
      actionType: "reevaluate",
      condition: (engagement: Engagement) => engagement.statut === "Approuvé",
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
