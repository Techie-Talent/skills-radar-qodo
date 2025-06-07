import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getScales } from '@/lib/data';
import ScalesClient from './scales-client';

export default async function ScalesPage() {
  const scales = await getScales();

  return (
    <PermissionGuard permission="scales.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Scales' }]}>
        <ScalesClient initialScales={scales} />
      </SidebarLayout>
    </PermissionGuard>
  );
}