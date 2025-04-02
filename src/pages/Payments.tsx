import { useState } from "react";
import { Dashboard, DashboardHeader, DashboardSection, DashboardGrid } from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui-custom/StatCard";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { cn } from "@/lib/utils";
import { 
  CreditCard, FileCheck, Calendar, CheckCircle, Clock, X, 
  ArrowRightLeft, Eye, Plus, FileEdit, Trash2, FileText, 
  CalendarDays, Filter, RefreshCw
} from "lucide-react";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { PaymentRequestDialog } from "@/components/dialogs/PaymentRequestDialog";
import { PaymentApprovalDialog } from "@/components/dialogs/PaymentApprovalDialog";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentTable } from "@/components/tables/PaymentTable";

interface Payment {
  id: string;
  engagementId: string;
  engagementRef: string;
  operationId: string;
  operationName: string;
  amount: number;
  requestDate: string;
  paymentDate: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  beneficiary: string;
  description: string;
}

interface PaymentRequest {
  id: string;
  engagementId: string;
  engagementRef: string;
  operationName: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
  startDate: string;
  description: string;
  status: "pending_officer" | "pending_accountant" | "approved" | "rejected";
  requestedBy: string;
  requestDate: string;
  beneficiary: string;
}

const mockPayments: Payment[] = [
  {
    id: "p1",
    engagementId: "e1",
    engagementRef: "ENG/2023/001",
    operationId: "op1",
    operationName: "Construction École Primaire de Koné",
    amount: 35000000,
    requestDate: "2023-05-10",
    paymentDate: "2023-05-20",
    status: "paid",
    beneficiary: "Entreprise ABC Construction",
    description: "Premier paiement pour travaux de fondation",
  },
  {
    id: "p2",
    engagementId: "e1",
    engagementRef: "ENG/2023/001",
    operationId: "op1",
    operationName: "Construction École Primaire de Koné",
    amount: 45000000,
    requestDate: "2023-07-15",
    paymentDate: "2023-07-30",
    status: "paid",
    beneficiary: "Entreprise ABC Construction",
    description: "Deuxième paiement pour travaux de structure",
  },
  {
    id: "p3",
    engagementId: "e2",
    engagementRef: "ENG/2023/008",
    operationId: "op2",
    operationName: "Équipement Hôpital Central",
    amount: 40000000,
    requestDate: "2023-06-05",
    paymentDate: "2023-06-18",
    status: "paid",
    beneficiary: "MedEquip International",
    description: "Paiement pour fourniture d'équipements médicaux",
  },
  {
    id: "p4",
    engagementId: "e3",
    engagementRef: "ENG/2023/012",
    operationId: "op3",
    operationName: "Rénovation Route Nationale 1",
    amount: 60000000,
    requestDate: "2023-08-10",
    paymentDate: "2023-08-28",
    status: "paid",
    beneficiary: "Routes & Ponts SA",
    description: "Premier paiement pour travaux de terrassement",
  },
  {
    id: "p5",
    engagementId: "e1",
    engagementRef: "ENG/2023/001",
    operationId: "op1",
    operationName: "Construction École Primaire de Koné",
    amount: 15000000,
    requestDate: "2023-09-20",
    paymentDate: null,
    status: "approved",
    beneficiary: "Entreprise ABC Construction",
    description: "Troisième paiement pour travaux de finition",
  },
  {
    id: "p6",
    engagementId: "e4",
    engagementRef: "ENG/2023/025",
    operationId: "op5",
    operationName: "Formation des Enseignants",
    amount: 18000000,
    requestDate: "2023-10-05",
    paymentDate: null,
    status: "pending",
    beneficiary: "Institut de Formation Pédagogique",
    description: "Paiement pour services de formation",
  },
  {
    id: "p7",
    engagementId: "e5",
    engagementRef: "ENG/2023/030",
    operationId: "op6",
    operationName: "Campagne de Vaccination",
    amount: 25000000,
    requestDate: "2023-09-15",
    paymentDate: null,
    status: "rejected",
    beneficiary: "Santé Pour Tous",
    description: "Paiement pour vaccins et matériel médical",
  },
  {
    id: "p8",
    engagementId: "e3",
    engagementRef: "ENG/2023/012",
    operationId: "op3",
    operationName: "Rénovation Route Nationale 1",
    amount: 35000000,
    requestDate: "2023-10-10",
    paymentDate: null,
    status: "pending",
    beneficiary: "Routes & Ponts SA",
    description: "Deuxième paiement pour travaux de revêtement",
  },
];

const mockEngagements = [
  { 
    id: "e1", 
    ref: "ENG/2023/001", 
    operation: "Construction École Primaire de Koné", 
    beneficiary: "Entreprise ABC Construction",
    budget: 100000000,
    allocated: 80000000
  },
  { 
    id: "e2", 
    ref: "ENG/2023/008", 
    operation: "Équipement Hôpital Central", 
    beneficiary: "MedEquip International",
    budget: 50000000,
    allocated: 40000000
  },
  { 
    id: "e3", 
    ref: "ENG/2023/012", 
    operation: "Rénovation Route Nationale 1", 
    beneficiary: "Routes & Ponts SA",
    budget: 150000000,
    allocated: 95000000
  },
  { 
    id: "e4", 
    ref: "ENG/2023/025", 
    operation: "Formation des Enseignants", 
    beneficiary: "Institut de Formation Pédagogique",
    budget: 25000000,
    allocated: 18000000
  },
  { 
    id: "e5", 
    ref: "ENG/2023/030", 
    operation: "Campagne de Vaccination", 
    beneficiary: "Santé Pour Tous",
    budget: 35000000,
    allocated: 25000000
  },
];

const mockPaymentRequests: PaymentRequest[] = [
  {
    id: "pr1",
    engagementId: "e1",
    engagementRef: "ENG/2023/001",
    operationName: "Construction École Primaire de Koné",
    amount: 5000000,
    frequency: "monthly",
    startDate: "2023-10-01",
    description: "Paiement mensuel pour les travaux de construction - Phase 2",
    status: "pending_officer",
    requestedBy: "Ahmed Benali",
    requestDate: "2023-09-20",
    beneficiary: "Entreprise ABC Construction",
  },
  {
    id: "pr2",
    engagementId: "e2",
    engagementRef: "ENG/2023/008",
    operationName: "Équipement Hôpital Central",
    amount: 10000000,
    frequency: "quarterly",
    startDate: "2023-10-01",
    description: "Paiement trimestriel pour la livraison d'équipements médicaux",
    status: "pending_accountant",
    requestedBy: "Amina Kaci",
    requestDate: "2023-09-15",
    beneficiary: "MedEquip International",
  },
  {
    id: "pr3",
    engagementId: "e3",
    engagementRef: "ENG/2023/012",
    operationName: "Rénovation Route Nationale 1",
    amount: 15000000,
    frequency: "quarterly",
    startDate: "2023-10-15",
    description: "Paiement pour les travaux de rénovation du tronçon nord",
    status: "approved",
    requestedBy: "Karim Hadj",
    requestDate: "2023-09-10",
    beneficiary: "Routes & Ponts SA",
  },
  {
    id: "pr4",
    engagementId: "e4",
    engagementRef: "ENG/2023/025",
    operationName: "Formation des Enseignants",
    amount: 3000000,
    frequency: "annual",
    startDate: "2023-11-01",
    description: "Paiement annuel pour le programme de formation continue",
    status: "rejected",
    requestedBy: "Samia Belhadj",
    requestDate: "2023-09-05",
    beneficiary: "Institut de Formation Pédagogique",
  },
];

const getStatusBadge = (status: Payment["status"] | PaymentRequest["status"]) => {
  switch (status) {
    case "pending":
    case "pending_officer":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400 gap-1">
          <Clock className="h-3 w-3" />
          <span>En attente (Officier)</span>
        </Badge>
      );
    case "pending_accountant":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400 gap-1">
          <Clock className="h-3 w-3" />
          <span>En attente (Comptable)</span>
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400 gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Approuvé</span>
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400 gap-1">
          <X className="h-3 w-3" />
          <span>Rejeté</span>
        </Badge>
      );
    case "paid":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400 gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Payé</span>
        </Badge>
      );
    default:
      return null;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export default function PaymentsPage() {
  const { user, isAdminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [requestsTab, setRequestsTab] = useState<string>("pending");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(mockPaymentRequests);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [currentRequest, setCurrentRequest] = useState<PaymentRequest | null>(null);
  
  const currentUserRole = isAdminUser ? "admin" : "officer";

  useState(() => {
    setPayments(mockPayments);
  });

  const totalPayments = payments.length;
  const totalPaidAmount = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPendingAmount = payments.filter((p) => p.status === "pending" || p.status === "approved").reduce((sum, p) => sum + p.amount, 0);
  const totalRejectedAmount = payments.filter((p) => p.status === "rejected").reduce((sum, p) => sum + p.amount, 0);

  const paymentStatusData = [
    { name: "Payé", value: totalPaidAmount, color: "#10b981" },
    { name: "En attente", value: totalPendingAmount, color: "#f59e0b" },
    { name: "Rejeté", value: totalRejectedAmount, color: "#ef4444" },
  ];

  const filteredPayments = statusFilter !== "all" ? payments.filter((payment) => payment.status === statusFilter) : payments;

  const filteredRequests = (() => {
    switch (requestsTab) {
      case "pending":
        return paymentRequests.filter(r => r.status === "pending_officer" || r.status === "pending_accountant");
      case "approved":
        return paymentRequests.filter(r => r.status === "approved");
      case "rejected":
        return paymentRequests.filter(r => r.status === "rejected");
      default:
        return paymentRequests;
    }
  })();

  const handleOpenAddDialog = () => {
    setCurrentPayment(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsEditDialogOpen(true);
  };

  const handleOpenViewDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenRequestDialog = () => {
    setCurrentRequest(null);
    setIsRequestDialogOpen(true);
  };

  const handleOpenApprovalDialog = (request: PaymentRequest) => {
    setCurrentRequest(request);
    setIsApprovalDialogOpen(true);
  };

  const handleAddPayment = (paymentData: Partial<Payment>) => {
    if (!paymentData.engagementId || !paymentData.amount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const engagement = mockEngagements.find((e) => e.id === paymentData.engagementId);

    if (!engagement) {
      toast({
        title: "Erreur",
        description: "Engagement invalide.",
        variant: "destructive",
      });
      return;
    }

    const newPayment: Payment = {
      id: `p${payments.length + 9}`,
      engagementId: paymentData.engagementId,
      engagementRef: engagement.ref,
      operationId: `op${Math.floor(Math.random() * 8) + 1}`,
      operationName: engagement.operation,
      amount: Number(paymentData.amount),
      requestDate: paymentData.requestDate || new Date().toISOString().split("T")[0],
      paymentDate: null,
      status: "pending",
      beneficiary: engagement.beneficiary,
      description: paymentData.description || "",
    };

    setPayments([...payments, newPayment]);
    setIsAddDialogOpen(false);
    toast({
      title: "Paiement ajouté",
      description: `Le paiement pour "${newPayment.operationName}" a été ajouté avec succès.`,
    });
  };

  const handleEditPayment = (paymentData: Partial<Payment>) => {
    if (!currentPayment) return;

    const updatedPayments = payments.map((p) =>
      p.id === currentPayment.id
        ? {
            ...p,
            amount: Number(paymentData.amount) || p.amount,
            requestDate: paymentData.requestDate || p.requestDate,
            status: paymentData.status || p.status,
            paymentDate: paymentData.status === "paid" ? new Date().toISOString().split("T")[0] : p.paymentDate,
            description: paymentData.description || p.description,
          }
        : p
    );

    setPayments(updatedPayments);
    setIsEditDialogOpen(false);
    toast({
      title: "Paiement modifié",
      description: `Le paiement pour "${currentPayment.operationName}" a été modifié avec succès.`,
    });
  };

  const handleDeletePayment = () => {
    if (!currentPayment) return;

    const updatedPayments = payments.filter((p) => p.id !== currentPayment.id);
    setPayments(updatedPayments);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Paiement supprimé",
      description: `Le paiement pour "${currentPayment.operationName}" a été supprimé avec succès.`,
    });
  };

  const handleAddRequest = (requestData: Partial<PaymentRequest>) => {
    if (!requestData.engagementId || !requestData.amount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const engagement = mockEngagements.find((e) => e.id === requestData.engagementId);
    if (!engagement) {
      toast({
        title: "Erreur",
        description: "Engagement invalide.",
        variant: "destructive",
      });
      return;
    }

    const availableBudget = engagement.budget - engagement.allocated;
    if ((requestData.amount || 0) > availableBudget) {
      toast({
        title: "Erreur",
        description: "Le montant demandé dépasse le budget disponible.",
        variant: "destructive",
      });
      return;
    }

    const newRequest: PaymentRequest = {
      id: `pr${paymentRequests.length + 1}`,
      engagementId: requestData.engagementId,
      engagementRef: engagement.ref,
      operationName: engagement.operation,
      amount: Number(requestData.amount),
      frequency: requestData.frequency as "monthly" | "quarterly" | "annual",
      startDate: requestData.startDate || new Date().toISOString().split("T")[0],
      description: requestData.description || "",
      status: "pending_officer",
      requestedBy: user?.email || "Utilisateur courant",
      requestDate: new Date().toISOString().split("T")[0],
      beneficiary: engagement.beneficiary,
    };

    setPaymentRequests([...paymentRequests, newRequest]);
    setIsRequestDialogOpen(false);
    
    toast({
      title: "Demande soumise",
      description: "Votre demande de paiement a été soumise et est en attente d'approbation.",
    });
  };

  const handleApproveRequest = (request: PaymentRequest, comments: string) => {
    const updatedRequests = paymentRequests.map((r) => {
      if (r.id === request.id) {
        if (request.status === "pending_officer") {
          return { ...r, status: "pending_accountant" };
        }
        else if (request.status === "pending_accountant") {
          return { ...r, status: "approved" };
        }
        else if (currentUserRole === "admin") {
          return { ...r, status: "approved" };
        }
        return r;
      }
      return r;
    });
    
    setPaymentRequests(updatedRequests);
    setIsApprovalDialogOpen(false);
    
    toast({
      title: "Demande approuvée",
      description: request.status === "pending_officer" 
        ? "La demande a été approuvée et transmise au comptable pour validation finale."
        : "La demande de paiement a été approuvée avec succès.",
    });
    
    if (request.status === "pending_accountant" || currentUserRole === "admin") {
      const newPayment: Payment = {
        id: `p${payments.length + 1}`,
        engagementId: request.engagementId,
        engagementRef: request.engagementRef,
        operationId: request.engagementId,
        operationName: request.operationName,
        amount: request.amount,
        requestDate: new Date().toISOString().split("T")[0],
        paymentDate: null,
        status: "approved",
        beneficiary: request.beneficiary,
        description: `Paiement approuvé: ${request.description}`,
      };
      
      setPayments([...payments, newPayment]);
    }
  };

  const handleRejectRequest = (request: PaymentRequest, reason: string) => {
    const updatedRequests = paymentRequests.map((r) => 
      r.id === request.id ? { ...r, status: "rejected" } : r
    );
    
    setPaymentRequests(updatedRequests);
    setIsApprovalDialogOpen(false);
    
    toast({
      title: "Demande rejetée",
      description: `La demande de paiement a été rejetée. Motif: ${reason}`,
    });
  };

  return (
    <Dashboard>
      <DashboardHeader title="Gestion des Paiements" description="Suivez et gérez les crédits de paiement (CP) et les décaissements">
        <div className="flex gap-2">
          <Button className="shadow-subtle" onClick={handleOpenRequestDialog}>
            <FileText className="mr-2 h-4 w-4" />
            Demande de paiement
          </Button>
          <Button className="shadow-subtle" onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau paiement
          </Button>
        </div>
      </DashboardHeader>

      <DashboardSection>
        <DashboardGrid columns={4}>
          <StatCard
            title="Total des Paiements"
            value={formatCurrency(totalPaidAmount + totalPendingAmount + totalRejectedAmount)}
            description={`${totalPayments} transactions`}
            icon={<ArrowRightLeft className="h-4 w-4" />}
          />
          <StatCard
            title="Montant Payé"
            value={formatCurrency(totalPaidAmount)}
            description="Paiements complétés"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title="Montant en Attente"
            value={formatCurrency(totalPendingAmount)}
            description="Paiements en attente"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Montant Rejeté"
            value={formatCurrency(totalRejectedAmount)}
            description="Paiements rejetés"
            icon={<X className="h-4 w-4" />}
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection>
        <Tabs defaultValue="payments" className="w-full">
          <TabsList>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="requests">
              Demandes de paiement
              {paymentRequests.filter(r => r.status === "pending_officer" || r.status === "pending_accountant").length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {paymentRequests.filter(r => r.status === "pending_officer" || r.status === "pending_accountant").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-6">
            <DashboardGrid columns={2}>
              <BudgetChart title="Répartition des Paiements par Statut" data={paymentStatusData} className="h-full" />
              <Card className="budget-card h-full">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Activité Récente</CardTitle>
                  <CardDescription>Dernières transactions de paiement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {payments.slice(0, 4).map((payment, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full",
                            payment.status === "paid"
                              ? "bg-green-100 text-green-600"
                              : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : payment.status === "approved"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-red-100 text-red-600"
                          )}
                        >
                          {payment.status === "paid" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : payment.status === "pending" ? (
                            <Clock className="h-5 w-5" />
                          ) : payment.status === "approved" ? (
                            <FileCheck className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{payment.operationName}</p>
                          <p className="text-sm text-muted-foreground">{payment.description}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{formatDate(payment.requestDate)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{payment.beneficiary.slice(0, 15)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full justify-center">
                    Voir toutes les transactions
                  </Button>
                </CardFooter>
              </Card>
            </DashboardGrid>

            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <TabsList>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="pending">En attente</TabsTrigger>
                    <TabsTrigger value="approved">Approuvés</TabsTrigger>
                    <TabsTrigger value="paid">Payés</TabsTrigger>
                  </TabsList>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <TabsContent value="all" className="animate-fade-in">
                  <PaymentTable
                    payments={filteredPayments}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                    onView={handleOpenViewDialog}
                    onEdit={handleOpenEditDialog}
                    onDelete={handleOpenDeleteDialog}
                  />
                </TabsContent>

                <TabsContent value="pending" className="animate-fade-in">
                  <PaymentTable
                    payments={payments.filter((p) => p.status === "pending")}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                    onView={handleOpenViewDialog}
                    onEdit={handleOpenEditDialog}
                    onDelete={handleOpenDeleteDialog}
                  />
                </TabsContent>

                <TabsContent value="approved" className="animate-fade-in">
                  <PaymentTable
                    payments={payments.filter((p) => p.status === "approved")}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                    onView={handleOpenViewDialog}
                    onEdit={handleOpenEditDialog}
                    onDelete={handleOpenDeleteDialog}
                  />
                </TabsContent>

                <TabsContent value="paid" className="animate-fade-in">
                  <PaymentTable
                    payments={payments.filter((p) => p.status === "paid")}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                    onView={handleOpenViewDialog}
                    onEdit={handleOpenEditDialog}
                    onDelete={handleOpenDeleteDialog}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs value={requestsTab} onValueChange={setRequestsTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="pending">
                    En attente
                    {paymentRequests.filter(r => r.status === "pending_officer" || r.status === "pending_accountant").length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {paymentRequests.filter(r => r.status === "pending_officer" || r.status === "pending_accountant").length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved">Approuvées</TabsTrigger>
                  <TabsTrigger value="rejected">Rejetées</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtres
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Opération</TableHead>
                      <TableHead>Bénéficiaire</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Fréquence</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de demande</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Aucune demande de paiement trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.engagementRef}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {request.operationName}
                          </TableCell>
                          <TableCell>{request.beneficiary}</TableCell>
                          <TableCell>{formatCurrency(request.amount)}</TableCell>
                          <TableCell>
                            {request.frequency === "monthly" ? "Mensuel" : 
                             request.frequency === "quarterly" ? "Trimestriel" : "Annuel"}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{formatDate(request.requestDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {(request.status === "pending_officer" || request.status === "pending_accountant") && 
                               ((currentUserRole === "officer" && request.status === "pending_officer") || 
                                (currentUserRole === "accountant" && request.status === "pending_accountant") ||
                                (currentUserRole === "admin")) && (
                                <Button 
                                  variant="outline"
                                  size="sm" 
                                  onClick={() => handleOpenApprovalDialog(request)}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Approuver
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleOpenApprovalDialog(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>

      <PaymentRequestDialog
        type="add"
        request={currentRequest}
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        onSave={handleAddRequest}
        engagements={mockEngagements}
        formatCurrency={formatCurrency}
      />

      <PaymentApprovalDialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        request={currentRequest}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        currentUserRole={currentUserRole}
      />

      <PaymentDialog
        type="add"
        payment={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={() => {}}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        engagements={mockEngagements}
        getStatusBadge={getStatusBadge}
      />

      <PaymentDialog
        type="edit"
        payment={currentPayment}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={() => {}}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        engagements={mockEngagements}
        getStatusBadge={getStatusBadge}
      />

      <PaymentDialog
        type="view"
        payment={currentPayment}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onSave={() => {}}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        engagements={mockEngagements}
        getStatusBadge={getStatusBadge}
      />

      <PaymentDialog
        type="delete"
        payment={currentPayment}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSave={() => {}}
        onDelete={() => {}}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        engagements={mockEngagements}
        getStatusBadge={getStatusBadge}
      />
    </Dashboard>
  );
}
