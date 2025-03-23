
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

// Mock data for actions
const MOCK_ACTIONS = [
  { id: 1, name: "Road Maintenance", program_id: 1, program_name: "Road Network Renovation", action_type: "centralized", allocated_amount: "45,000,000", operations_count: 3 },
  { id: 2, name: "Bridge Construction", program_id: 1, program_name: "Road Network Renovation", action_type: "centralized", allocated_amount: "35,000,000", operations_count: 2 },
  { id: 3, name: "Signal System Upgrade", program_id: 1, program_name: "Road Network Renovation", action_type: "decentralized", allocated_amount: "15,000,000", operations_count: 4 },
  { id: 4, name: "Rail Track Expansion", program_id: 2, program_name: "Railway Expansion", action_type: "centralized", allocated_amount: "50,000,000", operations_count: 1 },
  { id: 5, name: "Station Renovation", program_id: 2, program_name: "Railway Expansion", action_type: "decentralized", allocated_amount: "20,000,000", operations_count: 2 },
  { id: 6, name: "Digital Service Portal", program_id: 3, program_name: "E-Government Services", action_type: "centralized", allocated_amount: "30,000,000", operations_count: 2 },
  { id: 7, name: "Biometric ID System", program_id: 4, program_name: "Digital Identity System", action_type: "centralized", allocated_amount: "25,000,000", operations_count: 1 },
  { id: 8, name: "Affordable Housing Block A", program_id: 5, program_name: "Affordable Housing Project", action_type: "decentralized", allocated_amount: "40,000,000", operations_count: 3 },
];

// Mock data for programs
const MOCK_PROGRAMS = [
  { id: 1, name: "Road Network Renovation" },
  { id: 2, name: "Railway Expansion" },
  { id: 3, name: "E-Government Services" },
  { id: 4, name: "Digital Identity System" },
  { id: 5, name: "Affordable Housing Project" },
  { id: 6, name: "Urban Apartments" },
  { id: 7, name: "Desert Agriculture" },
  { id: 8, name: "Water Resources Management" },
];

export default function Actions() {
  const { t } = useTranslation();
  const [actions, setActions] = useState(MOCK_ACTIONS);
  const [programs] = useState(MOCK_PROGRAMS);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    program_id: "",
    action_type: "centralized",
    allocated_amount: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddAction = () => {
    if (!formData.name || !formData.program_id || !formData.allocated_amount) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    const selectedProgram = programs.find(p => p.id.toString() === formData.program_id);
    
    const newAction = {
      id: actions.length + 1,
      name: formData.name,
      program_id: parseInt(formData.program_id),
      program_name: selectedProgram?.name || "",
      action_type: formData.action_type,
      allocated_amount: formData.allocated_amount,
      operations_count: 0,
    };

    setActions([...actions, newAction]);
    toast.success(t("actions.addSuccess"));
    setFormData({ name: "", program_id: "", action_type: "centralized", allocated_amount: "" });
  };

  const handleEditAction = () => {
    if (!formData.name || !formData.program_id || !formData.allocated_amount) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    const selectedProgram = programs.find(p => p.id.toString() === formData.program_id);
    
    const updatedActions = actions.map((action) =>
      action.id === selectedAction.id 
        ? { 
            ...action, 
            name: formData.name,
            program_id: parseInt(formData.program_id),
            program_name: selectedProgram?.name || "",
            action_type: formData.action_type,
            allocated_amount: formData.allocated_amount,
          } 
        : action
    );
    
    setActions(updatedActions);
    toast.success(t("actions.updateSuccess"));
  };

  const handleDeleteAction = () => {
    const updatedActions = actions.filter(
      (action) => action.id !== selectedAction.id
    );
    
    setActions(updatedActions);
    toast.success(t("actions.deleteSuccess"));
  };

  const openEditDialog = (action: any) => {
    setSelectedAction(action);
    setFormData({
      name: action.name,
      program_id: action.program_id.toString(),
      action_type: action.action_type,
      allocated_amount: action.allocated_amount,
    });
  };

  const openViewDialog = (action: any) => {
    setSelectedAction(action);
    setIsViewDialogOpen(true);
  };

  const renderActionType = (action: any) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      action.action_type === 'centralized' 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
        : 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400'
    }`}>
      {action.action_type}
    </span>
  );

  const renderActionMenu = (action: any) => (
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
        <DropdownMenuItem onClick={() => openViewDialog(action)}>
          <Eye className="mr-2 h-4 w-4" />
          {t("common.view")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openEditDialog(action)}>
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
                {t("actions.deleteWarning")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  setSelectedAction(action);
                  handleDeleteAction();
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

  // Form for adding/editing actions
  const ActionForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">{t("actions.name")} *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program_id">{t("actions.program")} *</Label>
        <Select 
          value={formData.program_id} 
          onValueChange={(value) => handleSelectChange("program_id", value)}
        >
          <SelectTrigger id="program_id">
            <SelectValue placeholder={t("actions.selectProgram")} />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id.toString()}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="action_type">{t("actions.type")}</Label>
        <Select 
          value={formData.action_type} 
          onValueChange={(value) => handleSelectChange("action_type", value)}
        >
          <SelectTrigger id="action_type">
            <SelectValue placeholder={t("actions.selectType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="centralized">{t("actions.centralized")}</SelectItem>
            <SelectItem value="decentralized">{t("actions.decentralized")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="allocated_amount">{t("actions.amount")} *</Label>
        <Input
          id="allocated_amount"
          name="allocated_amount"
          value={formData.allocated_amount}
          onChange={handleInputChange}
          required
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("actions.title")}</h1>
        <p className="text-muted-foreground">
          {t("actions.description")}
        </p>
      </div>

      <DataTable
        title={t("actions.list")}
        data={actions}
        columns={[
          { key: "name", title: t("actions.name") },
          { key: "program_name", title: t("actions.program") },
          { 
            key: "action_type", 
            title: t("actions.type"),
            render: renderActionType,
          },
          { 
            key: "allocated_amount", 
            title: t("actions.amount"),
            render: (action) => `${action.allocated_amount} DZD` 
          },
          { 
            key: "operations_count", 
            title: t("actions.operations"),
            render: (action) => action.operations_count.toString()
          },
        ]}
        searchKeys={["name", "program_name"]}
        actionColumn={renderActionMenu}
        addButton={{
          title: t("actions.add"),
          content: (
            <>
              <ActionForm />
              <DialogFooter>
                <Button onClick={handleAddAction}>{t("common.save")}</Button>
              </DialogFooter>
            </>
          ),
        }}
      />

      {/* Edit Action Dialog */}
      <Dialog open={!!selectedAction && !isViewDialogOpen} onOpenChange={(open) => !open && setSelectedAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.edit")}</DialogTitle>
            <DialogDescription>
              {t("actions.editDescription")}
            </DialogDescription>
          </DialogHeader>
          <ActionForm />
          <DialogFooter>
            <Button onClick={handleEditAction}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Action Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("actions.details")}</DialogTitle>
            <DialogDescription>
              {t("actions.detailsDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedAction && (
            <div className="grid gap-6">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm">{t("actions.name")}</h3>
                    <p>{selectedAction.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{t("actions.program")}</h3>
                    <p>{selectedAction.program_name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{t("actions.type")}</h3>
                    {renderActionType(selectedAction)}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{t("actions.amount")}</h3>
                    <p>{selectedAction.allocated_amount} DZD</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">{t("actions.relatedOperations")}</h3>
                <Card>
                  <CardContent className="p-4">
                    {selectedAction.operations_count > 0 ? (
                      <div className="divide-y">
                        {Array.from({ length: selectedAction.operations_count }).map((_, i) => (
                          <div key={i} className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{t("operations.operation")} #{i+1}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" /> {t("common.view")}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        {t("actions.noOperationsYet")}
                      </p>
                    )}
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
                  openEditDialog(selectedAction);
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
