import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PrevisionCP, PrevisionCPStatus } from "@/types/prevision_cp";
import { Edit, FileText } from "lucide-react";

interface PrevisionsCPTableProps {
  previsionsCP: PrevisionCP[];
  formatCurrency: (amount: number) => string;
  onView: (prevision: PrevisionCP) => void;
  onEdit: (prevision: PrevisionCP) => void;
  onDelete: (prevision: PrevisionCP) => void;
  onMobilize?: (prevision: PrevisionCP) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function PrevisionsCPTable({
  previsionsCP,
  formatCurrency,
  onView,
  onEdit,
  onDelete,
  onMobilize,
  onRefresh,
  onAddNew,
}: PrevisionsCPTableProps) {
  const getStatusBadge = (status: PrevisionCPStatus) => {
    switch (status) {
      case "prévu":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Prévu
          </Badge>
        );
      case "demandé":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Demandé
          </Badge>
        );
      case "mobilisé":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Mobilisé
          </Badge>
        );
      case "en retard":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            En retard
          </Badge>
        );
      case "partiellement mobilisé":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Partiellement mobilisé
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getMobilizationPercentage = (prevu: number, mobilise: number) => {
    if (prevu === 0) return 0;
    return Math.round((mobilise / prevu) * 100);
  };

  const getConsumptionPercentage = (mobilise: number, consomme: number) => {
    if (mobilise === 0) return 0;
    return Math.round((consomme / mobilise) * 100);
  };

  const columns: ColumnDef<PrevisionCP, unknown>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "exercice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Exercice" />,
      cell: ({ row }) => row.getValue("exercice"),
      filterFn: "includesString",
    },
    {
      accessorKey: "operation_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opération" />,
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("operation_name")}>
          {row.getValue("operation_name")}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "engagement_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Engagement" />,
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("engagement_name")}>
          {row.getValue("engagement_name")}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "montant_prevu",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant prévu" />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("montant_prevu"))}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "montant_mobilise",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mobilisé" />,
      cell: ({ row }) => {
        const prevu = row.getValue("montant_prevu") as number;
        const mobilise = row.getValue("montant_mobilise") as number;
        const percentage = getMobilizationPercentage(prevu, mobilise);

        return (
          <div className="flex items-center gap-2">
            <div className="text-right flex-1">{formatCurrency(mobilise)}</div>
            <div className="w-16 flex items-center">
              <Progress value={percentage} className="h-2" />
              <span className="ml-2 text-xs">{percentage}%</span>
            </div>
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "montant_consomme",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Consommé" />,
      cell: ({ row }) => {
        const mobilise = row.getValue("montant_mobilise") as number;
        const consomme = row.getValue("montant_consomme") as number;
        const percentage = getConsumptionPercentage(mobilise, consomme);

        return (
          <div className="flex items-center gap-2">
            <div className="text-right flex-1">{formatCurrency(consomme)}</div>
            <div className="w-16 flex items-center">
              <Progress value={percentage} className="h-2" />
              <span className="ml-2 text-xs">{percentage}%</span>
            </div>
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "statut",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => getStatusBadge(row.getValue("statut")),
      filterFn: "includesString",
    },
  ];

  // Define custom actions
  const customActions = [];

  if (onMobilize) {
    customActions.push({
      label: "Mobiliser",
      icon: <FileText className="h-4 w-4" />,
      variant: "ghost" as const,
      actionType: "mobilize",
      condition: (prevision: PrevisionCP) => prevision.statut === "prévu" || prevision.statut === "demandé",
    });
  }

  const actionHandlers: ActionHandlers<PrevisionCP> = {
    onView,
    onEdit,
    onDelete,
    onCustomAction: (prevision, actionType) => {
      if (actionType === "mobilize" && onMobilize) {
        onMobilize(prevision);
      }
    },
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={previsionsCP}
      actionHandlers={actionHandlers}
      customActions={customActions}
      filterColumn="operation_name"
      onRefresh={onRefresh}
      onAddNew={onAddNew}
      addNewLabel="Ajouter une prévision"
      tableName="Prévisions CP"
    />
  );
}
