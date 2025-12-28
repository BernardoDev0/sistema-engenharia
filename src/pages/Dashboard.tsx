// src/pages/Dashboard.tsx

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DashboardContent = () => {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <nav className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate("/equipment")}>
                Equipment
              </Button>
              <Button variant="ghost" onClick={() => navigate("/my-equipment")}>
                My Equipment
              </Button>
              {(roles.includes("ADMIN") || roles.includes("OPERATIONS_MANAGER") || roles.includes("COMPLIANCE_ESG")) && (
                <Button variant="ghost" onClick={() => navigate("/executive-dashboard")}>
                  Executive
                </Button>
              )}
              {roles.includes("ADMIN") && (
                <Button variant="ghost" onClick={() => navigate("/users")}>
                  Users
                </Button>
              )}
            </nav>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl space-y-6">
          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{user?.id || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Roles</p>
                {roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No roles assigned. Contact your administrator.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-medium">Welcome</h2>
            <p className="text-sm text-muted-foreground">
              You are successfully authenticated. This is a protected area that
              requires a valid session. Additional modules (Equipment, Inventory)
              will be wired here once confirmed.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

export default Dashboard;
