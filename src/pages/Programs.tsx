
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { Edit, Eye, Trash2 } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";

// Mock data for programs
const MOCK_PROGRAMS = [
  { id: 1, name: "Road Network Renovation", portfolio: 1, portfolioName: "Transport Infrastructure", minister: "Transport", budget: "120,000,000", status: "active" },
  { id: 2, name: "Railway Expansion", portfolio: 1, portfolioName: "Transport Infrastructure", minister: "Transport", budget: "80,000,000", status: "active" },
  { id: 3, name: "E-Government Services", portfolio: 2, portfolioName: "Digital Transformation", minister: "Digital Economy", budget: "60,000,000", status: "active" },
  { id: 4, name: "Digital Identity System", portfolio: 2, portfolioName: "Digital Transformation", minister: "Digital Economy", budget: "40,000,000", status: "active" },
  { id: 5, name: "Affordable Housing Project", portfolio: 3, portfolioName: "Social Housing", minister: "Housing", budget: "150,000,000", status: "active" },
  { id: 6, name: "Urban Apartments", portfolio: 3, portfolioName: "Social Housing", minister: "Housing", budget: "100,000,000", status: "active" },
  { id: 7, name: "Desert Agriculture", portfolio: 4, portfolioName: "Agricultural Development", minister: "Agriculture", budget: "70,000,000", status: "active" },
  { id: 8, name: "Water Resources Management", portfolio: 4, portfolioName: "Agricultural Development", minister: "Agriculture", budget: "40,000,000", status: "active" },
];

// Mock data for portfolios
const MOCK_PORTFOLIOS = [
  { id: 1, name: "Transport Infrastructure" },
  { id: 2, name: "Digital Transformation" },
  { id: 3, name: "Social Housing" },
  { id: 4, name: "Agricultural Development" },
  { id: 5, name: "Healthcare Modernization" },
  { id: 6, name: "Renewable Energy" },
  { id: 7, name: "Education Reform" },
  { id: 8, name: "Urban Renewal" },
];

export default function Programs() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Get portfolio filter from URL
  const searchParams = new URLSearchParams(location.search);
  const portfolioFilter = searchParams.get("portfolio");

  const [programs, setPrograms] = useState(MOCK_PROGRAMS);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [portfolios] = useState(MOCK_PORTFOLIOS);
  const [formData, setFormData] = useState({
    name: "",
    portfolio: "",
    minister: "",
    budget: "",
    status: "active"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Filter programs based on portfolio if provided
  const filteredPrograms = portfolioFilter
    ? programs.filter(program => program.portfolio === parseInt(portfolioFilter))
    : programs;

  // Reset URL parameter when component unmounts or on manual clear
  useEffect(() => {
    return () => {
      // This runs when component unmounts
      if (portfolioFilter) {
        navigate("/programs", { replace: true });
      }
    };
  }, []);

  const clearPortfolioFilter = () => {
    navigate("/programs", { replace: true });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddProgram = () => {
    if (!formData.name || !formData.portfolio || !formData.budget) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    const selectedPortfolio = portfolios.find(p => p.id.toString() === formData.portfolio);
    
    const newProgram = {
      id: programs.length + 1,
      name: formData.name,
      portfolio: parseInt(formData.portfolio),
      portfolioName: selectedPortfolio?.name || "",
      minister: formData.minister,
      budget: formData.budget,
      status: formData.status,
    };

    setPrograms([...programs, newProgram]);
    toast.success(t("programs.addSuccess"));
    setIsAddDialogOpen(false);
    setFormData({ name: "", portfolio: "", minister: "", budget: "", status: "active" });
  };

  const handleEditProgram = () => {
    if (!formData.name || !formData.portfolio || !formData.budget) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    const selectedPortfolio = portfolios.find(p => p.id.toString() === formData.portfolio);
    
    const updatedPrograms = programs.map((program) =>
      program.id === selectedProgram.id 
        ? { 
            ...program, 
            name: formData.name,
            portfolio: parseInt(formData.portfolio),
            portfolioName: selectedPortfolio?.name || "",
            minister: formData.minister,
            budget: formData.budget,
            status: formData.status,
          } 
        : program
    );
    
    setPrograms(updatedPrograms);
    toast.success(t("programs.updateSuccess"));
    setIsEditDialogOpen(false);
  };

  const handleDeleteProgram = () => {
    const updatedPrograms = programs.filter(
      (program) => program.id !== selectedProgram.id
    );
    
    setPrograms(updatedPrograms);
    toast.success(t("programs.deleteSuccess"));
  };

  const openEditDialog = (program: any) => {
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      portfolio: program.portfolio.toString(),
      minister: program.minister,
      budget: program.budget,
      status: program.status,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (program: any) => {
    setSelectedProgram(program);
    setIsViewDialogOpen(true);
  };

  const renderProgramStatus = (program: any) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      program.status === 'active' 
        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
        : program.status === 'pending'
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
        : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
    }`}>
      {program.status}
    </span>
  );

  const renderActionMenu = (program: any) => (
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
        <DropdownMenuItem onClick={() => openViewDialog(program)}>
          <Eye className="mr-2 h-4 w-4" />
          {t("common.view")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openEditDialog(program)}>
          <Edit className="mr-2 h-4 w-4" />
          {t("common.edit")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("programs.deleteWarning")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  setSelectedProgram(program);
                  handleDeleteProgram();
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
  );

  // Form for adding/editing programs
  const ProgramForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">{t("programs.name")} *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="portfolio">{t("programs.portfolio")} *</Label>
        <Select 
          value={formData.portfolio} 
          onValueChange={(value) => handleSelectChange("portfolio", value)}
        >
          <SelectTrigger id="portfolio">
            <SelectValue placeholder={t("programs.selectPortfolio")} />
          </SelectTrigger>
          <SelectContent>
            {portfolios.map((portfolio) => (
              <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                {portfolio.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="minister">{t("programs.minister")}</Label>
        <Input
          id="minister"
          name="minister"
          value={formData.minister}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="budget">{t("programs.budget")} *</Label>
        <Input
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">{t("common.status")}</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder={t("common.selectStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t("common.active")}</SelectItem>
            <SelectItem value="pending">{t("common.pending")}</SelectItem>
            <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("programs.title")}</h1>
        <p className="text-muted-foreground">
          {t("programs.description")}
        </p>
      </div>

      {portfolioFilter && (
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center">
            <span className="mr-2">{t("programs.filteredBy")}: {portfolios.find(p => p.id.toString() === portfolioFilter)?.name}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0" 
              onClick={clearPortfolioFilter}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <DataTable
        title={t("programs.list")}
        data={filteredPrograms}
        columns={[
          { key: "name", title: t("programs.name") },
          { key: "portfolioName", title: t("programs.portfolio") },
          { key: "minister", title: t("programs.minister") },
          { 
            key: "budget", 
            title: t("programs.budget"),
            render: (program) => `${program.budget} DZD`
          },
          { 
            key: "status", 
            title: t("common.status"),
            render: renderProgramStatus,
          },
        ]}
        searchKeys={["name", "portfolioName", "minister"]}
        actionColumn={renderActionMenu}
        addButton={{
          title: t("programs.add"),
          content: (
            <>
              <ProgramForm />
              <DialogFooter>
                <Button onClick={handleAddProgram}>{t("common.save")}</Button>
              </DialogFooter>
            </>
          ),
        }}
      />

      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("programs.edit")}</DialogTitle>
            <DialogDescription>
              {t("programs.editDescription")}
            </DialogDescription>
          </DialogHeader>
          <ProgramForm />
          <DialogFooter>
            <Button onClick={handleEditProgram}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Program Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("programs.details")}</DialogTitle>
            <DialogDescription>
              {t("programs.detailsDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedProgram && (
            <div className="grid gap-6">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm">{t("programs.name")}</h3>
                    <p>{selectedProgram.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{t("programs.portfolio")}</h3>
                    <p>{selectedProgram.portfolioName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{t("programs.minister")}</h3>
                    <p>{selectedProgram.minister}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{t("programs.budget")}</h3>
                    <p>{selectedProgram.budget} DZD</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{t("common.status")}</h3>
                    {renderProgramStatus(selectedProgram)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">{t("programs.relatedActions")}</h3>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-center text-muted-foreground py-4">
                      {t("programs.noActionsYet")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  {t("common.close")}
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  openEditDialog(selectedProgram);
                }}>
                  {t("common.edit")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
