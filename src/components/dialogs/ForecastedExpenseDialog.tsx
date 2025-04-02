
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Program = {
  id: string;
  name: string;
  budget: number;
  allocated: number;
};

type Ministry = {
  id: string;
  name: string;
  code: string;
};

type ForecastedExpense = {
  id: string;
  program_id: string;
  forecasted_amount: number;
  mobilized_amount: number;
  period: string;
  start_date: string;
  end_date: string;
  ministry_id: string | null;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

interface ForecastedExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: ForecastedExpense | null;
  programs: Program[];
  ministries: Ministry[];
  onSubmit: (data: Partial<ForecastedExpense>) => void;
}

const ExpenseCategories = [
  { value: 'personnel', label: 'Personnel' },
  { value: 'operations', label: 'Opérations' },
  { value: 'investment', label: 'Investissement' },
  { value: 'development', label: 'Développement' },
  { value: 'emergency', label: 'Urgence' },
];

export const ForecastedExpenseDialog: React.FC<ForecastedExpenseDialogProps> = ({
  open,
  onOpenChange,
  expense,
  programs,
  ministries,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const isEditing = !!expense;

  // Define form schema
  const formSchema = z.object({
    program_id: z.string({ required_error: t('app.expenses.programRequired') }),
    forecasted_amount: z.coerce
      .number()
      .positive({ message: t('app.expenses.amountPositive') }),
    mobilized_amount: z.coerce.number().min(0, { message: t('app.expenses.amountMin') }),
    period: z.string({ required_error: t('app.expenses.periodRequired') }),
    start_date: z.date({ required_error: t('app.expenses.dateRequired') }),
    end_date: z.date({ required_error: t('app.expenses.dateRequired') }),
    ministry_id: z.string().nullable(),
    category: z.string({ required_error: t('app.expenses.categoryRequired') }),
    description: z.string().nullable(),
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      program_id: expense?.program_id || '',
      forecasted_amount: expense?.forecasted_amount || 0,
      mobilized_amount: expense?.mobilized_amount || 0,
      period: expense?.period || 'monthly',
      start_date: expense?.start_date ? new Date(expense.start_date) : new Date(),
      end_date: expense?.end_date ? new Date(expense.end_date) : new Date(),
      ministry_id: expense?.ministry_id || null,
      category: expense?.category || 'operations',
      description: expense?.description || '',
    },
  });

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert dates to ISO strings
    const data = {
      ...values,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('app.expenses.editExpense')
              : t('app.expenses.createExpense')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('app.expenses.editDescription')
              : t('app.expenses.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Program Selection */}
            <FormField
              control={form.control}
              name="program_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('app.expenses.program')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('app.expenses.selectProgram')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ministry Selection (Optional) */}
            <FormField
              control={form.control}
              name="ministry_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('app.expenses.ministry')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('app.expenses.selectMinistry')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* This is the line causing the problem - empty string value */}
                      <SelectItem value="null">{t('app.common.none')}</SelectItem>
                      {ministries.map((ministry) => (
                        <SelectItem key={ministry.id} value={ministry.id}>
                          {ministry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('app.expenses.ministryOptional')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Forecasted Amount */}
            <FormField
              control={form.control}
              name="forecasted_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('app.expenses.forecastedAmount')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mobilized Amount (for editing) */}
            {isEditing && (
              <FormField
                control={form.control}
                name="mobilized_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('app.expenses.mobilizedAmount')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Period Selection */}
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('app.expenses.period')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('app.expenses.selectPeriod')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">{t('app.expenses.monthly')}</SelectItem>
                      <SelectItem value="quarterly">{t('app.expenses.quarterly')}</SelectItem>
                      <SelectItem value="annual">{t('app.expenses.annual')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('app.expenses.category')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('app.expenses.selectCategory')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ExpenseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('app.expenses.startDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t('app.expenses.pickDate')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('app.expenses.endDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t('app.expenses.pickDate')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date("1900-01-01") || 
                            (form.getValues("start_date") && date < form.getValues("start_date"))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('app.expenses.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('app.expenses.descriptionPlaceholder')}
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('app.common.cancel')}
              </Button>
              <Button type="submit">
                {isEditing
                  ? t('app.common.save')
                  : t('app.common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
