import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Button } from "@/components/ui/button";
import { ColumnDef, Table, Header, Column } from "@tanstack/react-table";
import { Eye, FileEdit, Trash2, Check, X, File, Download, Printer, RefreshCw, Plus } from "lucide-react";
import ExcelJS from "exceljs";
import { useTranslation } from "react-i18next";

export interface ActionHandlers<T> {
  onView?: (data: T) => void;
  onEdit?: (data: T) => void;
  onDelete?: (data: T) => void;
  onApprove?: (data: T) => void;
  onReject?: (data: T) => void;
  onCustomAction?: (data: T, actionType: string) => void;
}

interface CustomAction<T> {
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  actionType: string;
  condition?: (data: T) => boolean;
}

type CustomActionsType<T> = CustomAction<T>[] | ((row: T) => React.ReactNode | React.ReactNode[] | undefined);

interface ReusableDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  filterColumn?: string;
  actionHandlers?: ActionHandlers<T>;
  customActions?: CustomActionsType<T>;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: Record<string, boolean>) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  noCardWrapper?: boolean;
  className?: string;
  emptyMessage?: string;
  enablePrint?: boolean;
  enableExport?: boolean;
  tableName?: string;
}

export function ReusableDataTable<T>({
  data,
  columns,
  filterColumn = "name",
  actionHandlers,
  customActions = [],
  enableRowSelection = false,
  onRowSelectionChange,
  onRefresh,
  onAddNew,
  addNewLabel,
  noCardWrapper = false,
  className,
  emptyMessage,
  enablePrint = true,
  enableExport = true,
  tableName,
}: ReusableDataTableProps<T>) {
  const { t } = useTranslation();

  // Add the actions column if any action handlers are provided
  const hasActions = actionHandlers || customActions;

  // Use translation or default if not provided
  const defaultAddNewLabel = t("common.addNew");
  const defaultTableName = t("common.data");
  const defaultEmptyMessage = t("common.noData");

  // Use provided values or defaults with translation
  const translatedAddNewLabel = addNewLabel || defaultAddNewLabel;
  const translatedTableName = tableName || defaultTableName;
  const translatedEmptyMessage = emptyMessage || defaultEmptyMessage;

  const columnsWithActions = React.useMemo(() => {
    if (!hasActions) return columns;

    return [
      ...columns,
      {
        id: "actions",
        header: t("common.actions"),
        cell: ({ row }) => {
          const data = row.original;

          // Custom actions section
          let customActionElements: React.ReactNode[] = [];

          if (typeof customActions === "function") {
            // If customActions is a function, call it with the row data
            const customActionResult = customActions(data);

            // Handle the case where the function returns undefined, a single element, or an array
            if (customActionResult) {
              if (Array.isArray(customActionResult)) {
                customActionElements = customActionResult;
              } else {
                customActionElements = [customActionResult];
              }
            }
          } else if (Array.isArray(customActions)) {
            // If customActions is an array, map it to buttons
            customActionElements = customActions
              .map((action, idx) => {
                if (action.condition && !action.condition(data)) return null;

                return (
                  <Button
                    key={idx}
                    variant={action.variant || "ghost"}
                    size="icon"
                    onClick={() => actionHandlers?.onCustomAction?.(data, action.actionType)}
                    title={action.label}
                  >
                    {action.icon}
                  </Button>
                );
              })
              .filter(Boolean);
          }

          return (
            <div className="flex justify-end gap-2">
              {actionHandlers?.onView && (
                <Button variant="ghost" size="icon" onClick={() => actionHandlers.onView?.(data)} title={t("common.viewDetails")}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}

              {actionHandlers?.onEdit && (
                <Button variant="ghost" size="icon" onClick={() => actionHandlers.onEdit?.(data)} title={t("common.edit")}>
                  <FileEdit className="h-4 w-4" />
                </Button>
              )}

              {actionHandlers?.onDelete && (
                <Button variant="ghost" size="icon" onClick={() => actionHandlers.onDelete?.(data)} title={t("common.delete")}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              {actionHandlers?.onApprove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => actionHandlers.onApprove?.(data)}
                  title={t("common.approve")}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}

              {actionHandlers?.onReject && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => actionHandlers.onReject?.(data)}
                  title={t("common.reject")}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {customActionElements}
            </div>
          );
        },
      },
    ];
  }, [columns, actionHandlers, customActions, hasActions, t]);

  const handleExportToExcel = async () => {
    const flattenObject = (obj: Record<string, unknown>, prefix = ""): Record<string, unknown> => {
      return Object.keys(obj).reduce((acc: Record<string, unknown>, k: string) => {
        const pre = prefix.length ? prefix + "_" : "";
        if (typeof obj[k] === "object" && obj[k] !== null) {
          Object.assign(acc, flattenObject(obj[k] as Record<string, unknown>, pre + k));
        } else {
          acc[pre + k] = obj[k];
        }
        return acc;
      }, {});
    };

    // Get visible columns
    const visibleColumns = columns.filter((col) => {
      if (!col.id) return false;
      return true;
    });

    // Format data based on visible columns
    const formattedData = data.map((item) => {
      const flatItem = flattenObject(item as unknown as Record<string, unknown>);
      const exportRow: Record<string, unknown> = {};

      visibleColumns.forEach((col) => {
        if (!col.id) return;

        // Get the header name for this column
        const headerName =
          typeof col.header === "function"
            ? (col.header as (props: { column: Column<T>; header: Header<T, unknown>; table: Table<T> }) => React.ReactNode)({
                column: {
                  id: col.id,
                  columnDef: col,
                  getSize: () => 150,
                  getStart: () => 0,
                  getLeafColumns: () => [],
                  getIsVisible: () => true,
                  pin: undefined,
                  getFlatColumns: () => [],
                  depth: 0,
                  columns: [],
                  parent: null,
                  headerGroup: null,
                } as Column<T>,
                header: {
                  id: col.id,
                  column: { id: col.id } as Column<T>,
                  getContext: () => ({
                    column: { id: col.id } as Column<T>,
                    header: { id: col.id } as Header<T, unknown>,
                    table: {} as Table<T>,
                  }),
                  getIsResizing: () => false,
                  getSize: () => 150,
                  getStart: () => 0,
                } as Header<T, unknown>,
                table: {
                  options: {},
                  getCenterTotalSize: () => 0,
                  getExpandedRowModel: () => ({ rows: [], flatRows: [], rowsById: {} }),
                  getFilteredRowModel: () => ({ rows: [], flatRows: [], rowsById: {} }),
                  getFlatHeaders: () => [],
                  getHeaderGroups: () => [],
                  getLeafHeaders: () => [],
                  getPaginationRowModel: () => ({ rows: [], flatRows: [], rowsById: {} }),
                  getRowModel: () => ({ rows: [], flatRows: [], rowsById: {} }),
                  getSortedRowModel: () => ({ rows: [], flatRows: [], rowsById: {} }),
                  getState: () => ({}),
                  setOptions: () => {},
                  setState: () => {},
                  refs: { tableElement: null, tableHeadElement: null, tableBodyElement: null },
                } as Table<T>,
              })
            : col.header || col.id;

        // Get the cell value
        exportRow[typeof headerName === "string" ? headerName : col.id] = flatItem[col.id];
      });

      return exportRow;
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(translatedTableName);

    // Add headers
    const headers = Object.keys(formattedData[0] || {});
    worksheet.columns = headers.map((header) => ({ header, key: header, width: 15 }));

    // Add data rows
    formattedData.forEach((row) => {
      worksheet.addRow(row);
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${translatedTableName}_${t("common.export")}_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const toolbarExtra = null;

  const table = (
    <DataTable
      data={data}
      columns={columnsWithActions}
      filterColumn={filterColumn}
      rowSelection={enableRowSelection}
      onRowSelectionChange={onRowSelectionChange}
      emptyMessage={translatedEmptyMessage}
      toolbarExtra={toolbarExtra}
      className={className}
      onRefresh={onRefresh}
      onExportCSV={enableExport ? handleExportToExcel : undefined}
      onPrint={enablePrint ? handlePrint : undefined}
    />
  );

  return noCardWrapper ? (
    table
  ) : (
    <Card>
      <CardContent className="pt-6">{table}</CardContent>
    </Card>
  );
}
