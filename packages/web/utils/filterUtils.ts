// packages/web/utils/filterUtils.ts

export interface FilterConfig {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number' | 'boolean';
  field: string;
  options?: { label: string; value: any }[];
  placeholder?: string;
  dependsOn?: {
    field: string;
    condition: (value: any) => boolean;
  }; // For conditional filters (e.g., mentor filter depends on program)
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
  createdBy: string;
  isShared: boolean;
  context?: string;
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
        // G-GMP Tracks
        { label: 'Patent Track', value: 'Patent Track' },
        { label: 'Research Paper Track', value: 'Research Paper Track' },
        { label: 'Entrepreneurship Track', value: 'Entrepreneurship Track' },
        { label: 'Inventor Foundation Track', value: 'Inventor Foundation Track' },
        // G-CMP Tracks
        { label: 'AI Product Development', value: 'AI Product Development' },
        { label: 'Full Stack Development', value: 'Full Stack Development' },
        { label: 'Cloud Development & Deployment', value: 'Cloud Development & Deployment' },
        { label: 'Agentic AI Development', value: 'Agentic AI Development' },
        // E-TIP Tracks
        { label: 'AI Product Development (E-TIP)', value: 'AI Product Development (E-TIP)' },
        { label: 'Full Stack (E-TIP)', value: 'Full Stack (E-TIP)' },
        { label: 'Cloud Development (E-TIP)', value: 'Cloud Development (E-TIP)' },
        { label: 'Agentic AI (E-TIP)', value: 'Agentic AI (E-TIP)' },
        { label: 'Custom Track', value: 'Custom Track' },
        // PCP Tracks
        { label: 'AI Product Development (PCP)', value: 'AI Product Development (PCP)' },
        { label: 'Agentic AI Systems (PCP)', value: 'Agentic AI Systems (PCP)' },
        { label: 'AI for Finance', value: 'AI for Finance' },
        { label: 'AI Security', value: 'AI Security' }
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
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' }
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
        { label: 'Dr. Brown', value: 'Dr. Brown' },
        { label: 'No Mentor', value: 'none' }
      ],
      dependsOn: {
        field: 'program',
        condition: (program) => program !== 'PCP' // Only show mentor filter for non-PCP programs
      }
    },
    {
      id: 'hasMentor',
      name: 'Has Mentor',
      type: 'boolean',
      field: 'hasMentor',
      options: [
        { label: 'Has Mentor', value: true },
        { label: 'No Mentor', value: false }
      ]
    },
    {
      id: 'joinDate',
      name: 'Join Date',
      type: 'date-range',
      field: 'joinDate'
    },
    {
      id: 'lastActive',
      name: 'Last Active',
      type: 'date-range',
      field: 'lastActive'
    },
    {
      id: 'progress',
      name: 'Progress',
      type: 'number',
      field: 'progress',
      placeholder: 'Min progress %'
    },
    {
      id: 'programType',
      name: 'Program Type',
      type: 'select',
      field: 'programType',
      options: [
        { label: 'Mentor-led', value: 'mentor-led' },
        { label: 'Self-paced', value: 'self-paced' }
      ]
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
      id: 'hasMentor',
      name: 'Has Mentor',
      type: 'boolean',
      field: 'hasMentor',
      options: [
        { label: 'Has Mentor', value: true },
        { label: 'No Mentor', value: false }
      ]
    },
    {
      id: 'date',
      name: 'Date',
      type: 'date-range',
      field: 'date'
    }
  ],
  mentors: [
    {
      id: 'search',
      name: 'Search',
      type: 'text',
      field: 'search',
      placeholder: 'Search by name, email, expertise...'
    },
    {
      id: 'program',
      name: 'Program',
      type: 'multi-select',
      field: 'programs',
      options: [
        { label: 'G-GMP', value: 'G-GMP' },
        { label: 'G-CMP', value: 'G-CMP' },
        { label: 'E-TIP', value: 'E-TIP' }
        // PCP intentionally excluded - mentors don't handle PCP
      ]
    },
    {
      id: 'status',
      name: 'Status',
      type: 'multi-select',
      field: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
    {
      id: 'expertise',
      name: 'Expertise',
      type: 'text',
      field: 'expertise',
      placeholder: 'e.g., AI/ML, Patents, Research'
    },
    {
      id: 'joinDate',
      name: 'Join Date',
      type: 'date-range',
      field: 'joinDate'
    },
    {
      id: 'studentCount',
      name: 'Student Count',
      type: 'number',
      field: 'students',
      placeholder: 'Min students'
    },
    {
      id: 'rating',
      name: 'Rating',
      type: 'number',
      field: 'rating',
      placeholder: 'Min rating',
      options: [
        { label: '4.5+', value: 4.5 },
        { label: '4.0+', value: 4.0 },
        { label: '3.5+', value: 3.5 }
      ]
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
    isShared: true,
    context: 'students'
  },
  {
    id: '2',
    name: 'Pending Reviews',
    filters: {
      status: ['pending']
    },
    createdAt: '2024-03-15',
    createdBy: 'Admin',
    isShared: true,
    context: 'students'
  },
  {
    id: '3',
    name: 'High Progress (>75%)',
    filters: {
      progress: 75
    },
    createdAt: '2024-03-20',
    createdBy: 'Admin',
    isShared: false,
    context: 'students'
  },
  {
    id: '4',
    name: 'PCP Students (Self-paced)',
    filters: {
      program: ['PCP'],
      hasMentor: false
    },
    createdAt: '2024-03-18',
    createdBy: 'Admin',
    isShared: true,
    context: 'students'
  },
  {
    id: '5',
    name: 'Mentor-led Programs',
    filters: {
      programType: 'mentor-led'
    },
    createdAt: '2024-03-17',
    createdBy: 'Admin',
    isShared: true,
    context: 'students'
  },
  {
    id: '6',
    name: 'Active Mentors (G-GMP)',
    filters: {
      program: ['G-GMP'],
      status: ['active']
    },
    createdAt: '2024-03-10',
    createdBy: 'Admin',
    isShared: true,
    context: 'mentors'
  },
  {
    id: '7',
    name: 'Recent Patents',
    filters: {
      type: ['patent'],
      status: ['filed', 'granted']
    },
    createdAt: '2024-03-05',
    createdBy: 'Admin',
    isShared: true,
    context: 'outcomes'
  }
];

export const buildQueryString = (filters: FilterState): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // For arrays, join with commas
        params.append(key, value.join(','));
        params.append(`${key}_type`, 'array');
      } else if (typeof value === 'object' && value !== null) {
        // Handle date range objects
        params.append(key, JSON.stringify(value));
        params.append(`${key}_type`, 'object');
      } else if (typeof value === 'boolean') {
        params.append(key, String(value));
        params.append(`${key}_type`, 'boolean');
      } else {
        params.append(key, String(value));
        params.append(`${key}_type`, 'string');
      }
    }
  });
  
  return params.toString();
};

export const parseQueryString = (search: string): FilterState => {
  const params = new URLSearchParams(search);
  const filters: FilterState = {};
  const typeMap: Record<string, string> = {};
  
  // First pass: collect types
  params.forEach((value, key) => {
    if (key.endsWith('_type')) {
      typeMap[key.replace('_type', '')] = value;
    }
  });
  
  // Second pass: parse values
  params.forEach((value, key) => {
    if (key.endsWith('_type')) return; // Skip type markers
    
    const type = typeMap[key] || 'string';
    
    if (type === 'array') {
      filters[key] = value.split(',');
    } else if (type === 'object') {
      try {
        filters[key] = JSON.parse(value);
      } catch {
        filters[key] = value;
      }
    } else if (type === 'boolean') {
      filters[key] = value === 'true';
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
      if (!filterValue || filterValue === '' || 
          (Array.isArray(filterValue) && filterValue.length === 0)) {
        return true;
      }
      
      const itemValue = item[key];
      
      // Handle special case for mentor filter
      if (key === 'mentor' && filterValue === 'none') {
        return !itemValue || itemValue === '';
      }
      
      // Handle array filters (multi-select)
      if (Array.isArray(filterValue)) {
        // Check if item value is in the filter array
        return filterValue.includes(itemValue);
      }
      
      // Handle search across multiple fields
      if (key === 'search') {
        const searchTerm = String(filterValue).toLowerCase();
        return (
          (item.name?.toLowerCase().includes(searchTerm) || false) ||
          (item.email?.toLowerCase().includes(searchTerm) || false) ||
          (item.registrationNumber?.toLowerCase().includes(searchTerm) || false) ||
          (item.track?.toLowerCase().includes(searchTerm) || false)
        );
      }
      
      // Handle programType filter
      if (key === 'programType') {
        if (filterValue === 'mentor-led') {
          return item.program !== 'PCP';
        } else if (filterValue === 'self-paced') {
          return item.program === 'PCP';
        }
      }
      
      // Handle hasMentor filter
      if (key === 'hasMentor') {
        const hasMentor = !!item.mentor && item.mentor !== '';
        return filterValue ? hasMentor : !hasMentor;
      }
      
      // Handle progress (number comparison)
      if (key === 'progress') {
        return itemValue >= Number(filterValue);
      }
      
      // Handle rating (number comparison)
      if (key === 'rating') {
        return itemValue >= Number(filterValue);
      }
      
      // Handle studentCount (number comparison)
      if (key === 'students') {
        return itemValue >= Number(filterValue);
      }
      
      // Handle date range
      if (key === 'joinDate' || key === 'lastActive' || key === 'date') {
        if (typeof filterValue === 'object' && filterValue !== null) {
          const { start, end } = filterValue as any;
          const itemDate = new Date(itemValue);
          
          if (start && itemDate < new Date(start)) return false;
          if (end) {
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999); // End of day
            if (itemDate > endDate) return false;
          }
          return true;
        }
      }
      
      // Handle expertise text search
      if (key === 'expertise' && Array.isArray(itemValue)) {
        const searchTerm = String(filterValue).toLowerCase();
        return itemValue.some((exp: string) => 
          exp.toLowerCase().includes(searchTerm)
        );
      }
      
      // Handle programs array for mentors
      if (key === 'programs' && Array.isArray(itemValue)) {
        if (Array.isArray(filterValue)) {
          // Check if mentor has any of the selected programs
          return filterValue.some(prog => itemValue.includes(prog));
        }
        return itemValue.includes(filterValue);
      }
      
      // For single values, do direct comparison
      // Convert both to string for comparison to handle type mismatches
      return String(itemValue) === String(filterValue);
    });
  });
};

// Helper function to get available filter options based on dependencies
export const getAvailableFilters = (
  context: string,
  currentFilters: FilterState
): FilterConfig[] => {
  const configs = filterConfigs[context] || [];
  
  return configs.filter(config => {
    // Check if this filter has dependencies
    if (config.dependsOn) {
      const dependentValue = currentFilters[config.dependsOn.field];
      return config.dependsOn.condition(dependentValue);
    }
    return true;
  });
};

// Helper function to get program type (mentor-led or self-paced)
export const getProgramType = (program: string): 'mentor-led' | 'self-paced' => {
  return program === 'PCP' ? 'self-paced' : 'mentor-led';
};

// Helper function to check if a program requires a mentor
export const programRequiresMentor = (program: string): boolean => {
  return program !== 'PCP';
};

// Helper function to validate mentor assignment
export const isValidMentorAssignment = (program: string, mentor?: string): boolean => {
  if (program === 'PCP') {
    return !mentor; // PCP should not have mentor
  }
  return !!mentor; // Other programs require mentor
};