"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Member {
  id: number;
  email: string;
  fullName: string | null;
  hireDate: string;
  currentClient: string | null;
  category: string;
  location: string | null;
  profile: any | null;
}

interface KnowledgeArea {
  id: number;
  name: string;
  skills: any[];
}

interface Skill {
  id: number;
  name: string;
  knowledgeArea: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
}

interface MemberSkill {
  id: number;
  expertiseLevel: number | null;
  expertiseDescription: string | null;
  member: Member;
  skill: {
    id: number;
    name: string;
    knowledgeArea: { id: number; name: string } | null;
    category: { id: number; name: string } | null;
  };
}

interface SkillCategory {
  id: number;
  name: string;
  skills: any[];
}

interface DashboardClientProps {
  members: Member[];
  knowledgeAreas: KnowledgeArea[];
  skills: Skill[];
  memberSkills: MemberSkill[];
  skillCategories: SkillCategory[];
}

export default function DashboardClient({
  members,
  knowledgeAreas,
  skills,
  memberSkills,
  skillCategories,
}: DashboardClientProps) {
  // Chart type state
  const [chartTypes, setChartTypes] = useState({
    categoryDistribution: 'bar' as 'bar' | 'pie',
    skillsByKnowledgeArea: 'bar' as 'bar' | 'pie',
    expertiseLevel: 'bar' as 'bar' | 'pie',
    clientDistribution: 'bar' as 'bar' | 'pie',
    memberCategoriesByClient: 'bar' as 'bar' | 'pie',
  });

  const toggleChartType = (chartName: keyof typeof chartTypes) => {
    setChartTypes(prev => ({
      ...prev,
      [chartName]: prev[chartName] === 'bar' ? 'pie' : 'bar'
    }));
  };

  // Calculate analytics data
  const totalMembers = members.length;
  const totalSkills = skills.length;
  const totalKnowledgeAreas = knowledgeAreas.length;
  const activeClients = [
    ...new Set(members.map((m) => m.currentClient).filter(Boolean)),
  ].length;

  // Member category distribution
  const categoryDistribution = members.reduce((acc, member) => {
    acc[member.category] = (acc[member.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Skills by knowledge area
  const skillsByKnowledgeArea = knowledgeAreas.map((area) => ({
    name: area.name,
    count: area.skills.length,
  }));

  // Skills by category
  const skillsByCategoryData = skillCategories.map((category) => ({
    name: category.name,
    count: category.skills.length,
  }));

  // Expertise level distribution
  const expertiseLevelDistribution = memberSkills.reduce((acc, ms) => {
    if (ms.expertiseLevel) {
      acc[ms.expertiseLevel] = (acc[ms.expertiseLevel] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  // Top skills by member count
  const skillMemberCount = memberSkills.reduce((acc, ms) => {
    acc[ms.skill.name] = (acc[ms.skill.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSkills = Object.entries(skillMemberCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  // Client distribution
  const clientDistribution = members.reduce((acc, member) => {
    if (member.currentClient) {
      acc[member.currentClient] = (acc[member.currentClient] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Hire date trends (by year)
  const hireTrends = members.reduce((acc, member) => {
    const year = new Date(member.hireDate).getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Helper functions for colors (defined before use)
  const getCategoryColor = (category: string) => {
    const colors = {
      Starter: "#10b981", // green
      Builder: "#3b82f6", // blue
      Solver: "#8b5cf6", // purple
      Wizard: "#f59e0b", // yellow
    };
    return colors[category as keyof typeof colors] || "#6b7280";
  };

  const getExpertiseColor = (level: number) => {
    const colors = {
      1: "#ef4444", // red
      2: "#f97316", // orange
      3: "#eab308", // yellow
      4: "#22c55e", // green
    };
    return colors[level as keyof typeof colors] || "#6b7280";
  };

  // Member categories by client
  const memberCategoriesByClient = members
    .filter(member => member.currentClient && member.category)
    .reduce((acc, member) => {
      const client = member.currentClient!;
      const category = member.category!;
      
      if (!acc[client]) {
        acc[client] = {};
      }
      acc[client][category] = (acc[client][category] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);

  // Transform data for charts
  const categoryDistributionData = Object.entries(categoryDistribution).map(([category, count]) => ({
    name: category,
    value: count,
    color: getCategoryColor(category),
  }));

  const skillsByKnowledgeAreaData = skillsByKnowledgeArea.map((area, index) => ({
    name: area.name,
    value: area.count,
    color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
  }));

  const expertiseLevelData = Object.entries(expertiseLevelDistribution).map(([level, count]) => {
    const levelNames = {
      1: "Beginner",
      2: "Intermediate", 
      3: "Advanced",
      4: "Expert",
    };
    return {
      name: levelNames[parseInt(level) as keyof typeof levelNames] || `Level ${level}`,
      value: count,
      color: getExpertiseColor(parseInt(level)),
    };
  });

  const clientDistributionData = Object.entries(clientDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([client, count], index) => ({
      name: client,
      value: count,
      color: `hsl(${(index * 45) % 360}, 65%, 55%)`,
    }));

  // Member categories by client chart data
  const memberCategoriesByClientData = Object.entries(memberCategoriesByClient).map(([client, categories]) => {
    const data: any = { client };
    Object.entries(categories).forEach(([category, count]) => {
      data[category] = count;
    });
    return data;
  });

  const allCategories = [...new Set(members.map(m => m.category).filter(Boolean))];

  // Chart configurations
  const categoryChartConfig = {
    value: {
      label: "Members",
      color: "hsl(var(--chart-1))",
    },
    Starter: {
      label: "Starter",
      color: getCategoryColor("Starter"),
    },
    Builder: {
      label: "Builder", 
      color: getCategoryColor("Builder"),
    },
    Solver: {
      label: "Solver",
      color: getCategoryColor("Solver"),
    },
    Wizard: {
      label: "Wizard",
      color: getCategoryColor("Wizard"),
    },
  } satisfies ChartConfig;

  const skillsChartConfig = {
    value: {
      label: "Skills",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const expertiseChartConfig = {
    value: {
      label: "Assessments",
      color: "hsl(var(--chart-3))",
    },
    Beginner: {
      label: "Beginner",
      color: getExpertiseColor(1),
    },
    Intermediate: {
      label: "Intermediate",
      color: getExpertiseColor(2),
    },
    Advanced: {
      label: "Advanced", 
      color: getExpertiseColor(3),
    },
    Expert: {
      label: "Expert",
      color: getExpertiseColor(4),
    },
  } satisfies ChartConfig;

  const clientChartConfig = {
    value: {
      label: "Members",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  // Chart rendering components
  const renderBarChart = (data: any[], config: ChartConfig, dataKey: string = 'value', nameKey: string = 'name') => {
    // Check if data has individual colors (for category/expertise charts)
    const hasIndividualColors = data.some(item => item.color);
    
    return (
      <ChartContainer config={config} className="h-[300px]">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar 
            dataKey={dataKey} 
            fill={hasIndividualColors ? undefined : "var(--color-value)"} 
            radius={4}
          >
            {hasIndividualColors && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  };

  const renderPieChart = (data: any[], config: ChartConfig, nameKey: string = 'name', dataKey: string = 'value') => (
    <ChartContainer config={config} className="h-[300px]">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );

  const renderStackedBarChart = (data: any[], categories: string[], config: ChartConfig) => (
    <ChartContainer config={config} className="h-[300px]">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="client" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {categories.map((category) => (
          <Bar 
            key={category} 
            dataKey={category} 
            stackId="a" 
            fill={`var(--color-${category})`}
            radius={[0, 0, 4, 4]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Insights and analytics for your team's skills and expertise
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/members">Member Management</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/members/talent-search">Talent Search</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/advanced-filters">Advanced Filters</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Skills Tracked
            </CardTitle>
            <span className="text-2xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSkills}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Knowledge Areas
            </CardTitle>
            <span className="text-2xl">🧠</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKnowledgeAreas}</div>
            <p className="text-xs text-muted-foreground">Defined domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <span className="text-2xl">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">Current assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Category Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Composition by Category</CardTitle>
              <CardDescription>
                Distribution of team members across different categories
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleChartType('categoryDistribution')}
            >
              {chartTypes.categoryDistribution === 'bar' ? '🥧 Pie' : '📊 Bar'}
            </Button>
          </CardHeader>
          <CardContent>
            {chartTypes.categoryDistribution === 'bar' 
              ? renderBarChart(categoryDistributionData, categoryChartConfig)
              : renderPieChart(categoryDistributionData, categoryChartConfig)
            }
          </CardContent>
        </Card>

        {/* Skills by Knowledge Area */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Skills by Knowledge Area</CardTitle>
              <CardDescription>
                Number of skills in each knowledge domain
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleChartType('skillsByKnowledgeArea')}
            >
              {chartTypes.skillsByKnowledgeArea === 'bar' ? '🥧 Pie' : '📊 Bar'}
            </Button>
          </CardHeader>
          <CardContent>
            {chartTypes.skillsByKnowledgeArea === 'bar' 
              ? renderBarChart(skillsByKnowledgeAreaData, skillsChartConfig)
              : renderPieChart(skillsByKnowledgeAreaData, skillsChartConfig)
            }
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expertise Level Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Expertise Level Distribution</CardTitle>
              <CardDescription>
                How team members rate their skills across all areas
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleChartType('expertiseLevel')}
            >
              {chartTypes.expertiseLevel === 'bar' ? '🥧 Pie' : '📊 Bar'}
            </Button>
          </CardHeader>
          <CardContent>
            {chartTypes.expertiseLevel === 'bar' 
              ? renderBarChart(expertiseLevelData, expertiseChartConfig)
              : renderPieChart(expertiseLevelData, expertiseChartConfig)
            }
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Skills</CardTitle>
            <CardDescription>
              Skills with the highest number of team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSkills.map((item, index) => (
                <div
                  key={item.skill}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{item.skill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.count} members
                    </span>
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${
                            (item.count /
                              Math.max(...topSkills.map((s) => s.count))) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Distribution by Client</CardTitle>
              <CardDescription>
                Current client assignments across the team
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleChartType('clientDistribution')}
            >
              {chartTypes.clientDistribution === 'bar' ? '🥧 Pie' : '📊 Bar'}
            </Button>
          </CardHeader>
          <CardContent>
            {chartTypes.clientDistribution === 'bar' 
              ? renderBarChart(clientDistributionData, clientChartConfig)
              : renderPieChart(clientDistributionData, clientChartConfig)
            }
          </CardContent>
        </Card>

        {/* Member Categories by Client */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Member Categories by Client</CardTitle>
              <CardDescription>
                Distribution of member categories across different clients
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleChartType('memberCategoriesByClient')}
            >
              {chartTypes.memberCategoriesByClient === 'bar' ? '🥧 Pie' : '📊 Bar'}
            </Button>
          </CardHeader>
          <CardContent>
            {chartTypes.memberCategoriesByClient === 'bar' 
              ? renderStackedBarChart(memberCategoriesByClientData, allCategories, categoryChartConfig)
              : (
                <div className="space-y-4">
                  {Object.entries(memberCategoriesByClient).map(([client, categories]) => (
                    <div key={client} className="space-y-2">
                      <h4 className="font-medium text-sm">{client}</h4>
                      <ChartContainer config={categoryChartConfig} className="h-[200px]">
                        <PieChart>
                          <Pie
                            data={Object.entries(categories).map(([category, count]) => ({
                              name: category,
                              value: count,
                              color: getCategoryColor(category),
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {Object.entries(categories).map(([category], index) => (
                              <Cell key={`cell-${index}`} fill={getCategoryColor(category)} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  ))}
                </div>
              )
            }
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Hiring Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring Trends by Year</CardTitle>
            <CardDescription>Team growth over the years</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(hireTrends)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, count]) => (
                  <div key={year} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {count} hires
                      </span>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${
                              (count / Math.max(...Object.values(hireTrends))) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>
            Key insights about your team's skills and composition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {memberSkills.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Skill Assessments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(
                  (memberSkills.length / (totalMembers * totalSkills)) * 100
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">
                Skills Coverage
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {
                  memberSkills.filter(
                    (ms) => ms.expertiseLevel && ms.expertiseLevel >= 3
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">
                Advanced+ Skills
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
