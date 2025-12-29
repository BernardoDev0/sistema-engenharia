// src/pages/Dashboard.tsx

import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

const DashboardContent = () => {
  const { user, roles } = useAuth();

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-background">
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
  return <DashboardContent />;
};

export default Dashboard;
