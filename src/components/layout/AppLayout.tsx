
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MainNav } from "@/components/navigation/MainNav";

export function AppLayout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <MainNav />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/90 backdrop-blur-sm px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              {/* Profile, notifications, etc. can be added here */}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <footer className="border-t py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Budget ERP. Tous droits réservés.
              </div>
              <div className="text-xs text-muted-foreground">Version 1.0.0</div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
