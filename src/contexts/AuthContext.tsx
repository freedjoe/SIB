
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: (callback?: () => void) => Promise<void>;
  isAdminUser: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    // Check if user is admin logged in
    const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (adminLoggedIn) {
      setIsAdminUser(true);
      setUser({ 
        id: "admin",
        email: "admin@example.com",
      } as User);
      setIsLoading(false);
      return;
    }

    // Set up Supabase auth listener and get initial session
    const setupAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
        }
      );

      // Get initial session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);

      return subscription;
    };

    let subscription: { unsubscribe: () => void };
    setupAuth().then(sub => {
      subscription = sub;
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signOut = async (callback?: () => void) => {
    if (isAdminUser) {
      localStorage.removeItem("adminLoggedIn");
      setIsAdminUser(false);
      setUser(null);
      if (callback) callback();
      return;
    }
    
    await supabase.auth.signOut();
    if (callback) callback();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut, isAdminUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
