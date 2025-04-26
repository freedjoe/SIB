import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import DashboardPage from "./pages/Dashboard";
import BudgetaryExercises from "./pages/BudgetaryExercises";
import Programs from "./pages/Programs";
import Portfolios from "./pages/Portfolios";
import Actions from "./pages/Actions";
import Operations from "./pages/Operations";
import Engagements from "./pages/Engagements";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Settings from "./pages/settings";
import Profile from "./pages/settings/Profile";
import Localization from "./pages/settings/Localization";
import Security from "./pages/settings/Security";
import BasicData from "./pages/settings/BasicData";
import Ministries from "./pages/settings/basic-data/Ministries";
import Companies from "./pages/settings/basic-data/Companies";
import BudgetCatalog from "./pages/settings/basic-data/BudgetCatalog";
import Nomenclature from "./pages/settings/basic-data/Nomenclature";
import ReportTypes from "./pages/settings/basic-data/ReportTypes";
import Users from "./pages/settings/Users";
import Roles from "./pages/settings/Roles";
import Help from "./pages/Help";
import HelpPresentation from "./pages/help/Presentation";
import HelpGuide from "./pages/help/Guide";
import HelpFAQ from "./pages/help/FAQ";
import HelpSupport from "./pages/help/Support";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ForecastedExpenses from "./pages/ForecastedExpenses";
import PrevisionsCP from "./pages/PrevisionsCP";
import MinistryRequests from "./pages/MinistryRequests";
import Chat from "./pages/Chat";
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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/budgetary-exercises" element={<BudgetaryExercises />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/portfolios" element={<Portfolios />} />
        <Route path="/actions" element={<Actions />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/engagements" element={<Engagements />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/forecasted-expenses" element={<ForecastedExpenses />} />
        <Route path="/previsions-cp" element={<PrevisionsCP />} />
        <Route path="/ministry-requests" element={<MinistryRequests />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings/profile" element={<Profile />} />
        <Route path="/settings/security" element={<Security />} />
        <Route path="/settings/localization" element={<Localization />} />
        <Route path="/settings/basic-data" element={<BasicData />} />
        <Route path="/settings/basic-data/ministries" element={<Ministries />} />
        <Route path="/settings/basic-data/companies" element={<Companies />} />
        <Route path="/settings/basic-data/budget-catalog" element={<BudgetCatalog />} />
        <Route path="/settings/basic-data/nomenclature" element={<Nomenclature />} />
        <Route path="/settings/basic-data/report-types" element={<ReportTypes />} />
        <Route path="/settings/users" element={<Users />} />
        <Route path="/settings/roles" element={<Roles />} />
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
