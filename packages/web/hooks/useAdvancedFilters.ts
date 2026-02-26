import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterState, FilterPreset, parseQueryString, buildQueryString, savedPresets } from '@/utils/filterUtils';

interface UseAdvancedFiltersProps {
  storageKey?: string;
  defaultFilters?: FilterState;
}

export const useAdvancedFilters = ({
  storageKey = 'savedFilters',
  defaultFilters = {}
}: UseAdvancedFiltersProps = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load from URL first, then localStorage, then defaults
    const urlFilters = parseQueryString(searchParams.toString());
    if (Object.keys(urlFilters).length > 0) return urlFilters;
    
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultFilters;
  });
  
  const [presets, setPresets] = useState<FilterPreset[]>(savedPresets);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const queryString = buildQueryString(filters);
    router.push(`?${queryString}`, { scroll: false });
    localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [filters, router, storageKey]);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setActivePreset(null);
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setActivePreset(null);
  }, []);

  const savePreset = useCallback((name: string, isShared: boolean = false) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
      isShared
    };
    
    setPresets(prev => [...prev, newPreset]);
    
    // In real app, save to API
    localStorage.setItem('filterPresets', JSON.stringify([...presets, newPreset]));
  }, [filters, presets]);

  const loadPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters);
    setActivePreset(preset.id);
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
    if (activePreset === id) {
      setActivePreset(null);
    }
  }, [activePreset]);

  const sharePreset = useCallback((id: string) => {
    setPresets(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isShared: true } : p
      )
    );
    // Generate shareable link
    const preset = presets.find(p => p.id === id);
    if (preset) {
      const queryString = buildQueryString(preset.filters);
      const shareUrl = `${window.location.origin}${window.location.pathname}?${queryString}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Filter link copied to clipboard!');
    }
  }, [presets]);

  return {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    presets,
    activePreset,
    savePreset,
    loadPreset,
    deletePreset,
    sharePreset,
    showFilterPanel,
    setShowFilterPanel,
    hasActiveFilters: Object.keys(filters).length > 0
  };
};