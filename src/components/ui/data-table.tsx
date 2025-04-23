"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  Table as TableInstance,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbar?: boolean;
  pagination?: boolean;
  filterColumn?: string;
  toolbarExtra?: React.ReactNode;
  rowSelection?: boolean;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onRefresh?: () => void;
  onExportCSV?: () => void;
  onPrint?: () => void;
  state?: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    rowSelection?: RowSelectionState;
  };
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar = true,
  pagination = true,
  filterColumn = "name",
  toolbarExtra,
  rowSelection: enableRowSelection = false,
  onRowSelectionChange,
  onRefresh,
  onExportCSV,
  onPrint,
  state,
  onSortingChange,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  className,
  emptyMessage = "Aucun résultat.",
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: state?.sorting || sorting,
      columnVisibility: state?.columnVisibility || columnVisibility,
      rowSelection: state?.rowSelection || rowSelection,
      columnFilters: state?.columnFilters || columnFilters,
    },
    enableRowSelection,
    onRowSelectionChange: onRowSelectionChange || setRowSelection,
    onSortingChange: onSortingChange || setSorting,
    onColumnFiltersChange: onColumnFiltersChange || setColumnFilters,
    onColumnVisibilityChange: onColumnVisibilityChange || setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {toolbar && (
        <DataTableToolbar
          table={table}
          filterColumn={filterColumn}
          extraContent={toolbarExtra}
          onRefresh={onRefresh}
          onExportCSV={onExportCSV}
          onPrint={onPrint}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => enableRowSelection && row.toggleSelected()}
                  className={enableRowSelection ? "cursor-pointer" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && <DataTablePagination table={table} />}
    </div>
  );
}
