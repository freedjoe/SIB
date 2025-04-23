import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Building, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Ministry {
  id: string;
  name: string;
  code: string;
  description?: string;
  head_name?: string;
  is_active: boolean;
  programs_count?: number;
  created_at: string;
  updated_at: string;
}

interface MinistryTableProps {
  ministries: Ministry[];
  formatDate: (date: string) => string;
  onView: (ministry: Ministry) => void;
  onEdit: (ministry: Ministry) => void;
  onDelete: (ministry: Ministry) => void;
  onRefresh?: () => void;
}

export function MinistryTable({ ministries, formatDate, onView, onEdit, onDelete, onRefresh }: MinistryTableProps) {
  const columns: ColumnDef<Ministry, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("code")}</Badge>,
      filterFn: "includesString",
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => {
        const description = row.getValue("description") as string | undefined;
        return description ? description : "N/A";
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "head_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Responsable" />,
      cell: ({ row }) => {
        const headName = row.getValue("head_name") as string | undefined;
        return headName ? headName : "Non assigné";
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return isActive ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Actif</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>Inactif</span>
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "programs_count",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Programmes" />,
      cell: ({ row }) => {
        const count = row.original.programs_count || 0;
        return (
          <Badge variant="outline" className="bg-gray-50">
            {count}
          </Badge>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Dernière mise à jour" />,
      cell: ({ row }) => formatDate(row.getValue("updated_at")),
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<Ministry> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={ministries}
      actionHandlers={actionHandlers}
      filterColumn="name"
      onRefresh={onRefresh}
      tableName="Ministères"
    />
  );
}
