
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dashboard, DashboardHeader, DashboardGrid, DashboardSection } from "@/components/layout/Dashboard";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { ReportCard } from "@/components/reports/ReportCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/components/ui/sonner";
import { getAllReports, Report } from "@/services/reportsService";
import { useQuery } from "@tanstack/react-query";

const Reports = () => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<string>("all");

  // Utilisation de React Query pour récupérer les données des rapports
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: getAllReports,
  });

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  // Fonction pour traduire le type de rapport
  const translateReportType = (type: string) => {
    switch (type) {
      case "budget_execution":
        return t("Budget Execution");
      case "ministerial_allocation":
        return t("Ministerial Allocation");
      case "financial_report":
        return t("Financial Report");
      case "financial_control":
        return t("Financial Control");
      case "program_performance":
        return t("Program Performance");
      case "commitment_tracking":
        return t("Commitment Tracking");
      case "internal_audit":
        return t("Internal Audit");
      default:
        return type;
    }
  };

  // Fonction pour traduire la fréquence
  const translateFrequency = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return t("Daily");
      case "weekly":
        return t("Weekly");
      case "monthly":
        return t("Monthly");
      case "quarterly":
        return t("Quarterly");
      case "biannual":
        return t("Biannual");
      case "annual":
        return t("Annual");
      case "ad_hoc":
        return t("Ad Hoc");
      default:
        return frequency;
    }
  };

  // Fonctions pour gérer les actions sur les rapports
  const handleViewReport = (report: Report) => {
    toast.info(t("View Report"), {
      description: t("Viewing report: {{title}}", { title: report.title })
    });
  };

  const handleEditReport = (report: Report) => {
    toast.info(t("Edit Report"), {
      description: t("Editing report: {{title}}", { title: report.title })
    });
  };

  const handleDeleteReport = (report: Report) => {
    toast.warning(t("Delete confirmation"), {
      description: t("Are you sure you want to delete this report?"),
      action: {
        label: t("Delete"),
        onClick: () => {
          toast.success(t("Report deleted"), {
            description: t("The report has been successfully deleted.")
          });
        }
      }
    });
  };

  const handleDownloadReport = (report: Report) => {
    toast.success(t("Download started"), {
      description: t("The report is being downloaded.")
    });
  };

  // Filtrer les rapports
  const filteredReports = filterType === "all" 
    ? reportData 
    : reportData?.filter(report => report.report_type === filterType);

  if (isLoading) {
    return (
      <Dashboard>
        <DashboardHeader title={t("Reports")} />
        <div className="flex items-center justify-center min-h-[400px]">
          <p>{t("Loading reports...")}</p>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard>
        <DashboardHeader title={t("Reports")} />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-500">{t("Error loading reports. Please try again.")}</p>
        </div>
      </Dashboard>
    );
  }

  // Extraire les types de rapports uniques
  const reportTypes = [...new Set(reportData?.map(report => report.report_type))];

  return (
    <Dashboard>
      <DashboardHeader title={t("Reports")}>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("Generate Report")}
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <div className="flex items-center mb-6 gap-2">
          <Filter className="h-4 w-4" />
          <span className="mr-2">{t("Filter by type")}:</span>
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("Select type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Reports")}</SelectItem>
              {reportTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {translateReportType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredReports && filteredReports.length > 0 ? (
          <DashboardGrid columns={3}>
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                title={report.title}
                description={report.description || undefined}
                date={formatDate(report.generated_date || new Date().toISOString())}
                frequency={translateFrequency(report.frequency)}
                status={report.status as "ready" | "pending" | "error"}
                filePath={report.file_path || undefined}
                onView={() => handleViewReport(report)}
                onEdit={() => handleEditReport(report)}
                onDelete={() => handleDeleteReport(report)}
                onDownload={() => handleDownloadReport(report)}
              />
            ))}
          </DashboardGrid>
        ) : (
          <div className="text-center py-10 bg-muted/20 rounded-lg">
            <p>{t("No reports found matching the selected criteria.")}</p>
          </div>
        )}
      </DashboardSection>
    </Dashboard>
  );
};

export default Reports;
