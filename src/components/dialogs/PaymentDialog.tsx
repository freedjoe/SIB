
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
import { useState, useEffect } from "react";

interface Payment {
  id: string;
  engagementId: string;
  engagementRef: string;
  operationId: string;
  operationName: string;
  amount: number;
  requestDate: string;
  paymentDate: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  beneficiary: string;
  description: string;
}

interface PaymentDialogProps {
  type: "add" | "edit" | "view" | "delete";
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payment: Partial<Payment>) => void;
  onDelete?: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | null) => string;
  engagements: Array<{ id: string, ref: string, operation: string, beneficiary: string }>;
  getStatusBadge: (status: Payment['status']) => React.ReactNode;
}

export function PaymentDialog({
  type,
  payment,
  open,
  onOpenChange,
  onSave,
  onDelete,
  formatCurrency,
  formatDate,
  engagements,
  getStatusBadge
}: PaymentDialogProps) {
  const [formData, setFormData] = useState<Partial<Payment>>({
    engagementId: "",
    amount: 0,
    requestDate: new Date().toISOString().split("T")[0],
    status: "pending",
    description: ""
  });

  useEffect(() => {
    if (payment && (type === "edit" || type === "view")) {
      setFormData({
        engagementId: payment.engagementId,
        amount: payment.amount,
        requestDate: payment.requestDate,
        status: payment.status,
        description: payment.description
      });
    } else {
      setFormData({
        engagementId: "",
        amount: 0,
        requestDate: new Date().toISOString().split("T")[0],
        status: "pending",
        description: ""
      });
    }
  }, [payment, type, open]);

  const handleSave = () => {
    onSave(formData);
  };

  const isReadOnly = type === "view" || type === "delete";

  const getTitleByType = () => {
    switch (type) {
      case "add": return "Ajouter un nouveau paiement";
      case "edit": return "Modifier le paiement";
      case "view": return "Détails du paiement";
      case "delete": return "Confirmer la suppression";
      default: return "";
    }
  };

  const getDescriptionByType = () => {
    switch (type) {
      case "add": return "Complétez le formulaire pour ajouter un nouveau paiement.";
      case "edit": return "Modifiez les détails du paiement.";
      case "view": return "";
      case "delete": return "Êtes-vous sûr de vouloir supprimer ce paiement? Cette action est irréversible.";
      default: return "";
    }
  };

  if (type === "view" && payment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Référence engagement:</div>
              <div>{payment.engagementRef}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Opération:</div>
              <div>{payment.operationName}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Bénéficiaire:</div>
              <div>{payment.beneficiary}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Montant:</div>
              <div>{formatCurrency(payment.amount)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Date de demande:</div>
              <div>{formatDate(payment.requestDate)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Date de paiement:</div>
              <div>{formatDate(payment.paymentDate)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Statut:</div>
              <div>{getStatusBadge(payment.status)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Description:</div>
              <div>{payment.description}</div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (type === "delete" && payment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce paiement? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              <strong>Référence engagement:</strong> {payment.engagementRef}
            </p>
            <p>
              <strong>Opération:</strong> {payment.operationName}
            </p>
            <p>
              <strong>Montant:</strong> {formatCurrency(payment.amount)}
            </p>
            <p>
              <strong>Statut:</strong> {payment.status}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitleByType()}</DialogTitle>
          <DialogDescription>
            {getDescriptionByType()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="engagement" className="text-right">
              Engagement
            </Label>
            <Select
              value={formData.engagementId}
              onValueChange={(value) => {
                const selectedEngagement = engagements.find(e => e.id === value);
                setFormData({ 
                  ...formData, 
                  engagementId: value,
                  operationName: selectedEngagement?.operation || "",
                  beneficiary: selectedEngagement?.beneficiary || ""
                });
              }}
              disabled={isReadOnly}
            >
              <SelectTrigger className="col-span-3">
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
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Montant
            </Label>
            <Input
              id="amount"
              type="number"
              className="col-span-3"
              value={formData.amount || ""}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              disabled={isReadOnly}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="requestDate" className="text-right">
              Date de demande
            </Label>
            <Input
              id="requestDate"
              type="date"
              className="col-span-3"
              value={formData.requestDate || ""}
              onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
              disabled={isReadOnly}
            />
          </div>
          {type === "edit" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Statut
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => 
                  setFormData({ 
                    ...formData, 
                    status: value as "pending" | "approved" | "rejected" | "paid",
                    paymentDate: value === "paid" ? new Date().toISOString().split("T")[0] : null
                  })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              className="col-span-3"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isReadOnly}
            />
          </div>
        </div>
        <DialogFooter>
          {type !== "view" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                {type === "add" ? "Ajouter" : "Enregistrer"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
