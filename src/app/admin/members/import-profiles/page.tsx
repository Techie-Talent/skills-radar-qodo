import { Suspense } from 'react';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { prisma } from '@/lib/prisma';
import ImportProfilesClient from './import-profiles-client';
import ImportProfilesLoading from './loading';

async function getMemberStats() {
  const [totalMembers, membersWithProfiles, membersWithoutProfiles] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({
      where: {
        profile: {
          isNot: null,
        },
      },
    }),
    prisma.member.count({
      where: {
        profile: null,
      },
    }),
  ]);

  return {
    totalMembers,
    membersWithProfiles,
    membersWithoutProfiles,
  };
}

export default async function ImportProfilesPage() {
  const memberStats = await getMemberStats();

  return (
    <PermissionGuard permission="members.write">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Data Imports', href: '/admin/imports' },
        { label: 'Import Profiles' }
      ]}>
        <Suspense fallback={<ImportProfilesLoading />}>
          <ImportProfilesClient memberStats={memberStats} />
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}