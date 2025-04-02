// The Reports page is too long to include in full here, but we'll need to add functionality.
// We should create a new component for the report generation dialog and update the page to use it.

import { useState, useEffect } from "react";
import { FileDown, FileText, ArrowDownWideNarrow, FileSearch, X, Calendar, FilePlus, ChartBar, FileEdit, Trash2, Eye, Save } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
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

export default function ReportsPage() {
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

  return (
    <Dashboard>
      <DashboardHeader title="Rapports" description="Générez et téléchargez des rapports sur l'exécution budgétaire">
        <Button className="shadow-subtle" onClick={handleGenerateReport}>
          <FilePlus className="mr-2 h-4 w-4" />
          Générer un rapport
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Filtrer les rapports</CardTitle>
            <CardDescription>Utilisez les filtres ci-dessous pour affiner votre recherche</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Type de rapport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="execution">Exécution Budgétaire</SelectItem>
                  <SelectItem value="allocation">Allocation</SelectItem>
                  <SelectItem value="annual">Rapport Annuel</SelectItem>
                  <SelectItem value="distribution">Répartition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </DashboardSection>

      <DashboardSection title="Rapports disponibles" description="Consultez et téléchargez les rapports générés">
        {loading ? (
          <p className="text-center py-8">Chargement des rapports...</p>
        ) : (
          <DashboardGrid columns={3}>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  id={report.id}
                  title={report.title}
                  description={report.description}
                  date={report.generated_date}
                  frequency={report.frequency}
                  status={report.status}
                  filePath={report.file_path}
                  onView={() => handleViewReport(report.id)}
                  onEdit={() => handleEditReport(report.id)}
                  onDelete={() => handleDeleteReport(report.id)}
                  onDownload={() => handleDownloadReport(report)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">Aucun rapport ne correspond à vos critères de recherche</p>
              </div>
            )}
          </DashboardGrid>
        )}
      </DashboardSection>

      <DashboardSection title="Rapports périodiques" description="Rapports générés à intervalles réguliers">
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList>
            <TabsTrigger value="monthly">Mensuel</TabsTrigger>
            <TabsTrigger value="quarterly">Trimestriel</TabsTrigger>
            <TabsTrigger value="yearly">Annuel</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Exécution Budgétaire Mensuelle</CardTitle>
                <CardDescription>Suivi mensuel détaillé de l'exécution budgétaire</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mois</TableHead>
                      <TableHead>Budget Prévu</TableHead>
                      <TableHead>Budget Exécuté</TableHead>
                      <TableHead>Taux d'Exécution</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Juillet 2023</TableCell>
                      <TableCell>120,000,000 DZD</TableCell>
                      <TableCell>98,500,000 DZD</TableCell>
                      <TableCell>82%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
                          Complété
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Juin 2023</TableCell>
                      <TableCell>115,000,000 DZD</TableCell>
                      <TableCell>110,200,000 DZD</TableCell>
                      <TableCell>96%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
                          Complété
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="quarterly" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Exécution Budgétaire Trimestrielle</CardTitle>
                <CardDescription>Suivi trimestriel détaillé de l'exécution budgétaire</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trimestre</TableHead>
                      <TableHead>Budget Prévu</TableHead>
                      <TableHead>Budget Exécuté</TableHead>
                      <TableHead>Taux d'Exécution</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>T2 2023</TableCell>
                      <TableCell>350,000,000 DZD</TableCell>
                      <TableCell>325,800,000 DZD</TableCell>
                      <TableCell>93%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
                          Complété
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>T1 2023</TableCell>
                      <TableCell>320,000,000 DZD</TableCell>
                      <TableCell>290,500,000 DZD</TableCell>
                      <TableCell>91%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
                          Complété
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="yearly" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Exécution Budgétaire Annuelle</CardTitle>
                <CardDescription>Bilan annuel détaillé de l'exécution budgétaire</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Année</TableHead>
                      <TableHead>Budget Prévu</TableHead>
                      <TableHead>Budget Exécuté</TableHead>
                      <TableHead>Taux d'Exécution</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2022</TableCell>
                      <TableCell>1,450,000,000 DZD</TableCell>
                      <TableCell>1,380,500,000 DZD</TableCell>
                      <TableCell>95%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
                          Complété
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2021</TableCell>
                      <TableCell>1,320,000,000 DZD</TableCell>
                      <TableCell>1,290,800,000 DZD</TableCell>
                      <TableCell>98%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
                          Complété
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>

      <DashboardSection
        title="Répartition Budgétaire par Ministère"
        description="Analyse de la répartition du budget entre les différents ministères"
      >
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Ministère</CardTitle>
            <CardDescription>Aperçu de la répartition du budget total entre les ministères</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ministère</TableHead>
                  <TableHead>Budget Alloué</TableHead>
                  <TableHead>Pourcentage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Ministère de l'Éducation</TableCell>
                  <TableCell>1,250,000,000 DZD</TableCell>
                  <TableCell>25%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ministère de la Santé</TableCell>
                  <TableCell>980,000,000 DZD</TableCell>
                  <TableCell>19.6%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ministère des Transports</TableCell>
                  <TableCell>750,000,000 DZD</TableCell>
                  <TableCell>15%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ministère de l'Agriculture</TableCell>
                  <TableCell>620,000,000 DZD</TableCell>
                  <TableCell>12.4%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Autres Ministères</TableCell>
                  <TableCell>1,400,000,000 DZD</TableCell>
                  <TableCell>28%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" className="mr-2">
              <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
              Trier
            </Button>
            <Button>
              <FileDown className="mr-2 h-4 w-4" />
              Télécharger le rapport complet
            </Button>
          </CardFooter>
        </Card>
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
