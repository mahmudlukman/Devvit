'use client';

import { useState } from 'react';
import { CardWrapper } from './CardWrapper';
import { BeatLoader } from 'react-spinners';
import { FormSuccess } from '../FormSuccess';
import { FormError } from '../FormError';
import { useForgotPasswordMutation } from '@/redux/features/auth/authApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    setError('');
    setSuccess('');

    try {
      const result = await forgotPassword(values).unwrap();
      setSuccess(result.message || 'Password reset email sent successfully');
      form.reset();
    } catch (error: any) {
      setError(error.data?.message || 'Something went wrong!');
    }
  };

  return (
    <CardWrapper
      headerLabel="Forgot Password"
      backButtonLabel="Back to login"
      backButtonHref="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="john.doe@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <BeatLoader />
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
