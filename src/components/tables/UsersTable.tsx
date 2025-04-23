import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: "active" | "inactive" | "pending";
  role: { id: string; name: string };
  company: { id: string; name: string } | null;
  created_at: string;
  last_login: string | null;
}

interface UsersTableProps {
  users: User[];
  formatDate: (date: string | null) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRefresh?: () => void;
}

export function UsersTable({ users, formatDate, getStatusBadge, onView, onEdit, onDelete, onRefresh }: UsersTableProps) {
  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => {
        const firstName = row.original.first_name;
        const lastName = row.original.last_name;
        const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage alt={`${firstName} ${lastName}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{`${firstName} ${lastName}`}</div>
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "username",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom d'utilisateur" />,
      cell: ({ row }) => row.getValue("username"),
      filterFn: "includesString",
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => row.getValue("email"),
      filterFn: "includesString",
    },
    {
      accessorKey: "role.name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rôle" />,
      cell: ({ row }) => row.original.role?.name || "N/A",
      filterFn: "includesString",
    },
    {
      accessorKey: "company.name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Organisation" />,
      cell: ({ row }) => row.original.company?.name || "N/A",
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: "includesString",
    },
    {
      accessorKey: "last_login",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Dernière connexion" />,
      cell: ({ row }) => formatDate(row.getValue("last_login")),
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<User> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={users}
      actionHandlers={actionHandlers}
      filterColumn="username"
      onRefresh={onRefresh}
      tableName="Utilisateurs"
    />
  );
}
