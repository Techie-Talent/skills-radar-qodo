import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMcpRequest, createSuccessResponse, createErrorResponse } from '@/lib/mcp-auth';

export async function GET(request: NextRequest) {
  // Authenticate the request
  const auth = await authenticateMcpRequest(request, 'dashboards:read');
  if (!auth.success) {
    return auth.response;
  }

  try {
    // Get basic counts
    const [
      totalMembers,
      totalSkills,
      totalKnowledgeAreas,
      totalSkillCategories,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.skill.count(),
      prisma.knowledgeArea.count(),
      prisma.skillCategory.count(),
    ]);

    // Get members by knowledge area
    const membersByKnowledgeArea = await prisma.knowledgeArea.findMany({
      include: {
        skills: {
          include: {
            members: {
              distinct: ['memberId'],
              select: {
                memberId: true,
              },
            },
          },
        },
      },
    });

    const knowledgeAreaStats = membersByKnowledgeArea.map((ka) => {
      const uniqueMemberIds = new Set();
      ka.skills.forEach((skill) => {
        skill.members.forEach((member) => {
          uniqueMemberIds.add(member.memberId);
        });
      });

      return {
        knowledge_area_id: ka.id,
        knowledge_area_name: ka.name,
        knowledge_area_description: ka.description,
        unique_members_count: uniqueMemberIds.size,
        skills_count: ka.skills.length,
      };
    });

    // Get members by skill category
    const membersBySkillCategory = await prisma.skillCategory.findMany({
      include: {
        skills: {
          include: {
            members: {
              distinct: ['memberId'],
              select: {
                memberId: true,
              },
            },
          },
        },
      },
    });

    const skillCategoryStats = membersBySkillCategory.map((category) => {
      const uniqueMemberIds = new Set();
      category.skills.forEach((skill) => {
        skill.members.forEach((member) => {
          uniqueMemberIds.add(member.memberId);
        });
      });

      return {
        category_id: category.id,
        category_name: category.name,
        grouping_criteria: category.groupingCriteria,
        unique_members_count: uniqueMemberIds.size,
        skills_count: category.skills.length,
      };
    });

    // Get members by client
    const membersByClient = await prisma.member.groupBy({
      by: ['currentClient'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const clientStats = membersByClient.map((client) => ({
      client_name: client.currentClient || 'Unassigned',
      members_count: client._count.id,
    }));

    // Get members by category
    const membersByCategory = await prisma.member.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const categoryStats = membersByCategory.map((cat) => ({
      member_category: cat.category || 'Uncategorized',
      members_count: cat._count.id,
    }));

    // Get expertise level distribution
    const expertiseLevelDistribution = await prisma.memberSkill.groupBy({
      by: ['expertiseLevel'],
      _count: {
        id: true,
      },
      orderBy: {
        expertiseLevel: 'asc',
      },
    });

    const expertiseStats = expertiseLevelDistribution.map((level) => ({
      expertise_level: level.expertiseLevel,
      skill_assessments_count: level._count.id,
    }));

    // Get top skills by member count
    const topSkillsByMemberCount = await prisma.skill.findMany({
      include: {
        members: {
          select: {
            memberId: true,
          },
        },
        knowledgeArea: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        members: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const topSkillsStats = topSkillsByMemberCount.map((skill) => ({
      skill_id: skill.id,
      skill_name: skill.name,
      knowledge_area: skill.knowledgeArea?.name,
      category: skill.category?.name,
      members_count: skill.members.length,
    }));

    // Get recent skill assessments
    const recentAssessments = await prisma.memberSkill.findMany({
      where: {
        assessmentDate: {
          not: null,
        },
      },
      include: {
        member: {
          select: {
            fullName: true,
            email: true,
          },
        },
        skill: {
          select: {
            name: true,
            knowledgeArea: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        assessmentDate: 'desc',
      },
      take: 20,
    });

    const recentAssessmentStats = recentAssessments.map((assessment) => ({
      member_name: assessment.member.fullName,
      member_email: assessment.member.email,
      skill_name: assessment.skill.name,
      knowledge_area: assessment.skill.knowledgeArea?.name,
      expertise_level: assessment.expertiseLevel,
      assessment_date: assessment.assessmentDate,
    }));

    const summary = {
      overview: {
        total_members: totalMembers,
        total_skills: totalSkills,
        total_knowledge_areas: totalKnowledgeAreas,
        total_skill_categories: totalSkillCategories,
        total_skill_assessments: expertiseLevelDistribution.reduce((sum, level) => sum + level._count.id, 0),
      },
      members_by_knowledge_area: knowledgeAreaStats,
      members_by_skill_category: skillCategoryStats,
      members_by_client: clientStats,
      members_by_category: categoryStats,
      expertise_level_distribution: expertiseStats,
      top_skills_by_member_count: topSkillsStats,
      recent_skill_assessments: recentAssessmentStats,
    };

    const metadata = {
      generated_at: new Date().toISOString(),
      data_freshness: 'real-time',
      summary_includes: [
        'overview_counts',
        'knowledge_area_breakdown',
        'skill_category_breakdown',
        'client_distribution',
        'member_category_distribution',
        'expertise_level_distribution',
        'top_skills_ranking',
        'recent_assessments',
      ],
    };

    return createSuccessResponse(summary, metadata);
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    return createErrorResponse('Internal server error', 500);
  }
}