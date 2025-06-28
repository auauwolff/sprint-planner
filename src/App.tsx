import { Authenticated, Unauthenticated } from "convex/react";
import { Dashboard, SignInForm } from "./components";

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

