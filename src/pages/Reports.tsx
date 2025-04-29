// The Reports page is too long to include in full here, but we'll need to add functionality.
// We should create a new component for the report generation dialog and update the page to use it.

import { useState, useEffect } from "react";
import {
  FileDown,
  FileText,
  ArrowDownWideNarrow,
  FileSearch,
  X,
  Calendar,
  FilePlus,
  ChartBar,
  FileEdit,
  Trash2,
  Eye,
  Save,
  Download,
  Clock,
  LineChart,
  BarChart3,
  PieChart,
  ChevronRight,
  Search,
} from "lucide-react";
import { Dashboard, DashboardHeader, DashboardGrid, DashboardSection } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { ReportCard } from "@/components/reports/ReportCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Report {
  id: string;
  title: string;
  description?: string;
  report_type: string;
  frequency: string;
  generated_date: string;
  file_path?: string;
  status: "ready" | "pending" | "error";
}

// Mock report types
const reportTypes = [
  { id: "budget", name: "Exécution Budgétaire", description: "Rapport sur l'exécution du budget" },
  { id: "payment", name: "Paiements", description: "Rapport sur les paiements effectués" },
  { id: "engagement", name: "Engagements", description: "Rapport sur les engagements" },
  { id: "operation", name: "Opérations", description: "Rapport sur les opérations" },
  { id: "program", name: "Programmes", description: "Rapport sur les programmes" },
  { id: "ministry", name: "Ministères", description: "Rapport sur les ministères" },
  { id: "audit", name: "Audit", description: "Rapport d'audit et contrôle" },
  { id: "analytics", name: "Analytique", description: "Rapports analytiques et tableaux de bord" },
];

// Mock recent reports
const recentReports = [
  {
    id: "rep1",
    name: "Exécution budgétaire T2 2023",
    type: "budget",
    date: "2023-06-30",
    user: "admin@sib.dz",
    status: "completed",
  },
  {
    id: "rep2",
    name: "Rapport d'engagement Ministère de l'Éducation",
    type: "engagement",
    date: "2023-07-15",
    user: "finance@sib.dz",
    status: "completed",
  },
  {
    id: "rep3",
    name: "Paiements Q3 2023",
    type: "payment",
    date: "2023-10-01",
    user: "admin@sib.dz",
    status: "pending",
  },
  {
    id: "rep4",
    name: "Audit contrôle financier",
    type: "audit",
    date: "2023-09-22",
    user: "audit@sib.dz",
    status: "completed",
  },
];

// Mock scheduled reports
const scheduledReports = [
  {
    id: "srep1",
    name: "Rapport d'exécution budgétaire mensuel",
    type: "budget",
    frequency: "monthly",
    nextRun: "2023-11-01",
    recipients: ["finance@sib.dz", "admin@sib.dz"],
  },
  {
    id: "srep2",
    name: "Rapport des paiements",
    type: "payment",
    frequency: "weekly",
    nextRun: "2023-10-23",
    recipients: ["finance@sib.dz"],
  },
  {
    id: "srep3",
    name: "Tableau de bord exécutif",
    type: "analytics",
    frequency: "daily",
    nextRun: "2023-10-18",
    recipients: ["director@sib.dz", "admin@sib.dz"],
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("generate");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newReportData, setNewReportData] = useState<Partial<Report>>({
    report_type: "execution",
    frequency: "monthly",
    status: "pending",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Attempt to fetch from Supabase, but fallback to mock data if it fails
      try {
        const { data, error } = await supabase.from("reports").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          const formattedReports = data.map((report) => ({
            id: report.id,
            title: report.title,
            description: report.description,
            report_type: report.report_type,
            frequency: report.frequency,
            generated_date: new Date(report.generated_date).toLocaleDateString("fr-DZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            file_path: report.file_path,
            status: report.status as "ready" | "pending" | "error",
          }));

          setReports(formattedReports);
          return;
        }
      } catch (apiError) {
        console.error("Error fetching reports from API:", apiError);
      }

      // Fallback to mock data
      setReports(mockReportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports",
        variant: "destructive",
      });

      // Fall back to mock data if API fails
      setReports(mockReportsData);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setNewReportData({
      report_type: "execution",
      frequency: "monthly",
      status: "pending",
      generated_date: new Date().toISOString(),
    });
    setIsAddDialogOpen(true);
  };

  const handleViewReport = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (report) {
      setSelectedReport(report);
      setDialogOpen(true);
    }
  };

  const handleAddReport = () => {
    if (!newReportData.title) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    // Generate a random ID for the new report
    const newReport: Report = {
      id: `report-${reports.length + 1}`,
      title: newReportData.title!,
      description: newReportData.description,
      report_type: newReportData.report_type!,
      frequency: newReportData.frequency!,
      generated_date: new Date().toLocaleDateString("fr-DZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status: "pending",
    };

    setReports([...reports, newReport]);
    setIsAddDialogOpen(false);

    // Simulate report generation
    setTimeout(() => {
      const updatedReports = [...reports, newReport].map((r) => (r.id === newReport.id ? { ...r, status: "ready" as const } : r));
      setReports(updatedReports);

      toast({
        title: "Rapport généré",
        description: `Le rapport "${newReport.title}" a été généré avec succès.`,
      });
    }, 3000);
  };

  const handleEditReport = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (report) {
      setSelectedReport(report);
      setNewReportData({
        title: report.title,
        description: report.description,
        report_type: report.report_type,
        frequency: report.frequency,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteReport = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (report) {
      setSelectedReport(report);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleUpdateReport = () => {
    if (!selectedReport || !newReportData.title) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const updatedReports = reports.map((r) =>
      r.id === selectedReport.id
        ? {
            ...r,
            title: newReportData.title!,
            description: newReportData.description,
            report_type: newReportData.report_type!,
            frequency: newReportData.frequency!,
          }
        : r
    );

    setReports(updatedReports);
    setIsEditDialogOpen(false);
    toast({
      title: "Rapport modifié",
      description: `Le rapport "${newReportData.title}" a été modifié avec succès.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedReport) return;

    const updatedReports = reports.filter((r) => r.id !== selectedReport.id);
    setReports(updatedReports);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Rapport supprimé",
      description: `Le rapport "${selectedReport.title}" a été supprimé avec succès.`,
    });
  };

  const handleDownloadReport = (report: Report) => {
    // Simulate report download
    toast({
      title: "Téléchargement démarré",
      description: `Le rapport "${report.title}" est en cours de téléchargement.`,
    });
  };

  const filteredReports = reportTypeFilter === "all" ? reports : reports.filter((report) => report.report_type === reportTypeFilter);

  const mockReportsData: Report[] = [
    {
      id: "report-1",
      title: "Rapport d'Exécution Budgétaire",
      description: "Rapport détaillé sur l'exécution du budget en cours",
      generated_date: "28 juillet 2023",
      frequency: "Quotidien",
      status: "ready",
      report_type: "execution",
    },
    {
      id: "report-2",
      title: "Rapport d'Allocation par Ministère",
      description: "Répartition des allocations budgétaires par ministère",
      generated_date: "22 juillet 2023",
      frequency: "Hebdomadaire",
      status: "ready",
      report_type: "allocation",
    },
    {
      id: "report-3",
      title: "Rapport Financier Annuel",
      description: "Bilan financier complet pour l'année fiscale",
      generated_date: "31 décembre 2022",
      frequency: "Annuel",
      status: "ready",
      report_type: "annual",
    },
    {
      id: "report-4",
      title: "Exécution Budgétaire Mensuelle",
      description: "Suivi mensuel de l'exécution du budget",
      generated_date: "31 juillet 2023",
      frequency: "Mensuel",
      status: "pending",
      report_type: "execution",
    },
    {
      id: "report-5",
      title: "Exécution Budgétaire Trimestrielle",
      description: "Suivi trimestriel de l'exécution du budget",
      generated_date: "30 juin 2023",
      frequency: "Trimestriel",
      status: "ready",
      report_type: "execution",
    },
    {
      id: "report-6",
      title: "Répartition Budgétaire par Ministère",
      description: "Analyse de la répartition du budget entre ministères",
      generated_date: "25 juillet 2023",
      frequency: "Mensuel",
      status: "ready",
      report_type: "distribution",
    },
  ];

  const reportTypeTitles: Record<string, string> = {
    execution: "Exécution Budgétaire",
    allocation: "Allocation",
    annual: "Rapport Annuel",
    distribution: "Répartition",
  };

  const frequencyOptions = [
    { label: "Quotidien", value: "daily" },
    { label: "Hebdomadaire", value: "weekly" },
    { label: "Mensuel", value: "monthly" },
    { label: "Trimestriel", value: "quarterly" },
    { label: "Annuel", value: "annual" },
  ];

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge className="bg-green-100 text-green-800 border-green-400">Complété</Badge>;
    } else if (status === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-400">En attente</Badge>;
    } else if (status === "failed") {
      return <Badge className="bg-red-100 text-red-800 border-red-400">Échoué</Badge>;
    }
    return <Badge>Inconnu</Badge>;
  };

  // Get frequency badge
  const getFrequencyBadge = (frequency: string) => {
    if (frequency === "daily") {
      return <Badge variant="outline">Quotidien</Badge>;
    } else if (frequency === "weekly") {
      return <Badge variant="outline">Hebdomadaire</Badge>;
    } else if (frequency === "monthly") {
      return <Badge variant="outline">Mensuel</Badge>;
    } else if (frequency === "quarterly") {
      return <Badge variant="outline">Trimestriel</Badge>;
    }
    return <Badge variant="outline">Personnalisé</Badge>;
  };

  // Filter reports based on search term
  const filteredRecentReports = recentReports.filter((report) => report.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-4 text-lg text-muted-foreground">Chargement des rapports...</span>
      </div>
    );
  }

  return (
    <Dashboard>
      <DashboardHeader title="Rapports" description="Générez et consultez les rapports sur l'exécution budgétaire et financière">
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Nouveau rapport
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Générer un rapport</TabsTrigger>
            <TabsTrigger value="recent">Rapports récents</TabsTrigger>
            <TabsTrigger value="scheduled">Rapports programmés</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Générer un nouveau rapport</CardTitle>
                <CardDescription>Sélectionnez les paramètres pour générer un rapport</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type de rapport</label>
                      <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type de rapport" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Période</label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current-month">Mois courant</SelectItem>
                          <SelectItem value="previous-month">Mois précédent</SelectItem>
                          <SelectItem value="current-quarter">Trimestre courant</SelectItem>
                          <SelectItem value="previous-quarter">Trimestre précédent</SelectItem>
                          <SelectItem value="current-year">Année courante</SelectItem>
                          <SelectItem value="previous-year">Année précédente</SelectItem>
                          <SelectItem value="custom">Période personnalisée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format de sortie</label>
                    <div className="flex space-x-2">
                      <Button variant={selectedFormat === "pdf" ? "default" : "outline"} onClick={() => setSelectedFormat("pdf")} className="flex-1">
                        PDF
                      </Button>
                      <Button
                        variant={selectedFormat === "excel" ? "default" : "outline"}
                        onClick={() => setSelectedFormat("excel")}
                        className="flex-1"
                      >
                        Excel
                      </Button>
                      <Button variant={selectedFormat === "csv" ? "default" : "outline"} onClick={() => setSelectedFormat("csv")} className="flex-1">
                        CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Réinitialiser</Button>
                <Button>Générer le rapport</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rapports récents</CardTitle>
                <CardDescription>Consultez et téléchargez les rapports générés récemment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher des rapports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="border rounded-md divide-y">
                  {filteredRecentReports.length > 0 ? (
                    filteredRecentReports.map((report) => (
                      <div key={report.id} className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{reportTypes.find((t) => t.id === report.type)?.name}</span>
                            <span className="mx-1">•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(report.date)}</span>
                            <span className="mx-1">•</span>
                            {getStatusBadge(report.status)}
                          </div>
                        </div>
                        <div>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">Aucun rapport trouvé. Générez un nouveau rapport pour commencer.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rapports programmés</CardTitle>
                <CardDescription>Gérez les rapports qui s'exécutent automatiquement selon un calendrier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md divide-y">
                  {scheduledReports.map((report) => (
                    <div key={report.id} className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{reportTypes.find((t) => t.id === report.type)?.name}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{getFrequencyBadge(report.frequency)}</span>
                          <span className="mx-1">•</span>
                          <Calendar className="h-3 w-3" />
                          <span>Prochain: {formatDate(report.nextRun)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Modifier <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Créer un rapport programmé
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>

      <DashboardSection>
        <DashboardGrid columns={3}>
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Rapports populaires</CardTitle>
              <CardDescription>Accédez rapidement aux rapports les plus utilisés</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {reportTypes.slice(0, 4).map((type) => (
                <div key={type.id} className="border rounded-md p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  {type.id === "budget" && <BarChart3 className="h-8 w-8 text-primary" />}
                  {type.id === "payment" && <LineChart className="h-8 w-8 text-primary" />}
                  {type.id === "engagement" && <PieChart className="h-8 w-8 text-primary" />}
                  {type.id === "audit" && <FileText className="h-8 w-8 text-primary" />}
                  <div>
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Statistiques des rapports générés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total rapports générés</span>
                <span className="font-medium">158</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rapports ce mois</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rapports programmés actifs</span>
                <span className="font-medium">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Formats les plus utilisés</span>
                <span className="font-medium">PDF (64%)</span>
              </div>
            </CardContent>
          </Card>
        </DashboardGrid>
      </DashboardSection>

      {/* Add Report Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Générer un nouveau rapport</DialogTitle>
            <DialogDescription>Sélectionnez le type de rapport que vous souhaitez générer</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titre
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={newReportData.title || ""}
                onChange={(e) => setNewReportData({ ...newReportData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={newReportData.description || ""}
                onChange={(e) => setNewReportData({ ...newReportData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="report-type" className="text-right">
                Type de rapport
              </Label>
              <Select value={newReportData.report_type} onValueChange={(value) => setNewReportData({ ...newReportData, report_type: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="execution">Exécution Budgétaire</SelectItem>
                  <SelectItem value="allocation">Allocation par Ministère</SelectItem>
                  <SelectItem value="annual">Rapport Financier Annuel</SelectItem>
                  <SelectItem value="distribution">Répartition Budgétaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Fréquence
              </Label>
              <Select value={newReportData.frequency} onValueChange={(value) => setNewReportData({ ...newReportData, frequency: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une fréquence" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddReport}>
              <ChartBar className="mr-2 h-4 w-4" />
              Générer le rapport
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le rapport</DialogTitle>
            <DialogDescription>Modifier les détails du rapport</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Titre
              </Label>
              <Input
                id="edit-title"
                className="col-span-3"
                value={newReportData.title || ""}
                onChange={(e) => setNewReportData({ ...newReportData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                className="col-span-3"
                value={newReportData.description || ""}
                onChange={(e) => setNewReportData({ ...newReportData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-report-type" className="text-right">
                Type de rapport
              </Label>
              <Select value={newReportData.report_type} onValueChange={(value) => setNewReportData({ ...newReportData, report_type: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="execution">Exécution Budgétaire</SelectItem>
                  <SelectItem value="allocation">Allocation par Ministère</SelectItem>
                  <SelectItem value="annual">Rapport Financier Annuel</SelectItem>
                  <SelectItem value="distribution">Répartition Budgétaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-frequency" className="text-right">
                Fréquence
              </Label>
              <Select value={newReportData.frequency} onValueChange={(value) => setNewReportData({ ...newReportData, frequency: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une fréquence" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateReport}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Report Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="py-4">
              <p>
                <strong>Titre:</strong> {selectedReport.title}
              </p>
              {selectedReport.description && (
                <p>
                  <strong>Description:</strong> {selectedReport.description}
                </p>
              )}
              <p>
                <strong>Type:</strong> {reportTypeTitles[selectedReport.report_type] || selectedReport.report_type}
              </p>
              <p>
                <strong>Date de génération:</strong> {selectedReport.generated_date}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du rapport</DialogTitle>
            <DialogDescription>Informations complètes sur le rapport sélectionné</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                  <h3 className="text-lg font-medium">{selectedReport.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-medium">Type de rapport</h4>
                  <p className="text-sm">{reportTypeTitles[selectedReport.report_type] || selectedReport.report_type}</p>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-medium">Fréquence</h4>
                  <p className="text-sm">{selectedReport.frequency}</p>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-medium">Date de génération</h4>
                  <p className="text-sm">{selectedReport.generated_date}</p>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-medium">Statut</h4>
                  <div className="text-sm">
                    {selectedReport.status === "ready" && (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Prêt
                      </Badge>
                    )}
                    {selectedReport.status === "pending" && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        En préparation
                      </Badge>
                    )}
                    {selectedReport.status === "error" && (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Erreur
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Fermer
            </Button>

            {selectedReport && selectedReport.status === "ready" && (
              <Button onClick={() => handleDownloadReport(selectedReport)}>
                <FileDown className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            )}

            <Button variant="secondary">
              <FileSearch className="mr-2 h-4 w-4" />
              Voir le contenu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
