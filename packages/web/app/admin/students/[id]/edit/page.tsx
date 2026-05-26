// packages/web/app/admin/students/[id]/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminStudent, useUpdateStudent } from '@/hooks/api/useAdmin';
import LoaderOne from "@/components/ui/loader-one";

// Form validation schema
const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  registrationNumber: z.string().min(5, 'Registration number must be at least 5 characters'),
  program: z.enum(['G-GMP', 'G-CMP', 'E-TIP', 'PCP']),
  track: z.string().min(1, 'Please select a track'),
  mentor: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'completed']),
  joinDate: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Mentor is required only for non-PCP programs
  if (data.program !== 'PCP' && !data.mentor) {
    return false;
  }
  return true;
}, {
  message: 'Mentor is required for this program',
  path: ['mentor'],
});

type StudentFormData = z.infer<typeof studentSchema>;

const programs = [
  { 
    id: 'G-GMP' as const, 
    name: 'G-GMP', 
    description: 'Global Guided Mentorship Program',
    hasMentor: true,
    tracks: [
      'Patent Track',
      'Research Paper Track', 
      'Entrepreneurship Track',
      'Inventor Foundation Track'
    ] 
  },
  { 
    id: 'G-CMP' as const, 
    name: 'G-CMP', 
    description: 'Global Coding Mentorship Program',
    hasMentor: true,
    tracks: [
      'AI Product Development',
      'Full Stack Development',
      'Cloud Development & Deployment',
      'Agentic AI Development'
    ] 
  },
  { 
    id: 'E-TIP' as const, 
    name: 'E-TIP', 
    description: 'Executive Technology Immersion Program',
    hasMentor: true,
    tracks: [
      'AI Product Development',
      'Full Stack',
      'Cloud Development',
      'Agentic AI',
      'Custom Track'
    ] 
  },
  { 
    id: 'PCP' as const, 
    name: 'PCP', 
    description: 'Professional Certification Program (Self-Paced)',
    hasMentor: false,
    tracks: [
      'AI Product Development',
      'Agentic AI Systems',
      'AI for Finance',
      'AI Security'
    ] 
  },
];

const mentors = [
  { id: '1', name: 'Dr. Smith', programs: ['G-GMP', 'G-CMP'] },
  { id: '2', name: 'Prof. Johnson', programs: ['G-CMP'] },
  { id: '3', name: 'Dr. Williams', programs: ['E-TIP', 'G-GMP'] },
  { id: '4', name: 'Dr. Brown', programs: ['E-TIP'] },
];

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  // Watch program to update tracks dropdown and mentor requirements
  const watchProgram = watch('program');
  const currentProgram = programs.find(p => p.id === watchProgram);

  // Filter mentors based on selected program
  const availableMentors = mentors.filter(mentor => 
    watchProgram && mentor.programs.includes(watchProgram)
  );

  const studentId = params.id as string;
  const { data: student, isLoading: studentLoading, error: studentError } = useAdminStudent(studentId);
  const updateStudentMutation = useUpdateStudent();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setValue('name', student.name);
      setValue('email', student.email);
      setValue('registrationNumber', student.registrationNumber);
      setValue('program', student.program as any);
      setValue('track', student.track);
      setValue('mentor', student.mentor || '');
      setValue('status', student.status as any);
      setValue('joinDate', student.joinDate);
      setValue('phone', student.phone || '');
      setValue('address', student.address || '');
      
      setSelectedProgram(student.program);
      setLoading(false);
    }
    if (studentError) {
      setError('Failed to load student data');
      setLoading(false);
    }
  }, [student, studentError, setValue]);

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setSubmitError(null);
    try {
      const payload: any = {
        name: data.name,
        registrationNumber: data.registrationNumber,
        phone: data.phone,
        address: data.address,
        status: data.status,
        program: data.program,
        track: data.track,
        mentor: data.mentor,
        joinDate: data.joinDate ? new Date(data.joinDate).toISOString() : undefined,
      };
      
      await updateStudentMutation.mutateAsync({ id: studentId, data: payload });
      setSuccessMessage('Student updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error updating student:', err);
      setSubmitError('Failed to update student. Please try again.');
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
          href="/admin/students"
          className="text-orange-600 hover:text-orange-700"
        >
          Back to Students
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
            href={`/admin/students/${params.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
          {successMessage}
        </div>
      )}
      {submitError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
          {submitError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                {...register('registrationNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.registrationNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.registrationNumber.message}</p>
              )}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                {...register('address')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Program Enrollment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Program Enrollment</h2>
          
          {/* Program Info Alert for PCP */}
          {watchProgram === 'PCP' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> PCP is a self-paced certification program. Students in this program 
                do not require mentor assignment and progress independently through the curriculum.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program *
              </label>
              <select
                {...register('program')}
                onChange={(e) => {
                  setSelectedProgram(e.target.value);
                  setValue('track', '');
                  setValue('mentor', '');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name} - {program.description}
                  </option>
                ))}
              </select>
              {errors.program && (
                <p className="mt-1 text-sm text-red-600">{errors.program.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Track *
              </label>
              <select
                {...register('track')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Track</option>
                {currentProgram?.tracks.map(track => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
              {errors.track && (
                <p className="mt-1 text-sm text-red-600">{errors.track.message}</p>
              )}
            </div>

            {/* Mentor Assignment - Conditional based on program */}
            {watchProgram && (
              <>
                {watchProgram !== 'PCP' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign Mentor *
                    </label>
                    <select
                      {...register('mentor')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Mentor</option>
                      {availableMentors.map(mentor => (
                        <option key={mentor.id} value={mentor.name}>{mentor.name}</option>
                      ))}
                    </select>
                    {errors.mentor && (
                      <p className="mt-1 text-sm text-red-600">{errors.mentor.message}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mentor
                    </label>
                    <input
                      type="text"
                      value="No mentor required (Self-paced PCP)"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      PCP is a self-paced certification program. No mentor assignment needed.
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
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

        {/* Additional Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
          <div>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter any additional notes or comments..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            href={`/admin/students/${params.id}`}
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
                Update Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}