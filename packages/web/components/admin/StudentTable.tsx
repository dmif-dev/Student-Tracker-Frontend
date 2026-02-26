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
import { MoreVertical, Edit, Trash2, Eye, Mail, UserCheck } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  mentor: string;
  status: 'active' | 'inactive' | 'pending';
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
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
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
      cell: ({ getValue }) => {
        const program = getValue() as string;
        const colors = {
          'G-GMP': 'bg-purple-100 text-purple-700',
          'G-CMP': 'bg-green-100 text-green-700',
          'E-TIP': 'bg-primary-100 text-primary-700',
          'PCP': 'bg-orange-100 text-orange-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[program as keyof typeof colors]}`}>
            {program}
          </span>
        );
      },
    },
    {
      accessorKey: 'track',
      header: 'Track',
    },
    {
      accessorKey: 'mentor',
      header: 'Mentor',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const colors = {
          active: 'bg-green-100 text-green-700',
          inactive: 'bg-gray-100 text-gray-700',
          pending: 'bg-yellow-100 text-yellow-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[status as keyof typeof colors]}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ getValue }) => {
        const progress = getValue() as number;
        return (
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-primary-600 rounded-full h-2"
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
      cell: ({ row }) => (
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
              <button
                onClick={() => {/* Handle email */}}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
              >
                <Mail size={16} className="mr-2" />
                Send Email
              </button>
              <button
                onClick={() => {/* Handle reassign mentor */}}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
              >
                <UserCheck size={16} className="mr-2" />
                Reassign Mentor
              </button>
              <hr className="my-2 border-gray-200" />
              <button
                onClick={() => {/* Handle delete */}}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-600"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      ),
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
    </div>
  );
}