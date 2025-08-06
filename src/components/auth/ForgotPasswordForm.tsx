import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTextDirection } from '@/lib/textDirection';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setGeneralError('');
    setSuccess(false);

    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        if (error.message.includes('rate limit')) {
          setGeneralError('Too many reset requests. Please wait before trying again.');
        } else {
          setGeneralError(error.message);
        }
      } else {
        setSuccess(true);
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
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <p className="text-sm text-gray-600 mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour for security.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setSuccess(false);
                  form.reset();
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Email
              </Button>
              
              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
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
            Reset Your Password
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
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
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email address"
                        disabled={loading}
                        autoComplete="email"
                        dir={getTextDirection(field.value)}
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
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
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

export default ForgotPasswordForm;