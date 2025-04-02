
import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

export function MainNav() {
  const { t } = useTranslation();

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

  return (
    <Sidebar>
      <SidebarHeader className="flex-1">
        <div className="h-16 flex flex-col items-center px-4">
          <NavLink to="/" className="flex items-center">
            <Logo />
          </NavLink>
          <div className="w-full mt-4 border-t pt-4">
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* The main navigation has been moved to the header */}
      </SidebarContent>
      <SidebarFooter className="border-t pt-4 px-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-full flex items-center justify-center gap-2"
              asChild
            >
              <NavLink to="/settings">
                <Settings className="h-4 w-4" />
                <span>{t("app.navigation.settings")}</span>
              </NavLink>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Paramètres du système</p>
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
