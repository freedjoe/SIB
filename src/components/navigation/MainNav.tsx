
import { Fragment, useState } from "react";
import { NavLink } from "react-router-dom";
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
  SidebarTrigger
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
  subItems?: NavItem[];
}

const mainNavItems: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
    description: "Vue d'ensemble du budget",
  },
  {
    label: "Budgets",
    href: "/budgets",
    icon: BarChart3,
    description: "Gestion des budgets",
  },
  {
    label: "Programmes",
    href: "/programs",
    icon: Layers,
    description: "Portefeuille des programmes",
  },
  {
    label: "Actions",
    href: "/actions",
    icon: ClipboardList,
    description: "Gestion des actions",
  },
  {
    label: "Opérations",
    href: "/operations",
    icon: FileCog,
    description: "Gestion des opérations",
  },
  {
    label: "Engagements",
    href: "/engagements",
    icon: PackagePlus,
    description: "Autorisations d'engagement",
  },
  {
    label: "Paiements",
    href: "/payments",
    icon: PieChart,
    description: "Crédits de paiement",
  },
  {
    label: "Rapports",
    href: "/reports",
    icon: BookOpenText,
    description: "Rapports et analyses",
  },
];

export function MainNav() {
  return (
    <Sidebar>
      <SidebarHeader className="flex-1">
        <div className="h-16 flex items-center px-4">
          <NavLink to="/" className="flex items-center">
            <Logo />
          </NavLink>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t pt-4 px-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-full flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
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
