
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Operation {
  id: string;
  name: string;
  description: string;
  actionId: string;
  actionName: string;
  programId: string;
  programName: string;
  allocatedAmount: number;
  usedAmount: number;
  progress: number;
  engagements: number;
  payments: number;
  status: "in_progress" | "completed" | "planned";
}

interface OperationDetailDialogProps {
  operation: Operation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatCurrency: (amount: number) => string;
  getStatusBadge: (status: Operation['status']) => React.ReactNode;
}

export function OperationDetailDialog({
  operation,
  open,
  onOpenChange,
  formatCurrency,
  getStatusBadge
}: OperationDetailDialogProps) {
  if (!operation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails de l'opération</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Nom:</div>
            <div>{operation.name}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Description:</div>
            <div>{operation.description}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Programme:</div>
            <div>{operation.programName}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Action:</div>
            <div>{operation.actionName}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Budget alloué:</div>
            <div>{formatCurrency(operation.allocatedAmount)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Budget utilisé:</div>
            <div>{formatCurrency(operation.usedAmount)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Progression:</div>
            <div>{operation.progress}%</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Engagements:</div>
            <div>{operation.engagements}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Paiements:</div>
            <div>{operation.payments}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Statut:</div>
            <div>{getStatusBadge(operation.status)}</div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
