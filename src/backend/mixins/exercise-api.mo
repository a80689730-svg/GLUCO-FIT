import List "mo:core/List";
import Runtime "mo:core/Runtime";
import ExerciseTypes "../types/exercise";
import ExerciseLib "../lib/exercise";

mixin (
  exerciseSessions : List.List<ExerciseTypes.ExerciseSession>,
  exerciseBookings : List.List<ExerciseTypes.ExerciseBooking>,
) {
  var nextExerciseBookingId : Nat = 0;

  /// Get all exercise sessions
  public query func getSessions() : async [ExerciseTypes.ExerciseSession] {
    ExerciseLib.getAllSessions(exerciseSessions);
  };

  /// Book an exercise session
  public shared ({ caller }) func bookSession(sessionId : Nat) : async ExerciseTypes.ExerciseBooking {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    let (booking, newId) = ExerciseLib.bookSession(exerciseBookings, exerciseSessions, nextExerciseBookingId, caller, sessionId);
    nextExerciseBookingId := newId;
    booking;
  };

  /// Cancel one of caller's bookings
  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    ExerciseLib.cancelBooking(exerciseBookings, caller, bookingId);
  };

  /// Get caller's own bookings sorted by date descending
  public shared query ({ caller }) func getMyBookings() : async [ExerciseTypes.ExerciseBooking] {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    ExerciseLib.getUserBookings(exerciseBookings, caller);
  };

  /// Admin: get all bookings across all users with user details and time slots
  public query func adminGetAllBookings() : async [ExerciseTypes.ExerciseBooking] {
    ExerciseLib.getAllBookings(exerciseBookings);
  };
};
