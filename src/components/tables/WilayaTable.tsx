import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import { Wilaya } from "@/types/database.types";

interface WilayaTableProps {
  wilayas: Wilaya[];
  formatDate: (date: string) => string;
  onView: (wilaya: Wilaya) => void;
  onEdit: (wilaya: Wilaya) => void;
  onDelete: (wilaya: Wilaya) => void;
  onRefresh?: () => void;
}

export function WilayaTable({ wilayas, formatDate, onView, onEdit, onDelete, onRefresh }: WilayaTableProps) {
  const columns: ColumnDef<Wilaya, unknown>[] = [
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
          <MapPin className="h-4 w-4 text-gray-500" />
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

  const actionHandlers: ActionHandlers<Wilaya> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={wilayas}
      actionHandlers={actionHandlers}
      filterColumn="name_fr"
      onRefresh={onRefresh}
      tableName="Wilayas"
    />
  );
}
