import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getMembers, getKnowledgeAreas, getSkillCategories, getSkills } from '@/lib/data';
import TalentSearchClient from './talent-search-client';

export default async function TalentSearchPage() {
  const [members, knowledgeAreas, skillCategories, skills] = await Promise.all([
    getMembers(),
    getKnowledgeAreas(),
    getSkillCategories(),
    getSkills(),
  ]);

  return (
    <PermissionGuard permission="members.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Team Members' }]}>
        <TalentSearchClient 
          members={members}
          knowledgeAreas={knowledgeAreas}
          skillCategories={skillCategories}
          skills={skills}
        />
      </SidebarLayout>
    </PermissionGuard>
  );
}