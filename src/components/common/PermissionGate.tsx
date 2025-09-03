import React from 'react';
import { useUserRole, UserRole } from '../../hooks/useUserRole';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on the user's role.
 * If the user's role matches the required role, the children are rendered.
 * Otherwise, the fallback is rendered, or null if no fallback is provided.
 */
export default function PermissionGate({
  children,
  requiredRole = 'super_admin',
  fallback = null,
}: PermissionGateProps) {
  const { role, loading } = useUserRole();

  // If still loading, don't render anything
  if (loading) {
    return null;
  }

  // If the user's role matches the required role, render the children
  if (role === requiredRole) {
    return <>{children}</>;
  }

  // Otherwise, render the fallback or null
  return <>{fallback}</>;
}