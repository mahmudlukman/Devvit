import { Suspense } from "react";
import { BeatLoader } from "react-spinners";
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <BeatLoader />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
};

export default Register;
