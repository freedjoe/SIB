import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createEngagementReevaluation } from "@/services/engagementReevaluationsService";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ReevaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: {
    id: string;
    reference: string;
    beneficiary?: string;
    montant_initial?: number;
  };
  onSuccess?: () => void;
}

export function ReevaluationDialog({ isOpen, onClose, engagement, onSuccess }: ReevaluationDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revaluationAmount, setRevaluationAmount] = useState<string>("0");
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [revaluationType, setRevaluationType] = useState<string>("increase");

  const handleSubmit = async () => {
    if (!engagement) return;

    if (!revaluationAmount || !reason) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    let amount = parseFloat(revaluationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être un nombre positif",
        variant: "destructive",
      });
      return;
    }

    // Make amount negative if it's a decrease
    if (revaluationType === "decrease") {
      amount = -amount;
    }

    setIsSubmitting(true);

    try {
      await createEngagementReevaluation({
        engagement_id: engagement.id,
        code: `REV-${Date.now().toString().slice(-8)}`,
        revaluation_amount: amount,
        reason,
        description,
        status: "submitted",
        revaluation_date: new Date().toISOString(),
      });

      toast({
        title: "Succès",
        description: "La demande de réévaluation a été soumise",
      });

      // Reset form
      setRevaluationAmount("0");
      setReason("");
      setDescription("");
      setRevaluationType("increase");

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error?.message || "Erreur inconnue"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayAmount = () => {
    const amount = parseFloat(revaluationAmount) || 0;

    if (revaluationType === "decrease") {
      return formatCurrency(-amount);
    } else {
      return formatCurrency(amount);
    }
  };

  const getCurrentAmount = () => {
    return formatCurrency(engagement?.montant_initial || 0);
  };

  const getNewAmount = () => {
    const initial = engagement?.montant_initial || 0;
    const amount = parseFloat(revaluationAmount) || 0;

    if (revaluationType === "decrease") {
      return formatCurrency(initial - amount);
    } else {
      return formatCurrency(initial + amount);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demande de réévaluation</DialogTitle>
          <DialogDescription>Soumettez une demande de révision pour l'engagement {engagement?.reference}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Engagement</span>
              <span className="font-semibold">{engagement?.reference}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Bénéficiaire</span>
              <span className="font-semibold">{engagement?.beneficiary || "Non spécifié"}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5 mb-2">
            <Label htmlFor="revaluationType">Type de réévaluation</Label>
            <Select value={revaluationType} onValueChange={setRevaluationType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Augmentation</SelectItem>
                <SelectItem value="decrease">Diminution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5 mb-2">
            <Label htmlFor="revaluationAmount">Montant de la réévaluation</Label>
            <Input
              id="revaluationAmount"
              type="number"
              placeholder="Montant"
              value={revaluationAmount}
              onChange={(e) => setRevaluationAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1.5 mb-2">
            <Label htmlFor="reason">Motif de la réévaluation</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un motif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revision_prix">Révision des prix</SelectItem>
                <SelectItem value="changement_perimetre">Changement de périmètre</SelectItem>
                <SelectItem value="imprevus">Imprévus techniques</SelectItem>
                <SelectItem value="erreur_estimation">Erreur d'estimation initiale</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5 mb-2">
            <Label htmlFor="description">Détails supplémentaires</Label>
            <Textarea
              id="description"
              placeholder="Décrivez la raison de cette réévaluation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4 mb-2 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5" />
              <h4 className="font-medium text-amber-800">Impact sur le budget</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 ml-7 text-amber-900">
              <div>Montant actuel:</div>
              <div className="font-medium">{getCurrentAmount()}</div>
              <div>Ajustement:</div>
              <div className={`font-medium ${revaluationType === "decrease" ? "text-red-600" : "text-green-600"}`}>
                {revaluationType === "increase" ? "+" : "-"}
                {formatCurrency(parseFloat(revaluationAmount) || 0)}
              </div>
              <div>Nouveau montant:</div>
              <div className="font-bold">{getNewAmount()}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Soumission en cours..." : "Soumettre la demande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
