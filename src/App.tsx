
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/index';
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Programs from "./pages/Programs";
import Portfolios from "./pages/Portfolios";
import Actions from "./pages/Actions";
import Operations from "./pages/Operations";
import Engagements from "./pages/Engagements";
import PaymentsPage from "./pages/Payments";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";
import ExpenseForecastsPage from "./pages/ExpenseForecasts";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="sigb-theme">
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <SettingsProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/programs" element={<Programs />} />
                  <Route path="/portfolios" element={<Portfolios />} />
                  <Route path="/actions" element={<Actions />} />
                  <Route path="/operations" element={<Operations />} />
                  <Route path="/engagements" element={<Engagements />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/expense-forecasts" element={<ExpenseForecastsPage />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default App;
