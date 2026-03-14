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
        <Search size={20} className="text-neutral-500 dark:text-neutral-900" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What do you want to listen to?"
        className="w-full bg-neutral-200 dark:bg-white text-neutral-900 dark:text-black text-sm rounded-full py-3 pl-10 pr-10 focus:outline-none placeholder:text-neutral-500 transition-colors duration-300"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-500 dark:text-neutral-900"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
