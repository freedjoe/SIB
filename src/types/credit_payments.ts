import { CreditPayment, Operation, FiscalYear } from "./database.types";

export interface CreditPaymentWithRelations extends CreditPayment {
  operation?: Operation;
  fiscal_year?: FiscalYear;
}
