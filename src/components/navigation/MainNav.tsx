import { Fragment, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  BookOpenText,
  ChevronDown,
  ClipboardList,
  FileCog,
  Layers,
  LayoutDashboard,
  PackagePlus,
  PieChart,
  Settings,
  Briefcase,
  FileText,
  Shield,
  TrendingUp,
  User,
  Lock,
  Globe,
  Database,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "@/components/logo/Logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

export function MainNav() {
  const { t } = useTranslation();
  const [isParametersMenu, setIsParametersMenu] = useState(false);

  const mainNavItems: NavItem[] = [
    {
      label: t("app.navigation.dashboard"),
      href: "/",
      icon: LayoutDashboard,
      description: "Vue d'ensemble du budget",
    },
    {
      label: t("app.navigation.budgets"),
      href: "/budgets",
      icon: BarChart3,
      description: "Gestion des budgets",
    },
    {
      label: t("app.navigation.portfolios"),
      href: "/portfolios",
      icon: Briefcase,
      description: "Portefeuille des programmes",
    },
    {
      label: t("app.navigation.programs"),
      href: "/programs",
      icon: Layers,
      description: "Gestion des programmes",
    },
    {
      label: t("app.navigation.actions"),
      href: "/actions",
      icon: ClipboardList,
      description: "Gestion des actions",
    },
    {
      label: t("app.navigation.operations"),
      href: "/operations",
      icon: FileCog,
      description: "Gestion des opérations",
    },
    {
      label: t("app.navigation.engagements"),
      href: "/engagements",
      icon: PackagePlus,
      description: "Autorisations d'engagement",
    },
    {
      label: t("app.navigation.payments"),
      href: "/payments",
      icon: PieChart,
      description: "Crédits de paiement",
    },
    {
      label: t("app.navigation.forecastedExpenses"),
      href: "/forecasted-expenses",
      icon: TrendingUp,
      description: "Prévisions des dépenses - CP à mobiliser",
    },
    {
      label: t("app.navigation.previsionsCP"),
      href: "/previsions-cp",
      icon: CreditCard,
      description: "Prévisions et mobilisation des CP",
    },
    {
      label: t("app.navigation.reports"),
      href: "/reports",
      icon: BookOpenText,
      description: "Rapports et analyses",
    },
    {
      label: t("app.navigation.controlsAudits"),
      href: "/audit",
      icon: Shield,
      description: "Contrôles et audits",
    },
  ];

  const parametersNavItems: NavItem[] = [
    {
      label: t("app.navigation.profile"),
      href: "/settings/profile",
      icon: User,
      description: "Gérer votre profil",
    },
    {
      label: t("app.navigation.security"),
      href: "/settings/security",
      icon: Lock,
      description: "Paramètres de sécurité",
    },
    {
      label: t("app.navigation.localization"),
      href: "/settings/localization",
      icon: Globe,
      description: "Paramètres de localisation",
    },
    {
      label: t("app.navigation.basicData"),
      href: "/settings/basic-data",
      icon: Database,
      description: "Données de base",
    },
  ];

  const menuVariants = {
    enter: {
      opacity: 0,
      x: -20,
    },
    center: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: 20,
    },
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex-1">
        <div className="h-16 flex flex-col items-center px-4">
          <NavLink to="/" className="flex items-center">
            <Logo />
          </NavLink>
          <div className="w-full mt-4 border-t pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={isParametersMenu ? "parameters" : "modules"}
                variants={menuVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <SidebarMenu>
                  {(isParametersMenu ? parametersNavItems : mainNavItems).map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md",
                              isActive ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )
                          }
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>{/* The main navigation has been moved to the header */}</SidebarContent>
      <SidebarFooter className="border-t pt-4 px-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setIsParametersMenu(!isParametersMenu)}
            >
              <Settings className="h-4 w-4" />
              <span>{isParametersMenu ? t("app.navigation.modules") : t("app.navigation.parameters")}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isParametersMenu ? "Retour aux modules" : "Paramètres du système"}</p>
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
