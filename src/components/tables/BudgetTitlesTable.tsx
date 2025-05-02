import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { Banknote } from "lucide-react";
import { BudgetTitle } from "@/types/database.types";

interface BudgetTitlesTableProps {
  budgetItems: BudgetTitle[];
  onView: (item: BudgetTitle) => void;
  onEdit: (item: BudgetTitle) => void;
  onDelete: (item: BudgetTitle) => void;
  onRefresh?: () => void;
}

export function BudgetTitlesTable({ budgetItems, onView, onEdit, onDelete, onRefresh }: BudgetTitlesTableProps) {
  const columns: ColumnDef<BudgetTitle, unknown>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.getValue("code")}
        </Badge>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => {
        const description = row.getValue("description") as string | undefined;
        return description ? description : "N/A";
      },
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<BudgetTitle> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={budgetItems}
      actionHandlers={actionHandlers}
      filterColumn="name"
      onRefresh={onRefresh}
      tableName="Catalogue Budgétaire"
    />
  );
}
