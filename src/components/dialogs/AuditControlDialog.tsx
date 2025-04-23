import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FinancialControl } from "@/components/tables/FinancialControlsTable";

interface AuditControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  control: FinancialControl | null;
  onSave: (data: Partial<FinancialControl>) => void;
  type: "add" | "edit" | "view";
}

const formSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  type: z.string().min(1, "Le type de contrôle est requis"),
  entity: z.string().min(1, "L'entité est requise"),
  controller: z.string().min(1, "Le contrôleur est requis"),
  result: z.enum(["conforme", "anomalie", "partiellement"], {
    required_error: "Le résultat est requis",
  }),
  details: z.string().optional(),
});

const controlTypes = [
  { value: "Contrôle de régularité", label: "Contrôle de régularité" },
  { value: "Contrôle de performance", label: "Contrôle de performance" },
  { value: "Contrôle budgétaire", label: "Contrôle budgétaire" },
  { value: "Contrôle interne", label: "Contrôle interne" },
  { value: "Contrôle de conformité", label: "Contrôle de conformité" },
];

export function AuditControlDialog({ open, onOpenChange, control, onSave, type }: AuditControlDialogProps) {
  const isReadOnly = type === "view";
  const isEditing = type === "edit";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: control?.date || new Date().toISOString().split("T")[0],
      type: control?.type || "",
      entity: control?.entity || "",
      controller: control?.controller || "",
      result: control?.result || "conforme",
      details: control?.id ? `Détails du contrôle ${control.id}` : "",
    },
  });

  useEffect(() => {
    if (control) {
      form.reset({
        date: control.date,
        type: control.type,
        entity: control.entity,
        controller: control.controller,
        result: control.result,
        details: control.id ? `Détails du contrôle ${control.id}` : "",
      });
    } else {
      form.reset({
        date: new Date().toISOString().split("T")[0],
        type: "",
        entity: "",
        controller: "",
        result: "conforme",
        details: "",
      });
    }
  }, [control, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      id: control?.id || `control-${Date.now()}`,
      ...values,
    });
    onOpenChange(false);
  };

  const dialogTitle = isEditing ? "Modifier le contrôle" : isReadOnly ? "Détails du contrôle" : "Ajouter un contrôle";
  const dialogDescription = isEditing
    ? "Modifiez les détails du contrôle existant"
    : isReadOnly
      ? "Consultez les détails du contrôle"
      : "Saisissez les informations pour le nouveau contrôle";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Résultat</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un résultat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="conforme">Conforme</SelectItem>
                        <SelectItem value="anomalie">Anomalie détectée</SelectItem>
                        <SelectItem value="partiellement">Partiellement conforme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de Contrôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type de contrôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {controlTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="entity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entité</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom de l'entité contrôlée" disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="controller"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrôleur</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom du contrôleur" disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Détails additionnels</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Détails du contrôle" disabled={isReadOnly} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                {isReadOnly ? "Fermer" : "Annuler"}
              </Button>
              {!isReadOnly && <Button type="submit">{isEditing ? "Modifier" : "Ajouter"}</Button>}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
