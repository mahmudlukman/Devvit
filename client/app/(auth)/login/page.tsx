import { Suspense } from "react";
import { BeatLoader } from "react-spinners";
import { LoginForm } from "../../../components/auth/LoginForm";

const Login = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <BeatLoader />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
};

export default Login;
