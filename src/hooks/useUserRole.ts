import { useState } from "react";
import { appStore } from "../store";

/**
 * A hook that provides the current user's role and helper functions to check permissions.
 *
 * @returns An object containing the user's role and helper functions
 */
export function useUserRole() {
  const { userData } = appStore();
  const role = userData?.role || "user";
  const [loading, setLoading] = useState(true);

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
    return role === "super_admin";
  };

  return {
    role,
    loading,
    hasRole,
    isSuperAdmin,
  };
}