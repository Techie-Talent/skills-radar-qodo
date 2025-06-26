import { Suspense } from 'react';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import AdvancedFiltersClient from './advanced-filters-client';
import { prisma } from '@/lib/prisma';

async function getFilterData() {
  const [knowledgeAreas, skillCategories, skills, clients, memberCategories] = await Promise.all([
    prisma.knowledgeArea.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.skillCategory.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.skill.findMany({
      include: {
        knowledgeArea: true,
        category: true
      },
      orderBy: { name: 'asc' }
    }),
    prisma.member.findMany({
      select: { currentClient: true },
      where: { currentClient: { not: null } },
      distinct: ['currentClient'],
      orderBy: { currentClient: 'asc' }
    }),
    prisma.member.findMany({
      select: { category: true },
      where: { category: { not: null } },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    })
  ]);

  return {
    knowledgeAreas: knowledgeAreas.map(ka => ({
      id: ka.id,
      name: ka.name,
      description: ka.description || undefined
    })),
    skillCategories: skillCategories.map(sc => ({
      id: sc.id,
      name: sc.name,
      groupingCriteria: sc.groupingCriteria || undefined
    })),
    skills: skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      knowledgeArea: skill.knowledgeArea ? { name: skill.knowledgeArea.name } : undefined,
      category: skill.category ? { name: skill.category.name } : undefined
    })),
    clients: clients.map(c => c.currentClient).filter((client): client is string => Boolean(client)),
    memberCategories: memberCategories.map(c => c.category).filter((category): category is string => Boolean(category))
  };
}

export default async function AdvancedFiltersPage() {
  const filterData = await getFilterData();

  return (
    <PermissionGuard permission="dashboard.read">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Advanced Filters' }
      ]}>
        <Suspense fallback={<div>Loading...</div>}>
          <AdvancedFiltersClient filterData={filterData} />
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}