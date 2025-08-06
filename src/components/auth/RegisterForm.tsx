import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTextDirection } from '@/lib/textDirection';

// Password strength requirements
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

// Comprehensive validation schema
const registerSchema = z.object({
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
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
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

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setGeneralError('');

    try {
      const { error } = await signUp(
        data.email, 
        data.password, 
        data.fullName,
        data.username || undefined
      );

      if (error) {
        // Handle specific error types
        if (error.message.includes('already registered')) {
          setGeneralError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Username already taken')) {
          form.setError('username', { message: 'This username is already taken' });
        } else if (error.message.includes('Password')) {
          form.setError('password', { message: error.message });
        } else {
          setGeneralError(error.message);
        }
      } else {
        // Successful registration
        navigate('/auth/login', {
          state: {
            message: 'Registration successful! Please check your email to verify your account before signing in.'
          }
        });
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isRTL = t('common.language') === 'العربية';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
          <CardTitle className="text-2xl font-bold text-gradient-clip">
            Create Your Account
          </CardTitle>
          <CardDescription>
            Join Jooy to access interactive worksheets
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
              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your full name"
                        disabled={loading}
                        autoComplete="name"
                        dir={getTextDirection(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username Field (Optional) */}
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
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        disabled={loading}
                        autoComplete="email"
                        dir={getTextDirection(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field with Strength Indicator */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
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
                    <FormLabel>Confirm Password *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;