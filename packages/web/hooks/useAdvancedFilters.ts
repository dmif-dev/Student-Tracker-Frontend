// hooks/useAdvancedFilters.ts

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
  
  // Initialize with URL filters or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    // First check URL params
    const urlFilters = parseQueryString(searchParams.toString());
    if (Object.keys(urlFilters).length > 0) {
      console.log('Initializing from URL:', urlFilters);
      return urlFilters;
    }
    
    // If no URL params, check localStorage (but only after mount)
    return defaultFilters;
  });
  
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Check if we have URL params - if yes, don't load from localStorage
      const urlFilters = parseQueryString(searchParams.toString());
      if (Object.keys(urlFilters).length > 0) {
        setFilters(urlFilters);
      } else {
        // No URL params, try loading from localStorage
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('Loading filters from localStorage:', parsed);
          setFilters(parsed);
          
          // Update URL to match localStorage
          const queryString = buildQueryString(parsed);
          router.push(`?${queryString}`, { scroll: false });
        }
      }
      
      // Load presets
      const savedPresetsFromStorage = localStorage.getItem('filterPresets');
      if (savedPresetsFromStorage) {
        setPresets(JSON.parse(savedPresetsFromStorage));
      } else {
        setPresets(savedPresets);
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [storageKey, searchParams, router]);

  // Update URL and localStorage when filters change
  useEffect(() => {
    // Only save after initial load is complete
    if (!isInitialized) return;
    
    const queryString = buildQueryString(filters);
    console.log('Filters changed, updating URL and localStorage:', filters);
    router.push(`?${queryString}`, { scroll: false });
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, [filters, router, storageKey, isInitialized]);

  // Update function with logging
  const updateFilter = useCallback((key: string, value: any) => {
    console.log(`Updating filter ${key}:`, value);
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      console.log('New filters state:', newFilters);
      return newFilters;
    });
    setActivePreset(null);
  }, []);

  const removeFilter = useCallback((key: string) => {
    console.log(`Removing filter ${key}`);
    setFilters(prev => {
      const { [key]: _, ...rest } = prev;
      console.log('Filters after removal:', rest);
      return rest;
    });
  }, []);

  const clearFilters = useCallback(() => {
    console.log('Clearing all filters');
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
  }, [filters]);

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
    hasActiveFilters: Object.keys(filters).length > 0,
    isInitialized // Export this to let parent know when filters are ready
  };
};