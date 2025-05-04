import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface Operation {
  id: string;
  name: string;
  description: string;
  actionId: string;
  actionName: string;
  programId: string;
  programName: string;
  code_operation: string;
  wilaya: string;
  titre_budgetaire: number;
  origine_financement: "budget_national" | "financement_exterieur";
  allocatedAmount: number;
  usedAmount: number;
  montant_consomme: number;
  progress: number;
  taux_physique: number;
  taux_financier: number;
  engagements: number;
  payments: number;
  status: "in_progress" | "completed" | "planned" | "en_pause" | "arreter" | "draft";
  start_date: string;
  end_date: string;
}

interface OperationsTableProps {
  operations: Operation[];
  formatCurrency: (amount: number) => string;
  onView: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function OperationsTable({ operations, formatCurrency, onView, onEdit, onDelete, onRefresh, onAddNew }: OperationsTableProps) {
  const { t } = useTranslation();

  const getStatusBadge = (status: Operation["status"]) => {
    switch (status) {
      case "planned":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            {t("operations.status.planned")}
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            {t("operations.status.in_progress")}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            {t("operations.status.completed")}
          </Badge>
        );
      case "en_pause":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            {t("operations.status.paused")}
          </Badge>
        );
      case "arreter":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            {t("operations.status.stopped")}
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            {t("operations.status.draft")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("operations.status.unknown")}</Badge>;
    }
  };

  const getProgressBarColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressTextColor = (progress: number) => {
    if (progress < 30) return "text-red-700";
    if (progress < 70) return "text-yellow-700";
    return "text-green-700";
  };

  const formatTitreBudgetaire = (titre: number) => {
    return `${t("budget.title")} ${titre}`;
  };

  const columns: ColumnDef<Operation, unknown>[] = [
    {
      accessorKey: "code_operation",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.code")} />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("code_operation")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.name")} />,
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue("name")}>
          {row.getValue("name")}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "programName",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.programAction")} />,
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="truncate" title={row.getValue("programName")}>
            {row.getValue("programName")}
          </div>
          <div className="text-xs text-gray-500 truncate" title={row.original.actionName}>
            {row.original.actionName}
          </div>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "wilaya",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.wilaya")} />,
      cell: ({ row }) => row.getValue("wilaya"),
      filterFn: "includesString",
    },
    {
      accessorKey: "allocatedAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.allocatedAE")} />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("allocatedAmount"))}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "progress",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.progress")} />,
      cell: ({ row }) => {
        const progress = row.getValue("progress") as number;
        return (
          <div className="w-full flex items-center gap-2">
            <Progress value={progress} className="h-2" />
            <span className={cn("text-xs font-medium", getProgressTextColor(progress))}>{progress}%</span>
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.status.label")} />,
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: "includesString",
    },
    {
      accessorKey: "start_date",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.startDate")} />,
      cell: ({ row }) => {
        const date = row.getValue("start_date") as string;
        return <div>{new Date(date).toLocaleDateString()}</div>;
      },
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<Operation> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={operations}
      actionHandlers={actionHandlers}
      filterColumn="name"
      onRefresh={onRefresh}
      onAddNew={onAddNew}
      addNewLabel={t("operations.addNew")}
      tableName={t("operations.tableName")}
    />
  );
}
