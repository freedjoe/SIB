import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Building, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Ministry {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  code: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  fax?: string;
  fax2?: string;
  is_active: boolean;
  parent_id?: string;
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
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("code")}</Badge>,
      filterFn: "includesString",
    },
    {
      accessorKey: "name_fr",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500" />
          <div className="space-y-1">
            <span className="font-medium">{row.getValue("name_fr")}</span>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span dir="rtl">{row.original.name_ar}</span>
              <span>|</span>
              <span>{row.original.name_en}</span>
            </div>
          </div>
        </div>
      ),
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
      filterColumn="name_fr"
      onRefresh={onRefresh}
      tableName="Institutions gouvernementales"
    />
  );
}
