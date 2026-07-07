// client/src/components/FloatingToolbar.tsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';
import LegendContent from './LegendContent';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

interface FloatingToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCount: number;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  activeCount,
}) => {
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  return (
    <div className="absolute top-4 left-4 right-4 z-50 mx-auto w-auto max-w-3xl">
      <div className="flex items-stretch bg-card rounded-full shadow-lg border border-border h-14">
        <div className="w-1/2 min-w-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <div className="w-px self-center h-8 bg-border mx-1 sm:mx-2" />

        <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 min-w-0">
          <div className="flex flex-col leading-tight text-[10px] font-medium text-muted-foreground text-right">
            <span>Active</span>
            <span>Clients</span>
          </div>
          <span className="text-foreground font-bold text-[clamp(1rem,4vw,1.75rem)] truncate">
            {activeCount}
          </span>
        </div>

        <div className="w-px self-center h-8 bg-border mx-1 sm:mx-2" />

        <Popover open={isLegendOpen} onOpenChange={setIsLegendOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full mx-1 self-center ${isLegendOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              aria-label={isLegendOpen ? 'Close Legend' : 'Open Legend'}
            >
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${isLegendOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 bg-card border-border">
            <LegendContent />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FloatingToolbar;
