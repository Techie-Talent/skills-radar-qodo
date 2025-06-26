import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { prisma } from '@/lib/prisma';
import MemberProfileClient from './member-profile-client';
import MemberProfileLoading from './loading';

async function getMemberWithProfile(id: string) {
  const member = await prisma.member.findUnique({
    where: { id: parseInt(id) },
    include: {
      profile: true,
    },
  });

  if (!member) {
    notFound();
  }

  return member;
}

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMemberWithProfile(id);

  return (
    <PermissionGuard permission="members.write">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Team Members', href: '/members/talent-search' },
        { label: member.fullName || member.email, href: `/admin/members/${member.id}` },
        { label: 'Profile' }
      ]}>
        <Suspense fallback={<MemberProfileLoading />}>
          <MemberProfileClient member={member} />
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}