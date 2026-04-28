import Common "common";

module {
  public type CallType = { #NormalCall; #VideoCall };
  public type AppointmentStatus = { #Confirmed; #Cancelled };

  public type Doctor = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    specialty : Text;
    availableSlots : [Text]; // ISO datetime strings
  };

  public type Appointment = {
    id : Nat;
    userId : Common.UserId;
    doctorId : Nat;
    slot : Text;
    callType : CallType;
    status : AppointmentStatus;
    confirmationNumber : Text;
    createdAt : Common.Timestamp;
  };
};
