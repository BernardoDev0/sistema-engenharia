// src/pages/MyEquipment.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  listLoansByUserUseCase,
  returnLoanUseCase,
  markLoanAsDamagedUseCase,
} from "@/app/composition/loan";
import type { LoanId, LoanStatus } from "@/core/domain/loan/Loan";
import type { UserId } from "@/core/domain/identity/User";
import { PackageCheck, PackageX, ArrowLeft } from "lucide-react";

interface LoanWithEquipment {
  id: LoanId;
  equipmentId: string;
  equipmentName: string;
  equipmentCategory: string;
  quantity: number;
  status: LoanStatus;
  createdAt: Date;
  returnedAt: Date | null;
  damageComment: string | null;
}

const MyEquipmentContent = () => {
  const [loans, setLoans] = useState<LoanWithEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithEquipment | null>(null);
  const [returnType, setReturnType] = useState<"OK" | "DAMAGED" | null>(null);
  const [damageComment, setDamageComment] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const { user, signOut, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAdmin = roles.includes("ADMIN");

  useEffect(() => {
    if (user) {
      fetchMyLoans();
    }
  }, [user]);

  const fetchMyLoans = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const result = await listLoansByUserUseCase.execute({
        userId: user.id as UserId,
      });

      // Fetch equipment details for each loan
      const loansWithEquipment = await Promise.all(
        result.loans.map(async (loan) => {
          const { data: equipment } = await supabase
            .from("equipment")
            .select("name, category")
            .eq("id", loan.equipmentId)
            .single();

          return {
            id: loan.id,
            equipmentId: loan.equipmentId,
            equipmentName: equipment?.name || "Unknown",
            equipmentCategory: equipment?.category || "Unknown",
            quantity: loan.quantity,
            status: loan.status,
            createdAt: loan.createdAt,
            returnedAt: loan.returnedAt,
            damageComment: loan.damageComment,
          };
        })
      );

      setLoans(loansWithEquipment);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch loans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnClick = (loan: LoanWithEquipment, type: "OK" | "DAMAGED") => {
    setSelectedLoan(loan);
    setReturnType(type);
    setDamageComment("");
    setShowReturnDialog(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedLoan || !returnType) return;

    if (returnType === "DAMAGED" && !damageComment.trim()) {
      toast({
        title: "Error",
        description: "Please provide a damage comment",
        variant: "destructive",
      });
      return;
    }

    setIsReturning(true);

    try {
      if (returnType === "OK") {
        await returnLoanUseCase.execute({ loanId: selectedLoan.id });
        toast({
          title: "Success",
          description: "Equipment returned successfully",
        });
      } else {
        await markLoanAsDamagedUseCase.execute({
          loanId: selectedLoan.id,
          damageComment: damageComment.trim(),
        });
        toast({
          title: "Equipment marked as damaged",
          description: "The equipment has been flagged for review",
        });
      }

      setShowReturnDialog(false);
      setSelectedLoan(null);
      setReturnType(null);
      await fetchMyLoans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to return equipment",
        variant: "destructive",
      });
    } finally {
      setIsReturning(false);
    }
  };

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "RETURNED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "DAMAGED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "";
    }
  };

  const activeLoans = loans.filter((loan) => loan.status === "ACTIVE");
  const historyLoans = loans.filter((loan) => loan.status !== "ACTIVE");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">My Equipment</h1>
            <nav className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/equipment")}>
                Equipment
              </Button>
              {isAdmin && (
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
        <Button
          variant="ghost"
          onClick={() => navigate("/equipment")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Browse Equipment
        </Button>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-sm text-muted-foreground">Loading your equipment...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Loans Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Currently In Possession</h2>
              {activeLoans.length === 0 ? (
                <div className="rounded-lg border bg-card p-12 text-center">
                  <p className="text-muted-foreground">
                    You don't have any equipment checked out at the moment.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/equipment")}
                    className="mt-4"
                  >
                    Browse available equipment
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md animate-fade-in"
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {loan.equipmentName}
                            </h3>
                            <Badge className={getStatusColor(loan.status)}>
                              {loan.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {loan.equipmentCategory}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="font-medium">{loan.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Borrowed:</span>
                            <span className="font-medium">
                              {new Date(loan.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReturnClick(loan, "OK")}
                            className="flex-1"
                          >
                            <PackageCheck className="mr-2 h-4 w-4" />
                            Return OK
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReturnClick(loan, "DAMAGED")}
                            className="flex-1"
                          >
                            <PackageX className="mr-2 h-4 w-4" />
                            Damaged
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* History Section */}
            {historyLoans.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Return History</h2>
                <div className="space-y-3">
                  {historyLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{loan.equipmentName}</h3>
                            <Badge className={getStatusColor(loan.status)} variant="outline">
                              {loan.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {loan.equipmentCategory} • Qty: {loan.quantity}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              Borrowed: {new Date(loan.createdAt).toLocaleDateString()}
                            </span>
                            {loan.returnedAt && (
                              <span>
                                Returned: {new Date(loan.returnedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {loan.damageComment && (
                            <div className="mt-2 rounded bg-destructive/10 p-2">
                              <p className="text-xs font-medium text-destructive mb-1">
                                Damage Report:
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {loan.damageComment}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Return Confirmation Dialog */}
      <AlertDialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {returnType === "OK" ? "Return Equipment" : "Report Damaged Equipment"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {returnType === "OK" ? (
                <span>
                  Confirm that you're returning{" "}
                  <strong>{selectedLoan?.equipmentName}</strong> in good condition.
                </span>
              ) : (
                <div className="space-y-4">
                  <p>
                    Report damage for <strong>{selectedLoan?.equipmentName}</strong>.
                    Please provide details about the damage.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="damageComment">Damage Description *</Label>
                    <Textarea
                      id="damageComment"
                      value={damageComment}
                      onChange={(e) => setDamageComment(e.target.value)}
                      placeholder="Describe the damage..."
                      rows={4}
                      disabled={isReturning}
                    />
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReturning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReturn}
              disabled={isReturning}
              className={
                returnType === "DAMAGED" ? "bg-destructive hover:bg-destructive/90" : ""
              }
            >
              {isReturning ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const MyEquipment = () => {
  return (
    <ProtectedRoute>
      <MyEquipmentContent />
    </ProtectedRoute>
  );
};

export default MyEquipment;
