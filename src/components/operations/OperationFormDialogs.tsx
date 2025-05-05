import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  CheckCircle,
  FileText,
  Upload,
  ChevronRight,
  ChevronLeft,
  Save,
  ClipboardList,
  FileSpreadsheet,
  FileText as FileIcon,
  Pencil,
} from "lucide-react";
import { Operation, Action, Wilaya, BudgetTitle } from "@/types/database.types";
import { useBudgetTitles } from "@/hooks/supabase";
import { cn } from "@/lib/utils";

interface OperationFormDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  newOperation: Partial<Operation>;
  setNewOperation: (operation: Partial<Operation>) => void;
  handleAddOperation: () => Promise<void>;

  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  currentOperation: Operation | null;
  handleEditOperation: () => Promise<void>;

  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleDeleteOperation: () => Promise<void>;

  actionsData: Action[];
  wilayasData: Wilaya[];
}

// Custom Step Indicator Component
type Step = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const StepIndicator: React.FC<{
  steps: Step[];
  currentStep: string;
  onChange: (step: string) => void;
}> = ({ steps, currentStep, onChange }) => {
  // Calculate the progress percentage based on current step
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // Calculate progress percentage properly adjusted to start from middle of first dot
  // and end at middle of last dot
  const totalSteps = steps.length - 1; // Number of segments between dots
  const progressPercentage = (currentStepIndex / totalSteps) * 100;

  return (
    <div className="mb-10 relative">
      <div className="relative flex justify-between items-center mb-8">
        {/* Steps indicators */}
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = currentStepIndex > index;

          // Calculate color styles based on step state
          const dotColorClasses =
            isCompleted || isActive
              ? "bg-primary border-primary shadow-md shadow-primary/20"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600";

          const labelColorClasses = isActive ? "text-primary font-medium" : isCompleted ? "text-primary/70" : "text-gray-500 dark:text-gray-400";

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step dot */}
              <button onClick={() => onChange(step.id)} className="group relative focus:outline-none">
                <span
                  className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                  ${dotColorClasses}
                  ${isActive ? "ring-4 ring-primary/20 scale-110" : ""}
                `}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <span className={`text-xs font-bold ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>{index + 1}</span>
                  )}
                </span>

                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 transform opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {step.label}
                    <div className="bg-gray-800 h-2 w-2 absolute -bottom-1 left-1/2 transform -translate-x-1/2 rotate-45"></div>
                  </div>
                </div>
              </button>

              {/* Step label */}
              <span className={`mt-2 text-xs whitespace-nowrap transition-colors duration-200 ${labelColorClasses}`}>{step.label}</span>
            </div>
          );
        })}

        {/* Progress bar positioned to start and end at the middle of dots */}
        <div className="absolute top-4 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
          {/* Background track */}
          <div
            className="absolute h-full bg-gray-100 dark:bg-gray-700"
            style={{
              left: `${100 / (steps.length * 2)}%`, // Start from middle of first dot
              right: `${100 / (steps.length * 2)}%`, // End at middle of last dot
              width: "auto", // Let the positioning determine the width
            }}
          />

          {/* Colored progress fill */}
          <div
            className="absolute h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{
              left: `${100 / (steps.length * 2)}%`, // Start from middle of first dot
              width: `${progressPercentage * (1 - 1 / steps.length)}%`, // Scaled to account for the margins
            }}
          />
        </div>
      </div>

      {/* Step description panel - Now with dark mode support */}
      <div className="py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-full">{steps.find((s) => s.id === currentStep)?.icon}</div>
          <div>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">{steps.find((s) => s.id === currentStep)?.label}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentStepIndex + 1} of {steps.length} steps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OperationFormDialogs: React.FC<OperationFormDialogsProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  newOperation,
  setNewOperation,
  handleAddOperation,
  isEditDialogOpen,
  setIsEditDialogOpen,
  currentOperation,
  handleEditOperation,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  handleDeleteOperation,
  actionsData,
  wilayasData,
}) => {
  const { data } = useBudgetTitles();
  const budgetTitles = (data as BudgetTitle[]) || [];

  const [addTab, setAddTab] = useState("details");
  const [editTab, setEditTab] = useState("details");

  const steps: Step[] = [
    { id: "details", label: "Operation Details", icon: <ClipboardList className="w-5 h-5" /> },
    { id: "financial", label: "Financial Information", icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: "implementation", label: "Implementation Details", icon: <CheckCircle className="w-5 h-5" /> },
    { id: "documents", label: "Documents", icon: <FileIcon className="w-5 h-5" /> },
    { id: "notes", label: "Observations", icon: <Pencil className="w-5 h-5" /> },
  ];

  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Operation</DialogTitle>
            <DialogDescription>Complete the information to create a new operation.</DialogDescription>
          </DialogHeader>

          <StepIndicator steps={steps} currentStep={addTab} onChange={setAddTab} />

          <Tabs value={addTab} onValueChange={setAddTab} className="w-full">
            {/* Step 1: Operation Details */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Operation Details</CardTitle>
                  <CardDescription>Enter basic information about the operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Operation Name</Label>
                      <Input
                        id="name"
                        value={newOperation.name || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                        placeholder="Operation name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Operation Code</Label>
                      <Input
                        id="code"
                        value={newOperation.code || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, code: e.target.value })}
                        placeholder="Operation code"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newOperation.description || ""}
                      onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                      placeholder="Description of the operation"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="action">Action</Label>
                      <Select value={newOperation.action_id || ""} onValueChange={(value) => setNewOperation({ ...newOperation, action_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                        <SelectContent>
                          {actionsData.map((action) => (
                            <SelectItem key={action.id} value={action.id}>
                              {action.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wilaya">Wilaya</Label>
                      <Select value={newOperation.wilaya_id || ""} onValueChange={(value) => setNewOperation({ ...newOperation, wilaya_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a wilaya" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayasData.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id}>
                              {wilaya.code} - {wilaya.name_fr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget_title_id">Budget Title</Label>
                      <Select
                        value={String(newOperation.budget_title_id || "")}
                        onValueChange={(value) => setNewOperation({ ...newOperation, budget_title_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a budget title" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetTitles &&
                            budgetTitles.map((titre: BudgetTitle) => (
                              <SelectItem key={titre.id} value={titre.id}>
                                {titre.code} - {titre.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                <CardFooter className="flex justify-end">
                  <Button onClick={() => setAddTab("financial")}>
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
                  <CardDescription>Enter financial details about the operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="funding_source">Funding Source</Label>
                    <Select
                      value={newOperation.origine_financement || "budget_national"}
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

                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium mb-3">Commitment Authorizations (AE)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="allocated_ae">Allocated AE</Label>
                        <Input
                          id="allocated_ae"
                          type="number"
                          value={newOperation.allocated_ae || 0}
                          onChange={(e) => setNewOperation({ ...newOperation, allocated_ae: parseFloat(e.target.value) })}
                          placeholder="Allocated AE"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consumed_ae">Consumed AE</Label>
                        <Input
                          id="consumed_ae"
                          type="number"
                          value={newOperation.consumed_ae || 0}
                          onChange={(e) => setNewOperation({ ...newOperation, consumed_ae: parseFloat(e.target.value) })}
                          placeholder="Consumed AE"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium mb-3">Payment Credits (CP)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="allocated_cp">Allocated CP</Label>
                        <Input
                          id="allocated_cp"
                          type="number"
                          value={newOperation.allocated_cp || 0}
                          onChange={(e) => setNewOperation({ ...newOperation, allocated_cp: parseFloat(e.target.value) })}
                          placeholder="Allocated CP"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consumed_cp">Consumed CP</Label>
                        <Input
                          id="consumed_cp"
                          type="number"
                          value={newOperation.consumed_cp || 0}
                          onChange={(e) => setNewOperation({ ...newOperation, consumed_cp: parseFloat(e.target.value) })}
                          placeholder="Consumed CP"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newOperation.status || "planned"}
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
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setAddTab("details")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={() => setAddTab("implementation")}>
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
                  <CardDescription>Enter information about the operation's implementation</CardDescription>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="physical_rate">Physical Rate (%)</Label>
                      <Input
                        id="physical_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={newOperation.physical_rate || 0}
                        onChange={(e) => setNewOperation({ ...newOperation, physical_rate: parseFloat(e.target.value) })}
                        placeholder="Physical rate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="financial_rate">Financial Rate (%)</Label>
                      <Input
                        id="financial_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={newOperation.financial_rate || 0}
                        onChange={(e) => setNewOperation({ ...newOperation, financial_rate: parseFloat(e.target.value) })}
                        placeholder="Financial rate"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor">Contractor</Label>
                    <Input
                      id="contractor"
                      value={newOperation.contractor || ""}
                      onChange={(e) => setNewOperation({ ...newOperation, contractor: e.target.value })}
                      placeholder="Contractor name"
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
                  <Button variant="outline" onClick={() => setAddTab("financial")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={() => setAddTab("documents")}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 4: Operation Documents */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Operation Documents</CardTitle>
                  <CardDescription>Add related documents to the operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-sm font-medium">Drag and drop files here</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, Word, Excel files</p>
                      <Button variant="outline" className="mt-4" size="sm">
                        Browse Files
                      </Button>
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
                  <Button variant="outline" onClick={() => setAddTab("implementation")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={() => setAddTab("notes")}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 5: Observations & Notes */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Observations & Notes</CardTitle>
                  <CardDescription>Add any additional notes or observations about the operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="observation">Notes & Observations</Label>
                    <Textarea
                      id="observation"
                      value={newOperation.observation || ""}
                      onChange={(e) => setNewOperation({ ...newOperation, observation: e.target.value })}
                      placeholder="Add any observations or notes about this operation"
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="highlight"
                      checked={newOperation.highlighted || false}
                      onCheckedChange={(checked) => setNewOperation({ ...newOperation, highlighted: checked as boolean })}
                    />
                    <Label htmlFor="highlight" className="text-sm font-medium leading-none">
                      Flag this operation for special attention
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setAddTab("documents")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={handleAddOperation}>
                    Submit
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Operation</DialogTitle>
            <DialogDescription>Update the operation's information.</DialogDescription>
          </DialogHeader>

          <StepIndicator steps={steps} currentStep={editTab} onChange={setEditTab} />

          <Tabs value={editTab} onValueChange={setEditTab} className="w-full">
            {/* Step 1: Operation Details */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Operation Details</CardTitle>
                  <CardDescription>Edit basic information about the operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Operation Name</Label>
                      <Input
                        id="edit-name"
                        value={newOperation.name || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                        placeholder="Operation name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-code">Operation Code</Label>
                      <Input
                        id="edit-code"
                        value={newOperation.code || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, code: e.target.value })}
                        placeholder="Operation code"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={newOperation.description || ""}
                      onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                      placeholder="Description of the operation"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-action">Action</Label>
                      <Select value={newOperation.action_id || ""} onValueChange={(value) => setNewOperation({ ...newOperation, action_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                        <SelectContent>
                          {actionsData.map((action) => (
                            <SelectItem key={action.id} value={action.id}>
                              {action.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-wilaya">Wilaya</Label>
                      <Select value={newOperation.wilaya_id || ""} onValueChange={(value) => setNewOperation({ ...newOperation, wilaya_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a wilaya" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayasData.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id}>
                              {wilaya.code} - {wilaya.name_fr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-budget_title_id">Budget Title</Label>
                      <Select
                        value={String(newOperation.budget_title_id || "")}
                        onValueChange={(value) => setNewOperation({ ...newOperation, budget_title_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a budget title" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetTitles &&
                            budgetTitles.map((titre: BudgetTitle) => (
                              <SelectItem key={titre.id} value={titre.id}>
                                {titre.code} - {titre.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                <CardFooter className="flex justify-end">
                  <Button onClick={() => setEditTab("financial")}>
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
                  <CardDescription>Edit financial details about the operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-funding_source">Funding Source</Label>
                    <Select
                      value={newOperation.origine_financement || "budget_national"}
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

                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium mb-3">Commitment Authorizations (AE)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-allocated_ae">Allocated AE</Label>
                        <Input
                          id="edit-allocated_ae"
                          type="number"
                          value={newOperation.allocated_ae || 0}
                          onChange={(e) => setNewOperation({ ...newOperation, allocated_ae: parseFloat(e.target.value) })}
                          placeholder="Allocated AE"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-consumed_ae">Consumed AE</Label>
                        <Input
                          id="edit-consumed_ae"
                          type="number"
                          value={newOperation.consumed_ae || 0}
                          onChange={(e) => setNewOperation({ ...newOperation, consumed_ae: parseFloat(e.target.value) })}
                          placeholder="Consumed AE"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium mb-3">Payment Credits (CP)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-allocated_cp">Allocated CP</Label>
                        <Input
                          id="edit-allocated_cp"
                          type="number"
                          value={newOperation.allocated_cp || 0}
                          onChange={(e) => setNewOperation({ ...newOperation, allocated_cp: parseFloat(e.target.value) })}
                          placeholder="Allocated CP"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-consumed_cp">Consumed CP</Label>
                        <Input
                          id="edit-consumed_cp"
                          type="number"
                          value={newOperation.consumed_cp || 0}
                          onChange={(e) => setNewOperation({ ...newOperation, consumed_cp: parseFloat(e.target.value) })}
                          placeholder="Consumed CP"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={newOperation.status || "planned"}
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
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setEditTab("details")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={() => setEditTab("implementation")}>
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
                  <CardDescription>Edit information about the operation's implementation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-start_date">Start Date</Label>
                      <Input
                        id="edit-start_date"
                        type="date"
                        value={newOperation.start_date || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-end_date">End Date</Label>
                      <Input
                        id="edit-end_date"
                        type="date"
                        value={newOperation.end_date || ""}
                        onChange={(e) => setNewOperation({ ...newOperation, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-physical_rate">Physical Rate (%)</Label>
                      <Input
                        id="edit-physical_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={newOperation.physical_rate || 0}
                        onChange={(e) => setNewOperation({ ...newOperation, physical_rate: parseFloat(e.target.value) })}
                        placeholder="Physical rate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-financial_rate">Financial Rate (%)</Label>
                      <Input
                        id="edit-financial_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={newOperation.financial_rate || 0}
                        onChange={(e) => setNewOperation({ ...newOperation, financial_rate: parseFloat(e.target.value) })}
                        placeholder="Financial rate"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-contractor">Contractor</Label>
                    <Input
                      id="edit-contractor"
                      value={newOperation.contractor || ""}
                      onChange={(e) => setNewOperation({ ...newOperation, contractor: e.target.value })}
                      placeholder="Contractor name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-implementation_notes">Implementation Notes</Label>
                    <Textarea
                      id="edit-implementation_notes"
                      value={newOperation.implementation_notes || ""}
                      onChange={(e) => setNewOperation({ ...newOperation, implementation_notes: e.target.value })}
                      placeholder="Notes about implementation progress"
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setEditTab("financial")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={() => setEditTab("documents")}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 4: Operation Documents */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Operation Documents</CardTitle>
                  <CardDescription>Edit or add related documents to the operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentOperation?.documents && currentOperation.documents.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {currentOperation.documents.map((doc, index) => (
                        <div key={index} className="border rounded-md overflow-hidden">
                          <div className="bg-gray-100 h-32 flex items-center justify-center">
                            <FileText className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-sm">{doc.name}</p>
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

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-sm font-medium">Drag and drop files here</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, Word, Excel files</p>
                      <Button variant="outline" className="mt-4" size="sm">
                        Browse Files
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setEditTab("implementation")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={() => setEditTab("notes")}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 5: Observations & Notes */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Observations & Notes</CardTitle>
                  <CardDescription>Edit or add notes and observations about the operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      rows={6}
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
                  <Button variant="outline" onClick={() => setEditTab("documents")}>
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
        </DialogContent>
      </Dialog>

      {/* Delete Operation Dialog - Kept unchanged as requested */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          {currentOperation && (
            <div className="py-4">
              <p>Êtes-vous sûr de vouloir supprimer l'opération "{currentOperation.name}" ?</p>
              <p className="text-sm text-gray-500 mt-2">Cette action est irréversible.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteOperation}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
