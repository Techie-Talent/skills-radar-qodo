import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { AdminPageSkeleton } from '@/components/ui/skeletons';

export default function SkillCategoriesLoading() {
  return (
    <PermissionGuard permission="skill_categories.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Skill Categories' }]}>
        <AdminPageSkeleton />
      </SidebarLayout>
    </PermissionGuard>
  );
}