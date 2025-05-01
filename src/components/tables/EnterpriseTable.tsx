import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
// Import Enterprise type from database.types
import { Enterprise } from "@/types/database.types";

interface EnterpriseTableProps {
  enterprises: Enterprise[];
  formatDate?: (date: string) => string;
  onView: (enterprise: Enterprise) => void;
  onEdit: (enterprise: Enterprise) => void;
  onDelete: (enterprise: Enterprise) => void;
  onRefresh?: () => void;
}

export function EnterpriseTable({ enterprises, formatDate, onView, onEdit, onDelete, onRefresh }: EnterpriseTableProps) {
  const columns: ColumnDef<Enterprise, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <div className="font-medium">{row.getValue("name")}</div>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "nif",
      header: ({ column }) => <DataTableColumnHeader column={column} title="NIF" />,
      cell: ({ row }) => row.getValue("nif") || "N/A",
      filterFn: "includesString",
    },
    {
      accessorKey: "rc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="RC" />,
      cell: ({ row }) => row.getValue("rc") || "N/A",
      filterFn: "includesString",
    },
    {
      accessorKey: "contact",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }) => {
        const phone = row.original.phone;
        const email = row.original.email;

        return (
          <div className="space-y-1">
            {phone && (
              <div className="flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3" />
                <span>{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3" />
                <span>{email}</span>
              </div>
            )}
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "address",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Adresse" />,
      cell: ({ row }) => {
        const address = row.getValue("address") as string | undefined;
        return address ? (
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            <span>{address}</span>
          </div>
        ) : (
          "N/A"
        );
      },
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<Enterprise> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={enterprises}
      actionHandlers={actionHandlers}
      filterColumn="name"
      onRefresh={onRefresh}
      tableName="Organisations"
    />
  );
}
