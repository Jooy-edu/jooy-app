import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Settings, LogOut, Shield } from 'lucide-react';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Show login button if not authenticated
  if (!user || !profile) {
    return (
      <Link to="/auth/login">
        <Button 
          variant="outline" 
          className="bg-white shadow-md hover:bg-gray-50"
          dir={t('common.language') === 'العربية' ? 'rtl' : 'ltr'}
        >
          Sign In
        </Button>
      </Link>
    );
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userInitials = getInitials(profile.full_name || profile.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white shadow-md">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'User'} />
            <AvatarFallback className="bg-gradient-orange-magenta text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1" dir={t('common.language') === 'العربية' ? 'rtl' : 'ltr'}>
            <p className="text-sm font-medium leading-none">
              {profile.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
            <div className="flex items-center mt-1">
              <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                {profile.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Profile Settings */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>

        {/* Password Reset */}
        <DropdownMenuItem asChild>
          <Link to="/auth/forgot-password" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* Sign Out */}
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;