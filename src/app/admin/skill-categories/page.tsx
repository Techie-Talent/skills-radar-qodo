import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getSkillCategories } from '@/lib/data';
import SkillCategoriesClient from './skill-categories-client';

export default async function SkillCategoriesPage() {
  const skillCategories = await getSkillCategories();

  return (
    <PermissionGuard permission="skill_categories.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Skill Categories' }]}>
        <SkillCategoriesClient initialSkillCategories={skillCategories} />
      </SidebarLayout>
    </PermissionGuard>
  );
}