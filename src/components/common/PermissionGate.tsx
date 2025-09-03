import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabaseClient } from '../../service/supabase';

interface PermissionGateProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on the user's role.
 * 
 * @param children - The content to render if the user has the required role
 * @param requiredRole - The role required to view the content (defaults to "super_admin")
 * @param fallback - Optional content to render if the user doesn't have the required role
 */
export default function PermissionGate({ 
  children, 
  requiredRole = 'super_admin',
  fallback = null 
}: PermissionGateProps) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        if (!user?.id) {
          setUserRole(null);
          return;
        }
        
        const { data } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
          
        setUserRole((data as any)?.role ?? null);
      } catch (e) {
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadRole();
  }, [user?.id]);

  // While loading, render nothing
  if (loading) return null;
  
  // If user has the required role, render children
  if (userRole === requiredRole) {
    return <>{children}</>;
  }
  
  // Otherwise render fallback or null
  return <>{fallback}</>;
}