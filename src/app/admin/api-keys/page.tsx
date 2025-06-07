import { Suspense } from 'react';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import ApiKeysClient from './api-keys-client';

export default function ApiKeysPage() {
  return (
    <PermissionGuard permission="admin.manage">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'API Keys' }]}>
        <ApiKeysClient />
      </SidebarLayout>
    </PermissionGuard>
  );
}