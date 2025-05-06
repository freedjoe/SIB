import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrevisionCP, PrevisionCPStatus } from "@/types/prevision_cp";
import { AlertTriangle, Info } from "lucide-react";

interface PrevisionCPMobilizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevision: PrevisionCP | null;
  onSubmit: (data: Partial<PrevisionCP>) => void;
}

export function PrevisionCPMobilizationDialog({ open, onOpenChange, prevision, onSubmit }: PrevisionCPMobilizationDialogProps) {
  const [montantMobilise, setMontantMobilise] = useState<number>(prevision?.montant_mobilise || 0);
  const [selectedStatus, setSelectedStatus] = useState<PrevisionCPStatus>(prevision?.statut || "prévu");

  // Calculate if there will be a delay
  const isDelayed = prevision?.date_demande ? new Date().getTime() - new Date(prevision.date_demande).getTime() > 30 * 24 * 60 * 60 * 1000 : false;

  // Get available next statuses based on current status
  const getAvailableStatuses = () => {
    const currentStatus = prevision?.statut;
    switch (currentStatus) {
      case "prévu":
        return ["prévu", "demandé"];
      case "demandé":
        return ["demandé", "mobilisé", "partiellement mobilisé", "en retard"];
      case "partiellement mobilisé":
        return ["partiellement mobilisé", "mobilisé", "en retard"];
      case "mobilisé":
        return ["mobilisé", "en retard"];
      case "en retard":
        return ["en retard", "mobilisé", "partiellement mobilisé"];
      default:
        return ["prévu"];
    }
  };

  // Get status description
  const getStatusDescription = (status: PrevisionCPStatus) => {
    switch (status) {
      case "prévu":
        return "La prévision est planifiée mais n'a pas encore été demandée";
      case "demandé":
        return "Une demande de mobilisation a été effectuée";
      case "partiellement mobilisé":
        return "Une partie du montant demandé a été mobilisée";
      case "mobilisé":
        return "Le montant a été entièrement mobilisé";
      case "en retard":
        return "La demande est en retard (plus de 30 jours)";
      default:
        return "";
    }
  };

  const handleSubmit = () => {
    if (!prevision) return;

    onSubmit({
      ...prevision,
      montant_mobilise: montantMobilise,
      statut: selectedStatus,
      date_demande: selectedStatus === "demandé" && prevision.statut === "prévu" ? new Date().toISOString() : prevision.date_demande,
      date_mobilise: ["mobilisé", "partiellement mobilisé"].includes(selectedStatus) ? new Date().toISOString() : prevision.date_mobilise,
    });
  };

  if (!prevision) return null;

  const availableStatuses = getAvailableStatuses();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modification de la prévision</DialogTitle>
          <DialogDescription>
            Prévision {prevision.exercice} - {prevision.periode} pour {prevision.operation_name}
          </DialogDescription>
        </DialogHeader>

        {isDelayed && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Cette demande a dépassé le délai de 30 jours.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Montant prévu</Label>
            <Input
              type="text"
              value={prevision.montant_prevu.toLocaleString("fr-DZ")}
              disabled
            />
          </div>

          {prevision.montant_demande > 0 && (
            <div className="space-y-2">
              <Label>Montant demandé</Label>
              <Input
                type="text"
                value={prevision.montant_demande.toLocaleString("fr-DZ")}
                disabled
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Montant à mobiliser</Label>
            <Input
              type="number"
              value={montantMobilise}
              onChange={(e) => setMontantMobilise(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{getStatusDescription(selectedStatus)}</AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Enregistrer les modifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
