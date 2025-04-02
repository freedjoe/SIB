
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportCard } from "@/components/reports/ReportCard";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Grid } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllReports, type Report } from "@/services/reportsService";

// Format the reports for display
interface FormattedReport {
  id: string;
  title: string;
  description: string;
  date: string;
  frequency: string;
  status: "ready" | "pending" | "error";
  filePath?: string;
  reportType: string;
}

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedReport, setSelectedReport] = useState<FormattedReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Fetch reports data
  const { data: reportsData, isLoading, error } = useQuery({
    queryKey: ["reports"],
    queryFn: getAllReports
  });

  // Format the reports data from Supabase
  const formatReports = (reports: Report[]): FormattedReport[] => {
    return reports.map(report => ({
      id: report.id,
      title: report.title,
      description: report.description || "Rapport détaillé généré automatiquement.",
      date: report.generated_date ? format(new Date(report.generated_date), "dd/MM/yyyy") : "N/A",
      frequency: formatFrequency(report.frequency),
      status: mapStatus(report.status),
      filePath: report.file_path || undefined,
      reportType: report.report_type
    }));
  };

  const reports = reportsData ? formatReports(reportsData) : [];

  // Format frequency for display
  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case "daily": return "Quotidien";
      case "weekly": return "Hebdomadaire";
      case "biweekly": return "Bi-hebdomadaire";
      case "monthly": return "Mensuel";
      case "quarterly": return "Trimestriel";
      case "biannual": return "Semestriel";
      case "annual": return "Annuel";
      case "ad_hoc": return "Ponctuel";
      default: return frequency;
    }
  };

  // Map status to display status
  const mapStatus = (status: string): "ready" | "pending" | "error" => {
    switch (status) {
      case "completed": return "ready";
      case "pending": return "pending";
      case "failed": return "error";
      default: return "pending";
    }
  };

  // Filter reports based on search query and type
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    return report.reportType === filterType && matchesSearch;
  });

  // Handle report actions
  const handleViewReport = (report: FormattedReport) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleDownloadReport = (report: FormattedReport) => {
    // In a real app, this would download the file from the filePath
    toast({
      title: "Téléchargement démarré",
      description: `Téléchargement de ${report.title}...`
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement des rapports...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Erreur lors du chargement des rapports</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rapports</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Rapports Générés</CardTitle>
          <CardDescription>
            Consultez tous les rapports générés par le système.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <Input 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="budget_execution">Exécution Budgétaire</SelectItem>
                  <SelectItem value="ministerial_allocation">Allocation Ministérielle</SelectItem>
                  <SelectItem value="financial_report">Rapport Financier</SelectItem>
                  <SelectItem value="financial_control">Contrôle Financier</SelectItem>
                  <SelectItem value="program_performance">Performance Programmes</SelectItem>
                  <SelectItem value="commitment_tracking">Suivi Engagements</SelectItem>
                  <SelectItem value="internal_audit">Audit Interne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setViewMode("list")}
                className="flex items-center"
              >
                <div className="flex flex-col h-4 w-4 justify-center space-y-1">
                  <div className="h-0.5 w-full bg-current"></div>
                  <div className="h-0.5 w-full bg-current"></div>
                  <div className="h-0.5 w-full bg-current"></div>
                </div>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="ready">Prêts</TabsTrigger>
              <TabsTrigger value="pending">En cours</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                {filteredReports.map(report => (
                  <ReportCard
                    key={report.id}
                    id={report.id}
                    title={report.title}
                    description={report.description}
                    date={report.date}
                    frequency={report.frequency}
                    status={report.status}
                    filePath={report.filePath}
                    onView={() => handleViewReport(report)}
                    onDownload={report.status === "ready" ? () => handleDownloadReport(report) : undefined}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ready">
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                {filteredReports.filter(report => report.status === "ready").map(report => (
                  <ReportCard
                    key={report.id}
                    id={report.id}
                    title={report.title}
                    description={report.description}
                    date={report.date}
                    frequency={report.frequency}
                    status={report.status}
                    filePath={report.filePath}
                    onView={() => handleViewReport(report)}
                    onDownload={() => handleDownloadReport(report)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                {filteredReports.filter(report => report.status === "pending").map(report => (
                  <ReportCard
                    key={report.id}
                    id={report.id}
                    title={report.title}
                    description={report.description}
                    date={report.date}
                    frequency={report.frequency}
                    status={report.status}
                    filePath={report.filePath}
                    onView={() => handleViewReport(report)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report View Dialog */}
      {selectedReport && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedReport.title}</DialogTitle>
              <DialogDescription>
                {selectedReport.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-semibold">Date:</div>
                <div>{selectedReport.date}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-semibold">Fréquence:</div>
                <div>{selectedReport.frequency}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-semibold">Statut:</div>
                <div>
                  {selectedReport.status === "ready" && "Prêt"}
                  {selectedReport.status === "pending" && "En cours"}
                  {selectedReport.status === "error" && "Erreur"}
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-semibold">Type:</div>
                <div>{selectedReport.reportType}</div>
              </div>
              <div className="border p-4 rounded-md bg-slate-50 dark:bg-slate-900">
                <p className="text-sm text-muted-foreground">Aperçu du contenu du rapport...</p>
                <p className="text-xs italic mt-2">Le contenu complet est disponible via le téléchargement.</p>
              </div>
            </div>
            
            <DialogFooter>
              {selectedReport.status === "ready" && (
                <Button onClick={() => handleDownloadReport(selectedReport)}>
                  Télécharger
                </Button>
              )}
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Reports;
