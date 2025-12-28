// src/pages/ESGReports.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
            <CardTitle>Access restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ESG reports are available to admin, operations and compliance users only.
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
            <h1 className="text-xl font-semibold tracking-tight">ESG Reports</h1>
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
              ESG
            </Badge>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Filters</h2>
            <p className="text-xs text-muted-foreground">Metrics are derived directly from real loans and returns.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={granularity} onValueChange={(v: "month" | "year") => setGranularity(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Granularity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>
              Export CSV
            </Button>
            <Button size="sm" onClick={() => handleExport("pdf")}>
              Export PDF
            </Button>
          </div>
        </section>

        <section>
          <Card className="bg-card/70 backdrop-blur-xl border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-semibold">ESG metric table</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Loading ESG metrics…</div>
              ) : !metrics || metrics.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No ESG data available yet. Once real equipment activity accumulates, metrics will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-border/60 text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2 text-left font-medium">Period</th>
                        <th className="py-2 text-left font-medium">Type</th>
                        <th className="py-2 text-left font-medium">Unit</th>
                        <th className="py-2 text-right font-medium">Value</th>
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

const ESGReports = () => (
  <ProtectedRoute>
    <ESGReportsContent />
  </ProtectedRoute>
);

export default ESGReports;
