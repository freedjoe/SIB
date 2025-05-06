import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Operation, Wilaya, Portfolio, Program, Action } from "@/types/database.types";

interface OperationsTableProps {
  operations: Operation[];
  wilayas: Record<string, Wilaya>;
  portfolios: Record<string, Portfolio>;
  programs: Record<string, Program>;
  actions: Record<string, Action>;
  formatCurrency: (amount: number) => string;
  onView: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function OperationsTable({
  operations,
  wilayas,
  portfolios,
  programs,
  actions,
  formatCurrency,
  onView,
  onEdit,
  onDelete,
  onRefresh,
  onAddNew,
}: OperationsTableProps) {
  const { t } = useTranslation();

  const getStatusBadge = (status: Operation["status"]) => {
    switch (status) {
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300">
            {t("operations.status.draft")}
          </Badge>
        );
      case "submitted":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300">
            {t("operations.status.submitted")}
          </Badge>
        );
      case "reviewed":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300">
            {t("operations.status.reviewed")}
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300">
            {t("operations.status.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300">
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

  const columns: ColumnDef<Operation, unknown>[] = [
    {
      accessorKey: "wilaya_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.wilaya")}
        />
      ),
      cell: ({ row }) => {
        const operation = row.original;
        return (
          <div>
            {operation.wilaya_id && wilayas[operation.wilaya_id]
              ? `${wilayas[operation.wilaya_id].code} - ${wilayas[operation.wilaya_id].name_fr}`
              : "-"}
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "portfolio_program",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.portfolioProgramAction")}
        />
      ),
      cell: ({ row }) => {
        const operation = row.original;
        return (
          <div className="flex flex-col space-y-1 max-w-[250px]">
            {operation.portfolio_id && (
              <div className="text-xs font-semibold">
                {portfolios[operation.portfolio_id]
                  ? `${portfolios[operation.portfolio_id].code} - ${portfolios[operation.portfolio_id].name}`
                  : operation.portfolio_id}
              </div>
            )}
            {operation.program_id && (
              <div className="text-xs">
                {programs[operation.program_id]
                  ? `${programs[operation.program_id].code} - ${programs[operation.program_id].name}`
                  : operation.program_id}
              </div>
            )}
            {operation.action_id && (
              <div className="text-xs text-muted-foreground">
                {actions[operation.action_id] ? `${actions[operation.action_id].code} - ${actions[operation.action_id].name}` : operation.action_id}
              </div>
            )}
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.name")}
        />
      ),
      cell: ({ row }) => (
        <div
          className="max-w-[250px] truncate"
          title={row.getValue("name") as string}>
          {row.getValue("name") || "-"}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.numOperation")}
        />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("code") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "beneficiary",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.beneficiary")}
        />
      ),
      cell: ({ row }) => <div>{row.getValue("beneficiary") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "inscription_date",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.inscriptionDate")}
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue("inscription_date") as string;
        return <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "notification_year",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.notificationYear")}
        />
      ),
      cell: ({ row }) => <div>{row.getValue("notification_year") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "delay",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.delay")}
        />
      ),
      cell: ({ row }) => {
        const delay = row.getValue("delay");
        return <div>{delay ? `${delay} mois` : "-"}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "initial_ae",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.initialAE")}
        />
      ),
      cell: ({ row }) => <div className="text-right">{formatCurrency((row.getValue("initial_ae") as number) || 0)}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "current_ae",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.currentAE")}
        />
      ),
      cell: ({ row }) => <div className="text-right">{formatCurrency((row.getValue("current_ae") as number) || 0)}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "committed_ae",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.committedAE")}
        />
      ),
      cell: ({ row }) => <div className="text-right">{formatCurrency((row.getValue("committed_ae") as number) || 0)}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "cumulative_payments",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.cumulativePayments")}
        />
      ),
      cell: ({ row }) => <div className="text-right">{formatCurrency((row.getValue("cumulative_payments") as number) || 0)}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "progress",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.progress")}
        />
      ),
      cell: ({ row }) => {
        const financialRate = (row.original.financial_rate as number) || 0;
        const physicalRate = (row.original.physical_rate as number) || 0;

        return (
          <div className="space-y-2 w-[200px]">
            <div className="w-full flex items-center gap-2">
              <div className="w-20 text-xs font-medium">Financier:</div>
              <Progress
                value={financialRate}
                className={`h-2 flex-1 ${getProgressBarColor(financialRate)}`}
              />
              <span className={cn("text-xs font-medium w-10 text-right", getProgressTextColor(financialRate))}>{financialRate}%</span>
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="w-20 text-xs font-medium">Physique:</div>
              <Progress
                value={physicalRate}
                className={`h-2 flex-1 ${getProgressBarColor(physicalRate)}`}
              />
              <span className={cn("text-xs font-medium w-10 text-right", getProgressTextColor(physicalRate))}>{physicalRate}%</span>
            </div>
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "project_status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.projectStatus")}
        />
      ),
      cell: ({ row }) => <div>{row.getValue("project_status") || "-"}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("operations.status.label")}
        />
      ),
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
