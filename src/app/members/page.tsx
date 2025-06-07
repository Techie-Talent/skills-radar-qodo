import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getMembers, getKnowledgeAreas, getSkills } from '@/lib/data';
import MembersClient from './members-client';

export default async function MembersPage() {
  const [members, knowledgeAreas, skills] = await Promise.all([
    getMembers(),
    getKnowledgeAreas(),
    getSkills(),
  ]);

  return (
    <PermissionGuard permission="members.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Member Management' }]}>
        <MembersClient 
          members={members}
          knowledgeAreas={knowledgeAreas}
          skills={skills}
        />
      </SidebarLayout>
    </PermissionGuard>
  );
}