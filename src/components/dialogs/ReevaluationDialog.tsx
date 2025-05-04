import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createEngagementReevaluation } from "@/services/engagementReevaluationsService";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ReevaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: {
    id: string;
    reference: string;
    beneficiary: string;
    montant_initial: number;
  };
  onSuccess?: () => void;
}

export function ReevaluationDialog({ isOpen, onClose, engagement, onSuccess }: ReevaluationDialogProps) {
  const { t } = useTranslation();
  const [montantReevalue, setMontantReevalue] = useState<number>(engagement.montant_initial);
  const [motifReevaluation, setMotifReevaluation] = useState("");
  const [documentJustificatif, setDocumentJustificatif] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!motifReevaluation) {
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.reasonRequired"),
        variant: "destructive",
      });
      return;
    }

    if (montantReevalue <= 0) {
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.invalidAmount"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement file upload logic
      const documentUrl = documentJustificatif ? "placeholder_url" : null;

      await createEngagementReevaluation({
        engagement_id: engagement.id,
        montant_initial: engagement.montant_initial,
        montant_reevalue: montantReevalue,
        motif_reevaluation: motifReevaluation,
        document_justificatif: documentUrl,
        statut_reevaluation: "en_attente",
        date_reevaluation: new Date().toISOString(),
      });

      toast({
        title: t("common.success"),
        description: t("engagements.reevaluation.success"),
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.error"),
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
          <DialogTitle>{t("engagements.reevaluation.title")}</DialogTitle>
          <DialogDescription>{t("engagements.reevaluation.description", { reference: engagement.reference })}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reference" className="text-right">
              {t("engagements.reference")}
            </Label>
            <div className="col-span-3 font-medium">{engagement.reference}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="beneficiary" className="text-right">
              {t("engagements.beneficiary")}
            </Label>
            <div className="col-span-3">{engagement.beneficiary}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="montant_initial" className="text-right">
              {t("engagements.initialAmount")}
            </Label>
            <div className="col-span-3">{formatCurrency(engagement.montant_initial)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="montant_reevalue" className="text-right">
              {t("engagements.reevaluation.newAmount")}
            </Label>
            <Input
              id="montant_reevalue"
              type="number"
              className="col-span-3"
              value={montantReevalue}
              onChange={(e) => setMontantReevalue(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="motif" className="text-right">
              {t("engagements.reevaluation.reason")}
            </Label>
            <Textarea
              id="motif"
              className="col-span-3"
              value={motifReevaluation}
              onChange={(e) => setMotifReevaluation(e.target.value)}
              placeholder={t("engagements.reevaluation.reasonPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document" className="text-right">
              {t("engagements.reevaluation.supportingDoc")}
            </Label>
            <Input id="document" type="file" className="col-span-3" onChange={(e) => setDocumentJustificatif(e.target.files?.[0] || null)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common.submitting") : t("common.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
