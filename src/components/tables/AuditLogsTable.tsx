import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { AuditLog } from "@/hooks/supabase/entities/audit_logs";

interface AuditLogsTableProps {
  logs: AuditLog[];
  formatTimestamp: (timestamp: string) => string;
  onView?: (log: AuditLog) => void;
  onRefresh?: () => void;
}

export function AuditLogsTable({ logs, formatTimestamp, onView, onRefresh }: AuditLogsTableProps) {
  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => formatTimestamp(row.getValue("created_at")),
      filterFn: "includesString",
    },
    {
      accessorKey: "user_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Utilisateur" />,
      cell: ({ row }) => row.getValue("user_id"),
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
      accessorKey: "table_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Table" />,
      cell: ({ row }) => row.getValue("table_name"),
      filterFn: "includesString",
    },
    {
      accessorKey: "ip_address",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Adresse IP" />,
      cell: ({ row }) => row.getValue("ip_address"),
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
