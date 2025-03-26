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
import { CreditCard, FileCheck, Calendar, CheckCircle, Clock, X, ArrowRightLeft, Eye, Plus, FileEdit, Trash2 } from "lucide-react";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { toast } from "@/components/ui/use-toast";

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
  { id: "e1", ref: "ENG/2023/001", operation: "Construction École Primaire de Koné", beneficiary: "Entreprise ABC Construction" },
  { id: "e2", ref: "ENG/2023/008", operation: "Équipement Hôpital Central", beneficiary: "MedEquip International" },
  { id: "e3", ref: "ENG/2023/012", operation: "Rénovation Route Nationale 1", beneficiary: "Routes & Ponts SA" },
  { id: "e4", ref: "ENG/2023/025", operation: "Formation des Enseignants", beneficiary: "Institut de Formation Pédagogique" },
  { id: "e5", ref: "ENG/2023/030", operation: "Campagne de Vaccination", beneficiary: "Santé Pour Tous" },
];

const getStatusBadge = (status: Payment["status"]) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400 gap-1">
          <Clock className="h-3 w-3" />
          <span>En attente</span>
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

interface PaymentTableProps {
  payments: Payment[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string | null) => string;
  getStatusBadge: (status: Payment["status"]) => React.ReactNode;
  onView: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

function PaymentTable({ payments, formatCurrency, formatDate, getStatusBadge, onView, onEdit, onDelete }: PaymentTableProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Opération</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Date demande</TableHead>
              <TableHead>Date paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Aucun paiement trouvé
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.engagementRef}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{payment.operationName}</TableCell>
                  <TableCell>{payment.beneficiary}</TableCell>
                  <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{formatDate(payment.requestDate)}</TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(payment)}>
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(payment)}>
                        <Trash2 className="h-4 w-4" />
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
  );
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);

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

  return (
    <Dashboard>
      <DashboardHeader title="Gestion des Paiements" description="Suivez et gérez les crédits de paiement (CP) et les décaissements">
        <Button className="shadow-subtle" onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau paiement
        </Button>
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
      </DashboardSection>

      <DashboardSection>
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
      </DashboardSection>

      <PaymentDialog
        type="add"
        payment={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddPayment}
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
        onSave={handleEditPayment}
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
        onDelete={handleDeletePayment}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        engagements={mockEngagements}
        getStatusBadge={getStatusBadge}
      />
    </Dashboard>
  );
}
