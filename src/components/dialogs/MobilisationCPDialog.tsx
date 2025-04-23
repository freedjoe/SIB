import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PrevisionCP } from "@/types/prevision_cp";

type Engagement = {
  id: string;
  name: string;
  operation_id: string;
  operation_name?: string;
  ministry_id: string | null;
};

type Operation = {
  id: string;
  name: string;
  ministry_id: string | null;
};

interface MobilisationCPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevision: PrevisionCP;
  engagements: Engagement[];
  operations: Operation[];
  onSubmit: (data: Partial<PrevisionCP>) => void;
}

const formSchema = z.object({
  montant_demande: z.string().min(1, "Required"),
  notes: z.string().optional(),
});

export function MobilisationCPDialog({ open, onOpenChange, prevision, engagements, operations, onSubmit }: MobilisationCPDialogProps) {
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      montant_demande: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (prevision) {
      form.reset({
        montant_demande: prevision.montant_demande?.toString() || "",
        notes: prevision.notes || "",
      });
    }
  }, [prevision, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const data: Partial<PrevisionCP> = {
      id: prevision.id,
      montant_demande: parseFloat(values.montant_demande),
      notes: values.notes,
      statut: "demandé",
      date_soumission: new Date().toISOString(),
    };

    onSubmit(data);
    onOpenChange(false);
  };

  const engagement = engagements.find((e) => e.id === prevision.engagement_id);
  const operation = operations.find((o) => o.id === prevision.operation_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("PrevisionsCP.dialog.mobilization.title")}</DialogTitle>
          <DialogDescription>
            {t("PrevisionsCP.dialog.mobilization.description", {
              operation: operation?.name,
              engagement: engagement?.name,
              periode: prevision.periode,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>{t("PrevisionsCP.dialog.mobilization.plannedAmount")}</FormLabel>
                <div className="text-lg font-semibold">{prevision.montant_prevu.toLocaleString()} FCFA</div>
              </div>
              <div>
                <FormLabel>{t("PrevisionsCP.dialog.mobilization.remainingAmount")}</FormLabel>
                <div className="text-lg font-semibold">{(prevision.montant_prevu - (prevision.montant_mobilise || 0)).toLocaleString()} FCFA</div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="montant_demande"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.mobilization.requestedAmount")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.mobilization.notes")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("PrevisionsCP.dialog.mobilization.notesPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("PrevisionsCP.dialog.mobilization.cancel")}
              </Button>
              <Button type="submit">{t("PrevisionsCP.dialog.mobilization.submit")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
