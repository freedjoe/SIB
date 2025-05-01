import { useEffect, useState } from "react";
import { getBudgetAllocations, getFinancialOperations, getMinistries } from "@/integrations/supabase/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ministry, BudgetAllocation, FinancialOperation } from "@/types/supabase";
import { DataLoadingWrapper } from "@/components/ui-custom/DataLoadingWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BlurLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

const BlurLoader = ({ isLoading, children, className }: BlurLoaderProps) => {
  return (
    <div
      className={cn(
        "transition-all duration-300",
        isLoading ? "opacity-50 blur-[2px] pointer-events-none animate-pulse" : "opacity-100 blur-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default function BudgetDashboard() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [operations, setOperations] = useState<FinancialOperation[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMinistry, setSelectedMinistry] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMinistry]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ministriesData, allocationsData, operationsData] = await Promise.all([
        getMinistries(),
        getBudgetAllocations(selectedYear, selectedMinistry),
        getFinancialOperations(selectedMinistry, undefined, selectedYear),
      ]);

      setMinistries(ministriesData);
      setAllocations(allocationsData);
      setOperations(operationsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Budget Dashboard</h1>
        <div className="flex gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="All Ministries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Ministries</SelectItem>
              {ministries.map((ministry) => (
                <SelectItem key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataLoadingWrapper
        isLoading={loading}
        skeletonComponent={
          <div className="space-y-4 w-full">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <BlurLoader isLoading={loading}>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Budget</CardTitle>
                <CardDescription>Initial Allocations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatAmount(allocations.reduce((sum, a) => sum + (a.initial_amount || 0), 0))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revised Budget</CardTitle>
                <CardDescription>After Modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatAmount(allocations.reduce((sum, a) => sum + (a.revised_amount || a.initial_amount || 0), 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Actual Spending</CardTitle>
                <CardDescription>Current Usage</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatAmount(allocations.reduce((sum, a) => sum + (a.actual_amount || 0), 0))}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="allocations">
            <TabsList>
              <TabsTrigger value="allocations">Budget Allocations</TabsTrigger>
              <TabsTrigger value="operations">Financial Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="allocations">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Allocations</CardTitle>
                  <CardDescription>Overview of budget allocations by ministry</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ministry</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Initial Amount</TableHead>
                        <TableHead className="text-right">Revised Amount</TableHead>
                        <TableHead className="text-right">Actual Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.map((allocation) => (
                        <TableRow key={allocation.id}>
                          <TableCell>{allocation.ministry?.name}</TableCell>
                          <TableCell>{allocation.category?.name}</TableCell>
                          <TableCell className="text-right">{formatAmount(allocation.initial_amount)}</TableCell>
                          <TableCell className="text-right">{formatAmount(allocation.revised_amount || allocation.initial_amount)}</TableCell>
                          <TableCell className="text-right">{formatAmount(allocation.actual_amount || 0)}</TableCell>
                          <TableCell>{allocation.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operations">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Operations</CardTitle>
                  <CardDescription>Recent financial operations and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Ministry</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operations.map((operation) => (
                        <TableRow key={operation.id}>
                          <TableCell>{new Date(operation.operation_date).toLocaleDateString()}</TableCell>
                          <TableCell>{operation.ministry?.name}</TableCell>
                          <TableCell>{operation.category?.name}</TableCell>
                          <TableCell>{operation.operation_type}</TableCell>
                          <TableCell className="text-right">{formatAmount(operation.amount)}</TableCell>
                          <TableCell>{operation.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </BlurLoader>
      </DataLoadingWrapper>
    </div>
  );
}
