// packages/web/components/admin/StudentTable.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { MoreVertical, Edit, Trash2, Eye, Mail, UserCheck, GraduationCap } from 'lucide-react';
import { useDeleteStudent } from '@/hooks/api/useAdmin';

interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  mentor?: string;
  status: 'active' | 'inactive' | 'pending' | 'completed';
  joinDate: string;
  lastActive: string;
  progress: number;
}

interface StudentTableProps {
  students: Student[];
}

export default function StudentTable({ students }: StudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Modal State
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-orange-100 text-orange-700',
      'G-CMP': 'bg-amber-100 text-amber-700',
      'E-TIP': 'bg-orange-100 text-orange-700',
      'PCP': 'bg-orange-50 text-orange-600',
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-orange-500 text-white',
      inactive: 'bg-gray-100 text-gray-700',
      pending: 'bg-amber-100 text-amber-700',
      completed: 'bg-orange-100 text-orange-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const deleteStudentMutation = useDeleteStudent();

  const handleDelete = (id: string, name: string) => {
    setStudentToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteStudentMutation.mutateAsync(studentToDelete.id);
      // Let the mutation handle UI invalidation, we just close the modal
      setStudentToDelete(null);
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('Failed to delete student. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Student>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
            {row.original.name.charAt(0)}
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'registrationNumber',
      header: 'Reg. Number',
      cell: ({ getValue }) => (
        <span className="text-sm font-mono">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }) => {
        const program = row.original.program;
        return (
          <div className="flex flex-col space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${getProgramColor(program)}`}>
              {program}
            </span>
            {program === 'PCP' && (
              <span className="text-xs text-gray-500 italic">Self-paced</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'track',
      header: 'Track',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.track}</div>
          {row.original.program === 'PCP' && (
            <div className="text-xs text-gray-400 mt-1">No mentor required</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'mentor',
      header: 'Mentor',
      cell: ({ row }) => {
        const program = row.original.program;
        const mentor = row.original.mentor;

        if (program === 'PCP') {
          return (
            <div className="flex items-center space-x-1">
              <GraduationCap size={14} className="text-gray-400" />
              <span className="text-sm text-gray-400 italic">
                Self-paced
              </span>
            </div>
          );
        }
        return (
          <span className="text-sm">
            {mentor || <span className="text-gray-400 italic">Not assigned</span>}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const progress = row.original.progress;
        const program = row.original.program;

        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className={`rounded-full h-2 ${program === 'PCP' ? 'bg-orange-500' : 'bg-orange-600'
                  }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm">{progress}%</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isPCP = row.original.program === 'PCP';

        return (
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical size={18} />
            </button>

            {activeMenu === row.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <Link
                  href={`/admin/students/${row.original.id}`}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                >
                  <Eye size={16} className="mr-2" />
                  View Details
                </Link>
                <Link
                  href={`/admin/students/${row.original.id}/edit`}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Link>
                <a
                  href={`mailto:${row.original.email}`}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                >
                  <Mail size={16} className="mr-2" />
                  Send Email
                </a>
                {!isPCP && (
                  <Link
                    href={`/admin/students/${row.original.id}/edit`}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                  >
                    <UserCheck size={16} className="mr-2" />
                    Reassign Mentor
                  </Link>
                )}
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={() => {
                    setActiveMenu(null);
                    handleDelete(row.original.id, row.original.name);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: students,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="ml-1">
                          {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            students.length
          )}{' '}
          of {students.length} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Delete Student
              </h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{studentToDelete.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setStudentToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isDeleting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

