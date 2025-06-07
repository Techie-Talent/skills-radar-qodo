import { prisma } from '@/lib/prisma';

export async function getMembers() {
  try {
    const members = await prisma.member.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
    return members;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw new Error('Failed to fetch members');
  }
}

export async function getKnowledgeAreas() {
  try {
    const knowledgeAreas = await prisma.knowledgeArea.findMany({
      include: {
        skills: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return knowledgeAreas;
  } catch (error) {
    console.error('Error fetching knowledge areas:', error);
    throw new Error('Failed to fetch knowledge areas');
  }
}

export async function getSkills() {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        knowledgeArea: true,
        category: true,
        scale: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return skills;
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw new Error('Failed to fetch skills');
  }
}

export async function getSkillCategories() {
  try {
    const skillCategories = await prisma.skillCategory.findMany({
      include: {
        skills: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return skillCategories;
  } catch (error) {
    console.error('Error fetching skill categories:', error);
    throw new Error('Failed to fetch skill categories');
  }
}

export async function getScales() {
  try {
    const scales = await prisma.scale.findMany({
      include: {
        skills: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return scales;
  } catch (error) {
    console.error('Error fetching scales:', error);
    throw new Error('Failed to fetch scales');
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function getRoles() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw new Error('Failed to fetch roles');
  }
}

export async function getPermissions() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return permissions;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw new Error('Failed to fetch permissions');
  }
}

export async function getMembersWithSkills() {
  try {
    const members = await prisma.member.findMany({
      include: {
        profile: true,
        skills: {
          include: {
            skill: {
              include: {
                knowledgeArea: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        fullName: 'asc',
      },
    });
    return members;
  } catch (error) {
    console.error('Error fetching members with skills:', error);
    throw new Error('Failed to fetch members with skills');
  }
}

export async function getMemberSkills() {
  try {
    const memberSkills = await prisma.memberSkill.findMany({
      include: {
        member: true,
        skill: {
          include: {
            knowledgeArea: true,
            category: true,
          },
        },
      },
    });
    return memberSkills;
  } catch (error) {
    console.error('Error fetching member skills:', error);
    throw new Error('Failed to fetch member skills');
  }
}