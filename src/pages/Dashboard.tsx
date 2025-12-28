// src/pages/Dashboard.tsx

import { identityFacade } from "@/app/composition/identity";

const Dashboard = () => {
  // Placeholder wiring to the Identity facade.
  void identityFacade;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-2xl space-y-6 px-4 text-center">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Identity wiring is in place. Real authentication and data will be added later.
          </p>
        </header>

        <section className="rounded-lg border bg-card p-6 text-left shadow-sm">
          <h2 className="mb-2 text-lg font-medium">Current user</h2>
          <p className="text-sm text-muted-foreground">
            No user is logged in yet. Once authentication is implemented, the
            active user from <code>IdentityFacade</code> will appear here.
          </p>
        </section>

        <section className="rounded-lg border bg-card p-6 text-left shadow-sm">
          <h2 className="mb-2 text-lg font-medium">Getting started</h2>
          <p className="text-sm text-muted-foreground">
            This is an empty state. Use this area to surface identity-aware
            content after wiring real auth and roles.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
