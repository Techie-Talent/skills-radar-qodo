import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft, Mail, Shield } from "lucide-react";

interface AuthErrorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

function getErrorMessage(error: string | undefined) {
  switch (error) {
    case "AccessDenied":
      return {
        title: "Access Denied",
        description:
          "Your Google Workspace domain is not authorized to access this application.",
        details: process.env.ALLOWED_EMAIL_DOMAIN
          ? `Only users from the ${process.env.ALLOWED_EMAIL_DOMAIN} Google Workspace organization can sign in.`
          : "Please contact your administrator for access.",
        icon: Shield,
      };
    case "Configuration":
      return {
        title: "Configuration Error",
        description:
          "There is a problem with the authentication configuration.",
        details: "Please contact the system administrator.",
        icon: AlertTriangle,
      };
    case "Verification":
      return {
        title: "Verification Error",
        description: "The verification token has expired or is invalid.",
        details: "Please try signing in again.",
        icon: Mail,
      };
    default:
      return {
        title: "Authentication Error",
        description: "An error occurred during authentication.",
        details: "Please try again or contact support if the problem persists.",
        icon: AlertTriangle,
      };
  }
}

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const { error } = await searchParams;
  const errorInfo = getErrorMessage(error);
  const IconComponent = errorInfo.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <IconComponent className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">
            Unable to complete sign-in process
          </p>
        </div>

        {/* Error Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <IconComponent className="h-5 w-5" />
              {errorInfo.title}
            </CardTitle>
            <CardDescription>{errorInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorInfo.details}</AlertDescription>
            </Alert>

            {error === "AccessDenied" && process.env.ALLOWED_EMAIL_DOMAIN && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">
                  Authorized Google Workspace
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This application is restricted to users from the{" "}
                  <code className="bg-background px-1 py-0.5 rounded text-xs">
                    {process.env.ALLOWED_EMAIL_DOMAIN}
                  </code>{" "}
                  Google Workspace organization.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    • Google Workspace accounts from{" "}
                    {process.env.ALLOWED_EMAIL_DOMAIN} are allowed
                  </p>
                  <p>• Personal Gmail accounts are not permitted</p>
                  <p>• Contact your administrator if you need access</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium">What you can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {error === "AccessDenied" ? (
                  <>
                    <li>
                      • Use your Google Workspace account from the authorized
                      domain
                    </li>
                    <li>• Contact your system administrator for access</li>
                    <li>
                      • Verify you&apos;re signing in with the correct Google
                      account
                    </li>
                  </>
                ) : (
                  <>
                    <li>• Try signing in again</li>
                    <li>• Clear your browser cache and cookies</li>
                    <li>• Contact support if the problem persists</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/api/auth/signin">Try Again</Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && error && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted p-2 rounded block">
                Error: {error}
              </code>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
