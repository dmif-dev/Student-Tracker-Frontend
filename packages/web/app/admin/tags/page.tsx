'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  Filter,
  PieChart,
  Hash,
  Users,
  Award,
} from 'lucide-react';
import { TagCategory } from '@student-tracker/shared/models/Tag';

interface TagData {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
  color: string;
  description: string;
  usageCount: number;
  createdAt: string;
}

// Update the TagModal component with proper typing
interface TagModalProps {
  tag?: {
    id: string;
    name: string;
    category: string;
    color: string;
    description: string;
  } | null;
  onClose: () => void;
  onSave: (tagData: { name: string; category: string; color: string; description: string }) => void;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);

  useEffect(() => {
    // Mock data - replace with API call
    const fetchTags = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTags([
        {
          id: '1',
          name: 'Machine Learning',
          slug: 'machine-learning',
          category: 'skill',
          color: 'blue',
          description: 'Students interested in ML/AI',
          usageCount: 45,
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Patent Filing',
          slug: 'patent-filing',
          category: 'achievement',
          color: 'purple',
          description: 'Has filed at least one patent',
          usageCount: 23,
          createdAt: '2024-01-20',
        },
        {
          id: '3',
          name: 'Research Paper',
          slug: 'research-paper',
          category: 'achievement',
          color: 'green',
          description: 'Has published research papers',
          usageCount: 31,
          createdAt: '2024-02-01',
        },
        {
          id: '4',
          name: 'Full Stack',
          slug: 'full-stack',
          category: 'skill',
          color: 'orange',
          description: 'Full stack development skills',
          usageCount: 52,
          createdAt: '2024-02-10',
        },
        {
          id: '5',
          name: 'AI Product',
          slug: 'ai-product',
          category: 'project',
          color: 'red',
          description: 'Working on AI product development',
          usageCount: 28,
          createdAt: '2024-02-15',
        },
        {
          id: '6',
          name: 'Entrepreneurship',
          slug: 'entrepreneurship',
          category: 'interest',
          color: 'yellow',
          description: 'Interested in startups',
          usageCount: 19,
          createdAt: '2024-03-01',
        },
      ]);
      setLoading(false);
    };

    fetchTags();
  }, []);

  const getCategoryColor = (category: TagCategory) => {
    const colors = {
      skill: 'bg-orange-100 text-orange-700',
      interest: 'bg-green-100 text-green-700',
      project: 'bg-purple-100 text-purple-700',
      achievement: 'bg-yellow-100 text-yellow-700',
      custom: 'bg-gray-100 text-gray-700',
    };
    return colors[category];
  };

  const getTagColor = (color: string) => {
    const colors = {
      blue: 'bg-orange-100 text-orange-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      indigo: 'bg-indigo-100 text-indigo-700',
      pink: 'bg-pink-100 text-pink-700',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: tags.length,
    skill: tags.filter((t) => t.category === 'skill').length,
    achievement: tags.filter((t) => t.category === 'achievement').length,
    project: tags.filter((t) => t.category === 'project').length,
    interest: tags.filter((t) => t.category === 'interest').length,
    totalUsage: tags.reduce((sum, t) => sum + t.usageCount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white"
        >
          <Plus size={18} className="mr-2" />
          Create Tag
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tags</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Tag size={20} className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Skills</p>
              <p className="text-2xl font-bold text-orange-600">{stats.skill}</p>
            </div>
            <Hash size={20} className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Achievements</p>
              <p className="text-2xl font-bold text-purple-600">{stats.achievement}</p>
            </div>
            <Award size={20} className="text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Projects</p>
              <p className="text-2xl font-bold text-green-600">{stats.project}</p>
            </div>
            <Users size={20} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Usage</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalUsage}</p>
            </div>
            <PieChart size={20} className="text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tags by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
            <option value="skill">Skills</option>
            <option value="interest">Interests</option>
            <option value="project">Projects</option>
            <option value="achievement">Achievements</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map((tag) => (
          <div
            key={tag.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag.color)}`}
                >
                  {tag.name}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(tag.category)}`}
                >
                  {tag.category}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingTag(tag)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit size={16} className="text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{tag.description}</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Used {tag.usageCount} times</span>
              <span className="text-gray-400">{new Date(tag.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Tag Modal */}
      {(showAddModal || editingTag) && (
        <TagModal
          tag={editingTag}
          onClose={() => {
            setShowAddModal(false);
            setEditingTag(null);
          }}
          onSave={(tagData) => {
            // Handle save
            setShowAddModal(false);
            setEditingTag(null);
          }}
        />
      )}
    </div>
  );
}

// Tag Modal Component

function TagModal({ tag, onClose, onSave }: TagModalProps) {
  const [formData, setFormData] = useState({
    name: tag?.name || '',
    category: tag?.category || 'skill',
    color: tag?.color || 'blue',
    description: tag?.description || '',
  });

  const colors = ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'indigo', 'pink'];
  const categories = ['skill', 'interest', 'project', 'achievement', 'custom'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">{tag ? 'Edit Tag' : 'Create New Tag'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full bg-${color}-500 ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-orange-500' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white"
            >
              {tag ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

