
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { StatCard } from "@/components/ui-custom/StatCard";
import { Activity, AlertTriangle, ArrowUpRight, Briefcase, CreditCard, DollarSign, LineChart, Users } from "lucide-react";

// Budget execution periods
const PERIODS = ["monthly", "quarterly", "annual"];

export default function Dashboard() {
  const { t } = useTranslation();
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

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">
          {t("dashboard.welcome", { name: user?.email || "Admin" })}
        </p>
      </div>

      {/* Budget execution tracking */}
      <Card>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      {/* Programs & Portfolios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.portfolios")}
          value={stats.portfolios.toString()}
          description={t("dashboard.portfoliosDesc")}
          icon={<Briefcase className="text-purple-600" />}
        />
        <StatCard
          title={t("dashboard.programs")}
          value={stats.programs.toString()}
          description={t("dashboard.programsDesc")}
          icon={<Users className="text-indigo-600" />}
        />
        <StatCard
          title={t("dashboard.actions")}
          value={stats.actions.toString()}
          description={t("dashboard.actionsDesc")}
          icon={<ArrowUpRight className="text-emerald-600" />}
        />
        <StatCard
          title={t("dashboard.operations")}
          value={stats.operations.toString()}
          description={t("dashboard.operationsDesc")}
          icon={<Activity className="text-pink-600" />}
        />
      </div>

      {/* Recent activities */}
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
    </div>
  );
}
