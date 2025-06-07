import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { AdminPageSkeleton } from '@/components/ui/skeletons';

export default function KnowledgeAreasLoading() {
  return (
    <PermissionGuard permission="knowledge_areas.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Knowledge Areas' }]}>
        <AdminPageSkeleton />
      </SidebarLayout>
    </PermissionGuard>
  );
}