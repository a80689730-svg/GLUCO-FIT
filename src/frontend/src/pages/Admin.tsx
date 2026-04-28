import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  ActivitySquare,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  Eye,
  EyeOff,
  Flame,
  Loader2,
  LogOut,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import {
  useAdminLogin,
  useAllAppointments,
  useAllBookings,
  useAllDietLogs,
  useAllOrders,
  useAllSubscriptions,
  useAllUsers,
  useDoctors,
  useSessions,
} from "../hooks/useBackend";
import type {
  Appointment,
  DietLogEntry,
  Doctor,
  ExerciseBooking,
  ExerciseSession,
  KitStatus,
  ShoppingOrder,
  Subscription,
} from "../types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  const datePart = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} ${timePart}`;
}

function planLabel(type: string): string {
  if (type === "ThreeMonths" || type === "ThreeMonth") return "3 Month";
  if (type === "SixMonths" || type === "SixMonth") return "6 Month";
  if (type === "OneYear") return "12 Month";
  return type;
}

function callTypeLabel(type: string): string {
  return type === "VideoCall" ? "Video Call" : "Phone Call";
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
  loading?: boolean;
}) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="flex items-center gap-4 pt-5 pb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ?? "bg-primary/10"}`}
        >
          <Icon
            className={`w-5 h-5 ${accent ? "text-white" : "text-primary"}`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-6 w-20 mt-1" />
          ) : (
            <p className="font-display text-xl font-bold text-foreground">
              {value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  message,
}: { icon: React.ElementType; message: string }) {
  return (
    <div
      data-ocid="admin.empty_state"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="font-display text-lg font-semibold text-foreground mb-1">
        No data yet
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
  );
}

// ─── Loading Rows ──────────────────────────────────────────────────────────────

function LoadingRows({ cols }: { cols: number }) {
  const colKeys = Array.from({ length: cols }, (_, i) => String(i));
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-border last:border-0">
          {colKeys.map((k) => (
            <td key={k} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Table Wrapper ─────────────────────────────────────────────────────────────

function TableWrapper({
  headers,
  children,
}: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap text-xs uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ─── Tab Section Header ────────────────────────────────────────────────────────

function TabHeader({
  title,
  description,
  icon: Icon,
  onRefresh,
  refreshId,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onRefresh: () => void;
  refreshId: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-foreground leading-tight">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={onRefresh}
        data-ocid={refreshId}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Refresh
      </Button>
    </div>
  );
}

// ─── User Cell ─────────────────────────────────────────────────────────────────

// Since getAllUsers returns {name, email} without Principal, we display the
// truncated Principal from the record's userId field, falling back gracefully.
function UserCell({ userId }: { userId: unknown }) {
  const id = String(userId);
  const display = id.length > 14 ? `${id.slice(0, 11)}…` : id;
  return (
    <td className="px-4 py-3">
      <span className="font-mono text-xs text-muted-foreground bg-muted/40 rounded px-1.5 py-0.5">
        {display}
      </span>
    </td>
  );
}

// ─── Food Logs Tab ─────────────────────────────────────────────────────────────

function FoodLogsTab({ onRefreshAll }: { onRefreshAll: () => void }) {
  const { data: rawLogs, isLoading, refetch } = useAllDietLogs();
  const logs = [...((rawLogs ?? []) as DietLogEntry[])].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );
  const totalCalories = logs.reduce((sum, l) => sum + Number(l.calories), 0);

  function handleRefresh() {
    void refetch();
    onRefreshAll();
  }

  return (
    <div className="space-y-5" data-ocid="admin.diet.section">
      <TabHeader
        title="Food Logs"
        description="All meals and food items logged by patients"
        icon={UtensilsCrossed}
        onRefresh={handleRefresh}
        refreshId="admin.diet.refresh_button"
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Entries"
          value={logs.length}
          icon={UtensilsCrossed}
          loading={isLoading}
        />
        <StatCard
          label="Total Calories Logged"
          value={
            isLoading ? "" : `${totalCalories.toLocaleString("en-IN")} kcal`
          }
          icon={Flame}
          accent="bg-orange-500"
          loading={isLoading}
        />
      </div>

      {isLoading ? (
        <TableWrapper
          headers={[
            "User",
            "Food Item",
            "Quantity",
            "Calories",
            "Grams",
            "Date & Time",
          ]}
        >
          <LoadingRows cols={6} />
        </TableWrapper>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          message="No diet entries logged yet. Patients will appear here once they start tracking meals."
        />
      ) : (
        <TableWrapper
          headers={[
            "User",
            "Food Item",
            "Quantity",
            "Calories",
            "Grams",
            "Date & Time",
          ]}
        >
          {logs.map((log: DietLogEntry, idx) => (
            <tr
              key={String(log.id)}
              className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
              data-ocid={`admin.diet.item.${idx + 1}`}
            >
              <UserCell userId={log.userId} />
              <td className="px-4 py-3 font-medium text-foreground">
                {log.foodName}
              </td>
              <td className="px-4 py-3 text-foreground">{log.quantity}</td>
              <td className="px-4 py-3 text-right font-semibold text-primary">
                {Number(log.calories)} kcal
              </td>
              <td className="px-4 py-3 text-right text-foreground">
                {log.grams.toFixed(1)} g
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                {formatDate(log.timestamp)}
              </td>
            </tr>
          ))}
        </TableWrapper>
      )}
    </div>
  );
}

// ─── Shopping Orders Tab ───────────────────────────────────────────────────────

function ShoppingOrdersTab({ onRefreshAll }: { onRefreshAll: () => void }) {
  const { data: rawOrders, isLoading, refetch } = useAllOrders();
  const orders = [...((rawOrders ?? []) as ShoppingOrder[])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );
  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0,
  );

  function handleRefresh() {
    void refetch();
    onRefreshAll();
  }

  return (
    <div className="space-y-5" data-ocid="admin.shopping.section">
      <TabHeader
        title="Shopping Orders"
        description="All purchase orders placed by patients"
        icon={ShoppingBag}
        onRefresh={handleRefresh}
        refreshId="admin.shopping.refresh_button"
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          loading={isLoading}
        />
        <StatCard
          label="Total Revenue"
          value={isLoading ? "" : `₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={ActivitySquare}
          accent="bg-emerald-600"
          loading={isLoading}
        />
      </div>

      {isLoading ? (
        <TableWrapper
          headers={[
            "Order #",
            "User",
            "Items",
            "Total Amount (₹)",
            "Date & Time",
          ]}
        >
          <LoadingRows cols={5} />
        </TableWrapper>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          message="No orders placed yet. They will appear here when patients make purchases."
        />
      ) : (
        <TableWrapper
          headers={[
            "Order #",
            "User",
            "Items",
            "Total Amount (₹)",
            "Date & Time",
          ]}
        >
          {orders.map((order: ShoppingOrder, idx) => (
            <tr
              key={String(order.id)}
              className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
              data-ocid={`admin.shopping.item.${idx + 1}`}
            >
              <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                #{order.orderNumber}
              </td>
              <UserCell userId={order.userId} />
              <td className="px-4 py-3 text-foreground">
                <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-xs font-medium">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-primary whitespace-nowrap">
                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                {formatDate(order.createdAt)}
              </td>
            </tr>
          ))}
        </TableWrapper>
      )}
    </div>
  );
}

// ─── Appointments Tab ──────────────────────────────────────────────────────────

function AppointmentsTab({ onRefreshAll }: { onRefreshAll: () => void }) {
  const { data: rawAppointments, isLoading, refetch } = useAllAppointments();
  const { data: rawDoctors } = useDoctors();
  const appointments = [...((rawAppointments ?? []) as Appointment[])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );
  const doctors = (rawDoctors ?? []) as Doctor[];
  const doctorMap = new Map(doctors.map((d) => [String(d.id), d.name]));
  const confirmedCount = appointments.filter(
    (a) => a.status === "Confirmed",
  ).length;

  function handleRefresh() {
    void refetch();
    onRefreshAll();
  }

  return (
    <div className="space-y-5" data-ocid="admin.appointments.section">
      <TabHeader
        title="Doctor Appointments"
        description="All doctor consultations booked by patients"
        icon={CalendarCheck}
        onRefresh={handleRefresh}
        refreshId="admin.appointments.refresh_button"
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Appointments"
          value={appointments.length}
          icon={CalendarCheck}
          loading={isLoading}
        />
        <StatCard
          label="Confirmed"
          value={isLoading ? "" : confirmedCount}
          icon={PackageCheck}
          accent="bg-emerald-600"
          loading={isLoading}
        />
      </div>

      {isLoading ? (
        <TableWrapper
          headers={[
            "Confirmation #",
            "User",
            "Doctor",
            "Slot / Date",
            "Call Type",
            "Status",
            "Booked On",
          ]}
        >
          <LoadingRows cols={7} />
        </TableWrapper>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          message="No appointments booked yet. They will appear here when patients schedule consultations."
        />
      ) : (
        <TableWrapper
          headers={[
            "Confirmation #",
            "User",
            "Doctor",
            "Slot / Date",
            "Call Type",
            "Status",
            "Booked On",
          ]}
        >
          {appointments.map((apt: Appointment, idx) => (
            <tr
              key={String(apt.id)}
              className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
              data-ocid={`admin.appointments.item.${idx + 1}`}
            >
              <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                {apt.confirmationNumber}
              </td>
              <UserCell userId={apt.userId} />
              <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                {doctorMap.get(String(apt.doctorId)) ??
                  `Doctor #${apt.doctorId}`}
              </td>
              <td className="px-4 py-3 text-foreground whitespace-nowrap text-sm">
                {apt.slot}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="secondary"
                  className="text-xs whitespace-nowrap"
                >
                  {callTypeLabel(apt.callType)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {apt.status === "Confirmed" ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs">
                    Confirmed
                  </Badge>
                ) : apt.status === "Cancelled" ? (
                  <Badge variant="destructive" className="text-xs">
                    Cancelled
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs">
                    Pending
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                {formatDate(apt.createdAt)}
              </td>
            </tr>
          ))}
        </TableWrapper>
      )}
    </div>
  );
}

// ─── Exercise Sessions Tab ─────────────────────────────────────────────────────

function ExerciseSessionsTab({ onRefreshAll }: { onRefreshAll: () => void }) {
  const { data: rawBookings, isLoading, refetch } = useAllBookings();
  const { data: rawSessions } = useSessions();
  const bookings = [...((rawBookings ?? []) as ExerciseBooking[])].sort(
    (a, b) => Number(b.bookingDate) - Number(a.bookingDate),
  );
  const sessions = (rawSessions ?? []) as ExerciseSession[];
  const sessionMap = new Map(sessions.map((s) => [String(s.id), s.name]));
  const activeCount = bookings.filter((b) => b.status === "Booked").length;

  function handleRefresh() {
    void refetch();
    onRefreshAll();
  }

  return (
    <div className="space-y-5" data-ocid="admin.exercise.section">
      <TabHeader
        title="Exercise Sessions"
        description="All exercise session bookings made by patients"
        icon={Dumbbell}
        onRefresh={handleRefresh}
        refreshId="admin.exercise.refresh_button"
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Bookings"
          value={bookings.length}
          icon={Dumbbell}
          loading={isLoading}
        />
        <StatCard
          label="Active (Booked)"
          value={isLoading ? "" : activeCount}
          icon={ActivitySquare}
          accent="bg-blue-600"
          loading={isLoading}
        />
      </div>

      {isLoading ? (
        <TableWrapper
          headers={["User", "Session", "Time Slot", "Booking Date", "Status"]}
        >
          <LoadingRows cols={5} />
        </TableWrapper>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          message="No exercise sessions booked yet. They will appear here when patients book sessions."
        />
      ) : (
        <TableWrapper
          headers={["User", "Session", "Time Slot", "Booking Date", "Status"]}
        >
          {bookings.map((booking: ExerciseBooking, idx) => (
            <tr
              key={String(booking.id)}
              className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
              data-ocid={`admin.exercise.item.${idx + 1}`}
            >
              <UserCell userId={booking.userId} />
              <td className="px-4 py-3 font-medium text-foreground">
                {sessionMap.get(String(booking.sessionId)) ??
                  `Session #${String(booking.sessionId)}`}
              </td>
              <td className="px-4 py-3 text-foreground whitespace-nowrap text-sm">
                {booking.timeSlot}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                {formatDate(booking.bookingDate)}
              </td>
              <td className="px-4 py-3">
                {booking.status === "Booked" ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs">
                    Booked
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Cancelled
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </TableWrapper>
      )}
    </div>
  );
}

// ─── Treatment Plans Tab ───────────────────────────────────────────────────────

function TreatmentPlansTab({ onRefreshAll }: { onRefreshAll: () => void }) {
  const { data: rawSubscriptions, isLoading, refetch } = useAllSubscriptions();
  const subscriptions = [...((rawSubscriptions ?? []) as Subscription[])].sort(
    (a, b) => Number(b.purchaseDate) - Number(a.purchaseDate),
  );
  const totalRevenue = subscriptions.reduce(
    (sum, s) => sum + Number(s.amount),
    0,
  );

  function handleRefresh() {
    void refetch();
    onRefreshAll();
  }

  function KitBadge({ status }: { status: KitStatus }) {
    if (status === "Received")
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs">
          Received
        </Badge>
      );
    if (status === "Shipped")
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs">
          Shipped
        </Badge>
      );
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs">
        Pending
      </Badge>
    );
  }

  return (
    <div className="space-y-5" data-ocid="admin.subscriptions.section">
      <TabHeader
        title="Treatment Plans"
        description="All care plan subscriptions purchased by patients"
        icon={CreditCard}
        onRefresh={handleRefresh}
        refreshId="admin.subscriptions.refresh_button"
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Plans"
          value={subscriptions.length}
          icon={CreditCard}
          loading={isLoading}
        />
        <StatCard
          label="Total Revenue"
          value={isLoading ? "" : `₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={ActivitySquare}
          accent="bg-violet-600"
          loading={isLoading}
        />
      </div>

      {isLoading ? (
        <TableWrapper
          headers={[
            "Order #",
            "Patient Name",
            "Email",
            "Plan",
            "Amount (₹)",
            "Kit Status",
            "Purchase Date",
          ]}
        >
          <LoadingRows cols={7} />
        </TableWrapper>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          message="No treatment plans purchased yet. They will appear here when patients buy a care plan."
        />
      ) : (
        <TableWrapper
          headers={[
            "Order #",
            "Patient Name",
            "Email",
            "Plan",
            "Amount (₹)",
            "Kit Status",
            "Purchase Date",
          ]}
        >
          {subscriptions.map((sub: Subscription, idx) => (
            <tr
              key={String(sub.id)}
              className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
              data-ocid={`admin.subscriptions.item.${idx + 1}`}
            >
              <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                {sub.orderNumber}
              </td>
              <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                {sub.name}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {sub.email}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Badge variant="secondary" className="text-xs">
                  {planLabel(String(sub.planType))}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-primary whitespace-nowrap">
                ₹{Number(sub.amount).toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-3">
                <KitBadge status={sub.kitStatus} />
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                {formatDate(sub.purchaseDate)}
              </td>
            </tr>
          ))}
        </TableWrapper>
      )}
    </div>
  );
}

// ─── Admin Login Gate ──────────────────────────────────────────────────────────

function AdminLoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { mutate: login, isPending } = useAdminLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    login(
      { email, password },
      {
        onSuccess: (ok) => {
          if (ok) {
            onSuccess();
          } else {
            setError("Invalid email or password. Please try again.");
          }
        },
        onError: () => {
          setError("Login failed. Please try again.");
        },
      },
    );
  }

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4"
      data-ocid="admin.login.section"
    >
      <Card className="w-full max-w-md shadow-health">
        <CardHeader className="border-b border-border pb-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">
                Admin Access
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sign in with your admin credentials
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-ocid="admin.login.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  data-ocid="admin.login.password_input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-ocid="admin.login.toggle"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2"
                data-ocid="admin.login.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              data-ocid="admin.login.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Admin Page ────────────────────────────────────────────────────────────────

const ADMIN_AUTH_KEY = "adminAuthenticated";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("food-logs");
  const [adminAuthenticated, setAdminAuthenticated] = useState(
    () => localStorage.getItem(ADMIN_AUTH_KEY) === "true",
  );

  // Pre-fetch all users list for the admin session
  const { refetch: refetchUsers } = useAllUsers();
  const { refetch: refetchDiet } = useAllDietLogs();
  const { refetch: refetchOrders } = useAllOrders();
  const { refetch: refetchAppointments } = useAllAppointments();
  const { refetch: refetchBookings } = useAllBookings();
  const { refetch: refetchSubscriptions } = useAllSubscriptions();

  function handleRefreshAll() {
    void refetchUsers();
    void refetchDiet();
    void refetchOrders();
    void refetchAppointments();
    void refetchBookings();
    void refetchSubscriptions();
  }

  function handleAdminLoginSuccess() {
    localStorage.setItem(ADMIN_AUTH_KEY, "true");
    setAdminAuthenticated(true);
  }

  function handleAdminLogout() {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setAdminAuthenticated(false);
    navigate({ to: "/" });
  }

  if (!adminAuthenticated) {
    return <AdminLoginGate onSuccess={handleAdminLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="admin.page">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground leading-tight">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  namratakutwade@gmail.com · Patient activity overview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleRefreshAll}
                data-ocid="admin.refresh_all_button"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleAdminLogout}
                data-ocid="admin.logout_button"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          data-ocid="admin.tab"
        >
          <TabsList className="mb-6 bg-muted/50 p-1 h-auto flex flex-wrap gap-1 w-full border border-border rounded-xl">
            <TabsTrigger
              value="food-logs"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm"
              data-ocid="admin.diet.tab"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Food Logs
            </TabsTrigger>
            <TabsTrigger
              value="shopping"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm"
              data-ocid="admin.shopping.tab"
            >
              <ShoppingBag className="w-4 h-4" />
              Shopping Orders
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm"
              data-ocid="admin.appointments.tab"
            >
              <CalendarCheck className="w-4 h-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="exercise"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm"
              data-ocid="admin.exercise.tab"
            >
              <Dumbbell className="w-4 h-4" />
              Exercise Sessions
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm"
              data-ocid="admin.subscriptions.tab"
            >
              <CreditCard className="w-4 h-4" />
              Treatment Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food-logs">
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6 pb-6">
                <FoodLogsTab onRefreshAll={handleRefreshAll} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shopping">
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6 pb-6">
                <ShoppingOrdersTab onRefreshAll={handleRefreshAll} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6 pb-6">
                <AppointmentsTab onRefreshAll={handleRefreshAll} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercise">
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6 pb-6">
                <ExerciseSessionsTab onRefreshAll={handleRefreshAll} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6 pb-6">
                <TreatmentPlansTab onRefreshAll={handleRefreshAll} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
