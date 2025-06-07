import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getMembers, getKnowledgeAreas, getSkills, getMemberSkills, getSkillCategories } from '@/lib/data';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const [members, knowledgeAreas, skills, memberSkills, skillCategories] = await Promise.all([
    getMembers(),
    getKnowledgeAreas(),
    getSkills(),
    getMemberSkills(),
    getSkillCategories(),
  ]);

  return (
    <PermissionGuard permission="dashboard.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Analytics Dashboard' }]}>
        <DashboardClient 
          members={members}
          knowledgeAreas={knowledgeAreas}
          skills={skills}
          memberSkills={memberSkills}
          skillCategories={skillCategories}
        />
      </SidebarLayout>
    </PermissionGuard>
  );
}