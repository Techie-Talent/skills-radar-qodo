import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getKnowledgeAreas } from '@/lib/data';
import KnowledgeAreasClient from './knowledge-areas-client';

export default async function KnowledgeAreasPage() {
  const knowledgeAreas = await getKnowledgeAreas();

  return (
    <PermissionGuard permission="knowledge_areas.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Knowledge Areas' }]}>
        <KnowledgeAreasClient initialKnowledgeAreas={knowledgeAreas} />
      </SidebarLayout>
    </PermissionGuard>
  );
}