import { BarChart3, CoinsIcon, DollarSign, TrendingDown, TrendingUp, PiggyBank, Wallet, Bell, Calendar, User, FileCheck, Clock, CheckCircle, X, FileEdit, Plus } from "lucide-react";
import { 
  Dashboard, 
  DashboardHeader, 
  DashboardGrid, 
  DashboardSection 
} from "@/components/layout/Dashboard";
import { StatCard } from "@/components/ui-custom/StatCard";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

// Mock data for approvals and recent activities
const pendingApprovals = [
  {
    id: "eng1",
    name: "Équipement des laboratoires universitaires",
    amount: 1200000,
    requestedBy: "Ministère de l'Enseignement Supérieur",
    date: "2023-10-15",
    priority: "Haute"
  },
  {
    id: "eng2",
    name: "Construction d'un hôpital",
    amount: 5000000,
    requestedBy: "Ministère de la Santé",
    date: "2023-10-12",
    priority: "Moyenne"
  },
  {
    id: "eng3",
    name: "Équipement médical",
    amount: 1800000,
    requestedBy: "Direction Centrale des Hôpitaux",
    date: "2023-10-10",
    priority: "Basse"
  }
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
    user: "Ahmed Benali"
  },
  {
    id: "act2",
    type: "approval",
    title: "Engagement approuvé",
    description: "Engagement pour 'Rénovation Route Nationale 1'",
    date: "2023-10-15",
    amount: 60000000,
    status: "approved",
    user: "Karima Hadj"
  },
  {
    id: "act3",
    type: "budget",
    title: "Budget modifié",
    description: "Budget du Ministère de la Santé",
    date: "2023-10-14",
    amount: 980000000,
    status: "updated",
    user: "Mohamed Cherif"
  },
  {
    id: "act4",
    type: "program",
    title: "Programme ajouté",
    description: "Nouveau programme 'Numérisation des Services Publics'",
    date: "2023-10-13",
    amount: 450000000,
    status: "created",
    user: "Amina Kadi"
  }
];

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric"
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

      <DashboardGrid columns={2}>
        <DashboardSection 
          title="Approbations en attente" 
          description="Engagements nécessitant une approbation"
        >
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

        <DashboardSection 
          title="Activités récentes" 
          description="Dernières actions effectuées sur la plateforme"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(activity.date)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {activity.user}
                        </span>
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
    </Dashboard>
  );
}
