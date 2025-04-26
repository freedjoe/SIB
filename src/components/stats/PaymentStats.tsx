import { StatCard } from "@/components/ui-custom/StatCard";
import { useTranslation } from "react-i18next";
import { DollarSign, CalendarCheck, Clock, CheckCircle, XCircle, TrendingUp, Users, Briefcase, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPaymentRequestStats } from "@/services/paymentRequestsService";

interface PaymentStatsProps {
  formatCurrency: (amount: number) => string;
}

export function PaymentStats({ formatCurrency }: PaymentStatsProps) {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["payment-request-stats"],
    queryFn: getPaymentRequestStats,
  });

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title={t("paymentStats.totalRequestsAmount")} value={formatCurrency(stats.total)} icon={<DollarSign />} />
      <StatCard title={t("paymentStats.pendingAmount")} value={formatCurrency(stats.pending)} icon={<Clock />} className="bg-yellow-50 dark:bg-yellow-950" />
      <StatCard title={t("paymentStats.approvedAmount")} value={formatCurrency(stats.approved)} icon={<CheckCircle />} className="bg-green-50 dark:bg-green-950" />
      <StatCard title={t("paymentStats.rejectedAmount")} value={formatCurrency(stats.rejected)} icon={<XCircle />} className="bg-red-50 dark:bg-red-950" />
    </div>
  );
}
