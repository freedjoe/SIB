
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Calendar, Check, Clock, Edit, Plus, Trash2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

import { ForecastedExpenseDialog } from '@/components/dialogs/ForecastedExpenseDialog';

type ForecastedExpense = {
  id: string;
  program_id: string;
  program_name?: string;
  forecasted_amount: number;
  mobilized_amount: number;
  period: string;
  start_date: string;
  end_date: string;
  ministry_id: string | null;
  ministry_name?: string;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type Program = {
  id: string;
  name: string;
  budget: number;
  allocated: number;
  ministry_id: string | null;
};

type Ministry = {
  id: string;
  name: string;
  code: string;
};

const ExpenseCategories = [
  { value: 'personnel', label: 'Personnel' },
  { value: 'operations', label: 'Opérations' },
  { value: 'investment', label: 'Investissement' },
  { value: 'development', label: 'Développement' },
  { value: 'emergency', label: 'Urgence' },
];

const ForecastedExpenses = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ForecastedExpense | null>(null);

  // Fetch forecasted expenses with related data
  const fetchForecastedExpenses = async () => {
    // Use any() method to specify a table not defined in the TypeScript types
    const { data, error } = await supabase
      .from('forecasted_expenses' as any)
      .select(`
        *,
        programs:program_id (name),
        ministries:ministry_id (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forecasted expenses:', error);
      throw error;
    }

    // Map the results to include program and ministry names
    return data.map((expense: any) => ({
      ...expense,
      program_name: expense.programs?.name,
      ministry_name: expense.ministries?.name,
    }));
  };

  // Fetch programs for the dropdown
  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }

    return data;
  };

  // Fetch ministries for the dropdown
  const fetchMinistries = async () => {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching ministries:', error);
      throw error;
    }

    return data;
  };

  const { data: forecastedExpenses, isLoading, refetch } = useQuery({
    queryKey: ['forecasted-expenses'],
    queryFn: fetchForecastedExpenses,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms,
  });

  const { data: ministries = [] } = useQuery({
    queryKey: ['ministries'],
    queryFn: fetchMinistries,
  });

  // Filter by period
  const filteredByPeriod = React.useMemo(() => {
    if (!forecastedExpenses) return [];
    if (selectedPeriod === 'all') return forecastedExpenses;
    return forecastedExpenses.filter((expense: ForecastedExpense) => 
      expense.period === selectedPeriod
    );
  }, [forecastedExpenses, selectedPeriod]);

  // Filter by category
  const filteredExpenses = React.useMemo(() => {
    if (selectedCategory === 'all') return filteredByPeriod;
    return filteredByPeriod.filter((expense: ForecastedExpense) => 
      expense.category === selectedCategory
    );
  }, [filteredByPeriod, selectedCategory]);

  // Calculate summary metrics
  const summary = React.useMemo(() => {
    if (!filteredExpenses?.length) return {
      total: 0,
      mobilized: 0,
      mobilizationRate: 0,
      count: 0
    };

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.forecasted_amount, 0);
    const mobilized = filteredExpenses.reduce((sum, expense) => sum + expense.mobilized_amount, 0);
    
    return {
      total,
      mobilized,
      mobilizationRate: total > 0 ? (mobilized / total) * 100 : 0,
      count: filteredExpenses.length
    };
  }, [filteredExpenses]);

  // Handle creating a new forecasted expense
  const handleCreateExpense = async (expense: Partial<ForecastedExpense>) => {
    try {
      // Use any() method to specify a table not defined in the TypeScript types
      const { data, error } = await supabase
        .from('forecasted_expenses' as any)
        .insert([expense])
        .select();

      if (error) throw error;

      toast({
        title: t('app.common.success'),
        description: t('app.expenses.createSuccess'),
      });

      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating forecasted expense:', error);
      toast({
        title: t('app.common.error'),
        description: error.message || t('app.expenses.createError'),
        variant: 'destructive',
      });
    }
  };

  // Handle updating an expense
  const handleUpdateExpense = async (id: string, updates: Partial<ForecastedExpense>) => {
    try {
      // Use any() method to specify a table not defined in the TypeScript types
      const { error } = await supabase
        .from('forecasted_expenses' as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('app.common.success'),
        description: t('app.expenses.updateSuccess'),
      });

      setIsDialogOpen(false);
      setEditingExpense(null);
      refetch();
    } catch (error: any) {
      console.error('Error updating forecasted expense:', error);
      toast({
        title: t('app.common.error'),
        description: error.message || t('app.expenses.updateError'),
        variant: 'destructive',
      });
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (id: string) => {
    if (!confirm(t('app.expenses.confirmDelete'))) return;

    try {
      // Use any() method to specify a table not defined in the TypeScript types
      const { error } = await supabase
        .from('forecasted_expenses' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('app.common.success'),
        description: t('app.expenses.deleteSuccess'),
      });

      refetch();
    } catch (error: any) {
      console.error('Error deleting forecasted expense:', error);
      toast({
        title: t('app.common.error'),
        description: error.message || t('app.expenses.deleteError'),
        variant: 'destructive',
      });
    }
  };

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate mobilization percentage
  const getMobilizationPercentage = (forecasted: number, mobilized: number) => {
    if (forecasted === 0) return 0;
    return Math.min(100, Math.round((mobilized / forecasted) * 100));
  };

  // Get badge color based on mobilization rate
  const getMobilizationBadgeVariant = (percentage: number) => {
    if (percentage < 30) return 'destructive';
    if (percentage < 70) return 'default';
    return 'success';
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('app.navigation.forecastedExpenses')}</h1>
          <p className="text-muted-foreground">{t('app.expenses.subtitle')}</p>
        </div>
        <Button onClick={() => {
          setEditingExpense(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('app.expenses.addNew')}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('app.expenses.totalForecasted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                formatCurrency(summary.total)
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('app.expenses.mobilized')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                formatCurrency(summary.mobilized)
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('app.expenses.mobilizationRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {summary.mobilizationRate.toFixed(1)}%
                  </div>
                  <Progress value={summary.mobilizationRate} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('app.expenses.totalForecasts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                summary.count
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="w-full md:w-auto">
          <Select
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t('app.expenses.selectPeriod')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('app.expenses.allPeriods')}</SelectItem>
              <SelectItem value="monthly">{t('app.expenses.monthly')}</SelectItem>
              <SelectItem value="quarterly">{t('app.expenses.quarterly')}</SelectItem>
              <SelectItem value="annual">{t('app.expenses.annual')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder={t('app.expenses.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('app.expenses.allCategories')}</SelectItem>
              {ExpenseCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('app.expenses.forecasts')}</CardTitle>
          <CardDescription>
            {t('app.expenses.tableDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredExpenses?.length === 0 ? (
            // No data state
            <div className="text-center py-10">
              <div className="text-muted-foreground">{t('app.expenses.noData')}</div>
            </div>
          ) : (
            // Data table
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('app.expenses.program')}</TableHead>
                    <TableHead>{t('app.expenses.ministry')}</TableHead>
                    <TableHead>{t('app.expenses.period')}</TableHead>
                    <TableHead>{t('app.expenses.forecasted')}</TableHead>
                    <TableHead>{t('app.expenses.mobilized')}</TableHead>
                    <TableHead>{t('app.expenses.mobilizationStatus')}</TableHead>
                    <TableHead className="text-right">{t('app.common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense: ForecastedExpense) => {
                    const mobilizationPercentage = getMobilizationPercentage(
                      expense.forecasted_amount,
                      expense.mobilized_amount
                    );
                    const badgeVariant = getMobilizationBadgeVariant(mobilizationPercentage);

                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.program_name}</TableCell>
                        <TableCell>{expense.ministry_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t(`app.expenses.${expense.period}`)}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(expense.start_date), 'dd/MM/yyyy')} - {format(new Date(expense.end_date), 'dd/MM/yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(expense.forecasted_amount)}</TableCell>
                        <TableCell>{formatCurrency(expense.mobilized_amount)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={badgeVariant as any}>
                              {mobilizationPercentage}%
                            </Badge>
                            <Progress value={mobilizationPercentage} className="h-1" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setEditingExpense(expense);
                                setIsDialogOpen(true);
                              }}
                              title={t('app.common.edit')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteExpense(expense.id)}
                              title={t('app.common.delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning for low mobilization */}
      {summary.mobilizationRate < 30 && !isLoading && filteredExpenses && filteredExpenses.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>
            {t('app.expenses.lowMobilizationAlert')}
          </AlertTitle>
          <AlertDescription>
            {t('app.expenses.lowMobilizationDescription')}
          </AlertDescription>
        </Alert>
      )}

      {/* Dialog for adding/editing forecasted expenses */}
      <ForecastedExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expense={editingExpense}
        programs={programs || []}
        ministries={ministries || []}
        onSubmit={(data) => {
          if (editingExpense) {
            handleUpdateExpense(editingExpense.id, data);
          } else {
            handleCreateExpense(data as any);
          }
        }}
      />
    </div>
  );
};

export default ForecastedExpenses;
