import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";

export interface Budget {
  id: string;
  year: number;
  ministryId: string;
  ministryName: string;
  totalAmount: number;
  allocatedAmount: number;
  status: "draft" | "pending" | "approved" | "rejected";
}

interface BudgetsTableProps {
  budgets: Budget[];
  formatCurrency: (amount: number) => string;
  onView: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function BudgetsTable({ budgets, formatCurrency, onView, onEdit, onDelete, onRefresh, onAddNew }: BudgetsTableProps) {
  const getStatusBadge = (status: Budget["status"]) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            Brouillon
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            En attente
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
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const columns: ColumnDef<Budget, unknown>[] = [
    {
      accessorKey: "ministryName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ministère" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("ministryName")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "year",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Année" />,
      cell: ({ row }) => row.getValue("year"),
      filterFn: "includesString",
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant Total" />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("totalAmount"))}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "allocatedAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant Alloué" />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("allocatedAmount"))}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<Budget> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={budgets}
      actionHandlers={actionHandlers}
      filterColumn="ministryName"
      onRefresh={onRefresh}
      onAddNew={onAddNew}
      addNewLabel="Ajouter un budget"
      tableName="Budgets"
    />
  );
}
