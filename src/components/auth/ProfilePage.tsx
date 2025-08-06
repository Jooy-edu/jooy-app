import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronLeft } from 'lucide-react';
import { getTextDirection } from '@/lib/textDirection';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!user) {
      setError('User not authenticated.');
      setUpdateLoading(false);
      return;
    }

    const updates: { full_name?: string } = {};
    if (fullName !== profile?.full_name) {
      updates.full_name = fullName;
    }

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      setUpdateLoading(false);
      return;
    }

    const { error: updateError } = await updateProfile(updates);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    }
    setUpdateLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const isRTL = t('common.language') === 'العربية';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-lg text-red-500 mb-4">You are not logged in.</p>
        <Button 
          onClick={() => navigate('/auth/login')} 
          className="bg-gradient-orange-magenta hover:bg-gradient-orange-magenta text-white"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button
        onClick={() => navigate('/home')}
        className="fixed top-4 left-4 z-50 rounded-full bg-gradient-orange-magenta hover:bg-gradient-orange-magenta text-white shadow-lg"
        size="icon"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <CardTitle className="text-2xl font-bold text-gradient-clip">
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  disabled 
                  className="bg-gray-100" 
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-100'}
                />
              </div>
              {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {isEditing ? (
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-orange-magenta hover:bg-gradient-orange-magenta text-white" 
                    disabled={updateLoading}
                  >
                    {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)} 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button" 
                  className="w-full bg-gradient-orange-magenta hover:bg-gradient-orange-magenta text-white" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleLogout} 
                className="w-full mt-4"
              >
                Logout
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;