import React from 'react';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RoleGuardProps {
  requiredRole: AppRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAccessDenied?: () => void;
}

const AccessDenied: React.FC<{ onBack?: () => void }> = ({ onBack }) => (
  <div className="max-w-md mx-auto px-4 py-16">
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle>Access Denied</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          You don't have permission to access this section.
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRole,
  children,
  fallback,
  onAccessDenied
}) => {
  const { hasRole, isLoading } = useUserRoles();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasRole(requiredRole)) {
    return fallback || <AccessDenied onBack={onAccessDenied} />;
  }

  return <>{children}</>;
};

export default RoleGuard;
