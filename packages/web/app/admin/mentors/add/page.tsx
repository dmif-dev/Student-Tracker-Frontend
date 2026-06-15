'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useCreateMentor } from '@/hooks/api/useAdmin';
import LoaderOne from '@/components/ui/loader-one';
import { ApiService } from '@/services/api';
import { toast, Toaster } from 'sonner';

interface MentorFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function AddMentorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MentorFormData>({
    defaultValues: {
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    },
  });

  const [programs, setPrograms] = useState<string[]>([]);

  useEffect(() => {
    ApiService.getPrograms().then(data => setPrograms(data.map(p => p.name))).catch(console.error);
  }, []);

  const addExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()]);
      setNewExpertise('');
    }
  };

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };

  const toggleProgram = (program: string) => {
    if (selectedPrograms.includes(program)) {
      setSelectedPrograms(selectedPrograms.filter(p => p !== program));
    } else {
      setSelectedPrograms([...selectedPrograms, program]);
    }
  };

  const createMentorMutation = useCreateMentor();

  const onSubmit = async (data: MentorFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        status: data.status.toUpperCase(),
        expertise,
        programs: selectedPrograms.map(p => p.replace('-', '_')),
      };
      await createMentorMutation.mutateAsync(payload as any);
      toast.success('Mentor added successfully!');
      setTimeout(() => {
        router.push('/admin/mentors');
      }, 1500);
    } catch (error: any) {
      console.error('Error adding mentor:', error);
      toast.error(error.message || 'Failed to add mentor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/mentors"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Mentor</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="City, Country"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter mentor's biography, experience, etc."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Expertise</h2>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., AI/ML, Patents, Research"
              />
              <button
                type="button"
                onClick={addExpertise}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {expertise.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeExpertise(item)}
                    className="ml-2 text-orange-500 hover:text-orange-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Program Assignment</h2>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Programs
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {programs.map((program) => {
                const isDisabled = program === 'PCP';
                return (
                <label
                  key={program}
                  className={`flex items-center p-4 border rounded-lg transition-colors ${
                    isDisabled
                      ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                      : selectedPrograms.includes(program)
                      ? 'bg-orange-50 border-orange-300 cursor-pointer'
                      : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPrograms.includes(program)}
                    onChange={() => !isDisabled && toggleProgram(program)}
                    disabled={isDisabled}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{program} {isDisabled && <span className="text-[10px] text-gray-400 ml-1">(Self-Paced)</span>}</span>
                </label>
              )})}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Status & Join Date</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Join Date *
              </label>
              <input
                type="date"
                {...register('joinDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/mentors"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="scale-75 mr-2"><LoaderOne /></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Add Mentor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
