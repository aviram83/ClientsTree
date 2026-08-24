import React, { useRef } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2 w-full min-w-0">
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        className="shrink-0 p-2 text-muted-foreground hover:text-primary transition-colors"
        aria-label={t('searchBar.focusAria')}
      >
        <Search size={20} />
      </button>
      <input
        ref={inputRef}
        type="text"
        placeholder={t('searchBar.placeholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 min-w-0 w-full bg-transparent text-sm text-left border-0 border-b border-border focus:outline-none focus:border-primary py-1"
        dir="ltr"
      />
    </div>
  );
};

export default SearchBar;
