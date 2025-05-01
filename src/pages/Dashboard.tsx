import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  CoinsIcon,
  DollarSign,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Wallet,
  Bell,
  Calendar,
  User,
  FileCheck,
  Clock,
  CheckCircle,
  X,
  FileEdit,
  Plus,
  Download,
  FileDown,
} from "lucide-react";
import { Dashboard, DashboardHeader, DashboardGrid, DashboardSection } from "@/components/layout/Dashboard";
import { StatCard } from "@/components/ui-custom/StatCard";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, PieChart, BarChart } from "@/components/charts";
import { CircularProgressIndicator } from "@/components/ui/ui-custom/CircularProgressIndicator";
import { toast } from "@/components/ui/use-toast";
import { DataLoadingWrapper } from "@/components/ui-custom/DataLoadingWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";

// Mock data for fiscal years with different values for each year
const fiscalYears = [
  {
    id: "fy1",
    year: 2024,
    status: "active",
    totalBudget: 5000000000,
    allocated: 3100000000,
    paid: 2100000000,
    available: 1900000000,
    engagementRate: 62,
    paymentRate: 42,
    budgetData: [
      { name: "Ministère de l'Éducation", value: 1250000000, color: "#4338ca" },
      { name: "Ministère de la Santé", value: 980000000, color: "#0ea5e9" },
      { name: "Ministère des Transports", value: 750000000, color: "#14b8a6" },
      { name: "Ministère de l'Agriculture", value: 620000000, color: "#10b981" },
      { name: "Autres Ministères", value: 1400000000, color: "#8b5cf6" },
    ],
    engagementData: [
      { name: "Engagés", value: 3100000000, color: "#4338ca" },
      { name: "Non engagés", value: 1900000000, color: "#f43f5e" },
    ],
    programmesData: [
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
    ],
  },
  {
    id: "fy2",
    year: 2023,
    status: "closed",
    totalBudget: 4500000000,
    allocated: 4200000000,
    paid: 3800000000,
    available: 300000000,
    engagementRate: 93,
    paymentRate: 84,
    budgetData: [
      { name: "Ministère de l'Éducation", value: 1150000000, color: "#4338ca" },
      { name: "Ministère de la Santé", value: 920000000, color: "#0ea5e9" },
      { name: "Ministère des Transports", value: 650000000, color: "#14b8a6" },
      { name: "Ministère de l'Agriculture", value: 580000000, color: "#10b981" },
      { name: "Autres Ministères", value: 1200000000, color: "#8b5cf6" },
    ],
    engagementData: [
      { name: "Engagés", value: 4200000000, color: "#4338ca" },
      { name: "Non engagés", value: 300000000, color: "#f43f5e" },
    ],
    programmesData: [
      {
        name: "Programme d'Éducation Nationale",
        allocation: 700000000,
        spent: 680000000,
        remaining: 20000000,
        progress: 97,
      },
      {
        name: "Santé Publique",
        allocation: 550000000,
        spent: 520000000,
        remaining: 30000000,
        progress: 95,
      },
      {
        name: "Infrastructure Routière",
        allocation: 400000000,
        spent: 360000000,
        remaining: 40000000,
        progress: 90,
      },
      {
        name: "Développement Agricole",
        allocation: 350000000,
        spent: 310000000,
        remaining: 40000000,
        progress: 89,
      },
    ],
  },
  {
    id: "fy3",
    year: 2022,
    status: "closed",
    totalBudget: 4200000000,
    allocated: 4200000000,
    paid: 4200000000,
    available: 0,
    engagementRate: 100,
    paymentRate: 100,
    budgetData: [
      { name: "Ministère de l'Éducation", value: 1050000000, color: "#4338ca" },
      { name: "Ministère de la Santé", value: 890000000, color: "#0ea5e9" },
      { name: "Ministère des Transports", value: 630000000, color: "#14b8a6" },
      { name: "Ministère de l'Agriculture", value: 530000000, color: "#10b981" },
      { name: "Autres Ministères", value: 1100000000, color: "#8b5cf6" },
    ],
    engagementData: [
      { name: "Engagés", value: 4200000000, color: "#4338ca" },
      { name: "Non engagés", value: 0, color: "#f43f5e" },
    ],
    programmesData: [
      {
        name: "Programme d'Éducation Nationale",
        allocation: 680000000,
        spent: 680000000,
        remaining: 0,
        progress: 100,
      },
      {
        name: "Santé Publique",
        allocation: 520000000,
        spent: 520000000,
        remaining: 0,
        progress: 100,
      },
      {
        name: "Infrastructure Routière",
        allocation: 380000000,
        spent: 380000000,
        remaining: 0,
        progress: 100,
      },
      {
        name: "Développement Agricole",
        allocation: 320000000,
        spent: 320000000,
        remaining: 0,
        progress: 100,
      },
    ],
  },
  {
    id: "fy4",
    year: 2025,
    status: "planning",
    totalBudget: 5500000000,
    allocated: 1000000000,
    paid: 0,
    available: 4500000000,
    engagementRate: 18,
    paymentRate: 0,
    budgetData: [
      { name: "Ministère de l'Éducation", value: 1350000000, color: "#4338ca" },
      { name: "Ministère de la Santé", value: 1050000000, color: "#0ea5e9" },
      { name: "Ministère des Transports", value: 850000000, color: "#14b8a6" },
      { name: "Ministère de l'Agriculture", value: 650000000, color: "#10b981" },
      { name: "Autres Ministères", value: 1600000000, color: "#8b5cf6" },
    ],
    engagementData: [
      { name: "Engagés", value: 1000000000, color: "#4338ca" },
      { name: "Non engagés", value: 4500000000, color: "#f43f5e" },
    ],
    programmesData: [
      {
        name: "Programme d'Éducation Nationale",
        allocation: 800000000,
        spent: 0,
        remaining: 800000000,
        progress: 0,
      },
      {
        name: "Santé Publique",
        allocation: 600000000,
        spent: 0,
        remaining: 600000000,
        progress: 0,
      },
      {
        name: "Infrastructure Routière",
        allocation: 450000000,
        spent: 0,
        remaining: 450000000,
        progress: 0,
      },
      {
        name: "Développement Agricole",
        allocation: 400000000,
        spent: 0,
        remaining: 400000000,
        progress: 0,
      },
    ],
  },
];

// Mock data for approvals and recent activities
const pendingApprovals = [
  {
    id: "eng1",
    name: "Équipement des laboratoires universitaires",
    amount: 1200000,
    requestedBy: "Ministère de l'Enseignement Supérieur",
    date: "2023-10-15",
    priority: "Haute",
  },
  {
    id: "eng2",
    name: "Construction d'un hôpital",
    amount: 5000000,
    requestedBy: "Ministère de la Santé",
    date: "2023-10-12",
    priority: "Moyenne",
  },
  {
    id: "eng3",
    name: "Équipement médical",
    amount: 1800000,
    requestedBy: "Direction Centrale des Hôpitaux",
    date: "2023-10-10",
    priority: "Basse",
  },
];

const recentActivities = [
  {
    id: "act1",
    type: "payment",
    title: "Paiement effectué",
    description: "Paiement pour 'Construction École Primaire de Koné'",
    date: "2023-10-16",
    amount: 35000000,
    status: "completed",
    user: "Ahmed Benali",
  },
  {
    id: "act2",
    type: "approval",
    title: "Engagement approuvé",
    description: "Engagement pour 'Rénovation Route Nationale 1'",
    date: "2023-10-15",
    amount: 60000000,
    status: "approved",
    user: "Karima Hadj",
  },
  {
    id: "act3",
    type: "budget",
    title: "Budget modifié",
    description: "Budget du Ministère de la Santé",
    date: "2023-10-14",
    amount: 980000000,
    status: "updated",
    user: "Mohamed Cherif",
  },
  {
    id: "act4",
    type: "program",
    title: "Programme ajouté",
    description: "Nouveau programme 'Numérisation des Services Publics'",
    date: "2023-10-13",
    amount: 450000000,
    status: "created",
    user: "Amina Kadi",
  },
];

// Sample chart data for the PDF report
const monthlyConsumptionData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "AE Consumed",
      data: [120, 190, 230, 250, 320, 380, 410, 450, 510, 550, 590, 630],
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
    },
    {
      label: "CP Consumed",
      data: [85, 140, 180, 220, 270, 310, 350, 390, 430, 470, 510, 550],
      borderColor: "rgb(153, 102, 255)",
      backgroundColor: "rgba(153, 102, 255, 0.2)",
    },
  ],
};

// Ministry distribution data for PDF
const ministryDistributionData = {
  labels: ["Education", "Health", "Transport", "Defense", "Agriculture", "Justice", "Foreign Affairs", "Other"],
  datasets: [
    {
      label: "Budget Allocation (in billions)",
      data: [1.25, 0.98, 0.75, 0.89, 0.62, 0.41, 0.35, 0.48],
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
        "rgba(255, 159, 64, 0.6)",
        "rgba(199, 199, 199, 0.6)",
        "rgba(83, 102, 255, 0.6)",
      ],
    },
  ],
};

// Program distribution data for PDF
const programDistributionData = {
  labels: ["Program A", "Program B", "Program C", "Program D", "Program E", "Other Programs"],
  datasets: [
    {
      label: "Allocation by Program",
      data: [0.85, 0.72, 0.65, 0.54, 0.48, 0.76],
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
        "rgba(255, 159, 64, 0.6)",
      ],
    },
  ],
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "approved":
      return <FileCheck className="h-5 w-5 text-blue-500" />;
    case "updated":
      return <FileEdit className="h-5 w-5 text-orange-500" />;
    case "created":
      return <Plus className="h-5 w-5 text-purple-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

// Helper function to get priority badge
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "Haute":
      return <Badge className="bg-red-500">Haute</Badge>;
    case "Moyenne":
      return <Badge className="bg-yellow-500">Moyenne</Badge>;
    case "Basse":
      return <Badge className="bg-blue-500">Basse</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(fiscalYears[0].id);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [loading, setLoading] = useState(false); // Add this if not already present

  useEffect(() => {
    if (loading) {
      return <PageLoadingSpinner message="Chargement du tableau de bord..." />;
    }
  }, [loading]);

  const handleGenerateReport = () => {
    setGeneratingPdf(true);

    // Simulate PDF generation with a delay
    setTimeout(() => {
      setGeneratingPdf(false);
      setIsPdfPreviewOpen(true);

      toast({
        title: t("dashboard.pdfGenerated"),
        description: t("dashboard.pdfGeneratedDescription"),
      });
    }, 1500);
  };

  const handleDownloadPdf = () => {
    // Simulate PDF download
    toast({
      title: t("dashboard.pdfDownloaded"),
      description: t("dashboard.pdfDownloadedDescription"),
    });
    setIsPdfPreviewOpen(false);
  };

  // Get the selected fiscal year details
  const currentFiscalYear = fiscalYears.find((year) => year.id === selectedYear) || fiscalYears[0];

  return (
    <DataLoadingWrapper
      loading={loading}
      skeleton={
        <div className="flex items-center justify-center min-h-screen">
          <Skeleton className="h-10 w-10 rounded-full" />
          <span className="ml-4 text-lg text-muted-foreground">Chargement des exercices budgétaires...</span>
        </div>
      }
    >
      <Dashboard>
        <DashboardHeader title={t("dashboard.title")} description={t("dashboard.welcome")}>
          <div className="flex items-center gap-3">
            <div className="w-52">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dashboard.selectFiscalYear")} />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {t("dashboard.fiscalYear")} {year.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="shadow-subtle" onClick={handleGenerateReport} disabled={generatingPdf}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {generatingPdf ? t("dashboard.generatingReport", "Génération du rapport...") : t("dashboard.detailedReport", "Rapport détaillé")}
            </Button>
          </div>
        </DashboardHeader>

        <DashboardSection>
          <DashboardGrid columns={4}>
            <StatCard
              title={t("dashboard.totalBudget")}
              value={formatCurrency(currentFiscalYear.totalBudget)}
              description={t("dashboard.fiscalYearBudget")}
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: 8.2, isPositive: true }}
            />
            <StatCard
              title={t("dashboard.totalAllocated")}
              value={formatCurrency(currentFiscalYear.allocated)}
              description={`${Math.round((currentFiscalYear.allocated / currentFiscalYear.totalBudget) * 100)}% ${t("dashboard.ofTotalBudget")}`}
              icon={<Wallet className="h-4 w-4" />}
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatCard
              title={t("dashboard.totalUtilized", "Total Utilized")}
              value={formatCurrency(currentFiscalYear.paid)}
              description={`${Math.round((currentFiscalYear.paid / currentFiscalYear.totalBudget) * 100)}% ${t("dashboard.ofTotalBudget")}`}
              icon={<CoinsIcon className="h-4 w-4" />}
              trend={{ value: 4.3, isPositive: true }}
            />
            <StatCard
              title={t("dashboard.remainingBudget")}
              value={formatCurrency(currentFiscalYear.available)}
              description={`${Math.round((currentFiscalYear.available / currentFiscalYear.totalBudget) * 100)}% ${t("dashboard.ofTotalBudget")}`}
              icon={<PiggyBank className="h-4 w-4" />}
              trend={{ value: 9.1, isPositive: false }}
            />
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid columns={2}>
            <BudgetChart title={t("dashboard.byMinistry")} data={currentFiscalYear.budgetData} className="h-full" />
            <BudgetChart title={t("dashboard.engagementStatus")} data={currentFiscalYear.engagementData} className="h-full" />
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection title={t("dashboard.programExecution")} description={t("dashboard.programExecutionDescription")}>
          <Card className="budget-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">{t("dashboard.mainPrograms")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentFiscalYear.programmesData.map((program, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{program.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(program.spent)} / {formatCurrency(program.allocation)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={program.progress} className="h-2" />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          program.progress < 40 ? "text-budget-danger" : program.progress < 70 ? "text-budget-warning" : "text-budget-success"
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

        <DashboardGrid columns={2}>
          <DashboardSection title="Approbations en attente" description="Engagements nécessitant une approbation">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {pendingApprovals.map((approval, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 last:pb-0 border-b last:border-b-0 border-border">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium">{approval.name}</h4>
                          {getPriorityBadge(approval.priority)}
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-muted-foreground">{approval.requestedBy}</p>
                          <p className="text-sm font-medium">{formatCurrency(approval.amount)}</p>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">{formatDate(approval.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  Voir toutes les approbations
                </Button>
              </CardFooter>
            </Card>
          </DashboardSection>

          <DashboardSection title="Activités récentes" description="Dernières actions effectuées sur la plateforme">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">{getStatusIcon(activity.status)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium leading-none">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(activity.date)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  Voir toutes les activités
                </Button>
              </CardFooter>
            </Card>
          </DashboardSection>
        </DashboardGrid>

        {/* PDF Report Preview Dialog */}
        <Dialog open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-primary" />
                {t("dashboard.pdfReportTitle", { year: currentFiscalYear.year })}
              </DialogTitle>
              <DialogDescription>{t("dashboard.pdfReportDescription")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Report Header */}
              <div className="text-center space-y-2 border-b pb-4">
                <h1 className="text-2xl font-bold">{t("dashboard.reportTitle")}</h1>
                <h2 className="text-xl">
                  {t("dashboard.fiscalYear")} {currentFiscalYear.year}
                </h2>
                <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>

              {/* Summary Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{t("dashboard.summary")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("dashboard.totalBudget")}</p>
                    <p className="font-semibold">{formatCurrency(currentFiscalYear.totalBudget)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("dashboard.totalAllocated")}</p>
                    <p className="font-semibold">{formatCurrency(currentFiscalYear.allocated)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("dashboard.totalUtilized", "Total Utilized")}</p>
                    <p className="font-semibold">{formatCurrency(currentFiscalYear.paid)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("dashboard.remainingBudget")}</p>
                    <p className="font-semibold">{formatCurrency(currentFiscalYear.available)}</p>
                  </div>
                </div>
              </div>

              {/* Budget Execution Progress */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{t("dashboard.budgetExecution")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <CircularProgressIndicator
                      value={currentFiscalYear.engagementRate}
                      size={150}
                      strokeWidth={12}
                      color="primary"
                      showValue={true}
                      label={t("dashboard.engagementRate")}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <CircularProgressIndicator
                      value={currentFiscalYear.paymentRate}
                      size={150}
                      strokeWidth={12}
                      color="secondary"
                      showValue={true}
                      label={t("dashboard.paymentRate")}
                    />
                  </div>
                </div>
              </div>

              {/* Monthly Consumption Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{t("dashboard.monthlyTrends")}</h3>
                <div className="h-[300px]">
                  <LineChart data={monthlyConsumptionData} />
                </div>
              </div>

              {/* Ministry Distribution */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{t("dashboard.byMinistry")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-[300px]">
                    <PieChart data={ministryDistributionData} />
                  </div>
                  <div className="h-[300px]">
                    <BarChart data={ministryDistributionData} />
                  </div>
                </div>
              </div>

              {/* Programs Distribution */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{t("dashboard.byProgram")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-[300px]">
                    <PieChart data={programDistributionData} />
                  </div>
                  <div className="h-[300px]">
                    <BarChart data={programDistributionData} />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPdfPreviewOpen(false)}>
                {t("common.close")}
              </Button>
              <Button onClick={handleDownloadPdf} className="gap-2">
                <Download className="h-4 w-4" />
                {t("dashboard.downloadPdf")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Dashboard>
    </DataLoadingWrapper>
  );
}
