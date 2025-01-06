import { Suspense } from "react";
import { BeatLoader } from "react-spinners";
import NewVerificationForm from "@/components/auth/NewVerificationForm";

const NewVerificationPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <BeatLoader />
        </div>
      }
    >
      <NewVerificationForm />
    </Suspense>
  );
};

export default NewVerificationPage;
