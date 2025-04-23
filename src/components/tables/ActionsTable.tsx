import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";

export interface Action {
  id: string;
  programme_id: string;
  programme_name: string;
  nom: string;
  type_action: string;
  montant_alloue: number;
}

interface ActionsTableProps {
  actions: Action[];
  formatCurrency: (amount: number) => string;
  onView: (action: Action) => void;
  onEdit: (action: Action) => void;
  onDelete: (action: Action) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function ActionsTable({ actions, formatCurrency, onView, onEdit, onDelete, onRefresh, onAddNew }: ActionsTableProps) {
  const columns: ColumnDef<Action, unknown>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => row.getValue("id"),
      filterFn: "includesString",
    },
    {
      accessorKey: "programme_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Programme" />,
      cell: ({ row }) => row.getValue("programme_name"),
      filterFn: "includesString",
    },
    {
      accessorKey: "nom",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom de l'action" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("nom")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "type_action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => row.getValue("type_action"),
      filterFn: "includesString",
    },
    {
      accessorKey: "montant_alloue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant alloué" />,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("montant_alloue"))}</div>,
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<Action> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={actions}
      actionHandlers={actionHandlers}
      filterColumn="nom"
      onRefresh={onRefresh}
      onAddNew={onAddNew}
      addNewLabel="Ajouter une action"
      tableName="Actions budgétaires"
    />
  );
}
