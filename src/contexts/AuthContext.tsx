import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        setSession(null);
        setUser(null);
      }

      // Once we've handled the auth state, we're no longer loading
      setIsLoading(false);
    });

    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
      } catch (error: unknown) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "You have successfully signed in",
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("Error signing in:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sign in";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, userData: Record<string, unknown> = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Account created successfully. Check your email for verification.",
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("Error signing up:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };
  const signOut = async (): Promise<void> => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear localStorage items
      localStorage.clear();

      // Clear browser cache if supported
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        } catch (cacheError) {
          console.warn("Error clearing cache:", cacheError);
        }
      }

      toast({
        title: "Success",
        description: "You have been signed out",
      });

      // Redirect to login page
      window.location.href = "/auth";
    } catch (error: unknown) {
      console.error("Error signing out:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sign out";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Check your email for password reset instructions",
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("Error resetting password:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send password reset email";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your password has been updated",
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
