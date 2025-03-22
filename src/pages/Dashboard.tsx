
import { BarChart3, CoinsIcon, DollarSign, TrendingDown, TrendingUp, PiggyBank, Wallet } from "lucide-react";
import { 
  Dashboard, 
  DashboardHeader, 
  DashboardGrid, 
  DashboardSection 
} from "@/components/layout/Dashboard";
import { StatCard } from "@/components/ui-custom/StatCard";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock data for the dashboard
const budgetData = [
  { name: "Ministère de l'Éducation", value: 1250000000, color: "#4338ca" },
  { name: "Ministère de la Santé", value: 980000000, color: "#0ea5e9" },
  { name: "Ministère des Transports", value: 750000000, color: "#14b8a6" },
  { name: "Ministère de l'Agriculture", value: 620000000, color: "#10b981" },
  { name: "Autres Ministères", value: 1400000000, color: "#8b5cf6" },
];

const engagementData = [
  { name: "Engagés", value: 3100000000, color: "#4338ca" },
  { name: "Non engagés", value: 1900000000, color: "#f43f5e" },
];

const programmesData = [
  { 
    name: "Programme d'Éducation Nationale",
    allocation: 750000000,
    spent: 480000000,
    remaining: 270000000,
    progress: 64,
  },
  {
    name: "Santé Publique",
    allocation: 580000000,
    spent: 390000000,
    remaining: 190000000,
    progress: 67,
  },
  {
    name: "Infrastructure Routière",
    allocation: 430000000,
    spent: 210000000,
    remaining: 220000000,
    progress: 49,
  },
  {
    name: "Développement Agricole",
    allocation: 380000000,
    spent: 145000000,
    remaining: 235000000,
    progress: 38,
  },
];

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  return (
    <Dashboard>
      <DashboardHeader 
        title="Tableau de Bord" 
        description="Vue d'ensemble de l'exécution budgétaire de l'État"
      >
        <Button className="shadow-subtle">
          <BarChart3 className="mr-2 h-4 w-4" />
          Rapport détaillé
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title="Budget Total"
            value={formatCurrency(5000000000)}
            description="Budget de l'année fiscale en cours"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Montant Engagé"
            value={formatCurrency(3100000000)}
            description="62% du budget total"
            icon={<Wallet className="h-4 w-4" />}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Montant Payé"
            value={formatCurrency(2100000000)}
            description="42% du budget total"
            icon={<CoinsIcon className="h-4 w-4" />}
            trend={{ value: 4.3, isPositive: true }}
          />
          <StatCard
            title="Disponible"
            value={formatCurrency(1900000000)}
            description="38% du budget restant"
            icon={<PiggyBank className="h-4 w-4" />}
            trend={{ value: 9.1, isPositive: false }}
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection>
        <DashboardGrid columns={2}>
          <BudgetChart 
            title="Répartition du Budget par Ministère" 
            data={budgetData} 
            className="h-full"
          />
          <BudgetChart 
            title="État des Engagements" 
            data={engagementData} 
            className="h-full"
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection 
        title="Exécution des Programmes" 
        description="Suivi de l'exécution des principaux programmes budgétaires"
      >
        <Card className="budget-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Programmes Principaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {programmesData.map((program, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{program.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(program.spent)} / {formatCurrency(program.allocation)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={program.progress} 
                      className="h-2"
                    />
                    <span 
                      className={cn(
                        "text-xs font-medium",
                        program.progress < 40 
                          ? "text-budget-danger" 
                          : program.progress < 70 
                            ? "text-budget-warning" 
                            : "text-budget-success"
                      )}
                    >
                      {program.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardSection>
    </Dashboard>
  );
}
