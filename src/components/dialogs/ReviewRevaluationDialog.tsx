import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { updateRevaluationStatus } from "@/services/engagementRevaluationService";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewRevaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  revaluation: {
    id: string;
    engagement_id: string;
    initial_amount: number;
    proposed_amount: number;
    reason: string;
    status: string;
    requested_by_user: {
      first_name: string;
      last_name: string;
      role?: {
        name: string;
      };
    };
  };
  onSuccess?: () => void;
}

export function ReviewRevaluationDialog({ isOpen, onClose, revaluation, onSuccess }: ReviewRevaluationDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateRevaluationStatus({
        id: revaluation.id,
        status: "approved",
        approved_by: user.id,
      });

      toast({
        title: "Succès",
        description: "La réévaluation a été approuvée avec succès",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error approving revaluation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation de la réévaluation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir un motif de rejet",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateRevaluationStatus({
        id: revaluation.id,
        status: "rejected",
        approved_by: user.id,
      });

      toast({
        title: "Succès",
        description: "La réévaluation a été rejetée avec succès",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error rejecting revaluation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet de la réévaluation",
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
          <DialogTitle>Examiner la demande de réévaluation</DialogTitle>
          <DialogDescription>Vérifiez les détails de la demande et prenez une décision</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Demandé par</Label>
            <div className="col-span-3">
              {revaluation.requested_by_user.first_name} {revaluation.requested_by_user.last_name}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Rôle</Label>
            <div className="col-span-3">{revaluation.requested_by_user.role?.name || "-"}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Montant initial</Label>
            <div className="col-span-3">{formatCurrency(revaluation.initial_amount)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Montant proposé</Label>
            <div className="col-span-3">{formatCurrency(revaluation.proposed_amount)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Motif</Label>
            <div className="col-span-3">{revaluation.reason}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              Commentaire
            </Label>
            <Textarea
              id="comment"
              className="col-span-3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajoutez un commentaire (requis pour le rejet)..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
            {isSubmitting ? "Traitement en cours..." : "Rejeter"}
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? "Traitement en cours..." : "Approuver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
