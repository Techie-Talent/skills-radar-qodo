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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Settings, BookOpen, Eye, Users } from "lucide-react";

interface Member {
  id: number;
  email: string;
  fullName: string | null;
  hireDate: Date | null;
  currentClient: string | null;
  category: string | null;
  location: string | null;
  profile: { id: number } | null;
}

interface KnowledgeArea {
  id: number;
  name: string;
}

interface SkillCategory {
  id: number;
  name: string;
}

interface Skill {
  id: number;
  name: string;
  knowledgeArea: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
}

interface TalentSearchClientProps {
  members: Member[];
  knowledgeAreas: KnowledgeArea[];
  skillCategories: SkillCategory[];
  skills: Skill[];
}

export default function TalentSearchClient({
  members,
  knowledgeAreas,
  skillCategories,
  skills,
}: TalentSearchClientProps) {
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    category: "all",
    client: "",
    location: "all",
    knowledgeArea: "all",
    skillCategory: "all",
    skill: "all",
    hireDateFrom: "",
    hireDateTo: "",
    availableOnly: false,
  });

  const filteredMembers = members.filter((member) => {
    const matchesName =
      !searchFilters.name ||
      (member.fullName && member.fullName.toLowerCase().includes(searchFilters.name.toLowerCase()));

    const matchesCategory =
      searchFilters.category === "all" || member.category === searchFilters.category;

    const matchesClient =
      !searchFilters.client ||
      (member.currentClient &&
        member.currentClient
          .toLowerCase()
          .includes(searchFilters.client.toLowerCase()));

    const matchesLocation =
      searchFilters.location === "all" ||
      (member.location &&
        member.location
          .toLowerCase()
          .includes(searchFilters.location.toLowerCase()));

    const matchesAvailability =
      !searchFilters.availableOnly || !member.currentClient;

    const hireDate = member.hireDate ? new Date(member.hireDate) : null;
    const matchesHireDateFrom =
      !searchFilters.hireDateFrom ||
      !hireDate ||
      hireDate >= new Date(searchFilters.hireDateFrom);

    const matchesHireDateTo =
      !searchFilters.hireDateTo ||
      !hireDate ||
      hireDate <= new Date(searchFilters.hireDateTo);

    return (
      matchesName &&
      matchesCategory &&
      matchesClient &&
      matchesLocation &&
      matchesAvailability &&
      matchesHireDateFrom &&
      matchesHireDateTo
    );
  });

  const uniqueCategories = [...new Set(members.map((m) => m.category).filter(Boolean))];
  // const uniqueClients = [
  //   ...new Set(members.map((m) => m.currentClient).filter(Boolean)),
  // ];
  const uniqueLocations = [
    ...new Set(members.map((m) => m.location).filter(Boolean)),
  ];

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-muted text-muted-foreground";
    const colors = {
      Starter: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      Builder: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      Solver: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      Wizard: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    };
    return (
      colors[category as keyof typeof colors] || "bg-muted text-muted-foreground"
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const clearFilters = () => {
    setSearchFilters({
      name: "",
      category: "all",
      client: "",
      location: "all",
      knowledgeArea: "all",
      skillCategory: "all",
      skill: "all",
      hireDateFrom: "",
      hireDateTo: "",
      availableOnly: false,
    });
  };

  const updateFilter = (key: string, value: string | boolean) => {
    setSearchFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-2">
            Search, filter, and manage team members and their skills
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/imports">
              <Settings className="h-4 w-4 mr-2" />
              Data Imports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/members/new">
              <Users className="h-4 w-4 mr-2" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Advanced Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>
            Use multiple criteria to find the right talent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Basic Filters */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={searchFilters.name}
                onChange={(e) => updateFilter("name", e.target.value)}
                placeholder="Search by name..."
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={searchFilters.category}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category || "unknown"}>
                      {category || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={searchFilters.location}
                onValueChange={(value) => updateFilter("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location || "unknown"}>
                      {location || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Input
                value={searchFilters.client}
                onChange={(e) => updateFilter("client", e.target.value)}
                placeholder="Search by client..."
              />
            </div>

            {/* Skill-based Filters */}
            <div className="space-y-2">
              <Label>Knowledge Area</Label>
              <Select
                value={searchFilters.knowledgeArea}
                onValueChange={(value) => updateFilter("knowledgeArea", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Knowledge Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Knowledge Areas</SelectItem>
                  {knowledgeAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Skill Category</Label>
              <Select
                value={searchFilters.skillCategory}
                onValueChange={(value) => updateFilter("skillCategory", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Skill Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skill Categories</SelectItem>
                  {skillCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Specific Skill</Label>
              <Select
                value={searchFilters.skill}
                onValueChange={(value) => updateFilter("skill", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id.toString()}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filters */}
            <div className="space-y-2">
              <Label>Hired From</Label>
              <Input
                type="date"
                value={searchFilters.hireDateFrom}
                onChange={(e) => updateFilter("hireDateFrom", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Hired To</Label>
              <Input
                type="date"
                value={searchFilters.hireDateTo}
                onChange={(e) => updateFilter("hireDateTo", e.target.value)}
              />
            </div>
          </div>

          {/* Availability Filter */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availableOnly"
                checked={searchFilters.availableOnly}
                onCheckedChange={(checked) =>
                  updateFilter("availableOnly", checked as boolean)
                }
              />
              <Label htmlFor="availableOnly" className="text-sm font-medium">
                Show only available talent (not assigned to clients)
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4 items-center">
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {members.length} members
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredMembers.length} shown
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {members.filter(m => !m.currentClient).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Not assigned to clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeAreas.length}</div>
            <p className="text-xs text-muted-foreground">
              Available areas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.length}</div>
            <p className="text-xs text-muted-foreground">
              Total skills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {member.fullName || "No Name"}
                {!member.currentClient && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                    Available
                  </span>
                )}
              </CardTitle>
              <CardDescription>{member.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                      member.category
                    )}`}
                  >
                    {member.category || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hired:</span>
                  <span className="text-sm">{formatDate(member.hireDate)}</span>
                </div>
                {member.currentClient && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Client:</span>
                    <span className="text-sm">{member.currentClient}</span>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="text-sm">{member.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile:</span>
                  <span className="text-xs text-muted-foreground">
                    {member.profile ? "Complete" : "Incomplete"}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/admin/members/${member.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/admin/members/${member.id}/skills`}>
                    <BookOpen className="h-3 w-3 mr-1" />
                    Skills
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/admin/members/${member.id}/profile`}>
                    <User className="h-3 w-3 mr-1" />
                    Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {members.length === 0
              ? "No team members found."
              : "No members match the current search criteria."}
          </p>
          {members.length === 0 && (
            <Button asChild className="mt-4">
              <Link href="/admin/members">Add Team Members</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}