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
import { MoreVertical, Edit, Trash2, Eye, Mail, UserCheck, GraduationCap, User, AlertCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeleteStudent } from '@/hooks/api/useAdmin';
import LoaderOne from '@/components/ui/loader-one';
import { motion, AnimatePresence } from 'framer-motion';

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

  const getProgramBadge = (program: string) => {
    const badges = {
      'G-GMP': 'bg-orange-50/80 border border-orange-200/60 text-orange-700 font-bold',
      'G-CMP': 'bg-amber-50/80 border border-amber-200/60 text-amber-700 font-bold',
      'E-TIP': 'bg-red-50/80 border border-red-200/60 text-red-700 font-bold',
      'PCP': 'bg-slate-50/80 border border-slate-200/60 text-slate-600 font-bold',
    };
    const styleClass = badges[program as keyof typeof badges] || 'bg-slate-50 border border-slate-200 text-slate-600 font-bold';
    return (
      <span className={`px-2.5 py-1 rounded-xl text-xs tracking-wide uppercase inline-flex items-center shadow-sm ${styleClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
        {program}
      </span>
    );
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
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        // Dynamic name-based gradient avatar
        const colors = [
          'from-orange-500 to-amber-500 shadow-orange-500/10',
          'from-amber-500 to-yellow-500 shadow-amber-500/10',
          'from-red-500 to-orange-500 shadow-red-500/10',
          'from-rose-500 to-pink-500 shadow-rose-500/10',
        ];
        const code = row.original.name.charCodeAt(0) || 0;
        const colorClass = colors[code % colors.length];

        return (
          <div className="flex items-center py-1">
            <div className={`w-9 h-9 bg-gradient-to-tr ${colorClass} rounded-2xl flex items-center justify-center text-white font-extrabold text-sm border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105`}>
              {row.original.name.charAt(0)}
            </div>
            <div className="ml-3.5">
              <div className="font-semibold text-slate-800 text-[14px] leading-tight tracking-tight group-hover:text-orange-600 transition-colors duration-200">{row.original.name}</div>
              <div className="text-slate-400 text-xs mt-0.5 font-medium">{row.original.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }) => {
        const program = row.original.program;
        return (
          <div className="flex flex-col space-y-1 py-1">
            {getProgramBadge(program)}
            {program === 'PCP' && (
              <span className="text-[10px] text-slate-400 italic font-semibold ml-1 tracking-wider uppercase">Self-paced</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'mentor',
      header: 'Mentor',
      cell: ({ row }) => {
        const program = row.original.program;
        const mentor = row.original.mentor;

        if (program === 'PCP') {
          return (
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 w-fit shadow-inner">
              <GraduationCap size={13} className="text-slate-400" />
              <span className="text-xs text-slate-400 italic font-semibold tracking-wide uppercase">
                Self-paced
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center py-1">
            {mentor ? (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                  <User size={12} className="stroke-[2.5px]" />
                </div>
                <span className="text-slate-700 font-semibold text-sm">
                  {mentor}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 text-xs italic font-semibold tracking-wide uppercase bg-slate-50/50 border border-dashed border-slate-200 px-2 py-0.5 rounded-lg">
                Not assigned
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isPCP = row.original.program === 'PCP';
        const isMenuOpen = activeMenu === row.id;

        return (
          <div className="relative flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(isMenuOpen ? null : row.id);
              }}
              className={`p-1.5 rounded-xl transition-all ${
                isMenuOpen 
                  ? 'bg-slate-100 text-slate-800' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 active:scale-95'
              }`}
            >
              <MoreVertical size={16} className="stroke-[2.2px]" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Backdrop click barrier */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setActiveMenu(null)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-9 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/50 py-2 z-20 overflow-hidden"
                  >
                    <Link
                      href={`/admin/students/${row.original.id}`}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center font-bold text-xs transition-colors"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Eye size={14} className="mr-2.5 text-slate-400 stroke-[2.2px]" />
                      View Details
                    </Link>
                    
                    <Link
                      href={`/admin/students/${row.original.id}/edit`}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center font-bold text-xs transition-colors"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Edit size={14} className="mr-2.5 text-slate-400 stroke-[2.2px]" />
                      Edit Details
                    </Link>
                    
                    <a
                      href={`mailto:${row.original.email}`}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center font-bold text-xs transition-colors"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Mail size={14} className="mr-2.5 text-slate-400 stroke-[2.2px]" />
                      Send Email
                    </a>
                    
                    {!isPCP && (
                      <Link
                        href={`/admin/students/${row.original.id}/edit`}
                        className="w-full px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center font-bold text-xs transition-colors"
                        onClick={() => setActiveMenu(null)}
                      >
                        <UserCheck size={14} className="mr-2.5 text-slate-400 stroke-[2.2px]" />
                        Reassign Mentor
                      </Link>
                    )}
                    
                    <hr className="my-1.5 border-slate-100" />
                    
                    <button
                      onClick={() => {
                        setActiveMenu(null);
                        handleDelete(row.original.id, row.original.name);
                      }}
                      className="w-full px-4 py-2 hover:bg-red-50 text-red-600 flex items-center font-bold text-xs transition-colors"
                    >
                      <Trash2 size={14} className="mr-2.5 text-red-400 stroke-[2.2px]" />
                      Delete Student
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50">
      <div className="overflow-visible">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50/80">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer select-none transition-colors duration-200 hover:bg-slate-100/50"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {header.column.getIsSorted() && (
                        <span className="text-orange-500 ml-0.5">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp size={12} className="stroke-[2.5px]" />
                          ) : (
                            <ChevronDown size={12} className="stroke-[2.5px]" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className="group hover:bg-slate-50/45 hover:shadow-[0_4px_24px_-8px_rgba(251,146,60,0.05)] transition-all duration-200"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-3.5 text-sm text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Showing <span className="text-slate-700 font-bold">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
          <span className="text-slate-700 font-bold">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              students.length
            )}
          </span>{' '}
          of <span className="text-slate-700 font-bold">{students.length}</span> students
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 border border-slate-200 rounded-xl text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:text-slate-800 shadow-sm active:scale-95 transition-all"
          >
            <ChevronLeft size={16} className="stroke-[2.5px]" />
          </button>
          
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 border border-slate-200 rounded-xl text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:text-slate-800 shadow-sm active:scale-95 transition-all"
          >
            <ChevronRight size={16} className="stroke-[2.5px]" />
          </button>
        </div>
      </div>

      {/* Deletion Dialog with blur screen overlay */}
      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-50 border border-red-100 rounded-2xl mb-4 text-red-500 shadow-sm">
                  <AlertCircle size={22} className="stroke-[2.2px] animate-pulse" />
                </div>
                
                <h3 className="text-lg font-black tracking-tight text-center text-slate-800 mb-2 font-montserrat">
                  Delete Student Profile
                </h3>
                
                <p className="text-center text-slate-500 text-sm font-medium px-4 mb-6 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-slate-800">{studentToDelete.name}</span>? All records will be permanently removed.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setStudentToDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-2xl hover:shadow-lg hover:shadow-red-500/10 transition-all flex items-center justify-center active:scale-[0.98] disabled:opacity-50 min-h-[38px]"
                  >
                    {isDeleting ? (
                      <span className="scale-[0.6] inline-block h-4"><LoaderOne /></span>
                    ) : (
                      'Confirm Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


