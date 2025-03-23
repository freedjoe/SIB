
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { StatCard } from "@/components/ui-custom/StatCard";
import { Activity, AlertTriangle, ArrowUpRight, Briefcase, CreditCard, DollarSign, Eye, LineChart, Users } from "lucide-react";
import { 
  Dashboard, 
  DashboardHeader, 
  DashboardGrid, 
  DashboardSection 
} from "@/components/layout/Dashboard";
import { useNavigate } from "react-router-dom";

// Budget execution periods
const PERIODS = ["monthly", "quarterly", "annual"];

// Mock portfolios data
const PORTFOLIOS = [
  { id: 1, name: "Transport Infrastructure", budget: "250M", programs: 5 },
  { id: 2, name: "Digital Transformation", budget: "180M", programs: 3 },
  { id: 3, name: "Social Housing", budget: "320M", programs: 4 },
  { id: 4, name: "Agricultural Development", budget: "150M", programs: 6 },
];

// Mock programs data
const PROGRAMS = [
  { id: 1, name: "Road Network Expansion", portfolio: "Transport Infrastructure", budget: "120M" },
  { id: 2, name: "Digital Governance", portfolio: "Digital Transformation", budget: "75M" },
  { id: 3, name: "Urban Housing", portfolio: "Social Housing", budget: "180M" },
  { id: 4, name: "Rural Agriculture", portfolio: "Agricultural Development", budget: "80M" },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePeriod, setActivePeriod] = useState<string>("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBudget: "1,500,000,000",
    allocatedBudget: "980,000,000",
    remainingBudget: "520,000,000",
    approvals: 12,
    portfolios: 8,
    programs: 24,
    actions: 56,
    operations: 86
  });

  // Simulate loading data from Supabase
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleViewPortfolio = (portfolioId: number) => {
    navigate(`/programs?portfolio=${portfolioId}`);
  };

  return (
    <Dashboard>
      <DashboardHeader 
        title={t("dashboard.title")}
        description={t("dashboard.welcome", { name: user?.email || "Admin" })}
      />

      {/* Budget execution tracking */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>{t("dashboard.budgetExecution")}</CardTitle>
            <CardDescription>
              {t("dashboard.budgetExecutionDescription")}
            </CardDescription>
          </div>
          <Tabs 
            value={activePeriod} 
            onValueChange={setActivePeriod}
            className="w-[400px]"
          >
            <TabsList className="grid grid-cols-3">
              {PERIODS.map((period) => (
                <TabsTrigger key={period} value={period}>
                  {t(`dashboard.period.${period}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <BudgetChart 
              period={activePeriod} 
              title={t("dashboard.budgetAllocation")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <DashboardSection title={t("dashboard.budgetOverview")}>
        <DashboardGrid columns={4}>
          <StatCard
            title={t("dashboard.totalBudget")}
            value={`${stats.totalBudget} DZD`}
            description={t("dashboard.totalBudgetDesc")}
            icon={<DollarSign className="text-blue-600" />}
          />
          <StatCard
            title={t("dashboard.allocatedBudget")}
            value={`${stats.allocatedBudget} DZD`}
            description={t("dashboard.allocatedDesc")}
            icon={<CreditCard className="text-green-600" />}
          />
          <StatCard
            title={t("dashboard.remainingBudget")}
            value={`${stats.remainingBudget} DZD`}
            description={t("dashboard.remainingDesc")}
            icon={<LineChart className="text-yellow-600" />}
          />
          <StatCard
            title={t("dashboard.pendingApprovals")}
            value={stats.approvals.toString()}
            description={t("dashboard.approvalsDesc")}
            icon={<AlertTriangle className="text-red-600" />}
          />
        </DashboardGrid>
      </DashboardSection>

      {/* Portfolios & Programs with cards */}
      <DashboardSection title={t("dashboard.portfoliosAndPrograms")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Portfolios */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("dashboard.portfolios")}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate("/portfolios")}>
                  {t("common.viewAll")}
                </Button>
              </div>
              <CardDescription>{t("dashboard.portfoliosDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PORTFOLIOS.map((portfolio) => (
                  <div key={portfolio.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{portfolio.name}</p>
                        <p className="text-sm text-muted-foreground">{portfolio.budget} • {portfolio.programs} {t("dashboard.programsLabel")}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleViewPortfolio(portfolio.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Programs */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("dashboard.programs")}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate("/programs")}>
                  {t("common.viewAll")}
                </Button>
              </div>
              <CardDescription>{t("dashboard.programsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PROGRAMS.map((program) => (
                  <div key={program.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-muted-foreground">{program.portfolio} • {program.budget}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/programs/${program.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      {/* Recent activities */}
      <DashboardSection>
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivities")}</CardTitle>
            <CardDescription>
              {t("dashboard.recentActivitiesDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p>{t("common.loading")}</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">{t("dashboard.activity.date")}</th>
                      <th className="text-left py-3 px-4">{t("dashboard.activity.user")}</th>
                      <th className="text-left py-3 px-4">{t("dashboard.activity.action")}</th>
                      <th className="text-left py-3 px-4">{t("dashboard.activity.details")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{new Date().toLocaleDateString()}</td>
                        <td className="py-3 px-4">User {i + 1}</td>
                        <td className="py-3 px-4">{["Created", "Updated", "Approved", "Rejected", "Deleted"][i]}</td>
                        <td className="py-3 px-4">
                          {["Budget allocation", "Program update", "Engagement approval", "Payment request", "Operation deletion"][i]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline">{t("common.viewAll")}</Button>
            </div>
          </CardContent>
        </Card>
      </DashboardSection>
    </Dashboard>
  );
}
