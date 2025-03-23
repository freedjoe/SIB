
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PlusCircle, Search, Trash2, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Mock data for portfolios
const MOCK_PORTFOLIOS = [
  { id: 1, name: "Transport Infrastructure", manager: "Mohammed Ali", budget: "250,000,000", programs: 5, status: "active" },
  { id: 2, name: "Digital Transformation", manager: "Karima Benali", budget: "180,000,000", programs: 3, status: "active" },
  { id: 3, name: "Social Housing", manager: "Youcef Mansour", budget: "320,000,000", programs: 4, status: "active" },
  { id: 4, name: "Agricultural Development", manager: "Amina Kadi", budget: "150,000,000", programs: 6, status: "active" },
  { id: 5, name: "Healthcare Modernization", manager: "Salem Rachid", budget: "280,000,000", programs: 3, status: "active" },
  { id: 6, name: "Renewable Energy", manager: "Leila Merabet", budget: "200,000,000", programs: 2, status: "active" },
  { id: 7, name: "Education Reform", manager: "Kamel Hamdi", budget: "220,000,000", programs: 4, status: "active" },
  { id: 8, name: "Urban Renewal", manager: "Nadia Bouaziz", budget: "190,000,000", programs: 3, status: "active" },
];

export default function Portfolios() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [portfolios, setPortfolios] = useState(MOCK_PORTFOLIOS);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    manager: "",
    budget: "",
    status: "active"
  });

  const filteredPortfolios = portfolios.filter(
    (portfolio) => 
      portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPortfolio = () => {
    const newPortfolio = {
      id: portfolios.length + 1,
      ...formData,
      programs: 0,
    };

    setPortfolios([...portfolios, newPortfolio]);
    toast.success(t("portfolios.addSuccess"));
    setIsAddDialogOpen(false);
    setFormData({ name: "", manager: "", budget: "", status: "active" });
  };

  const handleEditPortfolio = () => {
    const updatedPortfolios = portfolios.map((portfolio) =>
      portfolio.id === selectedPortfolio.id ? { ...portfolio, ...formData } : portfolio
    );
    
    setPortfolios(updatedPortfolios);
    toast.success(t("portfolios.updateSuccess"));
    setIsEditDialogOpen(false);
  };

  const handleDeletePortfolio = () => {
    const updatedPortfolios = portfolios.filter(
      (portfolio) => portfolio.id !== selectedPortfolio.id
    );
    
    setPortfolios(updatedPortfolios);
    toast.success(t("portfolios.deleteSuccess"));
  };

  const openEditDialog = (portfolio: any) => {
    setSelectedPortfolio(portfolio);
    setFormData({
      name: portfolio.name,
      manager: portfolio.manager,
      budget: portfolio.budget,
      status: portfolio.status,
    });
    setIsEditDialogOpen(true);
  };

  const viewPortfolio = (portfolio: any) => {
    // Navigate to programs with filter
    navigate(`/programs?portfolio=${portfolio.id}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("portfolios.title")}</h1>
        <p className="text-muted-foreground">
          {t("portfolios.description")}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>{t("portfolios.list")}</CardTitle>
            <div className="flex items-center gap-2">
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
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("portfolios.add")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("portfolios.add")}</DialogTitle>
                    <DialogDescription>
                      {t("portfolios.addDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{t("portfolios.name")}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="manager">{t("portfolios.manager")}</Label>
                      <Input
                        id="manager"
                        name="manager"
                        value={formData.manager}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget">{t("portfolios.budget")}</Label>
                      <Input
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddPortfolio}>{t("common.save")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">{t("portfolios.name")}</th>
                  <th className="text-left py-3 px-4">{t("portfolios.manager")}</th>
                  <th className="text-left py-3 px-4">{t("portfolios.budget")}</th>
                  <th className="text-left py-3 px-4">{t("portfolios.programs")}</th>
                  <th className="text-left py-3 px-4">{t("common.status")}</th>
                  <th className="text-left py-3 px-4 w-24">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPortfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{portfolio.name}</td>
                    <td className="py-3 px-4">{portfolio.manager}</td>
                    <td className="py-3 px-4">{portfolio.budget} DZD</td>
                    <td className="py-3 px-4">{portfolio.programs}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                        {portfolio.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">{t("common.openMenu")}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => viewPortfolio(portfolio)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("common.view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(portfolio)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("portfolios.deleteWarning")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => {
                                    setSelectedPortfolio(portfolio);
                                    handleDeletePortfolio();
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t("common.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Portfolio Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("portfolios.edit")}</DialogTitle>
            <DialogDescription>
              {t("portfolios.editDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t("portfolios.name")}</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-manager">{t("portfolios.manager")}</Label>
              <Input
                id="edit-manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-budget">{t("portfolios.budget")}</Label>
              <Input
                id="edit-budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditPortfolio}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
