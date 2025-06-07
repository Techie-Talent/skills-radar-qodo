import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getSkills, getKnowledgeAreas, getSkillCategories, getScales } from '@/lib/data';
import SkillsClient from './skills-client';

export default async function SkillsPage() {
  const [skills, knowledgeAreas, skillCategories, scales] = await Promise.all([
    getSkills(),
    getKnowledgeAreas(),
    getSkillCategories(),
    getScales(),
  ]);

  return (
    <PermissionGuard permission="skills.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Skills' }]}>
        <SkillsClient 
          initialSkills={skills}
          knowledgeAreas={knowledgeAreas}
          skillCategories={skillCategories}
          scales={scales}
        />
      </SidebarLayout>
    </PermissionGuard>
  );
}