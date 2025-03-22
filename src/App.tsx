
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Programs from "./pages/Programs";
import Operations from "./pages/Operations";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/portfolios" element={<NotFound />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/actions" element={<NotFound />} />
            <Route path="/engagements" element={<NotFound />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
