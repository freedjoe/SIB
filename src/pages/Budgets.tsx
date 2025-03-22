
import { useEffect, useState } from "react";
import { 
  Dashboard, 
  DashboardHeader, 
  DashboardSection 
} from "@/components/layout/Dashboard";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FilePlus, SearchIcon } from "lucide-react";

// Mock data
interface Budget {
  id: string;
  year: number;
  ministryId: string;
  ministryName: string;
  totalAmount: number;
  allocatedAmount: number;
  status: "draft" | "pending" | "approved" | "rejected";
}

const mockBudgets: Budget[] = [
  {
    id: "b1",
    year: 2023,
    ministryId: "m1",
    ministryName: "Ministère de l'Éducation",
    totalAmount: 1250000000,
    allocatedAmount: 980000000,
    status: "approved"
  },
  {
    id: "b2",
    year: 2023,
    ministryId: "m2",
    ministryName: "Ministère de la Santé",
    totalAmount: 980000000,
    allocatedAmount: 750000000,
    status: "approved"
  },
  {
    id: "b3",
    year: 2023,
    ministryId: "m3",
    ministryName: "Ministère des Transports",
    totalAmount: 750000000,
    allocatedAmount: 420000000,
    status: "approved"
  },
  {
    id: "b4",
    year: 2023,
    ministryId: "m4",
    ministryName: "Ministère de l'Agriculture",
    totalAmount: 620000000,
    allocatedAmount: 510000000,
    status: "approved"
  },
  {
    id: "b5",
    year: 2023,
    ministryId: "m5",
    ministryName: "Ministère de la Défense",
    totalAmount: 890000000,
    allocatedAmount: 740000000,
    status: "approved"
  },
  {
    id: "b6",
    year: 2023,
    ministryId: "m6",
    ministryName: "Ministère de la Justice",
    totalAmount: 410000000,
    allocatedAmount: 380000000,
    status: "pending"
  },
  {
    id: "b7",
    year: 2023,
    ministryId: "m7",
    ministryName: "Ministère des Affaires Étrangères",
    totalAmount: 350000000,
    allocatedAmount: 210000000,
    status: "pending"
  },
  {
    id: "b8",
    year: 2024,
    ministryId: "m1",
    ministryName: "Ministère de l'Éducation",
    totalAmount: 1350000000,
    allocatedAmount: 0,
    status: "draft"
  },
  {
    id: "b9",
    year: 2024,
    ministryId: "m2",
    ministryName: "Ministère de la Santé",
    totalAmount: 1050000000,
    allocatedAmount: 0,
    status: "draft"
  }
];

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    // Simulate API call
    const loadBudgets = () => {
      setBudgets(mockBudgets);
      setFilteredBudgets(mockBudgets);
    };
    
    loadBudgets();
  }, []);

  useEffect(() => {
    let result = budgets;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(budget => 
        budget.ministryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by year
    if (yearFilter) {
      result = result.filter(budget => 
        budget.year.toString() === yearFilter
      );
    }
    
    // Filter by status
    if (statusFilter) {
      result = result.filter(budget => 
        budget.status === statusFilter
      );
    }
    
    setFilteredBudgets(result);
  }, [budgets, searchTerm, yearFilter, statusFilter]);

  const getStatusBadge = (status: Budget["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Brouillon</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400">En attente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400">Rejeté</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dashboard>
      <DashboardHeader 
        title="Gestion des Budgets" 
        description="Créez, modifiez et suivez les budgets des ministères"
      >
        <Button className="shadow-subtle">
          <FilePlus className="mr-2 h-4 w-4" />
          Nouveau budget
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Card className="budget-card">
          <CardHeader>
            <CardTitle>Filtrer les budgets</CardTitle>
            <CardDescription>
              Utilisez les filtres ci-dessous pour affiner votre recherche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par ministère..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les années</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </DashboardSection>

      <DashboardSection>
        <Card className="budget-card">
          <CardHeader>
            <CardTitle>Liste des Budgets</CardTitle>
            <CardDescription>
              {filteredBudgets.length} budget{filteredBudgets.length !== 1 ? 's' : ''} trouvé{filteredBudgets.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead className="text-right">Montant Total</TableHead>
                    <TableHead className="text-right">Montant Alloué</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.length > 0 ? (
                    filteredBudgets.map((budget) => (
                      <TableRow 
                        key={budget.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{budget.ministryName}</TableCell>
                        <TableCell>{budget.year}</TableCell>
                        <TableCell className="text-right">{formatCurrency(budget.totalAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(budget.allocatedAmount)}</TableCell>
                        <TableCell className="text-right">{getStatusBadge(budget.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Aucun budget trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </DashboardSection>
    </Dashboard>
  );
}
