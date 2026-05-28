'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAdminMentor, useUpdateMentor } from '@/hooks/api/useAdmin';

import LoaderOne from '@/components/ui/loader-one';
import { ApiService } from '@/services/api';

interface MentorFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function EditMentorPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MentorFormData>();

  const mentorId = params.id as string;
  const [programs, setPrograms] = useState<string[]>([]);
  
  useEffect(() => {
    ApiService.getPrograms().then(data => setPrograms(data.map(p => p.name))).catch(console.error);
  }, []);
  const { data: mentor, isLoading: mentorLoading, error: mentorError } = useAdminMentor(mentorId);
  const updateMentorMutation = useUpdateMentor();

  useEffect(() => {
    if (mentor) {
      setValue('name', mentor.name);
      setValue('email', mentor.email);
      setValue('phone', mentor.phone || '');
      setValue('location', mentor.location || '');
      setValue('bio', mentor.bio || '');
      setValue('status', mentor.status.toLowerCase() as any);
      setValue('joinDate', new Date(mentor.joinDate).toISOString().split('T')[0]);
      
      setExpertise(mentor.expertise);
      setSelectedPrograms(mentor.programs.map((p: string) => p.replace('_', '-')));
      setLoading(false);
    }
    if (mentorError) {
      setError('Failed to load mentor data');
      setLoading(false);
    }
  }, [mentor, mentorError, setValue]);

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

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: MentorFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const payload = {
        ...data,
        status: data.status.toUpperCase(),
        expertise,
        programs: selectedPrograms.map(p => p.replace('-', '_')),
      };
      await updateMentorMutation.mutateAsync({
        id: mentorId,
        data: payload as any
      });
      setSuccessMessage('Mentor updated successfully!');
      setTimeout(() => {
        router.push(`/admin/mentors/${params.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating mentor:', err);
      setError('Failed to update mentor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
        <Link
          href="/admin/mentors"
          className="text-orange-600 hover:text-orange-700"
        >
          Back to Mentors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={`/admin/mentors/${params.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Mentor</h1>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Form - similar to add page but with existing data */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information - same as add page */}
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
              />
            </div>
          </div>
        </div>

        {/* Expertise Section - same as add page */}
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
                placeholder="Add expertise area"
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

        {/* Program Assignment - same as add page */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Program Assignment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {programs.map((program) => (
              <label
                key={program}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPrograms.includes(program)
                    ? 'bg-orange-50 border-orange-300'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPrograms.includes(program)}
                  onChange={() => toggleProgram(program)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{program}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status & Join Date - same as add page */}
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
            href={`/admin/mentors/${params.id}`}
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
                Update Mentor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}