
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createEngagementReevaluation } from "@/services/engagementReevaluationsService";

interface ReevaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: {
    id: string;
    reference: string;
    beneficiary: string;
    montant_initial?: number;
  };
  onSuccess: () => void;
}

export function ReevaluationDialog({ isOpen, onClose, engagement, onSuccess }: ReevaluationDialogProps) {
  const { toast } = useToast();
  const [montantReevalue, setMontantReevalue] = useState<string>("");
  const [motifReevaluation, setMotifReevaluation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!montantReevalue || !motifReevaluation) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createEngagementReevaluation({
        engagement_id: engagement.id,
        montant_initial: engagement.montant_initial || 0,
        montant_reevalue: parseFloat(montantReevalue),
        motif_reevaluation: motifReevaluation,
        statut_reevaluation: 'en_attente',
        created_by: "Utilisateur actuel", // À remplacer par l'utilisateur connecté
        date_reevaluation: new Date().toISOString()
      });

      toast({
        title: "Succès",
        description: "La demande de réévaluation a été créée avec succès.",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de la réévaluation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la demande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demande de réévaluation</DialogTitle>
          <DialogDescription>
            Créer une demande de réévaluation pour l'engagement {engagement.reference}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="montant" className="text-right">
              Nouveau montant
            </Label>
            <Input
              id="montant"
              type="number"
              className="col-span-3"
              value={montantReevalue}
              onChange={(e) => setMontantReevalue(e.target.value)}
              placeholder="Entrez le nouveau montant"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="motif" className="text-right">
              Motif
            </Label>
            <Textarea
              id="motif"
              className="col-span-3"
              value={motifReevaluation}
              onChange={(e) => setMotifReevaluation(e.target.value)}
              placeholder="Justification de la réévaluation"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "En cours..." : "Soumettre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
