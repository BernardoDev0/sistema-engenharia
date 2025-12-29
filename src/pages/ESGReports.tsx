// src/pages/ESGReports.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { listESGMetricsUseCase, exportESGReportUseCase } from "@/app/composition/analytics";

const ESGReportsContent = () => {
  const { roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [granularity, setGranularity] = useState<"month" | "year">("month");

  useEffect(() => {
    document.title = "ESG Reports | Equipment ESG";
  }, []);

  const isReporter = roles.includes("ADMIN") || roles.includes("OPERATIONS_MANAGER") || roles.includes("COMPLIANCE_ESG");

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["esg-metrics", granularity],
    queryFn: async () => {
      const now = new Date();
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const endOfYear = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59));
      const result = await listESGMetricsUseCase.execute({
        from: startOfYear,
        to: endOfYear,
        granularity,
      });
      return result.metrics;
    },
  });

  const handleExport = async (format: "csv" | "pdf") => {
    const now = new Date();
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const endOfYear = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59));

    const result = await exportESGReportUseCase.execute({
      from: startOfYear,
      to: endOfYear,
      granularity,
      format,
    });

    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isReporter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Os relatórios ESG estão disponíveis apenas para usuários de administração, operações e compliance.
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
    <div className="min-h-[calc(100vh-3rem)] bg-gradient-to-br from-background via-background to-background/60">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Relatórios ESG</h1>
            <p className="text-xs text-muted-foreground">
              As métricas são derivadas diretamente de empréstimos e devoluções reais.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={granularity} onValueChange={(v: "month" | "year") => setGranularity(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Granularidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>
              Exportar CSV
            </Button>
            <Button size="sm" onClick={() => handleExport("pdf")}>
              Exportar PDF
            </Button>
          </div>
        </section>

        <section>
          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Tabela de métricas ESG</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Carregando métricas ESG…</div>
              ) : !metrics || metrics.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Ainda não há dados ESG. Quando a atividade real de equipamentos aumentar, as métricas aparecerão aqui.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-border/60 text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2 text-left font-medium">Período</th>
                        <th className="py-2 text-left font-medium">Tipo</th>
                        <th className="py-2 text-left font-medium">Unidade</th>
                        <th className="py-2 text-right font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m) => (
                        <tr key={m.id} className="border-b border-border/40 last:border-0">
                          <td className="py-2 align-middle">{m.period}</td>
                          <td className="py-2 align-middle capitalize">{m.type.toLowerCase().replace("_", " ")}</td>
                          <td className="py-2 align-middle text-xs text-muted-foreground">{m.unit}</td>
                          <td className="py-2 align-middle text-right font-mono">{m.value}</td>
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

const ESGReports = () => <ESGReportsContent />;

export default ESGReports;
