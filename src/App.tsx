import { Authenticated, Unauthenticated } from "convex/react";
import { Dashboard } from "./components/dashboard/Dashboard";
import { SignInForm } from "./components/auth/SignInForm";

const App = () => {
  return (
    <>
      <Authenticated>
        <Dashboard />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
};

export default App;

