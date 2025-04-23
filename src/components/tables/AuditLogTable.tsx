import { Badge } from "@/components/ui/badge";
import { AuditLogWithRelations } from "@/services/auditLogService";
import { formatDate } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";

interface AuditLogTableProps {
  logs: AuditLogWithRelations[];
}

type ChangeValue = string | number | boolean | null | undefined;

interface Changes {
  before: Record<string, ChangeValue>;
  after: Record<string, ChangeValue>;
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return <Badge className="bg-green-500">Création</Badge>;
      case "update":
        return <Badge className="bg-blue-500">Modification</Badge>;
      case "delete":
        return <Badge variant="destructive">Suppression</Badge>;
      case "approve":
        return <Badge className="bg-green-500">Approbation</Badge>;
      case "reject":
        return <Badge variant="destructive">Rejet</Badge>;
      case "reevaluate":
        return <Badge className="bg-yellow-500">Réévaluation</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const formatChanges = (changes: Changes) => {
    const modifiedFields = Object.keys(changes.after).filter((key) => JSON.stringify(changes.before[key]) !== JSON.stringify(changes.after[key]));

    return (
      <div className="space-y-1">
        {modifiedFields.map((field) => (
          <div key={field} className="text-sm">
            <span className="font-medium">{field}:</span> <span className="text-red-500">{JSON.stringify(changes.before[field])}</span> →{" "}
            <span className="text-green-500">{JSON.stringify(changes.after[field])}</span>
          </div>
        ))}
      </div>
    );
  };

  const columns: ColumnDef<AuditLogWithRelations>[] = [
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => formatDate(row.getValue("created_at")),
      filterFn: "includesString",
    },
    {
      accessorKey: "action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
      cell: ({ row }) => getActionBadge(row.getValue("action")),
      filterFn: "includesString",
    },
    {
      accessorKey: "user.name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Utilisateur" />,
      cell: ({ row }) => row.original.user?.name || "-",
      filterFn: "includesString",
    },
    {
      accessorKey: "user.role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rôle" />,
      cell: ({ row }) => row.original.user?.role || "-",
      filterFn: "includesString",
    },
    {
      accessorKey: "changes",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Modifications" />,
      cell: ({ row }) => formatChanges(row.getValue("changes")),
      filterFn: "includesString",
    },
  ];

  return <DataTable columns={columns} data={logs} />;
}
