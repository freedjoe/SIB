import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Icons } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const mainRoutes = [
    {
      label: t("dashboard"),
      icon: "home",
      href: "/dashboard",
    },
    {
      label: t("budgets"),
      icon: "wallet",
      href: "/budgets",
    },
    {
      label: t("programs"),
      icon: "target",
      href: "/programs",
    },
    {
      label: t("portfolios"),
      icon: "briefcase",
      href: "/portfolios",
    },
    {
      label: t("actions"),
      icon: "hammer",
      href: "/actions",
    },
    {
      label: t("operations"),
      icon: "construction",
      href: "/operations",
    },
    {
      label: t("engagements"),
      icon: "file-contract",
      href: "/engagements",
    },
    {
      label: t("payments"),
      icon: "credit-card",
      href: "/payments",
    },
    {
      label: "Prévisions des Dépenses",
      icon: "chart-line",
      href: "/expense-forecasts",
    },
    {
      label: t("reports"),
      icon: "file-text",
      href: "/reports",
    },
    {
      label: t("audit"),
      icon: "shield",
      href: "/audit",
    },
    {
      label: t("settings"),
      icon: "settings",
      href: "/settings",
    },
  ];

  return (
    <div className="flex w-full shrink-0 items-center space-x-4">
      <Link to="/" className="hidden items-center space-x-2 md:flex">
        <Icons.logo className="h-6 w-6" />
        <span className="font-bold">SIGB</span>
      </Link>
      <nav className="hidden md:flex">
        <ul className="flex items-center space-x-6">
          {mainRoutes.map((route) => (
            <li key={route.href}>
              <Link
                to={route.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-foreground/80 sm:text-base",
                  location.pathname === route.href
                    ? "text-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
