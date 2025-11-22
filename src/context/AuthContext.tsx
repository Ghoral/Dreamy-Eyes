import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { supabaseClient } from "../service/supabase";
import { Session, User } from "@supabase/supabase-js";
import { appStore } from "../store";

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
  const { userData, setUserData } = appStore();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingUserDataRef = useRef(false);

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

        if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          // Clear user data on sign out
          setUserData(null);
        }
        // Don't load user data here - let the useEffect handle it
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    
    // Skip if already loading
    if (loadingUserDataRef.current) {
      return;
    }
    
    const loadRole = async () => {
      if (!userId) {
        // Clear user data if no session
        setUserData(null);
        loadingUserDataRef.current = false;
        return;
      }
      
      loadingUserDataRef.current = true;
      try {
        const { data } = await supabaseClient.rpc("get_current_user_data");
        // Always set user data when session exists
        // This ensures fresh data on login
        setUserData(data);
      } catch (e) {
        console.error("Error loading user data:", e);
        setUserData(null);
      } finally {
        loadingUserDataRef.current = false;
      }
    };
    
    // Load role whenever user ID changes
    loadRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        console.error("Error signing out", error);
        throw error;
      }

      // Clear all local state including user data
      setSession(null);
      setUser(null);
      setUserData(null); // Clear user data from store
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


