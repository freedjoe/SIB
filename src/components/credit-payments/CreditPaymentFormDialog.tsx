import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditPayment } from "@/pages/CreditPayments";
import { CalendarIcon, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

interface CreditPaymentFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description: string;
  creditPayment: Partial<CreditPayment>;
  setCreditPayment: (creditPayment: Partial<CreditPayment>) => void;
  onSave: () => void;
  operationsData: Array<{ id: string; title: string; code: string }>;
  fiscalYearsData: Array<{ id: string; year: number }>;
}

export function CreditPaymentFormDialog({
  isOpen,
  setIsOpen,
  title,
  description,
  creditPayment,
  setCreditPayment,
  onSave,
  operationsData,
  fiscalYearsData,
}: CreditPaymentFormDialogProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-5">
                {/* Basic Information Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                    {t("creditPayments.form.basicInfo") || "Informations de base"}
                  </h3>

                  {/* Code */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="code"
                      className="text-right">
                      {t("creditPayments.form.code") || "Code"}
                    </Label>
                    <Input
                      id="code"
                      className="col-span-3"
                      value={creditPayment.code || ""}
                      onChange={(e) => setCreditPayment({ ...creditPayment, code: e.target.value })}
                      placeholder="CP-YYYY-XXX"
                    />
                  </div>

                  {/* Operation */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="operation"
                      className="text-right">
                      {t("creditPayments.form.operation") || "Opération"} *
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={creditPayment.operation_id || ""}
                        onValueChange={(value) => setCreditPayment({ ...creditPayment, operation_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("creditPayments.form.selectOperation") || "Sélectionnez une opération"} />
                        </SelectTrigger>
                        <SelectContent>
                          {operationsData.map((operation) => (
                            <SelectItem
                              key={operation.id}
                              value={operation.id}>
                              <div className="flex flex-col">
                                <span>{operation.title}</span>
                                <span className="text-xs text-muted-foreground">{operation.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fiscal Year */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="fiscalYear"
                      className="text-right">
                      {t("creditPayments.form.fiscalYear") || "Année Fiscale"} *
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={creditPayment.fiscal_year_id || ""}
                        onValueChange={(value) => setCreditPayment({ ...creditPayment, fiscal_year_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("creditPayments.form.selectFiscalYear") || "Sélectionnez une année fiscale"} />
                        </SelectTrigger>
                        <SelectContent>
                          {fiscalYearsData.map((fiscalYear) => (
                            <SelectItem
                              key={fiscalYear.id}
                              value={fiscalYear.id}>
                              {fiscalYear.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                    {t("creditPayments.form.financialInfo") || "Informations financières"}
                  </h3>

                  {/* Amount */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="amount"
                      className="text-right">
                      {t("creditPayments.form.amount") || "Montant"} *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      className="col-span-3"
                      value={creditPayment.amount || ""}
                      onChange={(e) => setCreditPayment({ ...creditPayment, amount: parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                    {t("creditPayments.form.additionalInfo") || "Informations additionnelles"}
                  </h3>

                  {/* Description */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label
                      htmlFor="description"
                      className="text-right pt-2">
                      {t("creditPayments.form.description") || "Description"}
                    </Label>
                    <Textarea
                      id="description"
                      className="col-span-3 min-h-[100px]"
                      value={creditPayment.description || ""}
                      onChange={(e) => setCreditPayment({ ...creditPayment, description: e.target.value })}
                      placeholder={t("creditPayments.form.descriptionPlaceholder") || "Entrez une description..."}
                    />
                  </div>
                </div>

                {/* Required fields note */}
                <div className="pt-2 text-xs text-muted-foreground">* {t("common.requiredFields") || "Champs obligatoires"}</div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}>
              {t("common.cancel") || "Annuler"}
            </Button>
            <Button type="submit">{t("common.save") || "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
