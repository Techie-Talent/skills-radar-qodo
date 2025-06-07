'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { hasPermission } from '@/lib/permissions';

interface Props {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export default function PermissionGuard({ children, permission, fallback = null }: Props) {
  const { data: session } = useSession();

  if (!session || !hasPermission(session, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}