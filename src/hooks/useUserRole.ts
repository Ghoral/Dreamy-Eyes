import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseClient } from '../service/supabase';

/**
 * A hook that provides the current user's role and helper functions to check permissions.
 * 
 * @returns An object containing the user's role and helper functions
 */
export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        if (!user?.id) {
          setRole(null);
          return;
        }
        
        const { data } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
          
        setRole((data as any)?.role ?? null);
      } catch (e) {
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadRole();
  }, [user?.id]);

  /**
   * Check if the current user has the specified role
   * 
   * @param requiredRole - The role to check against
   * @returns boolean indicating if the user has the required role
   */
  const hasRole = (requiredRole: string): boolean => {
    return role === requiredRole;
  };

  /**
   * Check if the current user is a super admin
   * 
   * @returns boolean indicating if the user is a super admin
   */
  const isSuperAdmin = (): boolean => {
    return role === 'super_admin';
  };

  return {
    role,
    loading,
    hasRole,
    isSuperAdmin
  };
}