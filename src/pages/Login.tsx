// src/pages/Login.tsx

import { identityFacade } from "@/app/composition/identity";

const Login = () => {
  // Reference the facade to ensure wiring is in place.
  void identityFacade;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-4 px-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Minimal login shell. Authentication will be wired here once implemented.
        </p>
      </div>
    </div>
  );
};

export default Login;
