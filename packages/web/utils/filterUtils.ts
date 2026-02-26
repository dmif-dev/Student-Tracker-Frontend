export interface FilterConfig {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number' | 'boolean';
  field: string;
  options?: { label: string; value: any }[];
  placeholder?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
  createdBy: string;
  isShared: boolean;
}

export interface FilterState {
  [key: string]: any;
}

export const filterConfigs: Record<string, FilterConfig[]> = {
  students: [
    {
      id: 'search',
      name: 'Search',
      type: 'text',
      field: 'search',
      placeholder: 'Search by name, email, registration...'
    },
    {
      id: 'program',
      name: 'Program',
      type: 'multi-select',
      field: 'program',
      options: [
        { label: 'G-GMP', value: 'G-GMP' },
        { label: 'G-CMP', value: 'G-CMP' },
        { label: 'E-TIP', value: 'E-TIP' },
        { label: 'PCP', value: 'PCP' }
      ]
    },
    {
      id: 'track',
      name: 'Track',
      type: 'multi-select',
      field: 'track',
      options: [
        { label: 'Patent Track', value: 'Patent Track' },
        { label: 'Research Track', value: 'Research Paper Track' },
        { label: 'AI Product', value: 'AI Product Development' },
        { label: 'Full Stack', value: 'Full Stack Development' },
        { label: 'Cloud', value: 'Cloud Development' }
      ]
    },
    {
      id: 'status',
      name: 'Status',
      type: 'multi-select',
      field: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' }
      ]
    },
    {
      id: 'mentor',
      name: 'Mentor',
      type: 'select',
      field: 'mentor',
      options: [
        { label: 'Dr. Smith', value: 'Dr. Smith' },
        { label: 'Prof. Johnson', value: 'Prof. Johnson' },
        { label: 'Dr. Williams', value: 'Dr. Williams' },
        { label: 'Dr. Brown', value: 'Dr. Brown' }
      ]
    },
    {
      id: 'joinDate',
      name: 'Join Date',
      type: 'date-range',
      field: 'joinDate'
    },
    {
      id: 'progress',
      name: 'Progress',
      type: 'number',
      field: 'progress',
      placeholder: 'Min progress %'
    }
  ],
  outcomes: [
    {
      id: 'type',
      name: 'Type',
      type: 'multi-select',
      field: 'type',
      options: [
        { label: 'Patent', value: 'patent' },
        { label: 'Paper', value: 'paper' },
        { label: 'Project', value: 'project' },
        { label: 'Certification', value: 'certification' }
      ]
    },
    {
      id: 'status',
      name: 'Status',
      type: 'multi-select',
      field: 'status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Filed', value: 'filed' },
        { label: 'Published', value: 'published' },
        { label: 'Granted', value: 'granted' },
        { label: 'Completed', value: 'completed' }
      ]
    },
    {
      id: 'date',
      name: 'Date',
      type: 'date-range',
      field: 'date'
    }
  ]
};

export const savedPresets: FilterPreset[] = [
  {
    id: '1',
    name: 'Active G-GMP Students',
    filters: {
      program: ['G-GMP'],
      status: ['active']
    },
    createdAt: '2024-03-01',
    createdBy: 'Admin',
    isShared: true
  },
  {
    id: '2',
    name: 'Pending Reviews',
    filters: {
      status: ['pending']
    },
    createdAt: '2024-03-15',
    createdBy: 'Admin',
    isShared: true
  },
  {
    id: '3',
    name: 'High Progress (>75%)',
    filters: {
      progress: 75
    },
    createdAt: '2024-03-20',
    createdBy: 'Admin',
    isShared: false
  }
];

export const buildQueryString = (filters: FilterState): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        params.append(key, value.join(','));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params.toString();
};

export const parseQueryString = (search: string): FilterState => {
  const params = new URLSearchParams(search);
  const filters: FilterState = {};
  
  params.forEach((value, key) => {
    if (value.includes(',')) {
      filters[key] = value.split(',');
    } else {
      filters[key] = value;
    }
  });
  
  return filters;
};

export const filterData = <T extends Record<string, any>>(
  data: T[],
  filters: FilterState
): T[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue || filterValue === '') return true;
      
      const itemValue = item[key];
      
      if (Array.isArray(filterValue)) {
        return filterValue.includes(itemValue);
      }
      
      if (key === 'search') {
        const searchTerm = filterValue.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchTerm) ||
          item.email?.toLowerCase().includes(searchTerm) ||
          item.registrationNumber?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (key === 'progress') {
        return itemValue >= Number(filterValue);
      }
      
      if (key === 'joinDate' && typeof filterValue === 'object') {
        const { start, end } = filterValue as any;
        const itemDate = new Date(itemValue);
        if (start && itemDate < new Date(start)) return false;
        if (end && itemDate > new Date(end)) return false;
        return true;
      }
      
      return itemValue === filterValue;
    });
  });
};