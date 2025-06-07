import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getMembers } from '@/lib/data';
import MembersClient from './members-client';

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <PermissionGuard permission="members.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Team Members' }]}>
        <MembersClient initialMembers={members} />
      </SidebarLayout>
    </PermissionGuard>
  );
}