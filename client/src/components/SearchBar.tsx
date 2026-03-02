import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
}) => {
  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 p-1">
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className={`rounded-full p-2 transition-colors duration-300 ${
            isSearchOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
          }`}
          aria-label="Toggle Search"
        >
          <Search size={20} />
        </button>
        <input
          type="text"
          placeholder="חיפוש לקוח..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`bg-transparent outline-none text-sm transition-all duration-300 text-right ${
            isSearchOpen ? 'w-48 px-3 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}
          dir="rtl"
        />
      </div>
    </div>
  );
};

export default SearchBar;