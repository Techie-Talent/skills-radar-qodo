'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { hasPermission } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SignInButton from './sign-in-button';

interface Props {
  children: ReactNode;
  permission?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, permission, fallback }: Props) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access this page.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignInButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permission && !hasPermission(session, permission)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Required permission: <Badge variant="outline">{permission}</Badge>
              </AlertDescription>
            </Alert>
            {fallback}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}