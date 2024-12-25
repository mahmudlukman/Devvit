import { Suspense } from "react";
import { LoginForm } from "../../../components/auth/LoginForm";

const Login = () => {
  return <LoginForm />;
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
};

export default Page;
