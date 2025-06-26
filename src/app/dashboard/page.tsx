import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getMembers, getKnowledgeAreas, getSkills, getMemberSkills, getSkillCategories } from '@/lib/data';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const [membersRaw, knowledgeAreas, skills, memberSkills, skillCategories] = await Promise.all([
    getMembers(),
    getKnowledgeAreas(),
    getSkills(),
    getMemberSkills(),
    getSkillCategories(),
  ]);

  // Transform members data to match the expected interface
  const members = membersRaw.map(member => ({
    ...member,
    hireDate: member.hireDate ? member.hireDate.toISOString() : new Date().toISOString(),
    category: member.category || 'Unknown',
  }));

  // Transform memberSkills data to match the expected interface
  const transformedMemberSkills = memberSkills.map(memberSkill => ({
    ...memberSkill,
    member: {
      ...memberSkill.member,
      hireDate: memberSkill.member.hireDate ? memberSkill.member.hireDate.toISOString() : new Date().toISOString(),
      category: memberSkill.member.category || 'Unknown',
      profile: null, // Add the required profile field
    }
  }));

  return (
    <PermissionGuard permission="dashboard.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Analytics Dashboard' }]}>
        <DashboardClient 
          members={members}
          knowledgeAreas={knowledgeAreas}
          skills={skills}
          memberSkills={transformedMemberSkills}
          skillCategories={skillCategories}
        />
      </SidebarLayout>
    </PermissionGuard>
  );
}