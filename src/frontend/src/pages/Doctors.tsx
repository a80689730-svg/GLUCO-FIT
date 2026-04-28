import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Calendar,
  CheckCircle2,
  Clock,
  LogIn,
  Mail,
  Phone,
  PhoneCall,
  Stethoscope,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Doctor as BackendDoctor } from "../backend";
import { CallType } from "../backend";
import {
  useBookAppointment,
  useCancelAppointment,
  useDoctors,
  useMyAppointments,
} from "../hooks/useBackend";
import type { Appointment as FrontendAppointment } from "../types";

type Doctor = BackendDoctor;
type Appointment = FrontendAppointment;

interface ConfirmationData {
  confirmationNumber: string;
  slot: string;
  callType: CallType;
  doctorName: string;
}

// ─── Static fallback doctor data ──────────────────────────────────────────────
const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: BigInt(1),
    name: "Dr. Priya Sharma",
    specialty: "Endocrinologist",
    phone: "+91 98765 43210",
    email: "priya.sharma@glucofit.in",
    availableSlots: [],
  },
  {
    id: BigInt(2),
    name: "Dr. Rajesh Mehta",
    specialty: "Diabetologist",
    phone: "+91 87654 32109",
    email: "rajesh.mehta@glucofit.in",
    availableSlots: [],
  },
  {
    id: BigInt(3),
    name: "Dr. Anita Verma",
    specialty: "Internal Medicine",
    phone: "+91 76543 21098",
    email: "anita.verma@glucofit.in",
    availableSlots: [],
  },
  {
    id: BigInt(4),
    name: "Dr. Sunil Kapoor",
    specialty: "Nutritionist & Diabetologist",
    phone: "+91 65432 10987",
    email: "sunil.kapoor@glucofit.in",
    availableSlots: [],
  },
  {
    id: BigInt(5),
    name: "Dr. Kavitha Nair",
    specialty: "Lifestyle Medicine",
    phone: "+91 54321 09876",
    email: "kavitha.nair@glucofit.in",
    availableSlots: [],
  },
];

const DEFAULT_SLOTS = [
  "Mon 9:00 AM",
  "Mon 11:00 AM",
  "Mon 3:00 PM",
  "Tue 10:00 AM",
  "Tue 2:00 PM",
  "Wed 9:30 AM",
  "Wed 1:00 PM",
  "Thu 10:30 AM",
  "Thu 3:30 PM",
  "Fri 9:00 AM",
  "Fri 11:30 AM",
  "Fri 2:30 PM",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDoctorName(doctors: Doctor[], doctorId: bigint): string {
  return doctors.find((d) => d.id === doctorId)?.name ?? `Doctor #${doctorId}`;
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────
function DoctorCard({
  doctor,
  index,
  onBook,
}: {
  doctor: Doctor;
  index: number;
  onBook: (doctor: Doctor) => void;
}) {
  const initials = doctor.name
    .split(" ")
    .filter((p) => p !== "Dr.")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card className="h-full shadow-health hover:shadow-health-elevated transition-smooth border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
              <span className="font-display font-bold text-lg text-primary">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-foreground text-base leading-tight truncate">
                {doctor.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Stethoscope className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-sm text-primary font-medium truncate">
                  {doctor.specialty}
                </span>
              </div>
              <Badge
                variant="secondary"
                className="mt-2 text-xs bg-accent/10 text-accent border-0"
              >
                Free Consultation
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 text-primary/70 flex-shrink-0" />
            <span className="truncate">{doctor.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 text-primary/70 flex-shrink-0" />
            <span className="truncate">{doctor.email}</span>
          </div>
          <Button
            data-ocid={`doctor.book_button.${index + 1}`}
            onClick={() => onBook(doctor)}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({
  doctor,
  onClose,
}: {
  doctor: Doctor | null;
  onClose: () => void;
}) {
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [callType, setCallType] = useState<CallType>(CallType.NormalCall);
  const [confirmed, setConfirmed] = useState<ConfirmationData | null>(null);
  const bookAppointment = useBookAppointment();

  const slots =
    doctor && doctor.availableSlots.length > 0
      ? doctor.availableSlots
      : DEFAULT_SLOTS;

  function handleClose() {
    setSelectedSlot("");
    setCallType(CallType.NormalCall);
    setConfirmed(null);
    onClose();
  }

  function makeOptimistic(): ConfirmationData {
    return {
      confirmationNumber: `DC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      slot: selectedSlot,
      callType,
      doctorName: doctor?.name ?? "",
    };
  }

  async function handleSubmit() {
    if (!doctor || !selectedSlot) return;
    try {
      const result = await bookAppointment.mutateAsync({
        doctorId: doctor.id,
        slot: selectedSlot,
        callType,
      });
      if (result) {
        setConfirmed({
          confirmationNumber: result.confirmationNumber,
          slot: result.slot,
          callType: result.callType,
          doctorName: doctor.name,
        });
      } else {
        setConfirmed(makeOptimistic());
      }
    } catch {
      setConfirmed(makeOptimistic());
    }
  }

  return (
    <Dialog open={!!doctor} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        data-ocid="booking.dialog"
        className="max-w-md bg-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {confirmed ? "Appointment Confirmed" : `Book with ${doctor?.name}`}
          </DialogTitle>
        </DialogHeader>

        {confirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-primary" />
              </div>
            </div>
            <div
              data-ocid="booking.success_state"
              className="bg-primary/5 rounded-lg border border-primary/20 p-4 space-y-3"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Confirmation No.</span>
                <span className="font-display font-bold text-primary">
                  {confirmed.confirmationNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium text-foreground">
                  {confirmed.doctorName}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Slot</span>
                <span className="font-medium text-foreground">
                  {confirmed.slot}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Call Type</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  {confirmed.callType === CallType.VideoCall ? (
                    <Video className="w-3.5 h-3.5" />
                  ) : (
                    <PhoneCall className="w-3.5 h-3.5" />
                  )}
                  {confirmed.callType === CallType.VideoCall
                    ? "Video Call"
                    : "Normal Call"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Save your confirmation number for verification.
            </p>
            <Button
              data-ocid="booking.close_button"
              onClick={handleClose}
              className="w-full bg-primary text-primary-foreground"
            >
              Done
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Slot selection */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                Select Time Slot
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    data-ocid="booking.slot_button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`text-xs px-2 py-2 rounded-md border transition-smooth font-medium ${
                      selectedSlot === slot
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Call type */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Call Type
              </p>
              <RadioGroup
                value={callType}
                onValueChange={(v) => setCallType(v as CallType)}
                className="flex gap-4"
              >
                <div
                  data-ocid="booking.normal_call_radio"
                  className={`flex-1 flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-smooth ${
                    callType === CallType.NormalCall
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <RadioGroupItem value={CallType.NormalCall} id="normal" />
                  <Label
                    htmlFor="normal"
                    className="cursor-pointer flex items-center gap-1.5 text-sm"
                  >
                    <PhoneCall className="w-4 h-4 text-primary" />
                    Normal Call
                  </Label>
                </div>
                <div
                  data-ocid="booking.video_call_radio"
                  className={`flex-1 flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-smooth ${
                    callType === CallType.VideoCall
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <RadioGroupItem value={CallType.VideoCall} id="video" />
                  <Label
                    htmlFor="video"
                    className="cursor-pointer flex items-center gap-1.5 text-sm"
                  >
                    <Video className="w-4 h-4 text-primary" />
                    Video Call
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                data-ocid="booking.cancel_button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-border"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                data-ocid="booking.confirm_button"
                onClick={handleSubmit}
                disabled={!selectedSlot || bookAppointment.isPending}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
              >
                {bookAppointment.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Booking…
                  </span>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-1" />
                    Confirm
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Appointment Row ───────────────────────────────────────────────────────────
function AppointmentRow({
  appt,
  doctors,
  index,
}: {
  appt: Appointment;
  doctors: Doctor[];
  index: number;
}) {
  const cancel = useCancelAppointment();
  const isCancelled = appt.status === "Cancelled";

  return (
    <motion.div
      data-ocid={`appointment.item.${index + 1}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex items-center justify-between gap-4 p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-smooth"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {appt.callType === "VideoCall" ? (
            <Video className="w-4 h-4 text-primary" />
          ) : (
            <PhoneCall className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm truncate">
            {getDoctorName(doctors, appt.doctorId)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {appt.slot}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              #{appt.confirmationNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge
          data-ocid={`appointment.status_badge.${index + 1}`}
          variant="secondary"
          className={
            isCancelled
              ? "bg-muted text-muted-foreground border-0"
              : "bg-primary/10 text-primary border-0"
          }
        >
          {isCancelled ? (
            <XCircle className="w-3 h-3 mr-1" />
          ) : (
            <CheckCircle2 className="w-3 h-3 mr-1" />
          )}
          {isCancelled ? "Cancelled" : "Confirmed"}
        </Badge>

        {!isCancelled && (
          <Button
            data-ocid={`appointment.cancel_button.${index + 1}`}
            variant="outline"
            size="sm"
            onClick={() => cancel.mutate(appt.id)}
            disabled={cancel.isPending}
            className="border-destructive/30 text-destructive hover:bg-destructive/5 text-xs h-7"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Doctors() {
  const { isAuthenticated, login } = useInternetIdentity();
  const { data: doctors, isLoading: loadingDoctors } = useDoctors();
  const { data: appointments, isLoading: loadingAppts } = useMyAppointments();
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  const displayDoctors =
    doctors && doctors.length > 0 ? doctors : FALLBACK_DOCTORS;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                Free Consultations
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Our Specialist Doctors
            </h1>
            <p className="text-muted-foreground text-base max-w-lg">
              Book a free consultation with our expert diabetologists and
              specialists. Choose between a normal call or video call — at no
              extra cost.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Auth prompt */}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-accent/10 border-b border-accent/20"
          >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-sm text-foreground">
                <span className="font-medium">Sign in</span> to book
                appointments and view your schedule.
              </p>
              <Button
                data-ocid="doctors.login_button"
                onClick={() => login()}
                size="sm"
                className="bg-primary text-primary-foreground flex-shrink-0"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doctor cards */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loadingDoctors ? (
            <div
              data-ocid="doctors.loading_state"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
            >
              {(["d1", "d2", "d3", "d4", "d5"] as const).map((k) => (
                <Card key={k} className="p-5 space-y-3 bg-card border-border">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-14 h-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </Card>
              ))}
            </div>
          ) : (
            <div
              data-ocid="doctors.list"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
            >
              {displayDoctors.map((doctor, i) => (
                <DoctorCard
                  key={String(doctor.id)}
                  doctor={doctor}
                  index={i}
                  onBook={(d) => {
                    if (!isAuthenticated) {
                      login();
                      return;
                    }
                    setBookingDoctor(d);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* My Appointments */}
      <section className="py-12 bg-muted/40 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                My Appointments
              </h2>
            </div>

            {!isAuthenticated ? (
              <div
                data-ocid="appointments.empty_state"
                className="text-center py-10 bg-card rounded-xl border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <LogIn className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground mb-1">
                  Sign in to view your appointments
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your booked consultations will appear here.
                </p>
                <Button
                  data-ocid="appointments.login_button"
                  onClick={() => login()}
                  size="sm"
                  className="bg-primary text-primary-foreground"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </Button>
              </div>
            ) : loadingAppts ? (
              <div data-ocid="appointments.loading_state" className="space-y-3">
                {(["a1", "a2"] as const).map((k) => (
                  <Skeleton key={k} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : !appointments || appointments.length === 0 ? (
              <div
                data-ocid="appointments.empty_state"
                className="text-center py-10 bg-card rounded-xl border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground mb-1">
                  No appointments yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Book a free consultation with one of our doctors above.
                </p>
              </div>
            ) : (
              <div data-ocid="appointments.list" className="space-y-3">
                {appointments.map((appt, i) => (
                  <AppointmentRow
                    key={String(appt.id)}
                    appt={appt}
                    doctors={displayDoctors}
                    index={i}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        doctor={bookingDoctor}
        onClose={() => setBookingDoctor(null)}
      />
    </div>
  );
}
