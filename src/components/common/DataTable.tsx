
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataTableProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: {
    key: string;
    title: string;
    render?: (item: T) => React.ReactNode;
  }[];
  searchKeys?: Array<keyof T>;
  actionColumn?: (item: T) => React.ReactNode;
  addButton?: {
    title: string;
    content: React.ReactNode;
  };
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  title,
  description,
  data,
  columns,
  searchKeys = [],
  actionColumn,
  addButton,
  emptyState,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = searchKeys.length > 0 
    ? data.filter((item) => 
        searchKeys.some((key) => {
          const value = item[key];
          return typeof value === 'string' && 
            value.toLowerCase().includes(searchQuery.toLowerCase());
        })
      )
    : data;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {searchKeys.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("common.search")}
                  className="w-64 pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            
            {addButton && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {addButton.title}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{addButton.title}</DialogTitle>
                    <DialogDescription>
                      {t("common.fillRequiredFields")}
                    </DialogDescription>
                  </DialogHeader>
                  {addButton.content}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-300px)]">
          {filteredData.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {columns.map((column) => (
                    <th key={column.key} className="text-left py-3 px-4">
                      {column.title}
                    </th>
                  ))}
                  {actionColumn && (
                    <th className="text-left py-3 px-4 w-24">{t("common.actions")}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    {columns.map((column) => (
                      <td key={column.key} className="py-3 px-4">
                        {column.render ? column.render(item) : (item as any)[column.key]}
                      </td>
                    ))}
                    {actionColumn && (
                      <td className="py-3 px-4">{actionColumn(item)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-40">
              {emptyState || <p className="text-muted-foreground">{t("common.noDataFound")}</p>}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
