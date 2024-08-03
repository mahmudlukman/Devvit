'use client';

import { useCallback, useEffect, useState } from 'react';
import { CardWrapper } from './CardWrapper';
import { BeatLoader } from 'react-spinners';
import { useSearchParams } from 'next/navigation';
import { FormSuccess } from '../FormSuccess';
import { FormError } from '../FormError';
import { useActivationMutation } from '@/redux/features/auth/authApi';

const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const [activate, { isLoading }] = useActivationMutation();

  const token = searchParams?.get('token');

  const onSubmit = useCallback(async () => {
    if (!token) {
      setError('Missing token');
      return;
    }

    try {
      const result = await activate({ activation_token: token }).unwrap();
      setSuccess(result.message || 'Account activated successfully');
    } catch (error: any) {
      setError(error.data?.message || 'Something went wrong!');
    }
  }, [token, activate]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/login"
    >
      <div className="flex items-center w-full justify-center">
        {isLoading && <BeatLoader />}
        {!isLoading && success && <FormSuccess message={success} />}
        {!isLoading && error && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;