import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AuditLogWithRelations } from "@/services/auditLogService";
import { formatDate } from "@/lib/utils";

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Modifications</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              Aucun historique trouvé
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{formatDate(log.created_at)}</TableCell>
              <TableCell>{getActionBadge(log.action)}</TableCell>
              <TableCell>{log.user?.name || "-"}</TableCell>
              <TableCell>{log.user?.role || "-"}</TableCell>
              <TableCell>{formatChanges(log.changes)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
