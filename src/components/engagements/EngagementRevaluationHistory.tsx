import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getRevaluationsByEngagement } from "@/services/engagementRevaluationService";
import { formatDate, formatCurrency } from "@/lib/utils";

interface EngagementRevaluationHistoryProps {
  engagementId: string;
}

interface UserWithRole {
  first_name: string;
  last_name: string;
  role?: {
    name: string;
  };
}

interface EngagementRevaluation {
  id: string;
  engagement_id: string;
  initial_amount: number;
  proposed_amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requested_by: string;
  approved_by?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
  requested_by_user: UserWithRole;
  approved_by_user?: UserWithRole;
}

export function EngagementRevaluationHistory({ engagementId }: EngagementRevaluationHistoryProps) {
  const { t } = useTranslation();
  const [revaluations, setRevaluations] = useState<EngagementRevaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRevaluations = async () => {
      try {
        const data = await getRevaluationsByEngagement(engagementId);
        setRevaluations(data as EngagementRevaluation[]);
      } catch (error) {
        console.error("Error loading revaluations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRevaluations();
  }, [engagementId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatUserName = (user: UserWithRole | undefined) => {
    if (!user) return "-";
    return `${user.first_name} ${user.last_name}`;
  };

  const formatUserRole = (user: UserWithRole | undefined) => {
    if (!user?.role) return "-";
    return user.role.name;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des réévaluations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Montant initial</TableHead>
              <TableHead>Montant proposé</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead>Demandé par</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Approuvé par</TableHead>
              <TableHead>Date d'approbation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {revaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Aucune réévaluation trouvée
                </TableCell>
              </TableRow>
            ) : (
              revaluations.map((revaluation) => (
                <TableRow key={revaluation.id}>
                  <TableCell>{formatDate(revaluation.created_at)}</TableCell>
                  <TableCell>{formatCurrency(revaluation.initial_amount)}</TableCell>
                  <TableCell>{formatCurrency(revaluation.proposed_amount)}</TableCell>
                  <TableCell>{revaluation.reason}</TableCell>
                  <TableCell>{formatUserName(revaluation.requested_by_user)}</TableCell>
                  <TableCell>{formatUserRole(revaluation.requested_by_user)}</TableCell>
                  <TableCell>{getStatusBadge(revaluation.status)}</TableCell>
                  <TableCell>{formatUserName(revaluation.approved_by_user)}</TableCell>
                  <TableCell>{revaluation.approval_date ? formatDate(revaluation.approval_date) : "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
