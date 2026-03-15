import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onClear }) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search size={24} strokeWidth={3} className="text-black" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="SEARCH MUSIC..."
        className="w-full bg-white text-black text-lg font-black uppercase tracking-tighter neo-border neo-shadow py-3 pl-12 pr-12 focus:outline-none placeholder:text-black/30"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-4 flex items-center text-black hover:text-neo-pink"
        >
          <X size={24} strokeWidth={3} />
        </button>
      )}
    </div>
  );
};
