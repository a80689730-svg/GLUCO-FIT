import Common "common";

module {
  public type BookingStatus = { #Booked; #Cancelled };

  public type ExerciseSession = {
    id : Nat;
    name : Text;
    instructor : Text;
    description : Text;
    dayOfWeek : Text;
    timeSlot : Text;
    duration : Nat; // in minutes
    youtubeUrl : Text;
    youtubeThumbnail : Text;
  };

  public type ExerciseBooking = {
    id : Nat;
    sessionId : Nat;
    userId : Common.UserId;
    bookingDate : Common.Timestamp;
    timeSlot : Text;
    status : BookingStatus;
  };
};
