import { Suspense } from 'react';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import NewMemberClient from './new-member-client';
import NewMemberLoading from './loading';

export default function NewMemberPage() {
  return (
    <PermissionGuard permission="members.write">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Team Members', href: '/members/talent-search' },
        { label: 'Add Member' }
      ]}>
        <Suspense fallback={<NewMemberLoading />}>
          <NewMemberClient />
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}