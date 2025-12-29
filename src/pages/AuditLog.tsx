// src/pages/AuditLog.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
            <CardTitle>Acesso restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O log de auditoria é restrito a papéis de administração e compliance.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => navigate("/dashboard")}>
              Voltar para o painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <section>
          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Atividade recente</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Carregando trilha de auditoria…</div>
              ) : !logs || logs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum registro de auditoria ainda. Ações críticas como empréstimos, devoluções e relatos de dano aparecerão aqui.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-border/60 text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2 text-left font-medium">Hora</th>
                        <th className="py-2 text-left font-medium">Ação</th>
                        <th className="py-2 text-left font-medium">Entidade</th>
                        <th className="py-2 text-left font-medium">ID da entidade</th>
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

const AuditLog = () => <AuditLogContent />;

export default AuditLog;
