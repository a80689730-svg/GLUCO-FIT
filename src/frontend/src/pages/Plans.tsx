import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LogIn,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useMarkKitReceived,
  useMySubscriptions,
  useSubscribe,
} from "../hooks/useBackend";
import {
  PLANS,
  type PlanInfo,
  type PlanType,
  type Subscription,
} from "../types";

// ─── Format helpers ────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPlanLabel(pt: PlanType) {
  return PLANS.find((p) => p.type === pt)?.label ?? pt;
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: PlanInfo;
  index: number;
  onSubscribe: (plan: PlanInfo) => void;
}

function PlanCard({ plan, index, onSubscribe }: PlanCardProps) {
  const isBestValue = plan.type === "OneYear";
  const isMostPopular = plan.type === "SixMonths";
  const isHighlighted = isBestValue || isMostPopular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.45, ease: "easeOut" }}
      className="flex"
    >
      <Card
        className={`relative flex flex-col w-full transition-smooth hover:shadow-health-elevated ${
          isHighlighted
            ? "border-primary shadow-health-elevated ring-2 ring-primary/30"
            : "border-border shadow-health"
        }`}
      >
        {/* Badge */}
        {(isBestValue || isMostPopular) && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <Badge
              className={`px-3 py-1 text-xs font-semibold flex items-center gap-1 shadow-sm ${
                isBestValue
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {isBestValue ? (
                <>
                  <Star className="w-3 h-3 fill-current" /> Best Value
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" /> Most Popular
                </>
              )}
            </Badge>
          </div>
        )}

        <CardHeader
          className={`pt-8 pb-4 ${isHighlighted ? "bg-primary/5 rounded-t-lg" : ""}`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {plan.duration}
          </p>
          <h3 className="font-display text-xl font-bold text-foreground">
            {plan.label}
          </h3>
          <div className="mt-3">
            <span className="font-display text-4xl font-extrabold text-primary">
              {formatPrice(plan.price)}
            </span>
            <span className="text-muted-foreground text-sm ml-1">/ plan</span>
          </div>
          <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            Kit Included · No additional charges
          </p>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 gap-4 pb-6">
          <ul className="space-y-2 flex-1">
            {plan.features.map((feat) => (
              <li
                key={feat}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 space-y-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              No additional amount will be taken. Kit is included.
            </p>
            <Button
              data-ocid={`plan.subscribe_button.${index + 1}`}
              className={`w-full transition-smooth ${
                isHighlighted
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground border border-border"
              }`}
              onClick={() => onSubscribe(plan)}
            >
              Subscribe Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Checkout Modal ────────────────────────────────────────────────────────────

interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface CheckoutModalProps {
  plan: PlanInfo | null;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const subscribe = useSubscribe();
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  function validate() {
    const e: Partial<CheckoutForm> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit Indian mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (!plan) return;

    try {
      const result = await subscribe.mutateAsync({
        planType: plan.type,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      });

      // Extract orderNumber from result (backend returns Subscription)
      const sub = result as unknown as Subscription | undefined;
      const orderNum = sub?.orderNumber ?? "ORD-XXXXX";
      onSuccess(orderNum);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  function field(
    id: keyof CheckoutForm,
    label: string,
    type = "text",
    placeholder = "",
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label} <span className="text-destructive">*</span>
        </Label>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={form[id]}
          data-ocid={`checkout.${id}_input`}
          onChange={(ev) => {
            setForm((f) => ({ ...f, [id]: ev.target.value }));
            setErrors((er) => ({ ...er, [id]: undefined }));
          }}
          className={
            errors[id]
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {errors[id] && (
          <p
            data-ocid={`checkout.${id}_field_error`}
            className="text-xs text-destructive"
          >
            {errors[id]}
          </p>
        )}
      </div>
    );
  }

  return (
    <Dialog open={!!plan} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="checkout.dialog"
        className="max-w-md"
        onInteractOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Complete Your Purchase
          </DialogTitle>
          {plan && (
            <p className="text-sm text-muted-foreground mt-1">
              {plan.label} —{" "}
              <span className="font-semibold text-primary">
                {formatPrice(plan.price)}
              </span>
              <span className="ml-2 text-xs">(Kit Included)</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {field("name", "Full Name", "text", "Your full name")}
          {field("phone", "Phone Number", "tel", "10-digit mobile number")}
          {field("email", "Email Address", "email", "you@email.com")}

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-medium">
              Delivery Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              placeholder="House/flat no., street, city, state, pincode"
              value={form.address}
              data-ocid="checkout.address_input"
              rows={3}
              onChange={(ev) => {
                setForm((f) => ({ ...f, address: ev.target.value }));
                setErrors((er) => ({ ...er, address: undefined }));
              }}
              className={
                errors.address
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.address && (
              <p
                data-ocid="checkout.address_field_error"
                className="text-xs text-destructive"
              >
                {errors.address}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            No additional payment required. Kit will be dispatched after
            purchase.
          </p>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              data-ocid="checkout.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="checkout.submit_button"
              disabled={subscribe.isPending}
            >
              {subscribe.isPending ? "Processing…" : "Confirm Purchase"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Success Modal ─────────────────────────────────────────────────────────────

interface SuccessModalProps {
  orderNumber: string;
  onClose: () => void;
}

function SuccessModal({ orderNumber, onClose }: SuccessModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="checkout.success_state"
        className="max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center gap-4 py-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-foreground">
              Plan Purchased Successfully!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your kit will be dispatched soon.
            </p>
          </div>
          <div className="bg-muted rounded-lg px-5 py-3 space-y-0.5">
            <p className="text-xs text-muted-foreground">Order Number</p>
            <p className="font-mono text-lg font-bold text-primary">
              {orderNumber}
            </p>
            <p className="text-xs text-muted-foreground">
              Save this for verification
            </p>
          </div>
          <Button
            data-ocid="checkout.close_button"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onClose}
          >
            Done
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Active Subscriptions ──────────────────────────────────────────────────────

function ActivePlans() {
  const { data: subs, isLoading } = useMySubscriptions();
  const markReceived = useMarkKitReceived();

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2].map((i) => (
          <Skeleton
            key={i}
            className="h-40 rounded-xl"
            data-ocid={`active_plan.loading_state.${i}`}
          />
        ))}
      </div>
    );
  }

  if (!subs?.length) {
    return (
      <div
        data-ocid="active_plans.empty_state"
        className="flex flex-col items-center gap-3 py-10 text-center"
      >
        <ClipboardList className="w-10 h-10 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">
          No active plans yet. Subscribe to a plan above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subs.map((sub, i) => {
        const isReceived = sub.kitStatus === "Received";
        const isShipped = sub.kitStatus === "Shipped";
        return (
          <motion.div
            key={String(sub.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            data-ocid={`active_plan.item.${i + 1}`}
          >
            <Card className="border-border shadow-health h-full">
              <CardContent className="pt-5 pb-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">
                      {getPlanLabel(sub.planType)}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      {sub.orderNumber}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs shrink-0 ${
                      isReceived
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : isShipped
                          ? "bg-accent/10 text-accent border border-accent/30"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isReceived
                      ? "Kit Received"
                      : isShipped
                        ? "Shipped"
                        : "Kit Pending"}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Purchased: {formatDate(sub.purchaseDate)}
                </div>

                <div className="text-xs text-muted-foreground">
                  Amount Paid:{" "}
                  <span className="font-semibold text-foreground">
                    {formatPrice(Number(sub.amount))}
                  </span>
                </div>

                {!isReceived && (
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid={`active_plan.mark_received_button.${i + 1}`}
                    className="w-full text-xs border-primary/40 text-primary hover:bg-primary/5 transition-smooth"
                    disabled={markReceived.isPending}
                    onClick={async () => {
                      try {
                        await markReceived.mutateAsync(sub.id);
                        toast.success("Kit marked as received!");
                      } catch {
                        toast.error("Failed to update. Please try again.");
                      }
                    }}
                  >
                    <Package className="w-3.5 h-3.5 mr-1.5" />
                    Mark as Received
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Login Prompt ──────────────────────────────────────────────────────────────

function LoginPrompt() {
  const { login } = useInternetIdentity();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-14 text-center"
      data-ocid="plans.login_prompt"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <LogIn className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          Sign in to Subscribe
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          You need to be logged in to purchase a plan and track your kit
          delivery.
        </p>
      </div>
      <Button
        data-ocid="plans.login_button"
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        onClick={() => login()}
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign in with Internet Identity
      </Button>
    </motion.div>
  );
}

// ─── Plans Page ────────────────────────────────────────────────────────────────

export default function Plans() {
  const { isAuthenticated } = useInternetIdentity();
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  function handleSuccess(orderNumber: string) {
    setSelectedPlan(null);
    setSuccessOrder(orderNumber);
  }

  return (
    <div data-ocid="plans.page" className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="bg-card border-b py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Badge className="bg-primary/10 text-primary border border-primary/30 mb-3 text-xs">
              Comprehensive Diabetes Management
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
              Choose Your Care Plan
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              All plans include a complete Diabetes Care Kit. No hidden charges.
              Start your journey to better health today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6 items-stretch mt-4">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.type}
                plan={plan}
                index={i}
                onSubscribe={(p) => {
                  if (!isAuthenticated) {
                    toast.error("Please sign in to subscribe to a plan.");
                    return;
                  }
                  setSelectedPlan(p);
                }}
              />
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            All plans are one-time payments. No recurring charges. Kit
            dispatched within 3–5 business days.
          </motion.p>
        </div>
      </section>

      {/* My Active Plans */}
      <section
        className="py-12 px-4 bg-muted/30 border-t"
        data-ocid="active_plans.section"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">
              My Active Plans
            </h2>
            <p className="text-muted-foreground text-sm">
              Track your subscriptions and kit delivery status.
            </p>
          </div>

          {isAuthenticated ? <ActivePlans /> : <LoginPrompt />}
        </div>
      </section>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <CheckoutModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {successOrder && (
          <SuccessModal
            orderNumber={successOrder}
            onClose={() => setSuccessOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
