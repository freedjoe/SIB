import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createRevaluation } from "@/services/engagementRevaluationService";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface RequestRevaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: {
    id: string;
    reference: string;
    beneficiary: string;
    initial_amount: number;
  };
  onSuccess?: () => void;
}

export function RequestRevaluationDialog({ isOpen, onClose, engagement, onSuccess }: RequestRevaluationDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [proposedAmount, setProposedAmount] = useState<number>(engagement.initial_amount);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.loginRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.reasonRequired"),
        variant: "destructive",
      });
      return;
    }

    if (proposedAmount <= 0) {
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.invalidAmount"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createRevaluation({
        engagement_id: engagement.id,
        initial_amount: engagement.initial_amount,
        proposed_amount: proposedAmount,
        reason: reason.trim(),
        requested_by: user.id,
      });

      toast({
        title: t("common.success"),
        description: t("engagements.reevaluation.success"),
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating revaluation:", error);
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
          <DialogTitle>{t("engagements.reevaluation.requestTitle")}</DialogTitle>
          <DialogDescription>{t("engagements.reevaluation.requestDescription", { reference: engagement.reference })}</DialogDescription>
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
            <Label htmlFor="initial_amount" className="text-right">
              {t("engagements.initialAmount")}
            </Label>
            <div className="col-span-3">{formatCurrency(engagement.initial_amount)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proposed_amount" className="text-right">
              {t("engagements.reevaluation.newAmount")}
            </Label>
            <Input
              id="proposed_amount"
              type="number"
              className="col-span-3"
              value={proposedAmount}
              onChange={(e) => setProposedAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              {t("engagements.reevaluation.reason")}
            </Label>
            <Textarea
              id="reason"
              className="col-span-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("engagements.reevaluation.reasonPlaceholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
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
