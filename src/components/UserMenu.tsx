import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserCircle, LogOut, LogIn, User as UserIcon, Settings } from 'lucide-react';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  console.log('UserMenu: Render state -', { loading, hasUser: !!user, hasProfile: !!profile });

  console.log('UserMenu: Render state -', { loading, hasUser: !!user, hasProfile: !!profile });

  console.log('UserMenu: Render state -', { loading, hasUser: !!user, hasProfile: !!profile });

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  if (loading) {
    console.log('UserMenu: Showing loading state');
    console.log('UserMenu: Showing loading state');
    console.log('UserMenu: Showing loading state');
    return (
      <Button variant="outline" size="icon" className="bg-white shadow-md" disabled>
        <UserCircle className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  console.log('UserMenu: Rendering interactive menu');

  console.log('UserMenu: Rendering interactive menu');

  console.log('UserMenu: Rendering interactive menu');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white shadow-md">
          <UserCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          <>
            <DropdownMenuItem disabled className="opacity-100">
              <UserIcon className="h-4 w-4 mr-2" />
              <div className="flex flex-col">
                <span className="font-medium">{profile?.full_name || 'User'}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => navigate('/auth/login')}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/auth/register')}>
              <UserIcon className="h-4 w-4 mr-2" />
              Register
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;