import { Table } from "@tanstack/react-table";
import { Settings2, Download, Printer, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  onRefresh?: () => void;
  onExportCSV?: () => void;
  onPrint?: () => void;
}

export function DataTableViewOptions<TData>({ table, onRefresh, onExportCSV, onPrint }: DataTableViewOptionsProps<TData>) {
  return (
    <div className="flex items-center gap-2">
      {onRefresh && (
        <Button variant="outline" size="sm" className="h-8" onClick={onRefresh} title="Actualiser">
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Settings2 className="mr-2 h-4 w-4" />
            Affichage
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
            .map((column) => {
              const columnDef = column.columnDef;
              const headerValue = columnDef.header;
              let displayName = column.id;

              if (typeof headerValue === "string") {
                displayName = headerValue;
              } else if (headerValue && typeof headerValue === "function") {
                // A reasonable fallback when header is a function
                displayName = column.id;
              }

              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  className="capitalize"
                >
                  {displayName}
                </DropdownMenuCheckboxItem>
              );
            })}

          {(onExportCSV || onPrint) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {onExportCSV && (
                  <DropdownMenuItem onClick={onExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter CSV
                  </DropdownMenuItem>
                )}
                {onPrint && (
                  <DropdownMenuItem onClick={onPrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
