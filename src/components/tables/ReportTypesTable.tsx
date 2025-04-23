import { useState } from "react";
import { EyeIcon, PencilIcon, TrashIcon, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface ReportType {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: string;
  template_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ReportTypesTableProps {
  reportTypes: ReportType[];
  formatDate: (date: string) => string;
  getCategoryLabel: (value: string) => string;
  getFrequencyLabel: (value: string) => string;
  onView: (reportType: ReportType) => void;
  onEdit: (reportType: ReportType) => void;
  onDelete: (reportType: ReportType) => void;
  onRefresh: () => void;
}

export function ReportTypesTable({
  reportTypes,
  formatDate,
  getCategoryLabel,
  getFrequencyLabel,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: ReportTypesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Filter items based on search query and active filter
  const filteredItems = reportTypes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories for the filter
  const uniqueCategories = Array.from(new Set(reportTypes.map((item) => item.category)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Rechercher un type de rapport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Catégorie: {categoryFilter ? getCategoryLabel(categoryFilter) : "Toutes"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCategoryFilter(null)}>Toutes les catégories</DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueCategories.map((category) => (
                <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                  {getCategoryLabel(category)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" onClick={onRefresh} title="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="hidden md:table-cell">Fréquence</TableHead>
              <TableHead className="hidden md:table-cell">Statut</TableHead>
              <TableHead className="hidden lg:table-cell">Dernière mise à jour</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Aucun type de rapport trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((reportType) => (
                <TableRow key={reportType.id}>
                  <TableCell className="font-medium">{reportType.name}</TableCell>
                  <TableCell>{getCategoryLabel(reportType.category)}</TableCell>
                  <TableCell className="hidden md:table-cell">{getFrequencyLabel(reportType.frequency)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={reportType.is_active ? "default" : "outline"}>{reportType.is_active ? "Actif" : "Inactif"}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{formatDate(reportType.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(reportType)} title="Voir">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(reportType)} title="Modifier">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(reportType)} title="Supprimer">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredItems.length} {filteredItems.length === 1 ? "type de rapport" : "types de rapport"} trouvé{filteredItems.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
