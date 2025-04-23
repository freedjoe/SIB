import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuditLog } from "@/components/tables/AuditLogsTable";
import { Badge } from "@/components/ui/badge";

interface AuditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
  formatTimestamp: (timestamp: string) => string;
}

export function AuditLogDialog({ open, onOpenChange, log, formatTimestamp }: AuditLogDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Détails du Log d'Audit</DialogTitle>
          <DialogDescription>Informations complètes concernant l'action enregistrée</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Identifiant:</span>
            <span className="col-span-3 text-sm">{log.id}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Date:</span>
            <span className="col-span-3 text-sm">{formatTimestamp(log.timestamp)}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Utilisateur:</span>
            <span className="col-span-3 text-sm">{log.user}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Action:</span>
            <div className="col-span-3">
              <Badge variant="outline" className="font-medium">
                {log.action}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Adresse IP:</span>
            <span className="col-span-3 text-sm">{log.ipAddress}</span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <span className="text-sm font-medium">Détails:</span>
            <div className="col-span-3 rounded-md bg-muted p-3">
              <p className="text-sm">{log.details}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
