import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileEdit, Trash2, Eye, ArrowUpDown, Plus, RefreshCw, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Engagement } from "@/types/database.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EngagementsTableProps {
  engagements: Engagement[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  onEdit: (engagement: Engagement) => void;
  onDelete: (engagement: Engagement) => void;
  onView: (engagement: Engagement) => void;
  onReevaluate: (engagement: Engagement) => void;
  onApprove: (engagement: Engagement) => void;
  onReject: (engagement: Engagement) => void;
  onRefresh: () => void;
  onAddNew: () => void;
}

export function EngagementsTable({
  engagements,
  formatCurrency,
  formatDate,
  onEdit,
  onDelete,
  onView,
  onReevaluate,
  onApprove,
  onReject,
  onRefresh,
  onAddNew,
}: EngagementsTableProps) {
  const { t } = useTranslation();
  const [sortColumn, setSortColumn] = React.useState<string>("date");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedEngagements = [...engagements].sort((a, b) => {
    const aValue = a[sortColumn as keyof Engagement];
    const bValue = b[sortColumn as keyof Engagement];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      // Handle date comparison or other types
      if (sortColumn === "date") {
        const dateA = new Date(a.date || "").getTime();
        const dateB = new Date(b.date || "").getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">{t("engagements.draft")}</Badge>;
      case "submitted":
        return <Badge variant="warning">{t("engagements.submitted")}</Badge>;
      case "reviewed":
        return <Badge variant="secondary">{t("engagements.reviewed")}</Badge>;
      case "approved":
        return <Badge className="bg-green-500">{t("engagements.approved")}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{t("engagements.rejected")}</Badge>;
      case "proposed":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-500">
            {t("engagements.proposed")}
          </Badge>
        );
      case "validated":
        return <Badge className="bg-blue-500">{t("engagements.validated")}</Badge>;
      case "liquidated":
        return <Badge className="bg-purple-500">{t("engagements.liquidated")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string | undefined) => {
    if (!type) return null;

    const typeColors = {
      legal: "bg-blue-100 text-blue-800 border-blue-300",
      provisional: "bg-purple-100 text-purple-800 border-purple-300",
      technical: "bg-amber-100 text-amber-800 border-amber-300",
      multiannual: "bg-emerald-100 text-emerald-800 border-emerald-300",
      carryover: "bg-indigo-100 text-indigo-800 border-indigo-300",
      revaluation: "bg-rose-100 text-rose-800 border-rose-300",
      disbursement: "bg-cyan-100 text-cyan-800 border-cyan-300",
      reallocation: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
      off_budget: "bg-gray-100 text-gray-800 border-gray-300",
    };

    const colorClass = typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800";

    return (
      <Badge
        variant="outline"
        className={`${colorClass} text-xs px-2 py-0.5 rounded border`}>
        {t(`engagements.type.${type}`)}
      </Badge>
    );
  };

  const SortableColumnHeader = ({ column, title }: { column: string; title: string }) => (
    <div
      className="flex items-center cursor-pointer space-x-1"
      onClick={() => handleSort(column)}>
      <span>{title}</span>
      <ArrowUpDown className="h-4 w-4" />
    </div>
  );

  return (
    <Card className="overflow-hidden border">
      <div className="rounded-lg border">
        <div className="flex justify-between items-center p-4 bg-muted/30">
          <h3 className="text-lg font-medium">{t("engagements.tableTitle")}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {t("common.refresh")}
            </Button>
            <Button
              size="sm"
              onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-1" />
              {t("engagements.addNew")}
            </Button>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[120px]">
                  <SortableColumnHeader
                    column="reference"
                    title={t("engagements.reference")}
                  />
                </TableHead>
                <TableHead className="w-[110px]">
                  <SortableColumnHeader
                    column="date"
                    title={t("engagements.date")}
                  />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader
                    column="vendor"
                    title={t("engagements.vendor")}
                  />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader
                    column="type"
                    title={t("engagements.type")}
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortableColumnHeader
                    column="amount"
                    title={t("engagements.amount")}
                  />
                </TableHead>
                <TableHead className="w-[120px]">
                  <SortableColumnHeader
                    column="inscription_date"
                    title={t("engagements.inscriptionDate")}
                  />
                </TableHead>
                <TableHead className="w-[80px]">
                  <SortableColumnHeader
                    column="year"
                    title={t("engagements.year")}
                  />
                </TableHead>
                <TableHead className="w-[180px]">
                  <SortableColumnHeader
                    column="description"
                    title={t("engagements.description")}
                  />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader
                    column="status"
                    title={t("engagements.status")}
                  />
                </TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEngagements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-24 text-center">
                    {t("engagements.noEngagements")}
                  </TableCell>
                </TableRow>
              ) : (
                sortedEngagements.map((engagement) => (
                  <TableRow
                    key={engagement.id}
                    className="group">
                    <TableCell className="font-medium">{engagement.reference || "-"}</TableCell>
                    <TableCell>{engagement.date ? formatDate(engagement.date) : "-"}</TableCell>
                    <TableCell>{engagement.vendor || "-"}</TableCell>
                    <TableCell>{getTypeBadge(engagement.type)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(engagement.amount)}</TableCell>
                    <TableCell>{engagement.inscription_date ? formatDate(engagement.inscription_date) : "-"}</TableCell>
                    <TableCell>{engagement.year || new Date().getFullYear()}</TableCell>
                    <TableCell
                      className="max-w-[180px] truncate"
                      title={engagement.description}>
                      {engagement.description || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(engagement.status)}</TableCell>
                    <TableCell className="text-right p-0 pr-2">
                      <div className="flex justify-end items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onView(engagement)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onEdit(engagement)}>
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onDelete(engagement)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("engagements.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onReevaluate(engagement)}>{t("engagements.reevaluate")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onApprove(engagement)}>{t("engagements.approve")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReject(engagement)}>{t("engagements.reject")}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t bg-muted/30 text-sm text-muted-foreground">
          {t("engagements.totalRecords")}: {engagements.length}
        </div>
      </div>
    </Card>
  );
}
