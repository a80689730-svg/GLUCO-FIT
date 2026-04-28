import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Clock,
  Flame,
  Loader2,
  Plus,
  Scale,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import { useLogFood, useMyDietLogs } from "../hooks/useBackend";
import type { DietLogEntry } from "../types";

// Delete hook inline (keeps hook file stable)
function useDeleteDietLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteDietLog(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dietLogs"] });
    },
  });
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isToday(timestamp: bigint): boolean {
  const ms = Number(timestamp) / 1_000_000;
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

interface LogSuccessInfo {
  foodName: string;
  calories: number;
  grams: number;
}

function SuccessBanner({
  info,
  onDismiss,
}: { info: LogSuccessInfo; onDismiss: () => void }) {
  return (
    <div
      data-ocid="diet.success_state"
      className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm"
    >
      <Flame className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">Logged successfully!</p>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{info.foodName}</span> —{" "}
          {info.calories} kcal · {info.grams.toFixed(1)} g
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

function DietLogRow({
  entry,
  index,
  onDelete,
  isDeleting,
}: {
  entry: DietLogEntry;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      data-ocid={`diet.item.${index}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-smooth hover:shadow-health"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <UtensilsCrossed className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground capitalize">
          {entry.foodName}
        </p>
        <p className="text-xs text-muted-foreground">{entry.quantity}</p>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
        <Flame className="h-3 w-3 text-orange-400" />
        <span className="font-semibold text-foreground">
          {Number(entry.calories)}
        </span>
        <span>kcal</span>
      </div>
      <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
        <Scale className="h-3 w-3 text-accent" />
        <span className="font-semibold text-foreground">
          {entry.grams.toFixed(1)}
        </span>
        <span>g</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{formatTime(entry.timestamp)}</span>
      </div>
      <Button
        data-ocid={`diet.delete_button.${index}`}
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label={`Delete ${entry.foodName}`}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}

export default function Diet() {
  const navigate = useNavigate();
  const { isAuthenticated } = useInternetIdentity();

  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [successInfo, setSuccessInfo] = useState<LogSuccessInfo | null>(null);

  const { data: allLogs = [], isLoading } = useMyDietLogs();
  const logFood = useLogFood();
  const deleteDietLog = useDeleteDietLog();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const todayLogs = allLogs.filter((e) => isToday(e.timestamp));
  const totalCalories = todayLogs.reduce(
    (sum, e) => sum + Number(e.calories),
    0,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!foodName.trim() || !quantity.trim()) return;
    setSuccessInfo(null);

    try {
      const result = await logFood.mutateAsync({
        foodName: foodName.trim(),
        quantity: quantity.trim(),
      });
      if (result) {
        const entry = result as unknown as DietLogEntry;
        setSuccessInfo({
          foodName: entry.foodName,
          calories: Number(entry.calories),
          grams: entry.grams,
        });
      }
      setFoodName("");
      setQuantity("");
    } catch {
      toast.error("Failed to log food. Please try again.");
    }
  }

  async function handleDelete(id: bigint) {
    setDeletingId(id);
    try {
      await deleteDietLog.mutateAsync(id);
      toast.success("Entry removed.");
    } catch {
      toast.error("Failed to delete entry.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card shadow-health">
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Diet Log
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your meals and calorie intake
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Daily Summary */}
        <Card
          data-ocid="diet.summary_card"
          className="border-primary/20 bg-primary/5 shadow-health"
        >
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Today's Total
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold text-primary">
                  {totalCalories.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  kcal
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {todayLogs.length} {todayLogs.length === 1 ? "item" : "items"}{" "}
                today
              </Badge>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <Flame className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log Food Form */}
        <Card data-ocid="diet.log_form_card" className="shadow-health">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg text-foreground">
              Add Food Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="food-name" className="text-sm font-medium">
                    Food Name
                  </Label>
                  <Input
                    id="food-name"
                    data-ocid="diet.input"
                    placeholder="e.g., Rice, Chapati, Dal"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    disabled={logFood.isPending}
                    className="transition-smooth"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    data-ocid="diet.quantity_input"
                    placeholder="e.g., 1 bowl, 2 pieces"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={logFood.isPending}
                    className="transition-smooth"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                data-ocid="diet.submit_button"
                disabled={
                  logFood.isPending || !foodName.trim() || !quantity.trim()
                }
                className="w-full sm:w-auto transition-smooth"
              >
                {logFood.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging…
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Log Food
                  </>
                )}
              </Button>
            </form>

            {successInfo && (
              <div className="mt-4">
                <SuccessBanner
                  info={successInfo}
                  onDismiss={() => setSuccessInfo(null)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Log List */}
        <div data-ocid="diet.list" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">
              Today's Meals
            </h2>
            {todayLogs.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>

          {isLoading ? (
            <div data-ocid="diet.loading_state" className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : todayLogs.length === 0 ? (
            <div
              data-ocid="diet.empty_state"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <UtensilsCrossed className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">
                No meals logged yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first meal above to start tracking your nutrition.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayLogs.map((entry, idx) => (
                <DietLogRow
                  key={String(entry.id)}
                  entry={entry}
                  index={idx + 1}
                  onDelete={() => handleDelete(entry.id)}
                  isDeleting={deletingId === entry.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Nutrition hint */}
        {todayLogs.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Calorie values are approximate estimates based on standard serving
            sizes.
          </p>
        )}
      </div>
    </div>
  );
}
