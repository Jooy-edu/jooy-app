import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Mail, Calendar, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTextDirection } from '@/lib/textDirection';

// Profile update validation schema
const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, 'Full name can only contain letters and spaces'),
  username: z
    .string()
    .optional()
    .refine((val) => !val || (val.length >= 3 && val.length <= 30), {
      message: 'Username must be 3-30 characters if provided'
    })
    .refine((val) => !val || /^[a-zA-Z0-9_]+$/.test(val), {
      message: 'Username can only contain letters, numbers, and underscores'
    }),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, updateProfile, signOut } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      username: profile?.username || '',
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || '',
        username: profile.username || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    setLoading(true);
    setGeneralError('');
    setSuccess(false);

    try {
      const { error } = await updateProfile({
        full_name: data.fullName,
        username: data.username || null,
      });

      if (error) {
        if (error.message.includes('username')) {
          form.setError('username', { message: 'This username is already taken' });
        } else {
          setGeneralError(error.message);
        }
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isRTL = t('common.language') === 'العربية';

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader dir={isRTL ? 'rtl' : 'ltr'}>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Success message */}
              {success && (
                <Alert className="mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Profile updated successfully!</AlertDescription>
                </Alert>
              )}

              {/* General error message */}
              {generalError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                  {/* Full Name Field */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your full name"
                            disabled={loading}
                            dir={getTextDirection(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Username Field */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Choose a username"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-orange-magenta hover:bg-gradient-orange-magenta text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Profile...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Information Card */}
          <Card>
            <CardHeader dir={isRTL ? 'rtl' : 'ltr'}>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                View your account details and security information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Email:</span>
                </div>
                <span className="text-sm text-gray-600">{profile.email}</span>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Role:</span>
                </div>
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                  {profile.role}
                </Badge>
              </div>

              {/* Account Created */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Member since:</span>
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Last Login */}
              {profile.last_login_at && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Last login:</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(profile.last_login_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              <Separator />

              {/* Sign Out Button */}
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;