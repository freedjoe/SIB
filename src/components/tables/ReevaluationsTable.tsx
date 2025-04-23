import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { EngagementReevaluationWithRelations } from "@/services/engagementReevaluationsService";

interface ReevaluationsTableProps {
  reevaluations: EngagementReevaluationWithRelations[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onApprove?: (reevaluation: EngagementReevaluationWithRelations) => void;
  onReject?: (reevaluation: EngagementReevaluationWithRelations) => void;
  showActions?: boolean;
}

export function ReevaluationsTable({ reevaluations, formatCurrency, formatDate, onApprove, onReject, showActions = false }: ReevaluationsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approuvee":
        return <Badge className="bg-green-500">Approuvée</Badge>;
      case "rejetee":
        return <Badge variant="destructive">Rejetée</Badge>;
      case "en_attente":
        return <Badge variant="warning">En attente</Badge>;
      case "modifiee":
        return <Badge variant="secondary">Modifiée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Engagement</TableHead>
          <TableHead>Montant initial</TableHead>
          <TableHead>Montant réévalué</TableHead>
          <TableHead>Motif</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Validé par</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {reevaluations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showActions ? 8 : 7} className="text-center py-4">
              Aucune réévaluation trouvée
            </TableCell>
          </TableRow>
        ) : (
          reevaluations.map((reevaluation) => (
            <TableRow key={reevaluation.id}>
              <TableCell>{formatDate(reevaluation.date_reevaluation)}</TableCell>
              <TableCell>
                {reevaluation.engagement?.reference || "-"} - {reevaluation.engagement?.operation?.name || "-"}
              </TableCell>
              <TableCell>{formatCurrency(reevaluation.montant_initial)}</TableCell>
              <TableCell>{formatCurrency(reevaluation.montant_reevalue)}</TableCell>
              <TableCell>{reevaluation.motif_reevaluation}</TableCell>
              <TableCell>{getStatusBadge(reevaluation.statut_reevaluation)}</TableCell>
              <TableCell>{reevaluation.valide_par || "-"}</TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {reevaluation.statut_reevaluation === "en_attente" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => onApprove?.(reevaluation)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => onReject?.(reevaluation)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
