"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { CardWrapper } from "./CardWrapper";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { FormSuccess } from "../FormSuccess";
import { FormError } from "../FormError";
import { useActivationMutation } from "@/redux/features/auth/authApi";

// Component that handles search params
const VerificationFormWithParams = () => {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;

  return <VerificationFormContent token={token} />;
};

// Main form content component
const VerificationFormContent = ({ token }: { token: string | null }) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [activate, { isLoading }] = useActivationMutation();

  const onSubmit = useCallback(async () => {
    if (!token) {
      setError("Missing token");
      return;
    }

    try {
      const result = await activate({ activation_token: token }).unwrap();
      setSuccess(result.message || "Account activated successfully");
    } catch (error: any) {
      setError(error.data?.message || "Something went wrong!");
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

// Export wrapped component with Suspense
const NewVerificationForm = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center w-full justify-center">
          <BeatLoader />
        </div>
      }
    >
      <VerificationFormWithParams />
    </Suspense>
  );
};

export default NewVerificationForm;
