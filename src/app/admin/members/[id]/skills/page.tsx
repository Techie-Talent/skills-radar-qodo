import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { prisma } from '@/lib/prisma';
import MemberSkillsClient from './member-skills-client';

async function getMemberWithSkills(id: string) {
  const member = await prisma.member.findUnique({
    where: { id: parseInt(id) },
    include: {
      skills: {
        include: {
          skill: {
            include: {
              knowledgeArea: true,
              category: true,
              scale: true,
            },
          },
        },
        orderBy: [
          { skill: { knowledgeArea: { name: 'asc' } } },
          { skill: { name: 'asc' } },
        ],
      },
    },
  });

  if (!member) {
    notFound();
  }

  return member;
}

async function getAvailableSkills() {
  return await prisma.skill.findMany({
    include: {
      knowledgeArea: true,
      category: true,
      scale: true,
    },
    orderBy: [
      { knowledgeArea: { name: 'asc' } },
      { category: { name: 'asc' } },
      { name: 'asc' },
    ],
  });
}

async function getKnowledgeAreas() {
  return await prisma.knowledgeArea.findMany({
    orderBy: { name: 'asc' },
  });
}

async function getSkillCategories() {
  return await prisma.skillCategory.findMany({
    orderBy: { name: 'asc' },
  });
}

export default async function MemberSkillsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member, availableSkills, knowledgeAreas, skillCategories] = await Promise.all([
    getMemberWithSkills(id),
    getAvailableSkills(),
    getKnowledgeAreas(),
    getSkillCategories(),
  ]);

  return (
    <PermissionGuard permission="members.write">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Team Members', href: '/members/talent-search' },
        { label: member.fullName || member.email, href: `/admin/members/${member.id}` },
        { label: 'Skills' }
      ]}>
        <Suspense fallback={<div>Loading...</div>}>
          <MemberSkillsClient
            member={member}
            availableSkills={availableSkills}
            knowledgeAreas={knowledgeAreas}
            skillCategories={skillCategories}
          />
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}