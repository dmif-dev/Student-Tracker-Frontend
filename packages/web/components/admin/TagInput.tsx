'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: Tag[];
}

export default function TagInput({
  selectedTags,
  onChange,
  placeholder = 'Add tags...',
  suggestions = []
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = suggestions.filter(
      tag => 
        !selectedTags.includes(tag.id) &&
        tag.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [inputValue, suggestions, selectedTags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tagId: string) => {
    onChange([...selectedTags, tagId]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter(id => id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      // Create new tag if no suggestion selected
      if (filteredSuggestions.length > 0) {
        handleAddTag(filteredSuggestions[0].id);
      }
    }
  };

  const getTagDetails = (tagId: string): Tag | undefined => {
    return suggestions.find(t => t.id === tagId);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
        {selectedTags.map(tagId => {
          const tag = getTagDetails(tagId);
          if (!tag) return null;
          
          return (
            <span
              key={tagId}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-${tag.color}-100 text-${tag.color}-700`}
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tagId)}
                className="ml-2 hover:opacity-75"
              >
                <X size={14} />
              </button>
            </span>
          );
        })}
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] outline-none text-sm"
          placeholder={selectedTags.length === 0 ? placeholder : ''}
        />
      </div>

      {showSuggestions && (filteredSuggestions.length > 0 || inputValue) && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map(tag => (
            <button
              key={tag.id}
              onClick={() => handleAddTag(tag.id)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
            >
              <span className={`px-2 py-1 rounded-full text-sm bg-${tag.color}-100 text-${tag.color}-700`}>
                {tag.name}
              </span>
              <Plus size={16} className="text-gray-400" />
            </button>
          ))}
          
          {inputValue && filteredSuggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No matching tags. Press Enter to create "{inputValue}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
