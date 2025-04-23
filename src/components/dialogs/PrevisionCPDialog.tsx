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

type Ministry = {
  id: string;
  name: string;
  code: string;
};

interface PrevisionCPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevision?: PrevisionCP | null;
  engagements: Engagement[];
  operations: Operation[];
  ministries: Ministry[];
  onSubmit: (data: Partial<PrevisionCP>) => void;
}

const formSchema = z.object({
  engagement_id: z.string().min(1, "Required"),
  operation_id: z.string().min(1, "Required"),
  exercice: z.number().min(2000).max(2100),
  periode: z.string().regex(/^\d{4}-Q[1-4]$/, "Format: YYYY-Q[1-4]"),
  montant_prevu: z.number().min(0),
  notes: z.string().optional(),
});

export function PrevisionCPDialog({ open, onOpenChange, prevision, engagements, operations, ministries, onSubmit }: PrevisionCPDialogProps) {
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      engagement_id: prevision?.engagement_id || "",
      operation_id: prevision?.operation_id || "",
      exercice: prevision?.exercice || new Date().getFullYear(),
      periode: prevision?.periode || "",
      montant_prevu: prevision?.montant_prevu || 0,
      notes: prevision?.notes || "",
    },
  });

  useEffect(() => {
    if (prevision) {
      form.reset({
        engagement_id: prevision.engagement_id,
        operation_id: prevision.operation_id,
        exercice: prevision.exercice,
        periode: prevision.periode,
        montant_prevu: prevision.montant_prevu,
        notes: prevision.notes || "",
      });
    } else {
      form.reset({
        engagement_id: "",
        operation_id: "",
        exercice: new Date().getFullYear(),
        periode: "",
        montant_prevu: 0,
        notes: "",
      });
    }
  }, [prevision, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const data: Partial<PrevisionCP> = {
      engagement_id: values.engagement_id,
      operation_id: values.operation_id,
      exercice: values.exercice,
      periode: values.periode,
      montant_prevu: values.montant_prevu,
      notes: values.notes,
      statut: "prévu",
    };

    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  // Generate period options (Q1, Q2, Q3, Q4 for current and next year)
  const generatePeriodOptions = () => {
    const currentYear = new Date().getFullYear();
    const periods = [];

    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        periods.push(`${year}-Q${quarter}`);
      }
    }

    return periods;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{prevision ? t("PrevisionsCP.dialog.edit.title") : t("PrevisionsCP.dialog.create.title")}</DialogTitle>
          <DialogDescription>{prevision ? t("PrevisionsCP.dialog.edit.description") : t("PrevisionsCP.dialog.create.description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="engagement_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.engagement")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("PrevisionsCP.dialog.selectEngagement")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {engagements
                        .filter((engagement) => engagement.operation_id === form.getValues("operation_id"))
                        .map((engagement) => (
                          <SelectItem key={engagement.id} value={engagement.id}>
                            {engagement.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="operation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.operation")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("PrevisionsCP.dialog.selectOperation")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {operations.map((operation) => (
                        <SelectItem key={operation.id} value={operation.id}>
                          {operation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exercice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.exercice")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="periode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.periode")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="2024-Q1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="montant_prevu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.montantPrevu")}</FormLabel>
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
                  <FormLabel>{t("PrevisionsCP.dialog.notes")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{prevision ? t("PrevisionsCP.dialog.update") : t("PrevisionsCP.dialog.create")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
