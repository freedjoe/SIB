
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
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface PaymentRequest {
  id: string;
  engagementId: string;
  engagementRef: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
  startDate: string;
  description: string;
  status: "pending_officer" | "pending_accountant" | "approved" | "rejected";
  requestedBy: string;
  requestDate: string;
}

interface PaymentRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (request: Partial<PaymentRequest>) => void;
  type: "add" | "edit" | "view";
  request: PaymentRequest | null;
  engagements: Array<{ id: string; ref: string; operation: string; beneficiary: string; budget: number; allocated: number }>;
  formatCurrency: (amount: number) => string;
}

export function PaymentRequestDialog({
  open,
  onOpenChange,
  onSave,
  type,
  request,
  engagements,
  formatCurrency,
}: PaymentRequestDialogProps) {
  const [formData, setFormData] = useState<Partial<PaymentRequest>>({
    engagementId: "",
    amount: 0,
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    description: "",
    requestDate: new Date().toISOString().split("T")[0],
    status: "pending_officer"
  });

  const [selectedEngagement, setSelectedEngagement] = useState<typeof engagements[0] | null>(null);
  const [availableBudget, setAvailableBudget] = useState<number>(0);

  useEffect(() => {
    if (request && (type === "edit" || type === "view")) {
      setFormData({
        engagementId: request.engagementId,
        amount: request.amount,
        frequency: request.frequency,
        startDate: request.startDate,
        description: request.description,
      });

      const engagement = engagements.find(e => e.id === request.engagementId);
      if (engagement) {
        setSelectedEngagement(engagement);
        setAvailableBudget(engagement.budget - engagement.allocated);
      }
    } else {
      setFormData({
        engagementId: "",
        amount: 0,
        frequency: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        description: "",
        requestDate: new Date().toISOString().split("T")[0],
        status: "pending_officer"
      });
      setSelectedEngagement(null);
      setAvailableBudget(0);
    }
  }, [request, engagements, type, open]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleEngagementChange = (value: string) => {
    const engagement = engagements.find(e => e.id === value);
    setFormData({ ...formData, engagementId: value });
    
    if (engagement) {
      setSelectedEngagement(engagement);
      setAvailableBudget(engagement.budget - engagement.allocated);
    } else {
      setSelectedEngagement(null);
      setAvailableBudget(0);
    }
  };

  const isReadOnly = type === "view";
  const isBudgetExceeded = (formData.amount || 0) > availableBudget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {type === "add" 
              ? "Soumettre une demande de paiement" 
              : type === "edit" 
                ? "Modifier la demande de paiement"
                : "Détails de la demande de paiement"
            }
          </DialogTitle>
          <DialogDescription>
            {type === "add" 
              ? "Complétez le formulaire pour soumettre une nouvelle demande de paiement."
              : type === "edit"
                ? "Modifiez les détails de la demande de paiement."
                : ""
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="engagement" className="text-right">
              Engagement
            </Label>
            <div className="col-span-3">
              <Select
                disabled={isReadOnly}
                value={formData.engagementId}
                onValueChange={handleEngagementChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un engagement" />
                </SelectTrigger>
                <SelectContent>
                  {engagements.map((engagement) => (
                    <SelectItem key={engagement.id} value={engagement.id}>
                      {engagement.ref} - {engagement.operation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEngagement && (
                <div className="mt-2 text-sm">
                  <p>Bénéficiaire: <span className="font-medium">{selectedEngagement.beneficiary}</span></p>
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
              {isBudgetExceeded && selectedEngagement && (
                <p className="mt-1 text-sm text-red-500">
                  Le montant demandé dépasse le budget disponible.
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Fréquence</Label>
            <div className="col-span-3">
              <RadioGroup
                disabled={isReadOnly}
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as "monthly" | "quarterly" | "annual" })}
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
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual">Annuel</Label>
                </div>
              </RadioGroup>
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
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              className="col-span-3 min-h-[100px]"
              disabled={isReadOnly}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le but de cette demande de paiement..."
            />
          </div>
        </div>
        
        <DialogFooter>
          {type !== "view" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isBudgetExceeded || !formData.engagementId || !(formData.amount! > 0)}
              >
                {type === "add" ? "Soumettre la demande" : "Enregistrer"}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
