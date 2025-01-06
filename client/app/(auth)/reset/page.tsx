import { Suspense } from "react";
import { BeatLoader } from "react-spinners";
import { ResetForm } from "@/components/auth/ResetForm";

const ResetPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <BeatLoader />
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
};

export default ResetPage;
