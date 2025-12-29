// src/pages/ExecutiveDashboard.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { listActiveLoansUseCase } from "@/app/composition/loan";
import { listESGMetricsUseCase } from "@/app/composition/analytics";
import { supabase } from "@/integrations/supabase/client";

interface StockOverview {
  totalQuantity: number;
  inUse: number;
  available: number;
}

const fetchStockOverview = async (): Promise<StockOverview> => {
  const { data, error } = await supabase
    .from("equipment")
    .select("total_quantity,quantity_in_use");

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const totalQuantity = rows.reduce((sum, row: any) => sum + (row.total_quantity ?? 0), 0);
  const inUse = rows.reduce((sum, row: any) => sum + (row.quantity_in_use ?? 0), 0);

  return {
    totalQuantity,
    inUse,
    available: totalQuantity - inUse,
  };
};

const ExecutiveDashboardContent = () => {
  const { roles, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Executive Dashboard | Equipment ESG";
  }, []);

  const { data: stockOverview } = useQuery({
    queryKey: ["stock-overview"],
    queryFn: fetchStockOverview,
  });

  const { data: activeLoans } = useQuery({
    queryKey: ["active-loans"],
    queryFn: async () => {
      const result = await listActiveLoansUseCase.execute();
      return result.loans;
    },
  });

  const { data: esgMetrics } = useQuery({
    queryKey: ["esg-metrics-dashboard"],
    queryFn: async () => {
      const now = new Date();
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const endOfYear = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59));
      const result = await listESGMetricsUseCase.execute({
        from: startOfYear,
        to: endOfYear,
        granularity: "month",
      });
      return result.metrics;
    },
  });

  const isExecutive = roles.includes("ADMIN") || roles.includes("OPERATIONS_MANAGER") || roles.includes("COMPLIANCE_ESG");

  if (!isExecutive) {
    return (
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center bg-background">
        <Card className="max-w-md bg-background/60 backdrop-blur-xl border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O painel executivo está disponível apenas para papéis de administração, operações e compliance.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => navigate("/dashboard")}>
              Voltar para o painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const esgChartData = (esgMetrics ?? [])
    .filter((m) => m.type === "INCIDENT_RATE")
    .map((m) => ({ period: m.period, value: m.value }));

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-gradient-to-br from-background via-background to-background/60">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Estoque total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {stockOverview ? stockOverview.totalQuantity : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Todas as unidades de equipamentos na frota</p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Empréstimos ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{activeLoans ? activeLoans.length : "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Itens atualmente emprestados em campo</p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {stockOverview ? stockOverview.available : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Unidades prontas para uso</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-stretch">
          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Taxa de incidentes ao longo do tempo</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {esgChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  Ainda não há dados ESG. As métricas aparecerão conforme os empréstimos e devoluções acontecerem.
                </div>
              ) : (
                <ChartContainer
                  config={{
                    incident: {
                      label: "Taxa de incidentes",
                      color: "hsl(var(--destructive))",
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer>
                    <BarChart data={esgChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="period" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="value" name="Taxa de incidentes" fill="var(--color-incident, hsl(var(--destructive)))" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                O painel executivo mostra indicadores operacionais e ESG em tempo real, baseados apenas em
                empréstimos e devoluções reais de equipamentos.
              </p>
              <p>
                À medida que mais equipamentos circulam e incidentes de dano são registrados, esta visão revela
                intensidade de reúso, redução de desperdício e tendências de segurança.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

const ExecutiveDashboard = () => <ExecutiveDashboardContent />;

export default ExecutiveDashboard;
