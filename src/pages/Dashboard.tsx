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
            <h1 className="text-xl font-semibold">Painel</h1>
            <nav className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate("/equipment")}>
                Equipamentos
              </Button>
              <Button variant="ghost" onClick={() => navigate("/my-equipment")}>
                Meus equipamentos
              </Button>
              {(roles.includes("ADMIN") || roles.includes("OPERATIONS_MANAGER") || roles.includes("COMPLIANCE_ESG")) && (
                <Button variant="ghost" onClick={() => navigate("/executive-dashboard")}>
                  Executivo
                </Button>
              )}
              {roles.includes("ADMIN") && (
                <Button variant="ghost" onClick={() => navigate("/users")}>
                  Usuários
                </Button>
              )}
            </nav>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl space-y-6">
          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium">Informações da conta</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID do usuário</p>
                <p className="font-mono text-sm">{user?.id || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Papéis</p>
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
                    Nenhum papel atribuído. Entre em contato com o administrador.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-medium">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground">
              Você está autenticado com sucesso. Esta é uma área protegida que
              requer uma sessão válida. Módulos adicionais (Equipamentos, Empréstimos)
              serão conectados aqui assim que forem confirmados.
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
