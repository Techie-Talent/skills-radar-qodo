import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMcpRequest, createSuccessResponse, createErrorResponse } from '@/lib/mcp-auth';

export async function GET(request: NextRequest) {
  // Authenticate the request
  const auth = await authenticateMcpRequest(request, 'skills:read');
  if (!auth.success) {
    return auth.response;
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const knowledgeAreaId = searchParams.get('knowledge_area_id');
    const categoryId = searchParams.get('category_id');
    const includeMembers = searchParams.get('include_members') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (knowledgeAreaId) {
      where.knowledgeAreaId = parseInt(knowledgeAreaId);
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // Get total count
    const totalCount = await prisma.skill.count({ where });

    // Fetch skills with related data
    const skills = await prisma.skill.findMany({
      where,
      include: {
        knowledgeArea: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            groupingCriteria: true,
          },
        },
        scale: {
          select: {
            id: true,
            name: true,
            type: true,
            values: true,
          },
        },
        ...(includeMembers && {
          members: {
            include: {
              member: {
                select: {
                  id: true,
                  email: true,
                  fullName: true,
                  currentClient: true,
                  category: true,
                },
              },
            },
          },
        }),
      },
      orderBy: [
        { knowledgeArea: { name: 'asc' } },
        { category: { name: 'asc' } },
        { name: 'asc' },
      ],
      take: limit,
      skip: offset,
    });

    // Transform data for LLM consumption
    const transformedSkills = skills.map((skill) => {
      const baseData = {
        skill_id: skill.id,
        skill_name: skill.name,
        skill_purpose: skill.purpose,
        knowledge_area: skill.knowledgeArea ? {
          id: skill.knowledgeArea.id,
          name: skill.knowledgeArea.name,
          description: skill.knowledgeArea.description,
        } : null,
        category: skill.category ? {
          id: skill.category.id,
          name: skill.category.name,
          grouping_criteria: skill.category.groupingCriteria,
        } : null,
        scale: skill.scale ? {
          id: skill.scale.id,
          name: skill.scale.name,
          type: skill.scale.type,
          values: skill.scale.values.split(',').map(v => v.trim()),
        } : null,
      };

      // Add members data if requested and available
      if (includeMembers && 'members' in skill && skill.members) {
        const membersData = skill.members.map((memberSkill) => {
          // Type assertion since we know member is included when includeMembers is true
          const memberWithRelations = memberSkill as typeof memberSkill & {
            member: {
              id: number;
              email: string;
              fullName: string;
              currentClient: string | null;
              category: string | null;
            };
          };
          
          return {
            member_id: memberWithRelations.member.id,
            member_name: memberWithRelations.member.fullName,
            member_email: memberWithRelations.member.email,
            current_client: memberWithRelations.member.currentClient,
            member_category: memberWithRelations.member.category,
            expertise_level: memberSkill.expertiseLevel,
            expertise_description: memberSkill.expertiseDescription,
            assessment_date: memberSkill.assessmentDate,
          };
        });

        Object.assign(baseData, {
          member_count: skill.members.length,
          members: membersData,
        });
      }

      return baseData;
    });

    const metadata = {
      total_count: totalCount,
      returned_count: transformedSkills.length,
      limit,
      offset,
      has_more: offset + limit < totalCount,
      filters_applied: {
        knowledge_area_id: knowledgeAreaId,
        category_id: categoryId,
        include_members: includeMembers,
      },
    };

    return createSuccessResponse(transformedSkills, metadata);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return createErrorResponse('Internal server error', 500);
  }
}