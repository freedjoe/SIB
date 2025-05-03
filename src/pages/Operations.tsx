import { useState, useEffect } from "react";
import { Dashboard, DashboardHeader, DashboardSection } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency } from "@/lib/utils";
import {
  FileCog,
  SearchIcon,
  Plus,
  X,
  FileText,
  ClipboardEdit,
  Map,
  PenTool,
  CalendarIcon,
  Upload,
  ChevronRight,
  ChevronLeft,
  Save,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { OperationsTable } from "@/components/tables/OperationsTable";
import { Operation, Wilaya, Program, Action } from "@/types/database.types";
import { useOperations, useOperationMutation, useWilayas, usePrograms, useActions } from "@/hooks/supabase";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [titreBudgetaireFilter, setTitreBudgetaireFilter] = useState("all");
  const [origineFinancementFilter, setOrigineFinancementFilter] = useState("all");
  const [currentOperation, setCurrentOperation] = useState<Operation | null>(null);

  // Fetch operations data using the useOperations hook
  const {
    data: operationsData = [],
    isLoading: operationsLoading,
    refetch: refetchOperations,
  } = useOperations({
    select: "*, action:action_id(*), wilaya:wilaya_id(*), budget_title:budget_title_id(*), ministry:ministry_id(*)",
  });

  // Fetch wilayas data
  const { data: wilayasData = [] } = useWilayas({
    sort: { column: "name", ascending: true },
  });

  // Fetch programs data
  const { data: programsData = [] } = usePrograms({
    sort: { column: "name", ascending: true },
  });

  // Fetch actions data
  const { data: actionsData = [] } = useActions({
    sort: { column: "name", ascending: true },
  });

  // Setup mutation for operations
  const operationMutation = useOperationMutation({
    onSuccess: () => {
      refetchOperations();
      toast({
        title: "Operation Successful",
        description: "The database has been successfully updated.",
      });
    },
  });

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newOperation, setNewOperation] = useState<Partial<Operation>>({
    name: "",
    description: "",
    action_id: "",
    code: "",
    wilaya_id: "",
    titre_budgetaire: 1,
    origine_financement: "budget_national",
    allocated_ae: 0,
    allocated_cp: 0,
    consumed_ae: 0,
    consumed_cp: 0,
    physical_rate: 0,
    financial_rate: 0,
    status: "planned",
    inscription_date: new Date().toISOString(),
  });

  // Titre budgétaire options
  const titresBudgetaires = [
    { id: 1, name: "Operating Expenses", shortLabel: "T1" },
    { id: 2, name: "Public Equipment Expenses", shortLabel: "T2" },
    { id: 3, name: "Capital Expenses (or Transfers)", shortLabel: "T3" },
    { id: 4, name: "Public Debt Charges", shortLabel: "T4" },
    { id: 5, name: "Exceptional Expenses", shortLabel: "T5" },
  ];

  // Filter operations based on search and filter criteria
  const filteredOperations = operationsData.filter((operation) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (operation.name || "").toLowerCase().includes(searchLower) ||
      (operation.code || "").toLowerCase().includes(searchLower) ||
      (operation.description || "").toLowerCase().includes(searchLower) ||
      (operation.wilaya?.name || "").toLowerCase().includes(searchLower);

    // Program filter from nested action's program_id
    const matchesProgram = programFilter === "all" || operation.action?.program_id === programFilter;

    // Wilaya filter
    const matchesWilaya = wilayaFilter === "all" || operation.wilaya_id === wilayaFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || (operation.status || "").toLowerCase() === statusFilter.toLowerCase();

    // Titre budgétaire filter
    const matchesTitreBudgetaire =
      titreBudgetaireFilter === "all" || (operation.titre_budgetaire && operation.titre_budgetaire.toString() === titreBudgetaireFilter);

    // Origine financement filter
    const matchesOrigineFinancement =
      origineFinancementFilter === "all" || (operation.origine_financement || "").toLowerCase() === origineFinancementFilter.toLowerCase();

    // Return true if all filters match
    return matchesSearch && matchesProgram && matchesWilaya && matchesStatus && matchesTitreBudgetaire && matchesOrigineFinancement;
  });

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
            Completed
          </Badge>
        );
      case "planned":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-400">
            Planned
          </Badge>
        );
      case "en_pause":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400">
            On Hold
          </Badge>
        );
      case "arreter":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400">
            Stopped
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-400">
            Draft
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-400">
            Unknown
          </Badge>
        );
    }
  };

  // Get progress bar color based on percentage
  const getProgressBarColor = (progress: number | undefined | null) => {
    if (!progress) return "bg-gray-600";
    if (progress < 25) return "bg-red-600";
    if (progress < 50) return "bg-orange-600";
    if (progress < 75) return "bg-yellow-600";
    return "bg-green-600";
  };

  // Get progress text color based on percentage
  const getProgressTextColor = (progress: number | undefined | null) => {
    if (!progress) return "text-gray-600";
    if (progress < 25) return "text-red-600";
    if (progress < 50) return "text-orange-600";
    if (progress < 75) return "text-yellow-600";
    return "text-green-600";
  };

  // Handler functions
  const handleOpenAddDialog = () => {
    setNewOperation({
      name: "",
      description: "",
      action_id: "",
      code: "",
      wilaya_id: "",
      titre_budgetaire: 1,
      origine_financement: "budget_national",
      allocated_ae: 0,
      allocated_cp: 0,
      consumed_ae: 0,
      consumed_cp: 0,
      physical_rate: 0,
      financial_rate: 0,
      status: "planned",
      inscription_date: new Date().toISOString(),
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setNewOperation({
      name: operation.name,
      description: operation.description,
      action_id: operation.action_id,
      code: operation.code,
      wilaya_id: operation.wilaya_id,
      titre_budgetaire: operation.titre_budgetaire,
      origine_financement: operation.origine_financement,
      allocated_ae: operation.allocated_ae,
      allocated_cp: operation.allocated_cp,
      consumed_ae: operation.consumed_ae,
      consumed_cp: operation.consumed_cp,
      physical_rate: operation.physical_rate,
      financial_rate: operation.financial_rate,
      status: operation.status,
      inscription_date: operation.inscription_date,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenViewDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (operation: Operation) => {
    setCurrentOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  // Handler for adding a new operation
  const handleAddOperation = async () => {
    if (!newOperation.name || !newOperation.action_id || !newOperation.code || !newOperation.wilaya_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await operationMutation.mutateAsync({
        type: "INSERT",
        data: newOperation,
      });

      setIsAddDialogOpen(false);
      toast({
        title: "Operation Added",
        description: `The operation "${newOperation.name}" has been successfully added.`,
      });
    } catch (error) {
      console.error("Error adding operation:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the operation.",
        variant: "destructive",
      });
    }
  };

  // Handler for editing an operation
  const handleEditOperation = async () => {
    if (!currentOperation) return;

    if (!newOperation.name || !newOperation.action_id || !newOperation.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await operationMutation.mutateAsync({
        type: "UPDATE",
        id: currentOperation.id,
        data: newOperation,
      });

      setIsEditDialogOpen(false);
      toast({
        title: "Operation Updated",
        description: `The operation has been successfully updated.`,
      });
    } catch (error) {
      console.error("Error updating operation:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the operation.",
        variant: "destructive",
      });
    }
  };

  // Handler for deleting an operation
  const handleDeleteOperation = async () => {
    if (!currentOperation) return;

    try {
      await operationMutation.mutateAsync({
        type: "DELETE",
        id: currentOperation.id,
      });

      setIsDeleteDialogOpen(false);
      toast({
        title: "Operation Deleted",
        description: `The operation has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Error deleting operation:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the operation.",
        variant: "destructive",
      });
    }
  };

  if (operationsLoading) {
    return <PageLoadingSpinner message="Loading operations..." />;
  }

  // Add Operation Dialog - Wizard style
  const AddOperationDialog = () => {
    return (
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Operation</DialogTitle>
            <DialogDescription>Fill in the operation details to create a new operation in the system.</DialogDescription>
          </DialogHeader>

          {/* Wizard steps */}
          <div className="mt-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="details">Operation Details</TabsTrigger>
                <TabsTrigger value="financial">Financial Information</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="notes">Observations</TabsTrigger>
              </TabsList>

              {/* Step 1: Operation Details */}
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Operation Details</CardTitle>
                    <CardDescription>Basic information about the operation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Operation Name</Label>
                        <Input
                          id="name"
                          value={newOperation.name}
                          onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                          placeholder="Operation name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code">Operation Code</Label>
                        <Input
                          id="code"
                          value={newOperation.code}
                          onChange={(e) => setNewOperation({ ...newOperation, code: e.target.value })}
                          placeholder="Operation code"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newOperation.description}
                        onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                        placeholder="Describe the operation"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="program">Program</Label>
                        <Select
                          value={newOperation.program_id}
                          onValueChange={(value) => {
                            setNewOperation({ ...newOperation, program_id: value });
                            // Reset action when program changes
                            setNewOperation((prev) => ({ ...prev, action_id: "" }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a program" />
                          </SelectTrigger>
                          <SelectContent>
                            {programsData.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="action">Action</Label>
                        <Select value={newOperation.action_id} onValueChange={(value) => setNewOperation({ ...newOperation, action_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                          <SelectContent>
                            {actionsData
                              .filter((action) => !newOperation.program_id || action.program_id === newOperation.program_id)
                              .map((action) => (
                                <SelectItem key={action.id} value={action.id}>
                                  {action.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wilaya">Wilaya</Label>
                        <Select value={newOperation.wilaya_id} onValueChange={(value) => setNewOperation({ ...newOperation, wilaya_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a wilaya" />
                          </SelectTrigger>
                          <SelectContent>
                            {wilayasData.map((wilaya) => (
                              <SelectItem key={wilaya.id} value={wilaya.id}>
                                {wilaya.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget_title">Budget Title</Label>
                        <Select
                          value={newOperation.titre_budgetaire?.toString()}
                          onValueChange={(value) => setNewOperation({ ...newOperation, titre_budgetaire: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a budget title" />
                          </SelectTrigger>
                          <SelectContent>
                            {titresBudgetaires.map((titre) => (
                              <SelectItem key={titre.id} value={titre.id.toString()}>
                                {titre.shortLabel} - {titre.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newOperation.status}
                        onValueChange={(value) =>
                          setNewOperation({
                            ...newOperation,
                            status: value as "planned" | "in_progress" | "completed" | "en_pause" | "arreter" | "draft",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="en_pause">On Hold</SelectItem>
                          <SelectItem value="arreter">Stopped</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inscription_date">Registration Date</Label>
                        <Input
                          id="inscription_date"
                          type="date"
                          value={newOperation.inscription_date ? new Date(newOperation.inscription_date).toISOString().split("T")[0] : ""}
                          onChange={(e) => setNewOperation({ ...newOperation, inscription_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => document.querySelector('[data-value="financial"]')?.click()}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Step 2: Financial Information */}
              <TabsContent value="financial">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Information</CardTitle>
                    <CardDescription>Funding sources and financial allocations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="funding_source">Funding Source</Label>
                        <Select
                          value={newOperation.origine_financement}
                          onValueChange={(value) =>
                            setNewOperation({ ...newOperation, origine_financement: value as "budget_national" | "financement_exterieur" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select funding source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget_national">National Budget</SelectItem>
                            <SelectItem value="financement_exterieur">External Funding</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Commitment Authorizations (AE)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="allocated_ae">Allocated AE</Label>
                          <Input
                            id="allocated_ae"
                            type="number"
                            value={newOperation.allocated_ae || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, allocated_ae: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="consumed_ae">Consumed AE</Label>
                          <Input
                            id="consumed_ae"
                            type="number"
                            value={newOperation.consumed_ae || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, consumed_ae: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Payment Credits (CP)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="allocated_cp">Allocated CP</Label>
                          <Input
                            id="allocated_cp"
                            type="number"
                            value={newOperation.allocated_cp || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, allocated_cp: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="consumed_cp">Consumed CP</Label>
                          <Input
                            id="consumed_cp"
                            type="number"
                            value={newOperation.consumed_cp || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, consumed_cp: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Rates</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="financial_rate">Financial Rate (%)</Label>
                          <Input
                            id="financial_rate"
                            type="number"
                            min="0"
                            max="100"
                            value={newOperation.financial_rate || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, financial_rate: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                          {newOperation.allocated_ae && newOperation.allocated_ae > 0 && newOperation.consumed_ae ? (
                            <p className="text-xs text-gray-500 mt-1">
                              Calculated: {((newOperation.consumed_ae / newOperation.allocated_ae) * 100).toFixed(1)}%
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => document.querySelector('[data-value="details"]')?.click()}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => document.querySelector('[data-value="implementation"]')?.click()}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Step 3: Implementation Details */}
              <TabsContent value="implementation">
                <Card>
                  <CardHeader>
                    <CardTitle>Implementation Details</CardTitle>
                    <CardDescription>Timeline and physical progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newOperation.start_date || ""}
                          onChange={(e) => setNewOperation({ ...newOperation, start_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newOperation.end_date || ""}
                          onChange={(e) => setNewOperation({ ...newOperation, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physical_rate">Physical Progress Rate (%)</Label>
                      <Input
                        id="physical_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={newOperation.physical_rate || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, physical_rate: parseFloat(e.target.value) })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="implementation_notes">Implementation Notes</Label>
                      <Textarea
                        id="implementation_notes"
                        value={newOperation.implementation_notes || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, implementation_notes: e.target.value })}
                        placeholder="Add any relevant notes about the implementation"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => document.querySelector('[data-value="financial"]')?.click()}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => document.querySelector('[data-value="documents"]')?.click()}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Step 4: Documents */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Operation Documents</CardTitle>
                    <CardDescription>Upload and manage operation-related documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Drag and drop documents here or click to browse</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS, JPG, PNG (Max. 10MB)</p>
                        </div>
                        <Button type="button" variant="outline" className="mt-4" onClick={() => document.getElementById("document-upload")?.click()}>
                          Upload Documents
                        </Button>
                        <input id="document-upload" type="file" multiple className="hidden" />
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Document types to include:</h3>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Technical specifications</li>
                        <li>Funding agreements</li>
                        <li>Contract documents</li>
                        <li>Progress reports</li>
                        <li>Technical diagrams</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => document.querySelector('[data-value="implementation"]')?.click()}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => document.querySelector('[data-value="notes"]')?.click()}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Step 5: Observations */}
              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>Observations and Notes</CardTitle>
                    <CardDescription>Add any additional notes or observations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="observation">Add an observation</Label>
                      <Textarea
                        id="observation"
                        value={newOperation.observation || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, observation: e.target.value })}
                        placeholder="Add any observations or notes about this operation"
                        rows={5}
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        id="highlight"
                        checked={newOperation.highlighted || false}
                        onCheckedChange={(checked) => setNewOperation({ ...newOperation, highlighted: checked as boolean })}
                      />
                      <Label
                        htmlFor="highlight"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Flag this operation for special attention
                      </Label>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => document.querySelector('[data-value="documents"]')?.click()}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={handleAddOperation}>
                      Save Operation
                      <Save className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Edit Operation Dialog - Wizard style
  const EditOperationDialog = () => {
    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Operation</DialogTitle>
            <DialogDescription>Update operation information in the system</DialogDescription>
          </DialogHeader>

          {/* Wizard steps */}
          <div className="mt-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="details">Operation Details</TabsTrigger>
                <TabsTrigger value="financial">Financial Information</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="notes">Observations</TabsTrigger>
              </TabsList>

              {/* Step 1: Operation Details */}
              <TabsContent value="details" id="edit-details-tab">
                <Card>
                  <CardHeader>
                    <CardTitle>Operation Details</CardTitle>
                    <CardDescription>Basic information about the operation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Operation Name</Label>
                        <Input
                          id="edit-name"
                          value={newOperation.name}
                          onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                          placeholder="Operation name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-code">Operation Code</Label>
                        <Input
                          id="edit-code"
                          value={newOperation.code}
                          onChange={(e) => setNewOperation({ ...newOperation, code: e.target.value })}
                          placeholder="Operation code"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={newOperation.description}
                        onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                        placeholder="Describe the operation"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-program">Program</Label>
                        <Select
                          value={newOperation.program_id}
                          onValueChange={(value) => {
                            setNewOperation({ ...newOperation, program_id: value });
                            // Reset action when program changes
                            setNewOperation((prev) => ({ ...prev, action_id: "" }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a program" />
                          </SelectTrigger>
                          <SelectContent>
                            {programsData.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-action">Action</Label>
                        <Select value={newOperation.action_id} onValueChange={(value) => setNewOperation({ ...newOperation, action_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                          <SelectContent>
                            {actionsData
                              .filter((action) => !newOperation.program_id || action.program_id === newOperation.program_id)
                              .map((action) => (
                                <SelectItem key={action.id} value={action.id}>
                                  {action.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-wilaya">Wilaya</Label>
                        <Select value={newOperation.wilaya_id} onValueChange={(value) => setNewOperation({ ...newOperation, wilaya_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a wilaya" />
                          </SelectTrigger>
                          <SelectContent>
                            {wilayasData.map((wilaya) => (
                              <SelectItem key={wilaya.id} value={wilaya.id}>
                                {wilaya.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-budget_title">Budget Title</Label>
                        <Select
                          value={newOperation.titre_budgetaire?.toString()}
                          onValueChange={(value) => setNewOperation({ ...newOperation, titre_budgetaire: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a budget title" />
                          </SelectTrigger>
                          <SelectContent>
                            {titresBudgetaires.map((titre) => (
                              <SelectItem key={titre.id} value={titre.id.toString()}>
                                {titre.shortLabel} - {titre.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={newOperation.status}
                        onValueChange={(value) =>
                          setNewOperation({
                            ...newOperation,
                            status: value as "planned" | "in_progress" | "completed" | "en_pause" | "arreter" | "draft",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="en_pause">On Hold</SelectItem>
                          <SelectItem value="arreter">Stopped</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-inscription_date">Registration Date</Label>
                        <Input
                          id="edit-inscription_date"
                          type="date"
                          value={newOperation.inscription_date ? new Date(newOperation.inscription_date).toISOString().split("T")[0] : ""}
                          onChange={(e) => setNewOperation({ ...newOperation, inscription_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => document.getElementById("edit-financial-tab")?.click()}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Step 2: Financial Information */}
              <TabsContent value="financial" id="edit-financial-tab">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Information</CardTitle>
                    <CardDescription>Funding sources and financial allocations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-funding_source">Funding Source</Label>
                        <Select
                          value={newOperation.origine_financement}
                          onValueChange={(value) =>
                            setNewOperation({ ...newOperation, origine_financement: value as "budget_national" | "financement_exterieur" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select funding source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget_national">National Budget</SelectItem>
                            <SelectItem value="financement_exterieur">External Funding</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Commitment Authorizations (AE)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-allocated_ae">Allocated AE</Label>
                          <Input
                            id="edit-allocated_ae"
                            type="number"
                            value={newOperation.allocated_ae || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, allocated_ae: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-consumed_ae">Consumed AE</Label>
                          <Input
                            id="edit-consumed_ae"
                            type="number"
                            value={newOperation.consumed_ae || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, consumed_ae: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Payment Credits (CP)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-allocated_cp">Allocated CP</Label>
                          <Input
                            id="edit-allocated_cp"
                            type="number"
                            value={newOperation.allocated_cp || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, allocated_cp: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-consumed_cp">Consumed CP</Label>
                          <Input
                            id="edit-consumed_cp"
                            type="number"
                            value={newOperation.consumed_cp || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, consumed_cp: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Rates</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-financial_rate">Financial Rate (%)</Label>
                          <Input
                            id="edit-financial_rate"
                            type="number"
                            min="0"
                            max="100"
                            value={newOperation.financial_rate || ""}
                            onChange={(e) => setNewOperation({ ...newOperation, financial_rate: parseFloat(e.target.value) })}
                            placeholder="0"
                          />
                          {newOperation.allocated_ae && newOperation.allocated_ae > 0 && newOperation.consumed_ae ? (
                            <p className="text-xs text-gray-500 mt-1">
                              Calculated: {((newOperation.consumed_ae / newOperation.allocated_ae) * 100).toFixed(1)}%
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => document.getElementById("edit-details-tab")?.click()}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => document.getElementById("edit-implementation-tab")?.click()}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Step 3: Implementation Details */}
              <TabsContent value="implementation" id="edit-implementation-tab">
                <Card>
                  <CardHeader>
                    <CardTitle>Implementation Details</CardTitle>
                    <CardDescription>Timeline and physical progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-start_date">Start Date</Label>
                        <Input
                          id="edit-start_date"
                          type="date"
                          value={newOperation.start_date ? new Date(newOperation.start_date).toISOString().split("T")[0] : ""}
                          onChange={(e) => setNewOperation({ ...newOperation, start_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-end_date">End Date</Label>
                        <Input
                          id="edit-end_date"
                          type="date"
                          value={newOperation.end_date ? new Date(newOperation.end_date).toISOString().split("T")[0] : ""}
                          onChange={(e) => setNewOperation({ ...newOperation, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-physical_rate">Physical Progress Rate (%)</Label>
                      <Input
                        id="edit-physical_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={newOperation.physical_rate || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, physical_rate: parseFloat(e.target.value) })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-implementation_notes">Implementation Notes</Label>
                      <Textarea
                        id="edit-implementation_notes"
                        value={newOperation.implementation_notes || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, implementation_notes: e.target.value })}
                        placeholder="Add any relevant notes about the implementation"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => document.getElementById("edit-financial-tab")?.click()}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => document.getElementById("edit-documents-tab")?.click()}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Step 4: Documents */}
              <TabsContent value="documents" id="edit-documents-tab">
                <Card>
                  <CardHeader>
                    <CardTitle>Operation Documents</CardTitle>
                    <CardDescription>Upload and manage operation-related documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* List existing documents if any */}
                      {currentOperation?.documents && currentOperation.documents.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          {currentOperation.documents.map((doc, index) => (
                            <div key={index} className="border rounded-md overflow-hidden">
                              <div className="bg-gray-100 h-48 flex items-center justify-center">
                                <FileText className="h-16 w-16 text-gray-400" />
                              </div>
                              <div className="p-3">
                                <p className="font-medium">{doc.name}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <p className="text-xs text-gray-500">{doc.date}</p>
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-6">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Drag and drop documents here or click to browse</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS, JPG, PNG (Max. 10MB)</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => document.getElementById("edit-document-upload")?.click()}
                          >
                            Upload Documents
                          </Button>
                          <input id="edit-document-upload" type="file" multiple className="hidden" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => document.getElementById("edit-implementation-tab")?.click()}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => document.getElementById("edit-notes-tab")?.click()}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Step 5: Observations */}
              <TabsContent value="notes" id="edit-notes-tab">
                <Card>
                  <CardHeader>
                    <CardTitle>Observations and Notes</CardTitle>
                    <CardDescription>Add any additional notes or observations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Display existing observations if any */}
                    {currentOperation?.observations && currentOperation.observations.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <h3 className="text-sm font-medium">Existing Observations</h3>
                        {currentOperation.observations.map((obs, index) => (
                          <div key={index} className="border p-3 rounded-md">
                            <p className="text-sm">{obs.content}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-gray-500">
                                Added by: {obs.author} on {obs.date}
                              </p>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="edit-observation">Add an observation</Label>
                      <Textarea
                        id="edit-observation"
                        value={newOperation.observation || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, observation: e.target.value })}
                        placeholder="Add any observations or notes about this operation"
                        rows={5}
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        id="edit-highlight"
                        checked={newOperation.highlighted || false}
                        onCheckedChange={(checked) => setNewOperation({ ...newOperation, highlighted: checked as boolean })}
                      />
                      <Label
                        htmlFor="edit-highlight"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Flag this operation for special attention
                      </Label>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => document.getElementById("edit-documents-tab")?.click()}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={handleEditOperation}>
                      Save Changes
                      <Save className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Dashboard>
      <DashboardHeader title="Operations Management" description="Track and manage operations within budgetary actions">
        <Button className="shadow-subtle" onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Operation
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="list" className="animate-fade-in">
            <Card className="budget-card mb-6">
              <CardHeader>
                <CardTitle className="text-base">Filter Operations</CardTitle>
                <CardDescription>Search and filter by program or status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-64">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search for an operation..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={programFilter} onValueChange={setProgramFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programsData.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by wilaya" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Wilayas</SelectItem>
                        {wilayasData.map((wilaya) => (
                          <SelectItem key={wilaya.id} value={wilaya.id}>
                            {wilaya.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="en_pause">On Hold</SelectItem>
                        <SelectItem value="arreter">Stopped</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={titreBudgetaireFilter} onValueChange={setTitreBudgetaireFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by budget title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Titles</SelectItem>
                        {titresBudgetaires.map((titre) => (
                          <SelectItem key={titre.id} value={titre.id.toString()}>
                            {titre.shortLabel} - {titre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={origineFinancementFilter} onValueChange={setOrigineFinancementFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by funding source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="budget_national">National Budget</SelectItem>
                        <SelectItem value="financement_exterieur">External Funding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="budget-card">
              <CardHeader>
                <CardTitle>Operations List</CardTitle>
                <CardDescription>
                  {filteredOperations.length} operation{filteredOperations.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OperationsTable
                  operations={filteredOperations}
                  formatCurrency={formatCurrency}
                  onView={handleOpenViewDialog}
                  onEdit={handleOpenEditDialog}
                  onDelete={handleOpenDeleteDialog}
                  onRefresh={() => {
                    // Simulate refresh
                    toast({
                      title: "Data Refreshed",
                      description: "The operations list has been refreshed",
                    });
                    refetchOperations();
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>

      <AddOperationDialog />
      <EditOperationDialog />
    </Dashboard>
  );
}
