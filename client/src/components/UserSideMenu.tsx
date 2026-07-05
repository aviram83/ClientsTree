import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface UserSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserSideMenu = ({ isOpen, onClose, onLogout }: UserSideMenuProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-20',
        isOpen ? 'visible' : 'invisible pointer-events-none'
      )}
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
          'absolute inset-y-0 left-0 flex h-full w-3/4 max-w-xs md:max-w-sm flex-col bg-card shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex-grow overflow-y-auto p-4" />

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
