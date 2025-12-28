// src/hooks/use-auth.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { RoleName } from "@/core/domain/identity/Role";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: RoleName[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: RoleName) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<RoleName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Defer role fetching with setTimeout to prevent deadlock
      if (session?.user) {
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 0);
      } else {
        setRoles([]);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to fetch user roles:", error);
        return;
      }

      if (data) {
        setRoles(data.map((row) => row.role as RoleName));
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Wait for roles to be fetched
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setRoles([]);
    navigate("/login");
  };

  const hasRole = (role: RoleName): boolean => {
    return roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        isLoading,
        signIn,
        signOut,
        hasRole,
      }}
    >
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
