import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
  const isEditMode = Boolean(prevision);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      engagement_id: prevision?.engagement_id || "",
      operation_id: prevision?.operation_id || "",
      exercice: prevision?.exercice || new Date().getFullYear(),
      periode: prevision?.periode || `${new Date().getFullYear()}-Q1`,
      montant_prevu: prevision?.montant_prevu || 0,
      notes: prevision?.notes || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        engagement_id: prevision?.engagement_id || "",
        operation_id: prevision?.operation_id || "",
        exercice: prevision?.exercice || new Date().getFullYear(),
        periode: prevision?.periode || `${new Date().getFullYear()}-Q1`,
        montant_prevu: prevision?.montant_prevu || 0,
        notes: prevision?.notes || "",
      });
    }
  }, [prevision, open, form]);

  const filteredOperations = React.useMemo(() => {
    return operations;
  }, [operations]);

  const filteredEngagements = React.useMemo(() => {
    const operationId = form.watch("operation_id");
    if (!operationId) return engagements;
    return engagements.filter((engagement) => engagement.operation_id === operationId);
  }, [engagements, form.watch("operation_id")]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const data: Partial<PrevisionCP> = {
      ...(prevision?.id ? { id: prevision.id } : {}),
      engagement_id: values.engagement_id,
      operation_id: values.operation_id,
      exercice: values.exercice,
      periode: values.periode,
      montant_prevu: values.montant_prevu,
      notes: values.notes,
      statut: prevision?.statut || "prévu",
    };

    onSubmit(data);
    onOpenChange(false);
  };

  const periodOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const periods = [];

    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        periods.push(`${year}-Q${quarter}`);
      }
    }

    return periods;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t("PrevisionsCP.dialog.edit.title") : t("PrevisionsCP.dialog.create.title")}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t("PrevisionsCP.dialog.edit.description") : t("PrevisionsCP.dialog.create.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="operation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.operation")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("engagement_id", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("PrevisionsCP.dialog.selectOperation")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredOperations.map((operation) => (
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
              name="engagement_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.engagement")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch("operation_id")}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("PrevisionsCP.dialog.selectEngagement")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredEngagements.map((engagement) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exercice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("PrevisionsCP.dialog.exercice")}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Année" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[new Date().getFullYear(), new Date().getFullYear() + 1].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
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
                name="periode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("PrevisionsCP.dialog.periode")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Période" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periodOptions.map((period) => (
                          <SelectItem key={period} value={period}>
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="montant_prevu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PrevisionsCP.dialog.montantPrevu")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
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

            <DialogFooter className="mt-4 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">{isEditMode ? t("PrevisionsCP.dialog.update") : t("PrevisionsCP.dialog.create")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
