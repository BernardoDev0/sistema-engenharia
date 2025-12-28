// src/pages/AuditLog.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { listAuditLogsUseCase } from "@/app/composition/analytics";

const AuditLogContent = () => {
  const { roles, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Audit Log | Equipment ESG";
  }, []);

  const isAllowed = roles.includes("ADMIN") || roles.includes("COMPLIANCE_ESG");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const result = await listAuditLogsUseCase.execute({ limit: 200 });
      return result.logs;
    },
    enabled: isAllowed,
  });

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Access restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The audit log is restricted to admin and compliance roles.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/60">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold tracking-tight">Audit Log</h1>
            <nav className="flex gap-2 text-sm">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate("/executive-dashboard")}>
                Executive
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs tracking-wide">
              Compliance
            </Badge>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section>
          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Loading audit trail…</div>
              ) : !logs || logs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No audit entries recorded yet. Critical actions such as loans, returns and damage
                  reports will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-border/60 text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2 text-left font-medium">Time</th>
                        <th className="py-2 text-left font-medium">Action</th>
                        <th className="py-2 text-left font-medium">Entity</th>
                        <th className="py-2 text-left font-medium">Entity ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b border-border/40 last:border-0">
                          <td className="py-2 align-middle text-xs text-muted-foreground">
                            {log.createdAt.toLocaleString()}
                          </td>
                          <td className="py-2 align-middle font-medium">{log.action}</td>
                          <td className="py-2 align-middle text-xs text-muted-foreground">{log.entityType}</td>
                          <td className="py-2 align-middle text-xs font-mono">
                            {log.entityId ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

const AuditLog = () => (
  <ProtectedRoute>
    <AuditLogContent />
  </ProtectedRoute>
);

export default AuditLog;
