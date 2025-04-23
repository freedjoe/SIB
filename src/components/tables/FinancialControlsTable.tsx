import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";

export interface FinancialControl {
  id: string;
  date: string;
  type: string;
  entity: string;
  controller: string;
  result: "conforme" | "anomalie" | "partiellement";
  details?: string;
}

interface FinancialControlsTableProps {
  controls: FinancialControl[];
  formatDate: (date: string) => string;
  getResultBadge: (result: string) => React.ReactNode;
  onView?: (control: FinancialControl) => void;
  onEdit?: (control: FinancialControl) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function FinancialControlsTable({ controls, formatDate, getResultBadge, onView, onEdit, onRefresh, onAddNew }: FinancialControlsTableProps) {
  const columns: ColumnDef<FinancialControl, unknown>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => formatDate(row.getValue("date")),
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type de Contrôle" />,
      cell: ({ row }) => row.getValue("type"),
      filterFn: "includesString",
    },
    {
      accessorKey: "entity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Entité" />,
      cell: ({ row }) => row.getValue("entity"),
      filterFn: "includesString",
    },
    {
      accessorKey: "controller",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contrôleur" />,
      cell: ({ row }) => row.getValue("controller"),
      filterFn: "includesString",
    },
    {
      accessorKey: "result",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Résultat" />,
      cell: ({ row }) => getResultBadge(row.getValue("result")),
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<FinancialControl> | undefined =
    onView || onEdit
      ? {
          onView,
          onEdit,
        }
      : undefined;

  return (
    <ReusableDataTable
      columns={columns}
      data={controls}
      actionHandlers={actionHandlers}
      filterColumn="entity"
      onRefresh={onRefresh}
      onAddNew={onAddNew}
      addNewLabel="Ajouter un contrôle"
      tableName="Contrôles Financiers"
    />
  );
}
