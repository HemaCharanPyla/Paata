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
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search size={20} className="text-black" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="WHAT'S THE VIBE?"
        className="w-full bg-white text-black text-sm neo-border neo-shadow-sm py-3 pl-10 pr-10 focus:outline-none placeholder:text-black/40 font-bold uppercase tracking-wider"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-3 flex items-center text-black hover:text-neo-pink transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
