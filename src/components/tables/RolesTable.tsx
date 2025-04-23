import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  created_at: string;
  user_count: number;
}

interface RolesTableProps {
  roles: Role[];
  formatDate: (date: string) => string;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onRefresh?: () => void;
}

export function RolesTable({ roles, formatDate, onView, onEdit, onDelete, onRefresh }: RolesTableProps) {
  const columns: ColumnDef<Role, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => {
        const isSystem = row.original.is_system_role;
        return (
          <div className="flex items-center gap-2">
            {isSystem ? <ShieldCheck className="h-4 w-4 text-blue-500" /> : <Shield className="h-4 w-4 text-gray-500" />}
            <span className="font-medium">{row.getValue("name")}</span>
            {isSystem && (
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                Système
              </Badge>
            )}
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => row.getValue("description"),
      filterFn: "includesString",
    },
    {
      accessorKey: "permissions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Permissions" />,
      cell: ({ row }) => {
        const permissions = row.original.permissions || [];
        return (
          <div className="flex flex-wrap gap-1">
            {permissions.length > 3 ? (
              <Badge variant="outline">{permissions.length} permissions</Badge>
            ) : (
              permissions.map((permission, index) => (
                <Badge key={index} variant="outline" className="bg-gray-50">
                  {permission.name}
                </Badge>
              ))
            )}
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "user_count",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Utilisateurs" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-gray-50">
          {row.getValue("user_count")}
        </Badge>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date de création" />,
      cell: ({ row }) => formatDate(row.getValue("created_at")),
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<Role> = {
    onView,
    onEdit,
    onDelete: (role) => {
      // Prevent deleting system roles
      if (!role.is_system_role) {
        onDelete(role);
      }
    },
  };

  return (
    <ReusableDataTable columns={columns} data={roles} actionHandlers={actionHandlers} filterColumn="name" onRefresh={onRefresh} tableName="Rôles" />
  );
}
