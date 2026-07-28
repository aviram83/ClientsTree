import { ReactNode, useState } from 'react';
import { User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { UserSideMenu } from '../components/UserSideMenu';
import { Logo } from '../components/Logo';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const logout = useAuthStore((s) => s.logout);
  const profile = useProfileStore((s) => s.profile);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-muted flex flex-col">
      <div className="bg-card shadow-md z-30">
        <header className="w-full h-[72px] px-4 py-4 grid grid-cols-[1fr_auto_1fr] items-center">
          <button
            type="button"
            onClick={() => setIsSideMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 justify-self-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open user menu"
          >
            <Avatar>
              <AvatarFallback>
                {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold hidden sm:inline">{profile?.firstName}</span>
          </button>
          <Logo className="justify-self-center" />
          <div className="justify-self-end" />
        </header>
      </div>
      <main className="flex-grow relative z-10">{children}</main>
      <UserSideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onLogout={logout}
      />
    </div>
  );
};
