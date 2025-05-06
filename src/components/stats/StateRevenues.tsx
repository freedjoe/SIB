import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RevenueCategory {
  name: string;
  amount: number;
  growth: number;
}

interface StateRevenuesProps {
  categories: RevenueCategory[];
  total: number;
  yearOverYearGrowth: number;
}

export function StateRevenues({ categories, total, yearOverYearGrowth }: StateRevenuesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <span>Revenus de l'État</span>
          <Badge
            variant={yearOverYearGrowth >= 0 ? "success" : "destructive"}
            className="flex items-center gap-1">
            {yearOverYearGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {yearOverYearGrowth}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="font-medium">Total des revenus</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>

          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2">
              <div>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-muted-foreground">{formatCurrency(category.amount)}</p>
              </div>
              <Badge
                variant={category.growth >= 0 ? "success" : "destructive"}
                className="flex items-center gap-1">
                {category.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {category.growth}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
