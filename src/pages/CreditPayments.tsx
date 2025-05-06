import React, { useState, useEffect } from "react";
import { Dashboard, DashboardHeader } from "@/components/layout/Dashboard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { CreditPaymentTable } from "@/components/tables/CreditPaymentTable";
import { CreditPaymentViewDialog } from "@/components/credit-payments/CreditPaymentViewDialog";
import { CreditPaymentFormDialog } from "@/components/credit-payments/CreditPaymentFormDialog";
import { CreditPaymentApproveDialog } from "@/components/credit-payments/CreditPaymentApproveDialog";

// Define the structure of credit payment
export interface CreditPayment {
  id: string;
  code: string;
  operation_id: string;
  operation?: {
    id: string;
    title: string;
    code: string;
  };
  fiscal_year_id: string;
  fiscal_year?: {
    id: string;
    year: number;
  };
  amount: number;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Mock data for credit payments
const mockCreditPayments: CreditPayment[] = [
  {
    id: "1",
    code: "CP-2025-001",
    operation_id: "op1",
    operation: {
      id: "op1",
      title: "Construction de l'autoroute Est-Ouest",
      code: "OP-2025-001",
    },
    fiscal_year_id: "fy1",
    fiscal_year: {
      id: "fy1",
      year: 2025,
    },
    amount: 1500000000,
    status: "submitted",
    description: "Paiement de crédit pour la phase 1 de construction",
    created_at: "2025-01-15T09:30:00",
    updated_at: "2025-01-15T09:30:00",
  },
  {
    id: "2",
    code: "CP-2025-002",
    operation_id: "op2",
    operation: {
      id: "op2",
      title: "Modernisation du réseau d'eau potable",
      code: "OP-2025-002",
    },
    fiscal_year_id: "fy1",
    fiscal_year: {
      id: "fy1",
      year: 2025,
    },
    amount: 750000000,
    status: "approved",
    description: "Financement pour la rénovation des installations",
    created_at: "2025-01-20T11:15:00",
    updated_at: "2025-01-22T14:45:00",
  },
  {
    id: "3",
    code: "CP-2025-003",
    operation_id: "op3",
    operation: {
      id: "op3",
      title: "Construction de logements sociaux",
      code: "OP-2025-003",
    },
    fiscal_year_id: "fy1",
    fiscal_year: {
      id: "fy1",
      year: 2025,
    },
    amount: 1200000000,
    status: "submitted",
    description: "Financement de la première phase de construction",
    created_at: "2025-01-25T13:20:00",
    updated_at: "2025-01-25T13:20:00",
  },
  {
    id: "4",
    code: "CP-2025-004",
    operation_id: "op4",
    operation: {
      id: "op4",
      title: "Réhabilitation des équipements scolaires",
      code: "OP-2025-004",
    },
    fiscal_year_id: "fy1",
    fiscal_year: {
      id: "fy1",
      year: 2025,
    },
    amount: 450000000,
    status: "approved",
    description: "Modernisation des écoles primaires",
    created_at: "2025-02-01T10:00:00",
    updated_at: "2025-02-05T09:15:00",
  },
  {
    id: "5",
    code: "CP-2025-005",
    operation_id: "op5",
    operation: {
      id: "op5",
      title: "Extension du réseau électrique rural",
      code: "OP-2025-005",
    },
    fiscal_year_id: "fy1",
    fiscal_year: {
      id: "fy1",
      year: 2025,
    },
    amount: 850000000,
    status: "rejected",
    description: "Financement pour l'électrification des zones rurales",
    created_at: "2025-02-03T15:30:00",
    updated_at: "2025-02-07T11:25:00",
  },
];

// Mock operations data for dialogs
const mockOperations = [
  { id: "op1", title: "Construction de l'autoroute Est-Ouest", code: "OP-2025-001" },
  { id: "op2", title: "Modernisation du réseau d'eau potable", code: "OP-2025-002" },
  { id: "op3", title: "Construction de logements sociaux", code: "OP-2025-003" },
  { id: "op4", title: "Réhabilitation des équipements scolaires", code: "OP-2025-004" },
  { id: "op5", title: "Extension du réseau électrique rural", code: "OP-2025-005" },
];

// Mock fiscal years data for dialogs
const mockFiscalYears = [
  { id: "fy1", year: 2025 },
  { id: "fy2", year: 2026 },
];

export default function CreditPayments() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [creditPayments, setCreditPayments] = useState<CreditPayment[]>(mockCreditPayments);

  // Filter payments based on search term and active tab
  const filteredPayments = creditPayments.filter((payment) => {
    const matchesSearch =
      payment.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.operation?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === "pending") {
      return matchesSearch && payment.status === "submitted";
    } else if (activeTab === "approved") {
      return matchesSearch && payment.status === "approved";
    } else if (activeTab === "history") {
      return matchesSearch;
    }
    return matchesSearch;
  });

  // State for dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<CreditPayment | null>(null);
  const [newCreditPayment, setNewCreditPayment] = useState<Partial<CreditPayment>>({
    code: `CP-2025-${String(creditPayments.length + 1).padStart(3, "0")}`,
    operation_id: "",
    fiscal_year_id: "fy1",
    amount: 0,
    status: "draft",
    description: "",
  });

  // Format date helper function
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle view credit payment
  const handleViewCreditPayment = (payment: CreditPayment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  // Handle edit credit payment
  const handleEditCreditPayment = (payment: CreditPayment) => {
    setSelectedPayment(payment);
    setNewCreditPayment({
      ...payment,
    });
    setEditDialogOpen(true);
  };

  // Handle add new credit payment
  const handleAddNewCreditPayment = () => {
    setNewCreditPayment({
      code: `CP-2025-${String(creditPayments.length + 1).padStart(3, "0")}`,
      operation_id: "",
      fiscal_year_id: "fy1",
      amount: 0,
      status: "draft",
      description: "",
    });
    setAddDialogOpen(true);
  };

  // Handle approve credit payment
  const handleApprovePayment = (payment: CreditPayment) => {
    setSelectedPayment(payment);
    setApproveDialogOpen(true);
  };

  // Handle save edit credit payment
  const handleSaveEditCreditPayment = () => {
    if (selectedPayment && newCreditPayment) {
      setCreditPayments(
        creditPayments.map((cp) =>
          cp.id === selectedPayment.id ? ({ ...cp, ...newCreditPayment, updated_at: new Date().toISOString() } as CreditPayment) : cp
        )
      );
      setEditDialogOpen(false);
      toast({
        title: t("creditPayments.updateSuccess") || "Paiement mis à jour",
        description: t("creditPayments.updateSuccessDescription") || "Le paiement de crédit a été mis à jour avec succès.",
      });
    }
  };

  // Handle save new credit payment
  const handleSaveNewCreditPayment = () => {
    if (newCreditPayment.operation_id && newCreditPayment.amount) {
      const now = new Date().toISOString();
      const newPayment: CreditPayment = {
        id: `${creditPayments.length + 1}`,
        code: newCreditPayment.code || `CP-2025-${String(creditPayments.length + 1).padStart(3, "0")}`,
        operation_id: newCreditPayment.operation_id,
        operation: mockOperations.find((op) => op.id === newCreditPayment.operation_id),
        fiscal_year_id: newCreditPayment.fiscal_year_id || "fy1",
        fiscal_year: mockFiscalYears.find((fy) => fy.id === (newCreditPayment.fiscal_year_id || "fy1")),
        amount: newCreditPayment.amount,
        status: "submitted",
        description: newCreditPayment.description || null,
        created_at: now,
        updated_at: now,
      };

      setCreditPayments([...creditPayments, newPayment]);
      setAddDialogOpen(false);
      toast({
        title: t("creditPayments.createSuccess") || "Paiement créé",
        description: t("creditPayments.createSuccessDescription") || "Le nouveau paiement de crédit a été créé avec succès.",
      });
    } else {
      toast({
        variant: "destructive",
        title: t("creditPayments.error") || "Erreur",
        description: t("creditPayments.fillRequiredFields") || "Veuillez remplir tous les champs obligatoires.",
      });
    }
  };

  // Handle confirm approval
  const handleConfirmApproval = () => {
    if (selectedPayment) {
      setCreditPayments(
        creditPayments.map((cp) => (cp.id === selectedPayment.id ? { ...cp, status: "approved", updated_at: new Date().toISOString() } : cp))
      );
      setApproveDialogOpen(false);
      toast({
        title: t("creditPayments.approveSuccess") || "Paiement approuvé",
        description: t("creditPayments.approveSuccessDescription") || "Le paiement de crédit a été approuvé avec succès.",
      });
    }
  };

  // Handle reject credit payment
  const handleRejectPayment = (payment: CreditPayment) => {
    setCreditPayments(creditPayments.map((cp) => (cp.id === payment.id ? { ...cp, status: "rejected", updated_at: new Date().toISOString() } : cp)));
    toast({
      title: t("creditPayments.rejectSuccess") || "Paiement rejeté",
      description: t("creditPayments.rejectSuccessDescription") || "Le paiement de crédit a été rejeté.",
    });
  };

  // Handle delete credit payment
  const handleDeletePayment = (payment: CreditPayment) => {
    if (window.confirm(t("creditPayments.confirmDelete") || "Êtes-vous sûr de vouloir supprimer ce paiement de crédit ?")) {
      setCreditPayments(creditPayments.filter((cp) => cp.id !== payment.id));
      toast({
        title: t("creditPayments.deleteSuccess") || "Paiement supprimé",
        description: t("creditPayments.deleteSuccessDescription") || "Le paiement de crédit a été supprimé avec succès.",
      });
    }
  };

  return (
    <Dashboard className="p-6">
      <DashboardHeader
        title={t("app.navigation.creditPayments") || "Paiements de Crédit"}
        description={t("creditPayments.description") || "Gestion des paiements de crédit"}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">{t("creditPayments.pending") || "En attente"}</TabsTrigger>
          <TabsTrigger value="approved">{t("creditPayments.approved") || "Approuvés"}</TabsTrigger>
          <TabsTrigger value="history">{t("creditPayments.history") || "Historique"}</TabsTrigger>
        </TabsList>

        <TabsContent
          value="pending"
          className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("creditPayments.searchPlaceholder") || "Rechercher des paiements..."}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNewCreditPayment}>
                  <Plus className="mr-2 h-4 w-4" /> {t("creditPayments.addNew") || "Ajouter un paiement"}
                </Button>
              </div>

              {filteredPayments.length > 0 ? (
                <CreditPaymentTable
                  creditPayments={filteredPayments}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  onView={handleViewCreditPayment}
                  onEdit={handleEditCreditPayment}
                  onDelete={handleDeletePayment}
                  onApprove={handleApprovePayment}
                  onReject={handleRejectPayment}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("creditPayments.noPayments") || "Aucun paiement de crédit trouvé."}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="approved"
          className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("creditPayments.searchPlaceholder") || "Rechercher des paiements..."}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNewCreditPayment}>
                  <Plus className="mr-2 h-4 w-4" /> {t("creditPayments.addNew") || "Ajouter un paiement"}
                </Button>
              </div>

              {filteredPayments.length > 0 ? (
                <CreditPaymentTable
                  creditPayments={filteredPayments}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  onView={handleViewCreditPayment}
                  onEdit={handleEditCreditPayment}
                  onDelete={handleDeletePayment}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("creditPayments.noApprovedPayments") || "Aucun paiement de crédit approuvé trouvé."}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="history"
          className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("creditPayments.searchPlaceholder") || "Rechercher des paiements..."}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNewCreditPayment}>
                  <Plus className="mr-2 h-4 w-4" /> {t("creditPayments.addNew") || "Ajouter un paiement"}
                </Button>
              </div>

              {filteredPayments.length > 0 ? (
                <CreditPaymentTable
                  creditPayments={filteredPayments}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  onView={handleViewCreditPayment}
                  onEdit={handleEditCreditPayment}
                  onDelete={handleDeletePayment}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("creditPayments.noHistoryPayments") || "Aucun historique de paiement de crédit trouvé."}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      {selectedPayment && (
        <CreditPaymentViewDialog
          isOpen={viewDialogOpen}
          setIsOpen={setViewDialogOpen}
          creditPayment={selectedPayment}
          operationsData={mockOperations}
          fiscalYearsData={mockFiscalYears}
          onEdit={handleEditCreditPayment}
        />
      )}

      {/* Add/Edit Dialogs */}
      <CreditPaymentFormDialog
        isOpen={addDialogOpen}
        setIsOpen={setAddDialogOpen}
        title={t("creditPayments.addNew") || "Ajouter un paiement de crédit"}
        description={t("creditPayments.addNewDescription") || "Saisissez les détails pour créer un nouveau paiement de crédit."}
        creditPayment={newCreditPayment}
        setCreditPayment={setNewCreditPayment}
        onSave={handleSaveNewCreditPayment}
        operationsData={mockOperations}
        fiscalYearsData={mockFiscalYears}
      />

      <CreditPaymentFormDialog
        isOpen={editDialogOpen}
        setIsOpen={setEditDialogOpen}
        title={t("creditPayments.edit") || "Modifier le paiement de crédit"}
        description={t("creditPayments.editDescription") || "Modifiez les détails du paiement de crédit."}
        creditPayment={newCreditPayment}
        setCreditPayment={setNewCreditPayment}
        onSave={handleSaveEditCreditPayment}
        operationsData={mockOperations}
        fiscalYearsData={mockFiscalYears}
      />

      {/* Approve Dialog */}
      {selectedPayment && (
        <CreditPaymentApproveDialog
          isOpen={approveDialogOpen}
          setIsOpen={setApproveDialogOpen}
          creditPayment={selectedPayment}
          onApprove={handleConfirmApproval}
          onReject={() => handleRejectPayment(selectedPayment)}
        />
      )}
    </Dashboard>
  );
}
