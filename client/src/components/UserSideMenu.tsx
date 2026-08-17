import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, isNavGroup } from '@/config/navConfig';

interface UserSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserSideMenu = ({ isOpen, onClose, onLogout }: UserSideMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

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
      >
        <nav className="flex-grow overflow-y-auto p-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((entry) => {
              if (isNavGroup(entry)) {
                return (
                  <li key={entry.label}>
                    <div dir="rtl" className="flex items-center gap-2 px-3 pt-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                      <entry.icon className="h-4 w-4 shrink-0" />
                      {entry.label}
                    </div>
                    <ul className="flex flex-col gap-1 pe-4">
                      {entry.children.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <li key={item.path}>
                            <button
                              type="button"
                              dir="rtl"
                              onClick={() => {
                                navigate(item.path);
                                onClose();
                              }}
                              className={cn(
                                'w-full rounded-md px-3 py-2 text-right text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                              )}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              <span className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 shrink-0" />
                                {item.label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              }

              const isActive = location.pathname === entry.path;
              return (
                <li key={entry.path}>
                  <button
                    type="button"
                    dir="rtl"
                    onClick={() => {
                      navigate(entry.path);
                      onClose();
                    }}
                    className={cn(
                      'w-full rounded-md px-3 py-2 text-right text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="flex items-center gap-2">
                      <entry.icon className="h-4 w-4 shrink-0" />
                      {entry.label}
                    </span>
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
