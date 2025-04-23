import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { Building2, CheckCircle, XCircle, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Company {
  id: string;
  name: string;
  legal_name?: string;
  type: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  user_count?: number;
  created_at: string;
  updated_at: string;
}

interface CompanyTableProps {
  companies: Company[];
  formatDate: (date: string) => string;
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onRefresh?: () => void;
}

export function CompanyTable({ companies, formatDate, onView, onEdit, onDelete, onRefresh }: CompanyTableProps) {
  const columns: ColumnDef<Company, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            {row.original.legal_name && <div className="text-xs text-muted-foreground">{row.original.legal_name}</div>}
          </div>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge>,
      filterFn: "includesString",
    },
    {
      accessorKey: "tax_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="NIF" />,
      cell: ({ row }) => row.getValue("tax_id") || "N/A",
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
            {email && <div className="text-xs">{email}</div>}
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
      accessorKey: "user_count",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Utilisateurs" />,
      cell: ({ row }) => {
        const count = row.original.user_count || 0;
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mise à jour" />,
      cell: ({ row }) => formatDate(row.getValue("updated_at")),
      filterFn: "includesString",
    },
  ];

  const actionHandlers: ActionHandlers<Company> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={companies}
      actionHandlers={actionHandlers}
      filterColumn="name"
      onRefresh={onRefresh}
      tableName="Organisations"
    />
  );
}
