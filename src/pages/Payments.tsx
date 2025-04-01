
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';

// Types
interface Payment {
  id: string;
  engagementRef: string;
  beneficiary: string;
  amount: number;
  date: string;
  status: "pending" | "approved" | "rejected";
  paymentMethod: string;
  verifiedBy?: string;
  approvedBy?: string;
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
  requestedBy: string;
  requestDate: string;
  beneficiary: string;
  status: "pending_officer" | "pending_accountant" | "approved" | "rejected";
}

const PaymentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // State for payments and requests
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "PAY-001",
      engagementRef: "ENG-2023-001",
      beneficiary: "Alpha Construction Ltd",
      amount: 250000,
      date: "2023-03-15",
      status: "approved",
      paymentMethod: "Bank Transfer",
      verifiedBy: "John Accountant",
      approvedBy: "Finance Director"
    },
    {
      id: "PAY-002",
      engagementRef: "ENG-2023-005",
      beneficiary: "Beta Technologies Inc",
      amount: 175000,
      date: "2023-03-20",
      status: "pending",
      paymentMethod: "Check"
    },
    {
      id: "PAY-003",
      engagementRef: "ENG-2023-008",
      beneficiary: "Delta Education Services",
      amount: 120000,
      date: "2023-03-25",
      status: "rejected",
      paymentMethod: "Bank Transfer",
      verifiedBy: "Jane Accountant"
    },
    {
      id: "PAY-004",
      engagementRef: "ENG-2023-012",
      beneficiary: "Gamma Health Clinics",
      amount: 320000,
      date: "2023-04-02",
      status: "approved",
      paymentMethod: "Bank Transfer",
      verifiedBy: "John Accountant",
      approvedBy: "Finance Director"
    },
    {
      id: "PAY-005",
      engagementRef: "ENG-2023-015",
      beneficiary: "Omega Consultants",
      amount: 95000,
      date: "2023-04-10",
      status: "pending",
      paymentMethod: "Check"
    }
  ]);
  
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([
    {
      id: "REQ-001",
      engagementId: "ENG-2023-020",
      engagementRef: "Road Infrastructure - Phase 1",
      operationName: "Construction of Highway Section A",
      amount: 1500000,
      frequency: "quarterly",
      startDate: "2023-04-01",
      description: "Initial payment for highway construction project",
      requestedBy: "Project Manager",
      requestDate: "2023-03-25",
      beneficiary: "Alpha Construction Ltd",
      status: "pending_officer"
    },
    {
      id: "REQ-002",
      engagementId: "ENG-2023-021",
      engagementRef: "Education Technology - Annual",
      operationName: "School Computer Lab Equipment",
      amount: 800000,
      frequency: "annual",
      startDate: "2023-05-01",
      description: "Payment for computer equipment for 20 schools",
      requestedBy: "Education Director",
      requestDate: "2023-03-28",
      beneficiary: "Beta Technologies Inc",
      status: "pending_accountant"
    },
    {
      id: "REQ-003",
      engagementId: "ENG-2023-022",
      engagementRef: "Healthcare Services - Monthly",
      operationName: "Rural Clinic Support Program",
      amount: 250000,
      frequency: "monthly",
      startDate: "2023-04-15",
      description: "Monthly funding for rural healthcare clinics",
      requestedBy: "Healthcare Coordinator",
      requestDate: "2023-04-01",
      beneficiary: "Gamma Health Foundation",
      status: "approved"
    },
    {
      id: "REQ-004",
      engagementId: "ENG-2023-023",
      engagementRef: "Agricultural Development - Annual",
      operationName: "Farmer Support Program",
      amount: 1200000,
      frequency: "annual",
      startDate: "2023-06-01",
      description: "Annual subsidies for farming equipment",
      requestedBy: "Agriculture Minister",
      requestDate: "2023-04-05",
      beneficiary: "Farmers Association",
      status: "rejected"
    }
  ]);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("payments");
  
  // State for dialogs
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentRequestDialogOpen, setIsPaymentRequestDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  
  // Formatted currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Filter by approval status
  const pendingOfficerRequests = paymentRequests.filter(req => req.status === "pending_officer");
  const pendingAccountantRequests = paymentRequests.filter(req => req.status === "pending_accountant");
  
  // Calculate total payments by status
  const totalApproved = payments
    .filter(payment => payment.status === "approved")
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPending = payments
    .filter(payment => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Check user permissions
  const userCanApprove = user?.role === "admin" || user?.role === "officer";
  const userIsAccountant = user?.role === "accountant";
  
  // Handle payment request approval
  const handleApproveRequest = (requestId: string) => {
    // Simulate workflow
    const updatedRequests = paymentRequests.map(req => {
      if (req.id === requestId) {
        // If officer approves, move to accountant approval
        if (user?.role === "officer" && req.status === "pending_officer") {
          return { ...req, status: "pending_accountant" };
        }
        // If accountant or admin approves a pending_accountant request, mark as approved
        else if ((user?.role === "accountant" || user?.role === "admin") && req.status === "pending_accountant") {
          return { ...req, status: "approved" };
        }
        return req;
      }
      return req;
    });
    
    setPaymentRequests(updatedRequests);
    setIsApprovalDialogOpen(false);
    setSelectedRequest(null);
  };
  
  // Handle payment request rejection
  const handleRejectRequest = (requestId: string) => {
    const updatedRequests = paymentRequests.map(req => 
      req.id === requestId ? { ...req, status: "rejected" } : req
    );
    
    setPaymentRequests(updatedRequests);
    setIsApprovalDialogOpen(false);
    setSelectedRequest(null);
  };
  
  // Add new payment request
  const handleAddPaymentRequest = (request: PaymentRequest) => {
    setPaymentRequests([...paymentRequests, request]);
    setIsPaymentRequestDialogOpen(false);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
        <div className="flex space-x-4">
          <Button onClick={() => setIsPaymentRequestDialogOpen(true)}>Nouvelle Demande de Paiement</Button>
          <Button onClick={() => setIsPaymentDialogOpen(true)}>Enregistrer un Paiement</Button>
        </div>
      </div>
      
      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des Paiements Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalApproved)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === "approved").length} paiements
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paiements En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === "pending").length} paiements
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Demandes à Approuver</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userIsAccountant ? pendingAccountantRequests.length : 
              userCanApprove ? pendingOfficerRequests.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {userIsAccountant ? "En attente de validation comptable" : 
              userCanApprove ? "En attente de validation officier" : "Aucune demande à valider"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="payments" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="payments">Liste des Paiements</TabsTrigger>
          <TabsTrigger value="requests">Demandes de Paiement</TabsTrigger>
          <TabsTrigger value="approvals">Approbations ({
            userIsAccountant ? pendingAccountantRequests.length : 
            userCanApprove ? pendingOfficerRequests.length : 0
          })</TabsTrigger>
        </TabsList>
        
        {/* Payments Tab */}
        <TabsContent value="payments">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left">ID</th>
                  <th className="h-12 px-4 text-left">Référence Engagement</th>
                  <th className="h-12 px-4 text-left">Bénéficiaire</th>
                  <th className="h-12 px-4 text-left">Montant</th>
                  <th className="h-12 px-4 text-left">Date</th>
                  <th className="h-12 px-4 text-left">Méthode</th>
                  <th className="h-12 px-4 text-left">Statut</th>
                  <th className="h-12 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="p-4 align-middle font-medium">{payment.id}</td>
                    <td className="p-4 align-middle">{payment.engagementRef}</td>
                    <td className="p-4 align-middle">{payment.beneficiary}</td>
                    <td className="p-4 align-middle">{formatCurrency(payment.amount)}</td>
                    <td className="p-4 align-middle">{payment.date}</td>
                    <td className="p-4 align-middle">{payment.paymentMethod}</td>
                    <td className="p-4 align-middle">
                      <Badge 
                        variant={
                          payment.status === "approved" ? "success" :
                          payment.status === "rejected" ? "destructive" : "outline"
                        }
                      >
                        {payment.status === "approved" ? "Approuvé" :
                         payment.status === "rejected" ? "Rejeté" : "En Attente"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm">Voir</Button>
                        <Button variant="outline" size="sm">PDF</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        {/* Payment Requests Tab */}
        <TabsContent value="requests">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left">ID</th>
                  <th className="h-12 px-4 text-left">Opération</th>
                  <th className="h-12 px-4 text-left">Bénéficiaire</th>
                  <th className="h-12 px-4 text-left">Montant</th>
                  <th className="h-12 px-4 text-left">Fréquence</th>
                  <th className="h-12 px-4 text-left">Date Début</th>
                  <th className="h-12 px-4 text-left">Statut</th>
                  <th className="h-12 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentRequests.map((request) => (
                  <tr key={request.id} className="border-b">
                    <td className="p-4 align-middle font-medium">{request.id}</td>
                    <td className="p-4 align-middle">{request.operationName}</td>
                    <td className="p-4 align-middle">{request.beneficiary}</td>
                    <td className="p-4 align-middle">{formatCurrency(request.amount)}</td>
                    <td className="p-4 align-middle">
                      {request.frequency === "monthly" ? "Mensuelle" :
                       request.frequency === "quarterly" ? "Trimestrielle" : "Annuelle"}
                    </td>
                    <td className="p-4 align-middle">{request.startDate}</td>
                    <td className="p-4 align-middle">
                      <Badge 
                        variant={
                          request.status === "approved" ? "success" :
                          request.status === "rejected" ? "destructive" : 
                          "outline"
                        }
                      >
                        {request.status === "approved" ? "Approuvé" :
                         request.status === "rejected" ? "Rejeté" :
                         request.status === "pending_officer" ? "En attente (Officier)" :
                         "En attente (Comptable)"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm">Voir</Button>
                        <Button variant="outline" size="sm">Modifier</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left">ID</th>
                  <th className="h-12 px-4 text-left">Opération</th>
                  <th className="h-12 px-4 text-left">Bénéficiaire</th>
                  <th className="h-12 px-4 text-left">Montant</th>
                  <th className="h-12 px-4 text-left">Demandé par</th>
                  <th className="h-12 px-4 text-left">Date</th>
                  <th className="h-12 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Show appropriate requests based on user role */}
                {(userIsAccountant ? pendingAccountantRequests : 
                  userCanApprove ? pendingOfficerRequests : []).map((request) => (
                  <tr key={request.id} className="border-b">
                    <td className="p-4 align-middle font-medium">{request.id}</td>
                    <td className="p-4 align-middle">{request.operationName}</td>
                    <td className="p-4 align-middle">{request.beneficiary}</td>
                    <td className="p-4 align-middle">{formatCurrency(request.amount)}</td>
                    <td className="p-4 align-middle">{request.requestedBy}</td>
                    <td className="p-4 align-middle">{request.requestDate}</td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsApprovalDialogOpen(true);
                          }}
                        >
                          Voir et Approuver
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Show message if no requests to approve */}
                {((userIsAccountant && pendingAccountantRequests.length === 0) || 
                  (userCanApprove && pendingOfficerRequests.length === 0) ||
                  (!userIsAccountant && !userCanApprove)) && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Aucune demande en attente d'approbation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Placeholder for Payment Dialog */}
      {isPaymentDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Enregistrer un Paiement</h2>
            <p className="mb-4">Formulaire d'enregistrement d'un paiement.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsPaymentDialogOpen(false)}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for Payment Request Dialog */}
      {isPaymentRequestDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nouvelle Demande de Paiement</h2>
            <p className="mb-4">Formulaire pour une nouvelle demande de paiement.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsPaymentRequestDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                const newRequest: PaymentRequest = {
                  id: `REQ-${String(paymentRequests.length + 1).padStart(3, '0')}`,
                  engagementId: `ENG-2023-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
                  engagementRef: "New Engagement Reference",
                  operationName: "New Operation",
                  amount: 500000,
                  frequency: "monthly",
                  startDate: new Date().toISOString().split('T')[0],
                  description: "Description of the new payment request",
                  requestedBy: user?.name || "Current User",
                  requestDate: new Date().toISOString().split('T')[0],
                  beneficiary: "New Beneficiary",
                  status: "pending_officer"
                };
                handleAddPaymentRequest(newRequest);
              }}>
                Soumettre
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      {isApprovalDialogOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Approbation de la Demande</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium">ID de la Demande</p>
                <p>{selectedRequest.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Opération</p>
                <p>{selectedRequest.operationName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Montant</p>
                <p>{formatCurrency(selectedRequest.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Bénéficiaire</p>
                <p>{selectedRequest.beneficiary}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fréquence</p>
                <p>
                  {selectedRequest.frequency === "monthly" ? "Mensuelle" :
                   selectedRequest.frequency === "quarterly" ? "Trimestrielle" : "Annuelle"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Description</p>
                <p>{selectedRequest.description}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="destructive" 
                onClick={() => handleRejectRequest(selectedRequest.id)}
              >
                Rejeter
              </Button>
              <Button 
                variant="default"
                onClick={() => handleApproveRequest(selectedRequest.id)}
              >
                Approuver
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
