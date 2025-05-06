import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DelayedOperation {
  sector: string;
  count: number;
  totalAmount: number;
  averageDelay: number;
}

interface DelayedOperationsProps {
  operations?: DelayedOperation[];
  totalDelayed?: number;
  totalAmount?: number;
}

export function DelayedOperations({ operations = [], totalDelayed = 0, totalAmount = 0 }: DelayedOperationsProps) {
  // Add default values and safeguards
  const safeOperations = operations || [];
  const safeTotalDelayed = totalDelayed || 0;
  const safeTotalAmount = totalAmount || 0;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium">Opérations en retard</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert
          variant="destructive"
          className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Total des opérations en retard: {safeTotalDelayed}</AlertTitle>
          <AlertDescription>Montant total impacté: {formatCurrency(safeTotalAmount)}</AlertDescription>
        </Alert>

        <div className="space-y-6">
          {safeOperations.map((op, index) => (
            <div
              key={index}
              className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{op.sector}</h4>
                  <p className="text-sm text-muted-foreground">
                    {op.count} opérations - Retard moyen: {op.averageDelay} jours
                  </p>
                </div>
                <div className="text-sm font-medium">{formatCurrency(op.totalAmount)}</div>
              </div>
              <Progress
                value={(op.count / safeTotalDelayed) * 100}
                className="h-2 bg-red-100"
                // Fix the indicator class name
                className={{
                  indicator: "bg-red-500",
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
