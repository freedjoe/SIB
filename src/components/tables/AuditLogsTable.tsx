import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
}

interface AuditLogsTableProps {
  logs: AuditLog[];
  formatTimestamp: (timestamp: string) => string;
  onView?: (log: AuditLog) => void;
  onRefresh?: () => void;
}

export function AuditLogsTable({ logs, formatTimestamp, onView, onRefresh }: AuditLogsTableProps) {
  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      accessorKey: "timestamp",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => formatTimestamp(row.getValue("timestamp")),
      filterFn: "includesString",
    },
    {
      accessorKey: "user",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Utilisateur" />,
      cell: ({ row }) => row.getValue("user"),
      filterFn: "includesString",
    },
    {
      accessorKey: "action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium">
          {row.getValue("action")}
        </Badge>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "details",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Détails" />,
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue("details")}>
          {row.getValue("details")}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "ipAddress",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Adresse IP" />,
      cell: ({ row }) => row.getValue("ipAddress"),
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<AuditLog> | undefined = onView ? { onView } : undefined;

  return (
    <ReusableDataTable
      columns={columns}
      data={logs}
      actionHandlers={actionHandlers}
      filterColumn="action"
      onRefresh={onRefresh}
      tableName="Logs d'Audit"
    />
  );
}
