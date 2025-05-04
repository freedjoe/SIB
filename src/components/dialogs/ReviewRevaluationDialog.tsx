import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { updateRevaluationStatus } from "@/services/engagementRevaluationService";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";

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
        title: t("common.error"),
        description: t("engagements.reevaluation.loginRequired"),
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
        title: t("common.success"),
        description: t("engagements.reevaluation.approvalSuccess"),
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error approving revaluation:", error);
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.approvalError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!user) {
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.loginRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.commentRequired"),
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
        title: t("common.success"),
        description: t("engagements.reevaluation.rejectionSuccess"),
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error rejecting revaluation:", error);
      toast({
        title: t("common.error"),
        description: t("engagements.reevaluation.rejectionError"),
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
          <DialogTitle>{t("engagements.reevaluation.reviewTitle")}</DialogTitle>
          <DialogDescription>{t("engagements.reevaluation.reviewDescription")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("engagements.reevaluation.requestedBy")}</Label>
            <div className="col-span-3">
              {revaluation.requested_by_user.first_name} {revaluation.requested_by_user.last_name}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("common.role")}</Label>
            <div className="col-span-3">{revaluation.requested_by_user.role?.name || "-"}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("engagements.initialAmount")}</Label>
            <div className="col-span-3">{formatCurrency(revaluation.initial_amount)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("engagements.reevaluation.newAmount")}</Label>
            <div className="col-span-3">{formatCurrency(revaluation.proposed_amount)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("engagements.reevaluation.reason")}</Label>
            <div className="col-span-3">{revaluation.reason}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              {t("engagements.reevaluation.comments")}
            </Label>
            <Textarea
              id="comment"
              placeholder={t("engagements.reevaluation.commentsPlaceholder")}
              className="col-span-3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
            {isSubmitting ? t("common.processing") : t("common.reject")}
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? t("common.processing") : t("common.approve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
