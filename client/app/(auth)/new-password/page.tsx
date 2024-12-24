import { Suspense } from "react";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

const NewPasswordPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordForm />
    </Suspense>
  );
};

export default NewPasswordPage;
