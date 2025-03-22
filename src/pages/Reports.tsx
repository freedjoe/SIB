
import { FileDown, FileText, ArrowDownWideNarrow } from "lucide-react";
import { useState } from "react";
import { 
  Dashboard, 
  DashboardHeader,
  DashboardGrid, 
  DashboardSection 
} from "@/components/layout/Dashboard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportCard } from "@/components/reports/ReportCard";
import { cn } from "@/lib/utils";

// Mock data for reports
const reportsData = [
  {
    id: "report-1",
    title: "Rapport d'Exécution Budgétaire",
    description: "Rapport détaillé sur l'exécution du budget en cours",
    date: "28 juillet 2023",
    frequency: "Quotidien",
    status: "ready",
    type: "execution"
  },
  {
    id: "report-2",
    title: "Rapport d'Allocation par Ministère",
    description: "Répartition des allocations budgétaires par ministère",
    date: "22 juillet 2023",
    frequency: "Hebdomadaire",
    status: "ready",
    type: "allocation"
  },
  {
    id: "report-3",
    title: "Rapport Financier Annuel",
    description: "Bilan financier complet pour l'année fiscale",
    date: "31 décembre 2022",
    frequency: "Annuel",
    status: "ready",
    type: "annual"
  },
  {
    id: "report-4",
    title: "Exécution Budgétaire Mensuelle",
    description: "Suivi mensuel de l'exécution du budget",
    date: "31 juillet 2023",
    frequency: "Mensuel",
    status: "pending",
    type: "execution"
  },
  {
    id: "report-5",
    title: "Exécution Budgétaire Trimestrielle",
    description: "Suivi trimestriel de l'exécution du budget",
    date: "30 juin 2023",
    frequency: "Trimestriel",
    status: "ready",
    type: "execution"
  },
  {
    id: "report-6",
    title: "Répartition Budgétaire par Ministère",
    description: "Analyse de la répartition du budget entre ministères",
    date: "25 juillet 2023",
    frequency: "Mensuel",
    status: "ready",
    type: "distribution"
  }
];

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

export default function ReportsPage() {
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all");
  
  const filteredReports = reportTypeFilter === "all" 
    ? reportsData 
    : reportsData.filter(report => report.type === reportTypeFilter);

  return (
    <Dashboard>
      <DashboardHeader 
        title="Rapports" 
        description="Générez et téléchargez des rapports sur l'exécution budgétaire"
      >
        <Button className="shadow-subtle">
          <FileDown className="mr-2 h-4 w-4" />
          Générer un rapport
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Filtrer les rapports</CardTitle>
            <CardDescription>
              Utilisez les filtres ci-dessous pour affiner votre recherche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Select 
                value={reportTypeFilter} 
                onValueChange={setReportTypeFilter}
              >
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

      <DashboardSection 
        title="Rapports disponibles" 
        description="Consultez et téléchargez les rapports générés"
      >
        <DashboardGrid columns={3}>
          {filteredReports.map((report) => (
            <ReportCard 
              key={report.id}
              title={report.title}
              description={report.description}
              date={report.date}
              frequency={report.frequency}
              status={report.status as "ready" | "pending" | "error"}
            />
          ))}
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection
        title="Rapports périodiques"
        description="Rapports générés à intervalles réguliers"
      >
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
                <CardDescription>
                  Suivi mensuel détaillé de l'exécution budgétaire
                </CardDescription>
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
                <CardDescription>
                  Suivi trimestriel détaillé de l'exécution budgétaire
                </CardDescription>
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
                <CardDescription>
                  Bilan annuel détaillé de l'exécution budgétaire
                </CardDescription>
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
            <CardDescription>
              Aperçu de la répartition du budget total entre les ministères
            </CardDescription>
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
    </Dashboard>
  );
}
