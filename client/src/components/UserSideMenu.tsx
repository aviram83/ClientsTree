import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/config/navConfig';

interface UserSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserSideMenu = ({ isOpen, onClose, onLogout }: UserSideMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPendingPath(null);
    }
  }, [isOpen]);

  return (
    <div
      className={cn('fixed inset-0 z-20', !isOpen && 'pointer-events-none')}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'absolute left-0 top-[72px] bottom-0 flex w-3/4 max-w-xs md:max-w-sm flex-col bg-card shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        onTransitionEnd={(e) => {
          if (e.propertyName === 'transform' && !isOpen && pendingPath) {
            navigate(pendingPath);
            setPendingPath(null);
          }
        }}
      >
        <nav className="flex-grow overflow-y-auto p-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingPath(item.path);
                      onClose();
                    }}
                    className={cn(
                      'w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t p-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
