import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ReusableDataTable, ActionHandlers } from "./ReusableDataTable";
import { ListTree, BookOpen, FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NomenclatureItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  parent_id?: string;
  parent_name?: string;
  level: number;
  has_children: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NomenclatureTableProps {
  items: NomenclatureItem[];
  formatDate: (date: string) => string;
  onView: (item: NomenclatureItem) => void;
  onEdit: (item: NomenclatureItem) => void;
  onDelete: (item: NomenclatureItem) => void;
  onRefresh?: () => void;
}

export function NomenclatureTable({ items, formatDate, onView, onEdit, onDelete, onRefresh }: NomenclatureTableProps) {
  const columns: ColumnDef<NomenclatureItem, unknown>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.getValue("code")}
        </Badge>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => {
        const level = row.original.level;
        const hasChildren = row.original.has_children;

        return (
          <div className="flex items-center gap-2">
            {hasChildren ? <FolderTree className="h-4 w-4 text-blue-500" /> : <BookOpen className="h-4 w-4 text-gray-500" />}
            <span className="font-medium" style={{ marginLeft: `${(level - 1) * 12}px` }}>
              {row.getValue("name")}
            </span>
          </div>
        );
      },
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
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Catégorie" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {row.getValue("category")}
        </Badge>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "parent_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parent" />,
      cell: ({ row }) => {
        const parentName = row.getValue("parent_name") as string | undefined;
        return parentName ? (
          <div className="flex items-center gap-1">
            <ListTree className="h-4 w-4 text-gray-500" />
            <span>{parentName}</span>
          </div>
        ) : (
          "Racine"
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "level",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Niveau" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-gray-50">
          {row.getValue("level")}
        </Badge>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge variant={isActive ? "default" : "destructive"} className="text-xs">
            {isActive ? "Actif" : "Inactif"}
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

  const actionHandlers: ActionHandlers<NomenclatureItem> = {
    onView,
    onEdit,
    onDelete,
  };

  return (
    <ReusableDataTable
      columns={columns}
      data={items}
      actionHandlers={actionHandlers}
      filterColumn="name"
      onRefresh={onRefresh}
      tableName="Nomenclature"
    />
  );
}
