"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Skill {
  id: number;
  name: string;
  purpose: string | null;
  knowledgeArea: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  scale: { id: number; name: string } | null;
}

interface KnowledgeArea {
  id: number;
  name: string;
}

interface SkillCategory {
  id: number;
  name: string;
}

interface Scale {
  id: number;
  name: string;
}

interface SkillsClientProps {
  initialSkills: Skill[];
  knowledgeAreas: KnowledgeArea[];
  skillCategories: SkillCategory[];
  scales: Scale[];
}

export default function SkillsClient({
  initialSkills,
  knowledgeAreas,
  skillCategories,
  scales,
}: SkillsClientProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    knowledgeAreaId: "",
    categoryId: "",
    scaleId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSkill
        ? `/api/skills/${editingSkill.id}`
        : "/api/skills";

      const method = editingSkill ? "PUT" : "POST";

      const payload = {
        name: formData.name,
        purpose: formData.purpose || null,
        knowledgeAreaId: formData.knowledgeAreaId
          ? parseInt(formData.knowledgeAreaId)
          : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        scaleId: formData.scaleId ? parseInt(formData.scaleId) : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save skill");

      // Refresh the skills list
      const skillsResponse = await fetch("/api/skills");
      const updatedSkills = await skillsResponse.json();
      setSkills(updatedSkills);

      setShowForm(false);
      setEditingSkill(null);
      setFormData({
        name: "",
        purpose: "",
        knowledgeAreaId: "",
        categoryId: "",
        scaleId: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      purpose: skill.purpose || "",
      knowledgeAreaId: skill.knowledgeArea?.id.toString() || "",
      categoryId: skill.category?.id.toString() || "",
      scaleId: skill.scale?.id.toString() || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete skill");

      // Refresh the skills list
      const skillsResponse = await fetch("/api/skills");
      const updatedSkills = await skillsResponse.json();
      setSkills(updatedSkills);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSkill(null);
    setFormData({
      name: "",
      purpose: "",
      knowledgeAreaId: "",
      categoryId: "",
      scaleId: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Skills</h1>
          <p className="text-muted-foreground mt-2">
            Define individual skills and competencies
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setShowForm(true)}>Add Skill</Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSkill ? "Edit Skill" : "Add New Skill"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the purpose or application of this skill..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="knowledgeAreaId">Knowledge Area</Label>
                  <Select
                    value={formData.knowledgeAreaId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, knowledgeAreaId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Knowledge Area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Select Knowledge Area
                      </SelectItem>
                      {knowledgeAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select Category</SelectItem>
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
                  <Label htmlFor="scaleId">Scale</Label>
                  <Select
                    value={formData.scaleId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, scaleId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Scale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select Scale</SelectItem>
                      {scales.map((scale) => (
                        <SelectItem key={scale.id} value={scale.id.toString()}>
                          {scale.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingSkill ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <Card key={skill.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{skill.name}</CardTitle>
              {skill.purpose && (
                <CardDescription>{skill.purpose}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {skill.knowledgeArea && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                      {skill.knowledgeArea.name}
                    </span>
                  </div>
                )}
                {skill.category && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 px-2 py-1 rounded-full">
                      {skill.category.name}
                    </span>
                  </div>
                )}
                {skill.scale && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                      {skill.scale.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(skill)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(skill.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No skills found.</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            Add Your First Skill
          </Button>
        </div>
      )}
    </div>
  );
}
