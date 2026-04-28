import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import ExerciseTypes "../types/exercise";

module {
  /// Return all exercise sessions
  public func getAllSessions(sessions : List.List<ExerciseTypes.ExerciseSession>) : [ExerciseTypes.ExerciseSession] {
    sessions.toArray();
  };

  /// Seed initial exercise sessions suitable for diabetics (8 sessions)
  public func seedSessions(sessions : List.List<ExerciseTypes.ExerciseSession>) {
    // Only seed if empty
    if (sessions.size() > 0) return;

    let catalog : [ExerciseTypes.ExerciseSession] = [
      {
        id = 0;
        name = "Gentle Yoga for Blood Sugar";
        instructor = "Priya Sharma";
        description = "A slow-paced yoga flow that activates muscles and helps lower post-meal blood glucose levels through mindful breathing and gentle stretching.";
        dayOfWeek = "Monday";
        timeSlot = "7:00 AM - 8:00 AM";
        duration = 60;
        youtubeUrl = "https://www.youtube.com/watch?v=v7AYKMP6rOE";
        youtubeThumbnail = "https://img.youtube.com/vi/v7AYKMP6rOE/hqdefault.jpg";
      },
      {
        id = 1;
        name = "Morning Walk Motivation";
        instructor = "Rahul Verma";
        description = "A guided 30-minute brisk walk session designed to kickstart your metabolism and improve insulin sensitivity first thing in the morning.";
        dayOfWeek = "Tuesday";
        timeSlot = "6:30 AM - 7:00 AM";
        duration = 30;
        youtubeUrl = "https://www.youtube.com/watch?v=cZnsLVArIt8";
        youtubeThumbnail = "https://img.youtube.com/vi/cZnsLVArIt8/hqdefault.jpg";
      },
      {
        id = 2;
        name = "Resistance Training for Diabetics";
        instructor = "Ankit Mehta";
        description = "Light dumbbell and resistance band exercises that build muscle mass, increase glucose uptake, and support long-term blood sugar control.";
        dayOfWeek = "Wednesday";
        timeSlot = "8:00 AM - 9:00 AM";
        duration = 60;
        youtubeUrl = "https://www.youtube.com/watch?v=ixkQaZXVQjs";
        youtubeThumbnail = "https://img.youtube.com/vi/ixkQaZXVQjs/hqdefault.jpg";
      },
      {
        id = 3;
        name = "Seated Chair Exercises";
        instructor = "Meena Pillai";
        description = "Low-impact exercises performed entirely from a chair — perfect for seniors or those with mobility challenges. Improves circulation and flexibility.";
        dayOfWeek = "Thursday";
        timeSlot = "10:00 AM - 10:45 AM";
        duration = 45;
        youtubeUrl = "https://www.youtube.com/watch?v=Nv5UNbFR1_k";
        youtubeThumbnail = "https://img.youtube.com/vi/Nv5UNbFR1_k/hqdefault.jpg";
      },
      {
        id = 4;
        name = "Evening Stretching & Relaxation";
        instructor = "Priya Sharma";
        description = "A 45-minute full-body stretching routine that reduces stress hormones (cortisol) that can spike blood sugar, ending with a guided meditation.";
        dayOfWeek = "Friday";
        timeSlot = "6:00 PM - 6:45 PM";
        duration = 45;
        youtubeUrl = "https://www.youtube.com/watch?v=g_tea8ZNk5A";
        youtubeThumbnail = "https://img.youtube.com/vi/g_tea8ZNk5A/hqdefault.jpg";
      },
      {
        id = 5;
        name = "Cardio Cycling for Glucose Control";
        instructor = "Rahul Verma";
        description = "Stationary cycling intervals designed to deplete glycogen stores and significantly improve insulin sensitivity over time.";
        dayOfWeek = "Saturday";
        timeSlot = "7:30 AM - 8:30 AM";
        duration = 60;
        youtubeUrl = "https://www.youtube.com/watch?v=p2MGPRC5eAc";
        youtubeThumbnail = "https://img.youtube.com/vi/p2MGPRC5eAc/hqdefault.jpg";
      },
      {
        id = 6;
        name = "Core Strengthening Flow";
        instructor = "Ankit Mehta";
        description = "Targeted core and abdominal exercises that support posture, reduce belly fat linked to insulin resistance, and strengthen the lumbar region.";
        dayOfWeek = "Sunday";
        timeSlot = "9:00 AM - 9:45 AM";
        duration = 45;
        youtubeUrl = "https://www.youtube.com/watch?v=0cqq7bPNuYk";
        youtubeThumbnail = "https://img.youtube.com/vi/0cqq7bPNuYk/hqdefault.jpg";
      },
      {
        id = 7;
        name = "Stress-Relief Breathing & Meditation";
        instructor = "Meena Pillai";
        description = "Pranayama breathing techniques combined with mindfulness meditation to lower cortisol levels and help maintain stable blood glucose throughout the day.";
        dayOfWeek = "Wednesday";
        timeSlot = "6:00 PM - 6:30 PM";
        duration = 30;
        youtubeUrl = "https://www.youtube.com/watch?v=inpok4MKVLM";
        youtubeThumbnail = "https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg";
      },
      {
        id = 8;
        name = "Post-Meal Walking Guide";
        instructor = "Rahul Verma";
        description = "A 20-minute gentle walking routine specifically timed after meals to blunt post-prandial glucose spikes naturally and aid digestion.";
        dayOfWeek = "Monday";
        timeSlot = "1:00 PM - 1:20 PM";
        duration = 20;
        youtubeUrl = "https://www.youtube.com/watch?v=cT0eLPuMhUg";
        youtubeThumbnail = "https://img.youtube.com/vi/cT0eLPuMhUg/hqdefault.jpg";
      },
    ];

    for (session in catalog.values()) {
      sessions.add(session);
    };
  };

  /// Book an exercise session; returns the booking and incremented nextId
  public func bookSession(
    bookings : List.List<ExerciseTypes.ExerciseBooking>,
    sessions : List.List<ExerciseTypes.ExerciseSession>,
    nextId : Nat,
    caller : Common.UserId,
    sessionId : Nat,
  ) : (ExerciseTypes.ExerciseBooking, Nat) {
    let session = switch (sessions.find(func(s : ExerciseTypes.ExerciseSession) : Bool { s.id == sessionId })) {
      case null { Runtime.trap("Session not found: " # debug_show(sessionId)) };
      case (?s) { s };
    };

    let booking : ExerciseTypes.ExerciseBooking = {
      id = nextId;
      sessionId = sessionId;
      userId = caller;
      bookingDate = Time.now();
      timeSlot = session.timeSlot;
      status = #Booked;
    };

    bookings.add(booking);
    (booking, nextId + 1);
  };

  /// Cancel a booking for the caller; returns true if found and cancelled, false otherwise
  public func cancelBooking(
    bookings : List.List<ExerciseTypes.ExerciseBooking>,
    caller : Common.UserId,
    bookingId : Nat,
  ) : Bool {
    var found = false;
    bookings.mapInPlace(func(b : ExerciseTypes.ExerciseBooking) : ExerciseTypes.ExerciseBooking {
      if (b.id == bookingId and b.userId == caller) {
        found := true;
        { b with status = #Cancelled };
      } else {
        b;
      };
    });
    found;
  };

  /// Get all bookings for a specific user, sorted by bookingDate descending
  public func getUserBookings(
    bookings : List.List<ExerciseTypes.ExerciseBooking>,
    caller : Common.UserId,
  ) : [ExerciseTypes.ExerciseBooking] {
    let userBookings = bookings.filter(func(b : ExerciseTypes.ExerciseBooking) : Bool {
      b.userId == caller
    });
    let sorted = userBookings.sort(func(a : ExerciseTypes.ExerciseBooking, b : ExerciseTypes.ExerciseBooking) : { #less; #equal; #greater } {
      Int.compare(b.bookingDate, a.bookingDate)
    });
    sorted.toArray();
  };

  /// Get all bookings (admin)
  public func getAllBookings(bookings : List.List<ExerciseTypes.ExerciseBooking>) : [ExerciseTypes.ExerciseBooking] {
    let sorted = bookings.sort(func(a : ExerciseTypes.ExerciseBooking, b : ExerciseTypes.ExerciseBooking) : { #less; #equal; #greater } {
      Int.compare(b.bookingDate, a.bookingDate)
    });
    sorted.toArray();
  };
};
