import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Operation } from "@/types/database.types";

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
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            {t("operations.status.draft")}
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            {t("operations.status.submitted")}
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            {t("operations.status.reviewed")}
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            {t("operations.status.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            {t("operations.status.rejected")}
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
      accessorKey: "regional_budget_directorate",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.regionalBudgetDirectorate")} />,
      cell: ({ row }) => <div>{row.getValue("regional_budget_directorate") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "province",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.province")} />,
      cell: ({ row }) => <div>{row.getValue("province") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "municipality",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.municipality")} />,
      cell: ({ row }) => <div>{row.getValue("municipality") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "program_type",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.programType")} />,
      cell: ({ row }) => <div>{row.getValue("program_type") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "portfolio_program",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.portfolioProgram")} />,
      cell: ({ row }) => <div>{row.getValue("portfolio_program") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.code")} />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("code") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.name")} />,
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue("name") as string}>
          {row.getValue("name") || "-"}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "notification_year",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.notificationYear")} />,
      cell: ({ row }) => <div>{row.getValue("notification_year") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "initial_ae",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.initialAE")} />,
      cell: ({ row }) => <div className="text-right">{formatCurrency((row.getValue("initial_ae") as number) || 0)}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "current_ae",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.currentAE")} />,
      cell: ({ row }) => <div className="text-right">{formatCurrency((row.getValue("current_ae") as number) || 0)}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "committed_ae",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.committedAE")} />,
      cell: ({ row }) => <div className="text-right">{formatCurrency((row.getValue("committed_ae") as number) || 0)}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "cumulative_payments",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.cumulativePayments")} />,
      cell: ({ row }) => <div className="text-right">{formatCurrency((row.getValue("cumulative_payments") as number) || 0)}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "financial_rate",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.financialRate")} />,
      cell: ({ row }) => {
        const rate = (row.getValue("financial_rate") as number) || 0;
        return (
          <div className="w-full flex items-center gap-2">
            <Progress value={rate} className="h-2" />
            <span className={cn("text-xs font-medium", getProgressTextColor(rate))}>{rate}%</span>
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "physical_rate",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.physicalRate")} />,
      cell: ({ row }) => {
        const progress = (row.getValue("physical_rate") as number) || 0;
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
      accessorKey: "project_status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.projectStatus")} />,
      cell: ({ row }) => <div>{row.getValue("project_status") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "observations",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.observations")} />,
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={(row.getValue("observations") as string) || ""}>
          {row.getValue("observations") || "-"}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("operations.status.label")} />,
      cell: ({ row }) => getStatusBadge(row.getValue("status") as Operation["status"]),
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
