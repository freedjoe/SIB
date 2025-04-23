import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { PrevisionCP } from "@/types/prevision_cp";

interface PrevisionCPMobilizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevision: PrevisionCP | null;
  onSubmit: (data: Partial<PrevisionCP>) => void;
}

// Form schema
const formSchema = z.object({
  montant_demande: z.number().min(0),
  notes: z.string().optional(),
});

export function PrevisionCPMobilizationDialog({ open, onOpenChange, prevision, onSubmit }: PrevisionCPMobilizationDialogProps) {
  const { t } = useTranslation();

  // Initialize form with safe default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      montant_demande: 0,
      notes: "",
    },
  });

  // Reset form when prevision changes
  useEffect(() => {
    if (prevision) {
      form.reset({
        montant_demande: prevision.montant_prevu || 0,
        notes: prevision.notes || "",
      });
    }
  }, [prevision, form]);

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!prevision) return;

    onSubmit({
      id: prevision.id,
      ...values,
      statut: "demandé",
    });
    form.reset();
    onOpenChange(false);
  };

  // If no prevision is provided, don't render the dialog
  if (!prevision) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("PrevisionsCP.dialog.mobilization.title")}</DialogTitle>
          <DialogDescription>{t("PrevisionsCP.dialog.mobilization.description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>{t("PrevisionsCP.dialog.mobilization.montantPrevu")}</FormLabel>
                <div className="text-lg font-semibold">{prevision.montant_prevu.toLocaleString()} DZD</div>
              </div>
              <div>
                <FormLabel>{t("PrevisionsCP.dialog.mobilization.montantRestant")}</FormLabel>
                <div className="text-lg font-semibold">{(prevision.montant_prevu - (prevision.montant_mobilise || 0)).toLocaleString()} DZD</div>
              </div>
            </div>
            <FormField
              control={form.control}
              name="montant_demande"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.mobilization.montantDemande")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{t("PrevisionsCP.dialog.mobilization.submit")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
