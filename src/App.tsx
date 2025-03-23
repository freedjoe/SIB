
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Programs from "./pages/Programs";
import Portfolios from "./pages/Portfolios";
import Actions from "./pages/Actions";
import Operations from "./pages/Operations";
import Engagements from "./pages/Engagements";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import "./i18n/config"; // Import the i18n configuration

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  // Redirect to dashboard if already logged in - this works for normal Supabase auth
  useEffect(() => {
    if (user && window.location.pathname === "/auth") {
      window.location.href = "/";
    }
  }, [user]);

  return (
    <Routes>
      {/* For /auth route, check if admin login happened through localStorage */}
      <Route 
        path="/auth" 
        element={
          localStorage.getItem("adminLoggedIn") === "true" ? 
          <Navigate to="/" replace /> : 
          <Auth />
        } 
      />
      
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/portfolios" element={<Portfolios />} />
        <Route path="/actions" element={<Actions />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/engagements" element={<Engagements />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings/*" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <SettingsProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </AuthProvider>
        </SettingsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
