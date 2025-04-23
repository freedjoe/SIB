import { Column } from "@tanstack/react-table";
import { ChevronsUpDown, EyeOff, Filter, SortAsc, SortDesc, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  hideFilter?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className, hideFilter = false }: DataTableColumnHeaderProps<TData, TValue>) {
  const [showFilter, setShowFilter] = useState(false);
  const isFiltered = column.getFilterValue() !== undefined;

  if (!column.getCanSort() && hideFilter) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <div className="flex items-center">
        {column.getCanSort() ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                <span>{title}</span>
                {column.getIsSorted() === "desc" ? (
                  <SortDesc className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "asc" ? (
                  <SortAsc className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <SortAsc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Croissant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <SortDesc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Décroissant
              </DropdownMenuItem>
              {!hideFilter && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowFilter(!showFilter)}>
                    <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    {showFilter ? "Masquer le filtre" : "Filtrer"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div>{title}</div>
        )}

        {isFiltered && !showFilter && (
          <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal" onClick={() => setShowFilter(true)}>
            Filtré
          </Badge>
        )}

        {isFiltered && (
          <Button variant="ghost" onClick={() => column.setFilterValue(undefined)} className="h-8 w-8 p-0 ml-1">
            <X className="h-3 w-3" />
            <span className="sr-only">Supprimer le filtre</span>
          </Button>
        )}
      </div>

      {showFilter && (
        <div className="flex items-center gap-1">
          <Input
            placeholder={`Filtrer...`}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className="h-8 w-full"
          />
          <Button variant="ghost" size="sm" onClick={() => setShowFilter(false)} className="h-8 px-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </Button>
        </div>
      )}
    </div>
  );
}
