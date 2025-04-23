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
import HelpPresentation from "./pages/help/Presentation";
import HelpGuide from "./pages/help/Guide";
import HelpFAQ from "./pages/help/FAQ";
import HelpSupport from "./pages/help/Support";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ForecastedExpenses from "./pages/ForecastedExpenses";
import PrevisionsCP from "./pages/PrevisionsCP";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import "./i18n/config"; // Import the i18n configuration

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user && !adminLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, session, isLoading } = useAuth();

  // Redirect to dashboard if already logged in - this works for normal Supabase auth
  useEffect(() => {
    console.log("User:", user);
    console.log("Session:", session);
    console.log("Is Loading:", isLoading);
    console.log("Admin logged in:", localStorage.getItem("adminLoggedIn"));

    // Check both regular auth and admin auth
    if ((user || localStorage.getItem("adminLoggedIn") === "true") && window.location.pathname === "/auth") {
      window.location.href = "/";
    }
  }, [user, isLoading]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* For /auth route, check if logged in */}
      <Route path="/auth" element={user || localStorage.getItem("adminLoggedIn") === "true" ? <Navigate to="/" replace /> : <Auth />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/portfolios" element={<Portfolios />} />
        <Route path="/actions" element={<Actions />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/engagements" element={<Engagements />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/forecasted-expenses" element={<ForecastedExpenses />} />
        <Route path="/previsions-cp" element={<PrevisionsCP />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings/*" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/help/presentation" element={<HelpPresentation />} />
        <Route path="/help/guide" element={<HelpGuide />} />
        <Route path="/help/faq" element={<HelpFAQ />} />
        <Route path="/help/support" element={<HelpSupport />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
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
