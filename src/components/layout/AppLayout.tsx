
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MainNav } from "@/components/navigation/MainNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Badge } from "@/components/ui/badge";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { theme, setTheme, language, setLanguage } = useSettings();
  const [searchOpen, setSearchOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const languageOptions = [
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "ar", label: "العربية", flag: "🇩🇿" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <MainNav />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/90 backdrop-blur-sm px-6">
            <SidebarTrigger />
            
            {/* Search Bar */}
            <div className={cn(
              "flex-1 transition-all duration-300 overflow-hidden",
              searchOpen ? "max-w-2xl" : "max-w-0"
            )}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-9 w-full" 
                  placeholder={t("app.common.search")} 
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              {!searchOpen && (
                <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
              )}
              
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="font-semibold">{t("app.common.notifications")}</span>
                    <Button variant="ghost" size="sm">
                      {t("app.common.markAllRead")}
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-auto py-2">
                    {/* Notification items would go here */}
                    <div className="px-4 py-2 hover:bg-accent cursor-pointer">
                      <div className="flex items-start gap-2">
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nouvel engagement ajouté</p>
                          <p className="text-xs text-muted-foreground">Il y a 5 minutes</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 hover:bg-accent cursor-pointer">
                      <div className="flex items-start gap-2">
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Paiement approuvé</p>
                          <p className="text-xs text-muted-foreground">Il y a 25 minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t">
                    <Button variant="outline" className="w-full" onClick={() => navigate("/notifications")}>
                      {t("app.common.viewAll")}
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                title={theme === "dark" ? t("app.common.lightMode") : t("app.common.darkMode")}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="font-semibold">
                    {languageOptions.find(lang => lang.value === language)?.flag}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languageOptions.map((lang) => (
                    <DropdownMenuItem 
                      key={lang.value}
                      className={cn(
                        "cursor-pointer", 
                        language === lang.value && "bg-accent"
                      )}
                      onClick={() => setLanguage(lang.value as any)}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Admin</p>
                      <p className="text-xs text-muted-foreground">admin@example.com</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    {t("app.common.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("app.common.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/help")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    {t("app.common.help")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("app.common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <footer className="border-t py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} SIGB. Tous droits réservés.
              </div>
              <div className="text-xs text-muted-foreground">Version 1.0.0</div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
