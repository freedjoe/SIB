import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  showRowsPerPage?: boolean;
  showPageJump?: boolean;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  showRowsPerPage = true,
  showPageJump = true,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: DataTablePaginationProps<TData>) {
  const [pageIndex, setPageIndex] = useState<string>(String(table.getState().pagination.pageIndex + 1));

  const handlePageChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = Number(pageIndex);
      if (isNaN(page)) return;

      const pageCount = table.getPageCount();
      if (page < 1) {
        table.setPageIndex(0);
        setPageIndex("1");
      } else if (page > pageCount) {
        table.setPageIndex(pageCount - 1);
        setPageIndex(String(pageCount));
      } else {
        table.setPageIndex(page - 1);
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} sur {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s)
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {showRowsPerPage && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
        </div>

        {showPageJump && table.getPageCount() > 4 && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Aller à</p>
            <Input
              type="number"
              min={1}
              max={table.getPageCount()}
              value={pageIndex}
              onChange={(e) => setPageIndex(e.target.value)}
              onKeyDown={handlePageChange}
              onBlur={() => setPageIndex(String(table.getState().pagination.pageIndex + 1))}
              className="h-8 w-[60px]"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="Première page"
          >
            <span className="sr-only">Aller à la première page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Page précédente"
          >
            <span className="sr-only">Aller à la page précédente</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} title="Page suivante">
            <span className="sr-only">Aller à la page suivante</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="Dernière page"
          >
            <span className="sr-only">Aller à la dernière page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
