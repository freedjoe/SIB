
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, InfoIcon } from "lucide-react";

interface ExpenseForecast {
  id: string;
  programId: string;
  programName: string;
  ministryId: string;
  ministryName: string;
  amount: number;
  period: "monthly" | "quarterly" | "annually";
  startDate: string;
  endDate: string;
  category: string;
  mobilizedAmount: number;
  remaining: number;
  status: "draft" | "active" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface Program {
  id: string;
  name: string;
  budget: number;
  allocated: number;
  ministryId: string;
  ministryName: string;
}

interface Ministry {
  id: string;
  name: string;
  code: string;
}

interface ExpenseForecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "add" | "edit" | "view" | "delete";
  forecast: ExpenseForecast | null;
  programs: Program[];
  ministries: Ministry[];
  formatCurrency: (amount: number) => string;
  onSave: (forecast: Partial<ExpenseForecast>) => void;
  onDelete?: () => void;
}

const CATEGORIES = [
  "Infrastructures",
  "Équipement",
  "Formation",
  "Services",
  "Fonctionnement",
  "Personnel",
  "Maintenance",
  "Autre"
];

export function ExpenseForecastDialog({
  open,
  onOpenChange,
  type,
  forecast,
  programs,
  ministries,
  formatCurrency,
  onSave,
  onDelete
}: ExpenseForecastDialogProps) {
  const [formData, setFormData] = useState<Partial<ExpenseForecast>>({
    programId: "",
    amount: 0,
    period: "monthly",
    category: "Autre",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [availableBudget, setAvailableBudget] = useState<number>(0);

  // Initialize form data based on forecast
  useEffect(() => {
    if (forecast && type !== "add") {
      setFormData({
        programId: forecast.programId,
        amount: forecast.amount,
        period: forecast.period,
        startDate: forecast.startDate,
        endDate: forecast.endDate,
        category: forecast.category,
      });

      const program = programs.find(p => p.id === forecast.programId);
      if (program) {
        setSelectedProgram(program);
        setAvailableBudget(program.budget - program.allocated);
      }
    } else {
      setFormData({
        programId: "",
        amount: 0,
        period: "monthly",
        category: "Autre",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0]
      });
      setSelectedProgram(null);
      setAvailableBudget(0);
    }
  }, [forecast, programs, type, open]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  const handleProgramChange = (value: string) => {
    const program = programs.find(p => p.id === value);
    setFormData({ ...formData, programId: value });
    
    if (program) {
      setSelectedProgram(program);
      setAvailableBudget(program.budget - program.allocated);
    } else {
      setSelectedProgram(null);
      setAvailableBudget(0);
    }
  };

  // Adjust end date based on period selection
  const calculateEndDate = (startDate: string, period: string) => {
    const start = new Date(startDate);
    let endDate = new Date(start);
    
    switch (period) {
      case "monthly":
        endDate.setMonth(start.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(start.getMonth() + 3);
        break;
      case "annually":
        endDate.setFullYear(start.getFullYear() + 1);
        break;
    }
    
    endDate.setDate(endDate.getDate() - 1);
    return endDate.toISOString().split("T")[0];
  };

  const handlePeriodChange = (value: string) => {
    if (formData.startDate) {
      const newEndDate = calculateEndDate(formData.startDate, value);
      setFormData({ 
        ...formData, 
        period: value as "monthly" | "quarterly" | "annually",
        endDate: newEndDate
      });
    } else {
      setFormData({ ...formData, period: value as "monthly" | "quarterly" | "annually" });
    }
  };

  const handleStartDateChange = (value: string) => {
    const newEndDate = calculateEndDate(value, formData.period || "monthly");
    setFormData({
      ...formData,
      startDate: value,
      endDate: newEndDate
    });
  };

  const isReadOnly = type === "view";
  const isDelete = type === "delete";
  const isBudgetExceeded = (formData.amount || 0) > availableBudget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {type === "add" 
              ? "Ajouter une prévision de dépense" 
              : type === "edit" 
                ? "Modifier la prévision de dépense"
                : type === "delete"
                  ? "Supprimer la prévision de dépense"
                  : "Détails de la prévision de dépense"
            }
          </DialogTitle>
          <DialogDescription>
            {type === "add" 
              ? "Remplissez le formulaire pour ajouter une nouvelle prévision de dépense."
              : type === "edit"
                ? "Modifiez les détails de la prévision de dépense."
                : type === "delete"
                  ? "Êtes-vous sûr de vouloir supprimer cette prévision de dépense ?"
                  : ""
            }
          </DialogDescription>
        </DialogHeader>
        
        {isDelete && forecast ? (
          <div className="py-4">
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InfoIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Attention
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Vous êtes sur le point de supprimer définitivement cette prévision de dépense. 
                      Cette action ne peut pas être annulée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Programme</p>
                <p className="mt-1">{forecast.programName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Montant</p>
                <p className="mt-1">{formatCurrency(forecast.amount)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Catégorie</p>
                <p className="mt-1">{forecast.category}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program" className="text-right">
                Programme
              </Label>
              <div className="col-span-3">
                <Select
                  disabled={isReadOnly}
                  value={formData.programId}
                  onValueChange={handleProgramChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProgram && (
                  <div className="mt-2 text-sm">
                    <p>Ministère: <span className="font-medium">{selectedProgram.ministryName}</span></p>
                    <p>Budget disponible: <span className={`font-medium ${availableBudget > 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(availableBudget)}
                    </span></p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <div className="col-span-3">
                <Input
                  id="amount"
                  type="number"
                  disabled={isReadOnly}
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                />
                {isBudgetExceeded && selectedProgram && (
                  <p className="mt-1 text-sm text-red-500">
                    Le montant prévu dépasse le budget disponible.
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Période</Label>
              <div className="col-span-3">
                <RadioGroup
                  disabled={isReadOnly}
                  value={formData.period}
                  onValueChange={handlePeriodChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Mensuel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quarterly" id="quarterly" />
                    <Label htmlFor="quarterly">Trimestriel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="annually" id="annually" />
                    <Label htmlFor="annually">Annuel</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Catégorie
              </Label>
              <div className="col-span-3">
                <Select
                  disabled={isReadOnly}
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Date de début
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
                disabled={isReadOnly}
                value={formData.startDate || ""}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Date de fin
              </Label>
              <Input
                id="endDate"
                type="date"
                className="col-span-3"
                disabled={true}  // Always read-only - calculated based on period
                value={formData.endDate || ""}
              />
            </div>
            
            {forecast && (formData.mobilizedAmount !== undefined) && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mobilized" className="text-right">
                  Montant mobilisé
                </Label>
                <div className="col-span-3">
                  <p className="font-medium">
                    {formatCurrency(forecast.mobilizedAmount)} 
                    <span className="text-muted-foreground ml-2">
                      ({Math.round((forecast.mobilizedAmount / forecast.amount) * 100)}% du montant prévu)
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          {isDelete ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Supprimer définitivement
              </Button>
            </>
          ) : isReadOnly ? (
            <Button onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isBudgetExceeded || !formData.programId || !(formData.amount! > 0)}
              >
                {type === "add" ? "Ajouter" : "Enregistrer"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
