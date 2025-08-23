import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabaseClient } from "../service/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error("Error checking session", error);
        }
        
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      } catch (error) {
        console.error("Error in checkSession", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for future auth state changes
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        console.error("Error signing out", error);
        throw error;
      }
      
      // Clear local state
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Error in signOut", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


