import { Link } from "@tanstack/react-router";
import {
  Activity,
  Calendar,
  ChevronRight,
  LogIn,
  MessageCircle,
  Package,
  Shield,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import {
  useCurrentUser,
  useMyAppointments,
  useMyBookings,
  useMyChatHistory,
  useMyDietLogs,
  useMyOrders,
  useMySubscriptions,
} from "../hooks/useBackend";
import type { Appointment, DietLogEntry, Subscription } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayTimestamp(): bigint {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return BigInt(start.getTime()) * BigInt(1_000_000);
}

function formatPlanType(planType: string): string {
  switch (planType) {
    case "ThreeMonths":
      return "3 Month Plan";
    case "SixMonths":
      return "6 Month Plan";
    case "OneYear":
      return "1 Year Plan";
    default:
      return planType;
  }
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  href: string;
  accentClass?: string;
}

function SummaryCard({
  icon,
  title,
  children,
  href,
  accentClass = "bg-primary/10 text-primary",
}: SummaryCardProps) {
  return (
    <Link
      to={href}
      data-ocid={`dashboard.card.${title.toLowerCase().replace(/\s+/g, "_")}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-health transition-smooth hover:shadow-health-elevated hover:border-primary/30"
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentClass}`}
        >
          {icon}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
          {title}
        </p>
        {children}
      </div>
    </Link>
  );
}

// ─── Diet Summary Card ────────────────────────────────────────────────────────

function DietCard() {
  const { data: logs = [], isLoading } = useMyDietLogs();
  const dayStart = todayTimestamp();
  const todayLogs = (logs as DietLogEntry[]).filter(
    (l) => l.timestamp >= dayStart,
  );
  const totalCalories = todayLogs.reduce(
    (sum, l) => sum + Number(l.calories),
    0,
  );

  return (
    <SummaryCard
      icon={<Utensils className="w-4 h-4" />}
      title="Diet Today"
      href="/diet"
      accentClass="bg-primary/10 text-primary"
    >
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
      ) : (
        <>
          <p className="text-2xl font-display font-bold text-foreground">
            {totalCalories}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              kcal
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {todayLogs.length} food item{todayLogs.length !== 1 ? "s" : ""}{" "}
            logged today
          </p>
        </>
      )}
    </SummaryCard>
  );
}

// ─── Appointments Card ────────────────────────────────────────────────────────

function AppointmentsCard() {
  const { data: appointments = [], isLoading } = useMyAppointments();
  const upcoming = (appointments as Appointment[])
    .filter((a) => a.status !== "Cancelled")
    .sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
  const next = upcoming[0];

  return (
    <SummaryCard
      icon={<Calendar className="w-4 h-4" />}
      title="Appointments"
      href="/doctors"
      accentClass="bg-accent/10 text-accent"
    >
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
      ) : next ? (
        <>
          <p className="text-sm font-semibold text-foreground truncate">
            {next.slot}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Status: {next.status}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No upcoming appointments
        </p>
      )}
    </SummaryCard>
  );
}

// ─── Treatment Plan Card ──────────────────────────────────────────────────────

function TreatmentCard() {
  const { data: subscriptions = [], isLoading } = useMySubscriptions();
  const active = (subscriptions as Subscription[]).find(
    (s) => s.kitStatus !== "Received",
  );
  const latest = active ?? (subscriptions as Subscription[])[0];

  return (
    <SummaryCard
      icon={<Shield className="w-4 h-4" />}
      title="Treatment Plan"
      href="/plans"
      accentClass="bg-chart-1/20 text-foreground"
    >
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
      ) : latest ? (
        <>
          <p className="text-sm font-semibold text-foreground">
            {formatPlanType(String(latest.planType))}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kit: {String(latest.kitStatus)}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No active plan</p>
      )}
    </SummaryCard>
  );
}

// ─── Shopping Card ────────────────────────────────────────────────────────────

function ShoppingCard() {
  const { data: orders = [], isLoading } = useMyOrders();
  const sorted = [...orders].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );
  const last = sorted[0];

  return (
    <SummaryCard
      icon={<ShoppingBag className="w-4 h-4" />}
      title="Shopping"
      href="/shopping"
      accentClass="bg-primary/10 text-primary"
    >
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
      ) : (
        <>
          <p className="text-2xl font-display font-bold text-foreground">
            {orders.length}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              order{orders.length !== 1 ? "s" : ""}
            </span>
          </p>
          {last && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Last: #{last.orderNumber}
            </p>
          )}
          {!last && (
            <p className="text-sm text-muted-foreground mt-0.5">
              No orders yet
            </p>
          )}
        </>
      )}
    </SummaryCard>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard() {
  const { data: bookings = [], isLoading } = useMyBookings();
  const active = bookings.filter((b) => String(b.status) === "Booked");

  return (
    <SummaryCard
      icon={<Activity className="w-4 h-4" />}
      title="Exercise"
      href="/exercise"
      accentClass="bg-accent/10 text-accent"
    >
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
      ) : (
        <>
          <p className="text-2xl font-display font-bold text-foreground">
            {active.length}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              active session{active.length !== 1 ? "s" : ""}
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </>
      )}
    </SummaryCard>
  );
}

// ─── Chat Card ────────────────────────────────────────────────────────────────

function ChatCard() {
  const { data: history = [], isLoading } = useMyChatHistory();
  const sorted = [...history].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );
  const last = sorted[0];
  const snippet = last
    ? last.content.slice(0, 60) + (last.content.length > 60 ? "…" : "")
    : null;

  return (
    <SummaryCard
      icon={<MessageCircle className="w-4 h-4" />}
      title="Recent Chat"
      href="/chat"
      accentClass="bg-primary/10 text-primary"
    >
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
      ) : snippet ? (
        <>
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {snippet}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {String(last!.role).toLowerCase()} message
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No chat history yet</p>
      )}
    </SummaryCard>
  );
}

// ─── Order Summary Card ────────────────────────────────────────────────────────

function PackageCard() {
  const { data: orders = [], isLoading } = useMyOrders();
  const total = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <SummaryCard
      icon={<Package className="w-4 h-4" />}
      title="Spending"
      href="/shopping"
      accentClass="bg-chart-1/20 text-foreground"
    >
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
      ) : (
        <>
          <p className="text-2xl font-display font-bold text-foreground">
            ₹{total.toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Total spent across {orders.length} order
            {orders.length !== 1 ? "s" : ""}
          </p>
        </>
      )}
    </SummaryCard>
  );
}

// ─── Unauthenticated State ────────────────────────────────────────────────────

function UnauthenticatedView() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4"
      data-ocid="dashboard.empty_state"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <LogIn className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="text-xl font-display font-semibold text-foreground mb-2">
          Sign in to view your dashboard
        </h2>
        <p className="text-muted-foreground text-sm">
          Sign in or create a free account to see your health summary,
          appointments, orders, and more.
        </p>
      </div>
      <Link
        to="/login"
        data-ocid="dashboard.login_button"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
      >
        <LogIn className="w-4 h-4" />
        Sign In / Create Account
      </Link>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { currentUser, isLoggedIn } = useCurrentUser();

  if (!isLoggedIn) {
    return (
      <div className="bg-background min-h-screen">
        <UnauthenticatedView />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen" data-ocid="dashboard.page">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-display font-bold text-foreground">
                My Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Welcome back,{" "}
                <span className="font-medium text-foreground">
                  {currentUser?.name}
                </span>{" "}
                · {currentUser?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Grid */}
      <div
        className="container mx-auto px-4 py-8"
        data-ocid="dashboard.section"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Health Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DietCard />
          <AppointmentsCard />
          <TreatmentCard />
          <ShoppingCard />
          <ExerciseCard />
          <ChatCard />
          <PackageCard />
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-muted/40 border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Log Food", href: "/diet" },
              { label: "Book Appointment", href: "/doctors" },
              { label: "View Plans", href: "/plans" },
              { label: "Shop Now", href: "/shopping" },
              { label: "Exercise Sessions", href: "/exercise" },
              { label: "Chat with AI", href: "/chat" },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                data-ocid={`dashboard.quick_link.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:text-primary"
              >
                {item.label}
                <ChevronRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
