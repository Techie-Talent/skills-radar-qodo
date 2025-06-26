import { Suspense } from 'react';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { prisma } from '@/lib/prisma';
import ImportsClient from './imports-client';
import ImportsLoading from './loading';

async function getImportStats() {
  const [totalMembers, membersWithProfiles, totalSkills, memberSkillsCount] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({
      where: {
        profile: {
          isNot: null,
        },
      },
    }),
    prisma.skill.count(),
    prisma.memberSkill.count(),
  ]);

  return {
    totalMembers,
    membersWithProfiles,
    membersWithoutProfiles: totalMembers - membersWithProfiles,
    totalSkills,
    memberSkillsCount,
  };
}

export default async function ImportsPage() {
  const importStats = await getImportStats();

  return (
    <PermissionGuard permission="members.write">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Data Imports' }
      ]}>
        <Suspense fallback={<ImportsLoading />}>
          <ImportsClient importStats={importStats} />
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}