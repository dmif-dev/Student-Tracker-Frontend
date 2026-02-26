'use client';

import { useState } from 'react';
import {
  Filter,
  X,
  Save,
  Share2,
  Trash2,
  ChevronDown,
  Calendar,
  Search
} from 'lucide-react';
import { FilterConfig, filterConfigs } from '@/utils/filterUtils';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';

interface AdvancedFiltersProps {
  context: 'students' | 'outcomes' | 'mentors';
  onFilterChange?: (filters: any) => void;
}

export default function AdvancedFilters({ context, onFilterChange }: AdvancedFiltersProps) {
  const {
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
    hasActiveFilters
  } = useAdvancedFilters({ storageKey: `${context}Filters` });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const configs = filterConfigs[context];

  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key, value);
    onFilterChange?.({ ...filters, [key]: value });
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const FilterChip = ({ filterKey, value }: { filterKey: string; value: any }) => {
    const config = configs.find(c => c.id === filterKey);
    if (!config) return null;

    let displayValue = value;
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (filterKey === 'joinDate' && typeof value === 'object') {
      const { start, end } = value;
      displayValue = `${start || ''} - ${end || ''}`;
    }

    return (
      <div className="inline-flex items-center bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm">
        <span className="font-medium mr-1">{config.name}:</span>
        <span className="truncate max-w-[150px]">{displayValue}</span>
        <button
          onClick={() => removeFilter(filterKey)}
          className="ml-2 text-primary-600 hover:text-primary-700"
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  const FilterPanel = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 absolute top-12 left-0 w-96 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Advanced Filters</h3>
        <button
          onClick={() => setShowFilterPanel(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {configs.map((config) => (
          <div key={config.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {config.name}
            </label>
            
            {config.type === 'text' && (
              <input
                type="text"
                value={filters[config.id] || ''}
                onChange={(e) => handleFilterChange(config.id, e.target.value)}
                placeholder={config.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}

            {config.type === 'select' && (
              <select
                value={filters[config.id] || ''}
                onChange={(e) => handleFilterChange(config.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                {config.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {config.type === 'multi-select' && (
              <div className="space-y-2">
                {config.options?.map((opt) => (
                  <label key={opt.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters[config.id] || []).includes(opt.value)}
                      onChange={(e) => {
                        const current = filters[config.id] || [];
                        const newValue = e.target.checked
                          ? [...current, opt.value]
                          : current.filter((v: string) => v !== opt.value);
                        handleFilterChange(config.id, newValue);
                      }}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {config.type === 'date-range' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters[config.id]?.start || ''}
                  onChange={(e) => handleFilterChange(config.id, {
                    ...filters[config.id],
                    start: e.target.value
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Start"
                />
                <input
                  type="date"
                  value={filters[config.id]?.end || ''}
                  onChange={(e) => handleFilterChange(config.id, {
                    ...filters[config.id],
                    end: e.target.value
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="End"
                />
              </div>
            )}

            {config.type === 'number' && (
              <input
                type="number"
                value={filters[config.id] || ''}
                onChange={(e) => handleFilterChange(config.id, e.target.value)}
                placeholder={config.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear all
        </button>
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <Save size={16} className="mr-1" />
          Save as preset
        </button>
      </div>
    </div>
  );

  const SavePresetModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preset Name
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Active Students"
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="rounded border-gray-300 mr-2"
            />
            <span className="text-sm">Share with team</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowSaveModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              savePreset(presetName, isShared);
              setShowSaveModal(false);
              setPresetName('');
              setIsShared(false);
            }}
            disabled={!presetName}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={`flex items-center px-4 py-2 border rounded-lg transition-colors relative ${
            showFilterPanel || hasActiveFilters
              ? 'bg-primary-50 border-primary-300 text-primary-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter size={18} className="mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Save size={18} className="mr-2" />
          Presets
          <ChevronDown size={16} className="ml-2" />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(filters).map(([key, value]) => (
            <FilterChip key={key} filterKey={key} value={value} />
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && <FilterPanel />}

      {/* Presets Dropdown */}
      {showPresets && (
        <div className="absolute top-12 left-32 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {presets.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No saved presets
            </div>
          ) : (
            <>
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                    activePreset === preset.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1"
                      onClick={() => {
                        loadPreset(preset);
                        setShowPresets(false);
                      }}
                    >
                      <p className="text-sm font-medium">{preset.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(preset.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {preset.isShared && (
                        <Share2 size={14} className="text-gray-400" />
                      )}
                      <button
                        onClick={() => sharePreset(preset.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Share2 size={12} />
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="p-1 hover:bg-gray-200 rounded text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Save Preset Modal */}
      {showSaveModal && <SavePresetModal />}
    </div>
  );
}