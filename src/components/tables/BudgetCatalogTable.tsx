import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Banknote, Calendar, ArrowDownUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BudgetItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BudgetCatalogTableProps {
  budgetItems: BudgetItem[];
  formatDate: (date: string) => string;
  onView: (item: BudgetItem) => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
  onRefresh?: () => void;
}

export function BudgetCatalogTable({ budgetItems, formatDate, onView, onEdit, onDelete, onRefresh }: BudgetCatalogTableProps) {
  const columns: ColumnDef<BudgetItem, unknown>[] = [
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
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Catégorie" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {row.getValue("category")}
        </Badge>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ArrowDownUp className="h-4 w-4 text-gray-500" />
          <span>{row.getValue("type")}</span>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "year",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Année" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{row.getValue("year")}</span>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge variant={isActive ? "default" : "destructive"} className="text-xs">
            {isActive ? "Actif" : "Inactif"}
          </Badge>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mise à jour" />,
      cell: ({ row }) => formatDate(row.getValue("updated_at")),
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<BudgetItem> = {
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
