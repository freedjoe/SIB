import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditPaymentWithRelations } from "@/types/credit_payments";
import { Operation, FiscalYear } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";

interface CreditPaymentFormDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  newCreditPayment: Partial<CreditPaymentWithRelations>;
  setNewCreditPayment: React.Dispatch<React.SetStateAction<Partial<CreditPaymentWithRelations>>>;
  handleAddCreditPayment: () => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  currentCreditPayment: CreditPaymentWithRelations | null;
  handleEditCreditPayment: () => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleDeleteCreditPayment: () => void;
  operationsData: Operation[];
  fiscalYearsData: FiscalYear[];
}

export function CreditPaymentFormDialogs({
  isAddDialogOpen,
  setIsAddDialogOpen,
  newCreditPayment,
  setNewCreditPayment,
  handleAddCreditPayment,
  isEditDialogOpen,
  setIsEditDialogOpen,
  currentCreditPayment,
  handleEditCreditPayment,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  handleDeleteCreditPayment,
  operationsData,
  fiscalYearsData,
}: CreditPaymentFormDialogsProps) {
  const getOperationName = (operationId: string): string => {
    const operation = operationsData.find((op) => op.id === operationId);
    return operation?.title || "Opération inconnue";
  };

  const getFiscalYearName = (fiscalYearId: string): string => {
    const fiscalYear = fiscalYearsData.find((fy) => fy.id === fiscalYearId);
    return fiscalYear?.year?.toString() || "Année inconnue";
  };

  return (
    <>
      {/* Add Credit Payment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau paiement de crédit</DialogTitle>
            <DialogDescription>Complétez les informations pour créer un nouveau paiement de crédit.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                value={newCreditPayment.code || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operation" className="text-right">
                Opération
              </Label>
              <Select
                value={newCreditPayment.operation_id}
                onValueChange={(value) => setNewCreditPayment({ ...newCreditPayment, operation_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une opération" />
                </SelectTrigger>
                <SelectContent>
                  {operationsData.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      {operation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fiscal_year" className="text-right">
                Année Fiscale
              </Label>
              <Select
                value={newCreditPayment.fiscal_year_id}
                onValueChange={(value) => setNewCreditPayment({ ...newCreditPayment, fiscal_year_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une année fiscale" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYearsData.map((fiscalYear) => (
                    <SelectItem key={fiscalYear.id} value={fiscalYear.id}>
                      {fiscalYear.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={newCreditPayment.amount || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={newCreditPayment.description || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCreditPayment}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Credit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le paiement de crédit</DialogTitle>
            <DialogDescription>Modifiez les détails du paiement de crédit.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Code
              </Label>
              <Input
                id="edit-code"
                value={newCreditPayment.code || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-operation" className="text-right">
                Opération
              </Label>
              <Select
                value={newCreditPayment.operation_id}
                onValueChange={(value) => setNewCreditPayment({ ...newCreditPayment, operation_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une opération" />
                </SelectTrigger>
                <SelectContent>
                  {operationsData.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      {operation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fiscal_year" className="text-right">
                Année Fiscale
              </Label>
              <Select
                value={newCreditPayment.fiscal_year_id}
                onValueChange={(value) => setNewCreditPayment({ ...newCreditPayment, fiscal_year_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une année fiscale" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYearsData.map((fiscalYear) => (
                    <SelectItem key={fiscalYear.id} value={fiscalYear.id}>
                      {fiscalYear.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                Montant
              </Label>
              <Input
                id="edit-amount"
                type="number"
                className="col-span-3"
                value={newCreditPayment.amount || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Statut
              </Label>
              <Select value={newCreditPayment.status} onValueChange={(value: any) => setNewCreditPayment({ ...newCreditPayment, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="submitted">Soumis</SelectItem>
                  <SelectItem value="reviewed">Révisé</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={newCreditPayment.description || ""}
                onChange={(e) => setNewCreditPayment({ ...newCreditPayment, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditCreditPayment}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Credit Payment Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le paiement de crédit</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer ce paiement de crédit? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {currentCreditPayment && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Code:</span>
                <span>{currentCreditPayment.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Opération:</span>
                <span>{getOperationName(currentCreditPayment.operation_id)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Année fiscale:</span>
                <span>{getFiscalYearName(currentCreditPayment.fiscal_year_id)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Montant:</span>
                <span>{formatCurrency(currentCreditPayment.amount)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteCreditPayment}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
