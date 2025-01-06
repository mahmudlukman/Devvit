import { Suspense } from "react";
import { BeatLoader } from "react-spinners";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

const NewPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <BeatLoader />
        </div>
      }
    >
      <NewPasswordForm />
    </Suspense>
  );
};

export default NewPasswordPage;
