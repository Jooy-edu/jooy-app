import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff, Check, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Password requirements (same as registration)
interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
  { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

// Validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .refine((pwd) => passwordRequirements.every(req => req.test(pwd)), {
      message: 'Password must meet all requirements'
    }),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  // Check for valid reset token in URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setGeneralError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setGeneralError('');

    try {
      const { error } = await updatePassword(data.password);

      if (error) {
        if (error.message.includes('session')) {
          setGeneralError('Your reset link has expired. Please request a new password reset.');
        } else {
          setGeneralError(error.message);
        }
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login', {
            state: {
              message: 'Password updated successfully! Please sign in with your new password.'
            }
          });
        }, 3000);
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isRTL = t('common.language') === 'العربية';

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Password Updated!
            </CardTitle>
            <CardDescription>
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <p className="text-sm text-gray-600 mb-4">
              Redirecting you to sign in...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
          <CardTitle className="text-2xl font-bold text-gradient-clip">
            Set New Password
          </CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* General error message */}
          {generalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* New Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your new password"
                          disabled={loading}
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    
                    {/* Password Requirements */}
                    {password && (
                      <div className="mt-2 space-y-1">
                        {passwordRequirements.map((req, index) => {
                          const isValid = req.test(password);
                          return (
                            <div key={index} className="flex items-center text-xs">
                              {isValid ? (
                                <Check className="h-3 w-3 text-green-500 mr-2" />
                              ) : (
                                <X className="h-3 w-3 text-red-500 mr-2" />
                              )}
                              <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                                {req.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          disabled={loading}
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
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
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordForm;