"use client";
import { Suspense } from "react";
import NewVerificationForm from "@/components/auth/NewVerificationForm";

const NewVerificationPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewVerificationForm />
    </Suspense>
  );
};

export default NewVerificationPage;
