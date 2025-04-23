import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";

export interface AuditControl {
  id: string;
  date: string;
  type: string;
  entity: string;
  controller: string;
  result: "conforme" | "anomalie" | "partiellement";
}

interface AuditControlsTableProps {
  controls: AuditControl[];
  formatDate: (date: string) => string;
  onView?: (control: AuditControl) => void;
  onEdit?: (control: AuditControl) => void;
  onDelete?: (control: AuditControl) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function AuditControlsTable({ controls, formatDate, onView, onEdit, onDelete, onRefresh, onAddNew }: AuditControlsTableProps) {
  const getResultBadge = (result: string) => {
    switch (result) {
      case "conforme":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">
            Conforme
          </Badge>
        );
      case "anomalie":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-400">
            Anomalie détectée
          </Badge>
        );
      case "partiellement":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
            Partiellement conforme
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const columns: ColumnDef<AuditControl, unknown>[] = [
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

  const actionHandlers: ActionHandlers<AuditControl> | undefined =
    onView || onEdit || onDelete
      ? {
          onView,
          onEdit,
          onDelete,
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
