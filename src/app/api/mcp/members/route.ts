import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMcpRequest, createSuccessResponse, createErrorResponse } from '@/lib/mcp-auth';

export async function GET(request: NextRequest) {
  // Authenticate the request
  const auth = await authenticateMcpRequest(request, 'members:read');
  if (!auth.success) {
    return auth.response;
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const knowledgeAreaId = searchParams.get('knowledge_area_id');
    const skillId = searchParams.get('skill_id');
    const currentClient = searchParams.get('current_client');
    const category = searchParams.get('category');
    const minExpertiseLevel = searchParams.get('min_expertise_level');
    const includeSkills = searchParams.get('include_skills') === 'true';
    const includeProfile = searchParams.get('include_profile') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for members
    const where: any = {};
    if (currentClient) {
      where.currentClient = currentClient;
    }
    if (category) {
      where.category = category;
    }

    // If filtering by knowledge area or skill, we need to join through skills
    if (knowledgeAreaId || skillId || minExpertiseLevel) {
      where.skills = {
        some: {
          ...(skillId && { skillId: parseInt(skillId) }),
          ...(minExpertiseLevel && { expertiseLevel: { gte: parseInt(minExpertiseLevel) } }),
          ...(knowledgeAreaId && {
            skill: {
              knowledgeAreaId: parseInt(knowledgeAreaId),
            },
          }),
        },
      };
    }

    // Get total count
    const totalCount = await prisma.member.count({ where });

    // Fetch members with related data
    const members = await prisma.member.findMany({
      where,
      include: {
        ...(includeSkills && {
          skills: {
            include: {
              skill: {
                include: {
                  knowledgeArea: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              { skill: { knowledgeArea: { name: 'asc' } } },
              { skill: { name: 'asc' } },
            ],
          },
        }),
        ...(includeProfile && {
          profile: true,
        }),
      },
      orderBy: [
        { fullName: 'asc' },
        { email: 'asc' },
      ],
      take: limit,
      skip: offset,
    });

    // Transform data for LLM consumption
    const transformedMembers = members.map((member) => ({
      member_id: member.id,
      email: member.email,
      full_name: member.fullName,
      hire_date: member.hireDate,
      current_client: member.currentClient,
      category: member.category,
      location: member.location,
      ...(includeSkills && {
        skills_count: member.skills?.length || 0,
        skills: member.skills?.map((memberSkill) => ({
          skill_id: memberSkill.skill.id,
          skill_name: memberSkill.skill.name,
          skill_purpose: memberSkill.skill.purpose,
          knowledge_area: memberSkill.skill.knowledgeArea ? {
            id: memberSkill.skill.knowledgeArea.id,
            name: memberSkill.skill.knowledgeArea.name,
          } : null,
          category: memberSkill.skill.category ? {
            id: memberSkill.skill.category.id,
            name: memberSkill.skill.category.name,
          } : null,
          expertise_level: memberSkill.expertiseLevel,
          expertise_description: memberSkill.expertiseDescription,
          assessment_date: memberSkill.assessmentDate,
        })) || [],
        // Group skills by knowledge area for easier consumption
        skills_by_knowledge_area: member.skills?.reduce((acc, memberSkill) => {
          const kaName = memberSkill.skill.knowledgeArea?.name || 'Uncategorized';
          if (!acc[kaName]) {
            acc[kaName] = [];
          }
          acc[kaName].push({
            skill_name: memberSkill.skill.name,
            expertise_level: memberSkill.expertiseLevel,
            expertise_description: memberSkill.expertiseDescription,
          });
          return acc;
        }, {} as Record<string, any[]>) || {},
      }),
      ...(includeProfile && member.profile && {
        profile: {
          assignments: member.profile.assignments,
          team_roles: member.profile.teamRoles,
          client_appreciations: member.profile.clientAppreciations,
          feedback: member.profile.feedback,
          talent_pool_periods: member.profile.talentPoolPeriods,
        },
      }),
    }));

    const metadata = {
      total_count: totalCount,
      returned_count: transformedMembers.length,
      limit,
      offset,
      has_more: offset + limit < totalCount,
      filters_applied: {
        knowledge_area_id: knowledgeAreaId,
        skill_id: skillId,
        current_client: currentClient,
        category: category,
        min_expertise_level: minExpertiseLevel,
        include_skills: includeSkills,
        include_profile: includeProfile,
      },
    };

    return createSuccessResponse(transformedMembers, metadata);
  } catch (error) {
    console.error('Error fetching members:', error);
    return createErrorResponse('Internal server error', 500);
  }
}