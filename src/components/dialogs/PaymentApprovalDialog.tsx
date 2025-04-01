
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, X } from "lucide-react";

interface PaymentRequest {
  id: string;
  engagementId: string;
  engagementRef: string;
  operationName: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
  startDate: string;
  description: string;
  status: "pending_officer" | "pending_accountant" | "approved" | "rejected";
  requestedBy: string;
  requestDate: string;
  beneficiary: string;
}

interface PaymentApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PaymentRequest | null;
  onApprove: (request: PaymentRequest, comments: string) => void;
  onReject: (request: PaymentRequest, reason: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  currentUserRole: "officer" | "accountant" | "admin";
}

export function PaymentApprovalDialog({
  open,
  onOpenChange,
  request,
  onApprove,
  onReject,
  formatCurrency,
  formatDate,
  currentUserRole
}: PaymentApprovalDialogProps) {
  const [comments, setComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  if (!request) return null;
  
  const canApprove = (
    (currentUserRole === "officer" && request.status === "pending_officer") ||
    (currentUserRole === "accountant" && request.status === "pending_accountant") ||
    (currentUserRole === "admin")
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_officer":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400 gap-1">
            <Clock className="h-3 w-3" />
            <span>En attente (Officier)</span>
          </Badge>
        );
      case "pending_accountant":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400 gap-1">
            <Clock className="h-3 w-3" />
            <span>En attente (Comptable)</span>
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400 gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Approuvé</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400 gap-1">
            <X className="h-3 w-3" />
            <span>Rejeté</span>
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "monthly": return "Mensuel";
      case "quarterly": return "Trimestriel";
      case "annual": return "Annuel";
      default: return frequency;
    }
  };
  
  const handleApprove = () => {
    onApprove(request, comments);
  };
  
  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    onReject(request, rejectionReason);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setShowRejectForm(false);
        setComments("");
        setRejectionReason("");
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Approbation de la demande de paiement</DialogTitle>
          <DialogDescription>
            Vérifiez les détails de la demande de paiement avant l'approbation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Référence</h3>
              <p className="text-base font-semibold">{request.engagementRef}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
              <div className="mt-1">{getStatusBadge(request.status)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Opération</h3>
              <p className="text-base">{request.operationName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Bénéficiaire</h3>
              <p className="text-base">{request.beneficiary}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Montant</h3>
              <p className="text-base font-semibold">{formatCurrency(request.amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fréquence</h3>
              <p className="text-base">{getFrequencyText(request.frequency)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date de début</h3>
              <p className="text-base">{formatDate(request.startDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Demandé par</h3>
              <p className="text-base">{request.requestedBy}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <div className="p-3 bg-muted rounded-md text-sm">
              {request.description}
            </div>
          </div>
          
          {canApprove && !showRejectForm && (
            <div className="mt-2">
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Ajouter des commentaires (optionnel)..."
                className="mt-1"
              />
            </div>
          )}
          
          {showRejectForm && (
            <div className="mt-2">
              <Label htmlFor="rejection-reason" className="text-red-500">Motif de rejet</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Veuillez indiquer la raison du rejet..."
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          {canApprove ? (
            showRejectForm ? (
              <>
                <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                  Confirmer le rejet
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Fermer
                </Button>
                <Button 
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowRejectForm(true)}
                >
                  Rejeter
                </Button>
                <Button onClick={handleApprove}>
                  Approuver
                </Button>
              </>
            )
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
