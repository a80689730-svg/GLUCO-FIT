import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Calendar, Clock, Dumbbell, LogIn, Play, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useBookSession,
  useCancelBooking,
  useMyBookings,
  useSessions,
} from "../hooks/useBackend";
import type { ExerciseBooking, ExerciseSession } from "../types";

function getYoutubeVideoId(url: string): string {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]{11})/,
  );
  return match ? match[1] : "";
}

function getYoutubeThumbnail(url: string, thumbnail: string): string {
  if (thumbnail) return thumbnail;
  const id = getYoutubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

function SessionCard({
  session,
  isBooked,
  onBook,
  isBooking,
  onWatch,
}: {
  session: ExerciseSession;
  isBooked: boolean;
  onBook: (id: bigint) => void;
  isBooking: boolean;
  onWatch: (session: ExerciseSession) => void;
}) {
  const thumb = getYoutubeThumbnail(
    session.youtubeUrl,
    session.youtubeThumbnail,
  );

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-smooth"
      data-ocid={`exercise.session_card.${session.id}`}
    >
      {/* Thumbnail — click opens video modal */}
      <button
        type="button"
        onClick={() => onWatch(session)}
        className="block w-full relative group bg-muted/40 h-44 overflow-hidden cursor-pointer"
        data-ocid={`exercise.session_video.${session.id}`}
        aria-label={`Watch ${session.name}`}
      >
        {thumb ? (
          <img
            src={thumb}
            alt={session.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.currentTarget;
              // Try mqdefault (medium quality) if hqdefault failed
              if (thumb.includes("/hqdefault.jpg")) {
                target.onerror = null;
                const mqUrl = thumb.replace("/hqdefault.jpg", "/mqdefault.jpg");
                target.src = mqUrl;
                target.onerror = () => {
                  target.onerror = null;
                  target.src = `https://placehold.co/480x360/e2e8f0/64748b?text=${encodeURIComponent(session.name)}`;
                };
              } else {
                target.onerror = null;
                target.src = `https://placehold.co/480x360/e2e8f0/64748b?text=${encodeURIComponent(session.name)}`;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-foreground ml-0.5" />
          </div>
        </div>
      </button>

      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-sm leading-tight">{session.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {session.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {session.instructor}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {session.dayOfWeek}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {session.timeSlot} · {String(session.duration)} min
          </span>
        </div>

        {isBooked ? (
          <Badge variant="secondary" className="w-full justify-center py-1.5">
            ✓ Booked
          </Badge>
        ) : (
          <Button
            className="w-full"
            size="sm"
            onClick={() => onBook(session.id)}
            disabled={isBooking}
            data-ocid={`exercise.book_session_button.${session.id}`}
          >
            {isBooking ? "Booking…" : "Book Session"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function MyBookingCard({
  booking,
  sessionName,
  index,
  onCancel,
  isCancelling,
}: {
  booking: ExerciseBooking;
  sessionName: string;
  index: number;
  onCancel: (id: bigint) => void;
  isCancelling: boolean;
}) {
  const cancelled = booking.status === "Cancelled";
  return (
    <Card
      className={cancelled ? "opacity-60" : ""}
      data-ocid={`exercise.booking.item.${index}`}
    >
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{sessionName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {booking.timeSlot} ·{" "}
            {new Date(
              Number(booking.bookingDate) / 1_000_000,
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={cancelled ? "outline" : "secondary"}>
            {booking.status}
          </Badge>
          {!cancelled && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-destructive hover:text-destructive"
              onClick={() => onCancel(booking.id)}
              disabled={isCancelling}
              data-ocid={`exercise.cancel_booking_button.${index}`}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Exercise() {
  const { isAuthenticated, login } = useInternetIdentity();
  const { data: sessions, isLoading: loadingSessions } = useSessions();
  const { data: myBookings } = useMyBookings();
  const bookSession = useBookSession();
  const cancelBooking = useCancelBooking();

  const [watchSession, setWatchSession] = useState<ExerciseSession | null>(
    null,
  );

  const bookedSessionIds = new Set(
    (myBookings ?? [])
      .filter((b) => b.status === "Booked")
      .map((b) => String(b.sessionId)),
  );

  function getSessionName(sessionId: bigint): string {
    const found = (sessions ?? []).find((s) => s.id === sessionId);
    return found?.name ?? `Session #${String(sessionId)}`;
  }

  async function handleBook(sessionId: bigint) {
    if (!isAuthenticated) {
      login();
      return;
    }
    try {
      await bookSession.mutateAsync(sessionId);
      toast.success("Session booked successfully!");
    } catch {
      toast.error("Failed to book session.");
    }
  }

  async function handleCancel(bookingId: bigint) {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled.");
    } catch {
      toast.error("Failed to cancel booking.");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="text-center space-y-4"
          data-ocid="exercise.auth_required"
        >
          <Dumbbell className="w-12 h-12 text-primary/40 mx-auto" />
          <h2 className="text-xl font-display font-bold">Exercise Sessions</h2>
          <p className="text-muted-foreground">
            Login to browse and book exercise sessions
          </p>
          <Button onClick={() => login()} data-ocid="exercise.login_button">
            <LogIn className="w-4 h-4 mr-2" />
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-ocid="exercise.page">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">
          Exercise Sessions
        </h1>
        <p className="text-muted-foreground text-sm">
          Book guided sessions and watch tutorial videos
        </p>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="mb-6" data-ocid="exercise.tabs">
          <TabsTrigger value="sessions" data-ocid="exercise.sessions_tab">
            <Dumbbell className="w-4 h-4 mr-2" />
            All Sessions
          </TabsTrigger>
          <TabsTrigger value="mybookings" data-ocid="exercise.my_bookings_tab">
            <Calendar className="w-4 h-4 mr-2" />
            My Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          {loadingSessions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {["a", "b", "c", "d", "e", "f"].map((k) => (
                <Skeleton key={k} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="exercise.sessions.empty_state"
            >
              <Dumbbell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No sessions available yet
              </p>
              <p className="text-xs text-muted-foreground">
                Check back soon for new sessions
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sessions.map((session) => (
                <SessionCard
                  key={String(session.id)}
                  session={session}
                  isBooked={bookedSessionIds.has(String(session.id))}
                  onBook={handleBook}
                  isBooking={bookSession.isPending}
                  onWatch={setWatchSession}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mybookings">
          {!myBookings || myBookings.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="exercise.bookings.empty_state"
            >
              <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No bookings yet
              </p>
              <p className="text-xs text-muted-foreground">
                Browse sessions and book your first one
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((booking, i) => (
                <MyBookingCard
                  key={String(booking.id)}
                  booking={booking}
                  sessionName={getSessionName(booking.sessionId)}
                  index={i + 1}
                  onCancel={handleCancel}
                  isCancelling={cancelBooking.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* YouTube Video Modal */}
      <Dialog
        open={!!watchSession}
        onOpenChange={(open) => !open && setWatchSession(null)}
      >
        <DialogContent
          className="max-w-3xl p-0 overflow-hidden"
          data-ocid="exercise.video_modal.dialog"
        >
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-base pr-8 truncate">
              {watchSession?.name ?? ""}
            </DialogTitle>
          </DialogHeader>
          {watchSession && (
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(watchSession.youtubeUrl)}?autoplay=1&rel=0`}
                title={watchSession.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <div className="px-4 py-3 flex justify-between items-center border-t border-border">
            <p className="text-xs text-muted-foreground truncate">
              {watchSession?.instructor && (
                <>
                  <User className="w-3 h-3 inline mr-1" />
                  {watchSession.instructor} · {watchSession.dayOfWeek} ·{" "}
                  {watchSession.timeSlot}
                </>
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWatchSession(null)}
              data-ocid="exercise.video_modal.close_button"
            >
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
