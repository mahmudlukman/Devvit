import { Suspense } from "react";
import { LoginForm } from "../../../components/auth/LoginForm";

const Login = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
};

export default Login;
