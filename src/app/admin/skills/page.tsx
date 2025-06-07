'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';

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

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    knowledgeAreaId: '',
    categoryId: '',
    scaleId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, knowledgeAreasRes, categoriesRes, scalesRes] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/knowledge-areas'),
        fetch('/api/skill-categories'),
        fetch('/api/scales'),
      ]);

      if (!skillsRes.ok || !knowledgeAreasRes.ok || !categoriesRes.ok || !scalesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [skillsData, knowledgeAreasData, categoriesData, scalesData] = await Promise.all([
        skillsRes.json(),
        knowledgeAreasRes.json(),
        categoriesRes.json(),
        scalesRes.json(),
      ]);

      setSkills(skillsData);
      setKnowledgeAreas(knowledgeAreasData);
      setSkillCategories(categoriesData);
      setScales(scalesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSkill 
        ? `/api/skills/${editingSkill.id}`
        : '/api/skills';
      
      const method = editingSkill ? 'PUT' : 'POST';
      
      const payload = {
        name: formData.name,
        purpose: formData.purpose || null,
        knowledgeAreaId: formData.knowledgeAreaId ? parseInt(formData.knowledgeAreaId) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        scaleId: formData.scaleId ? parseInt(formData.scaleId) : null,
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save skill');

      await fetchData();
      setShowForm(false);
      setEditingSkill(null);
      setFormData({ name: '', purpose: '', knowledgeAreaId: '', categoryId: '', scaleId: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      purpose: skill.purpose || '',
      knowledgeAreaId: skill.knowledgeArea?.id.toString() || '',
      categoryId: skill.category?.id.toString() || '',
      scaleId: skill.scale?.id.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete skill');

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSkill(null);
    setFormData({ name: '', purpose: '', knowledgeAreaId: '', categoryId: '', scaleId: '' });
  };

  if (loading) {
    return (
      <PermissionGuard permission="skills.read">
        <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Skills' }]}>
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Loading...</div>
          </div>
        </SidebarLayout>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="skills.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Skills' }]}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
              <p className="text-gray-600 mt-2">Define individual skills and competencies</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Add Skill
              </button>
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
                  {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose
                    </label>
                    <textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      rows={3}
                      placeholder="Describe the purpose or application of this skill..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="knowledgeAreaId" className="block text-sm font-medium text-gray-700 mb-1">
                        Knowledge Area
                      </label>
                      <select
                        id="knowledgeAreaId"
                        value={formData.knowledgeAreaId}
                        onChange={(e) => setFormData({ ...formData, knowledgeAreaId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select Knowledge Area</option>
                        {knowledgeAreas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="categoryId"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select Category</option>
                        {skillCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="scaleId" className="block text-sm font-medium text-gray-700 mb-1">
                        Scale
                      </label>
                      <select
                        id="scaleId"
                        value={formData.scaleId}
                        onChange={(e) => setFormData({ ...formData, scaleId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select Scale</option>
                        {scales.map((scale) => (
                          <option key={scale.id} value={scale.id}>
                            {scale.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      {editingSkill ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
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
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {skill.knowledgeArea.name}
                        </span>
                      </div>
                    )}
                    {skill.category && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {skill.category.name}
                        </span>
                      </div>
                    )}
                    {skill.scale && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {skill.scale.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {skills.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No skills found.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Add Your First Skill
              </button>
            </div>
          )}
        </div>
      </SidebarLayout>
    </PermissionGuard>
  );
}