import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Types "../types/appointments";
import Common "../types/common";

module {
  let WEEKDAY_SLOTS : [Text] = [
    "Monday 9:00 AM", "Monday 10:00 AM", "Monday 11:00 AM",
    "Monday 2:00 PM", "Monday 3:00 PM", "Monday 4:00 PM",
    "Tuesday 9:00 AM", "Tuesday 10:00 AM", "Tuesday 11:00 AM",
    "Tuesday 2:00 PM", "Tuesday 3:00 PM", "Tuesday 4:00 PM",
    "Wednesday 9:00 AM", "Wednesday 10:00 AM", "Wednesday 11:00 AM",
    "Wednesday 2:00 PM", "Wednesday 3:00 PM", "Wednesday 4:00 PM",
    "Thursday 9:00 AM", "Thursday 10:00 AM", "Thursday 11:00 AM",
    "Thursday 2:00 PM", "Thursday 3:00 PM", "Thursday 4:00 PM",
    "Friday 9:00 AM", "Friday 10:00 AM", "Friday 11:00 AM",
    "Friday 2:00 PM", "Friday 3:00 PM", "Friday 4:00 PM",
  ];

  let SEED_DOCTORS : [Types.Doctor] = [
    {
      id = 1;
      name = "Dr. Anil Kumar";
      phone = "+91-9876543210";
      email = "anil.kumar@diabetescare.in";
      specialty = "Endocrinologist";
      availableSlots = WEEKDAY_SLOTS;
    },
    {
      id = 2;
      name = "Dr. Priya Sharma";
      phone = "+91-8765432109";
      email = "priya.sharma@diabetescare.in";
      specialty = "Diabetologist";
      availableSlots = WEEKDAY_SLOTS;
    },
    {
      id = 3;
      name = "Dr. Ravi Mehta";
      phone = "+91-7654321098";
      email = "ravi.mehta@diabetescare.in";
      specialty = "Nutritionist";
      availableSlots = WEEKDAY_SLOTS;
    },
    {
      id = 4;
      name = "Dr. Sunita Patel";
      phone = "+91-6543210987";
      email = "sunita.patel@diabetescare.in";
      specialty = "General Physician";
      availableSlots = WEEKDAY_SLOTS;
    },
    {
      id = 5;
      name = "Dr. Arjun Singh";
      phone = "+91-5432109876";
      email = "arjun.singh@diabetescare.in";
      specialty = "Endocrinologist";
      availableSlots = WEEKDAY_SLOTS;
    },
  ];

  public func seedDoctors(doctors : List.List<Types.Doctor>) {
    if (not doctors.isEmpty()) return; // Already seeded
    for (doc in SEED_DOCTORS.values()) {
      doctors.add(doc);
    };
  };

  public func getAllDoctors(doctors : List.List<Types.Doctor>) : [Types.Doctor] {
    doctors.toArray();
  };

  func makeConfirmationNumber(id : Nat, now : Int) : Text {
    "APPT-" # id.toText() # "-" # (now / 1_000_000_000).toText();
  };

  public func bookAppointment(
    appointments : List.List<Types.Appointment>,
    nextId : Nat,
    caller : Common.UserId,
    doctorId : Nat,
    slot : Text,
    callType : Types.CallType,
  ) : (Types.Appointment, Nat) {
    let now = Time.now();
    let appt : Types.Appointment = {
      id = nextId;
      userId = caller;
      doctorId;
      slot;
      callType;
      status = #Confirmed;
      confirmationNumber = makeConfirmationNumber(nextId, now);
      createdAt = now;
    };
    appointments.add(appt);
    (appt, nextId + 1);
  };

  public func cancelAppointment(
    appointments : List.List<Types.Appointment>,
    caller : Common.UserId,
    appointmentId : Nat,
  ) : Bool {
    var found = false;
    appointments.mapInPlace(func(a : Types.Appointment) : Types.Appointment {
      if (a.id == appointmentId and Principal.equal(a.userId, caller)) {
        found := true;
        { a with status = #Cancelled };
      } else a;
    });
    found;
  };

  public func getUserAppointments(
    appointments : List.List<Types.Appointment>,
    caller : Common.UserId,
  ) : [Types.Appointment] {
    appointments.filter(func(a : Types.Appointment) : Bool {
      Principal.equal(a.userId, caller)
    }).toArray();
  };

  public func getAllAppointments(
    appointments : List.List<Types.Appointment>,
  ) : [Types.Appointment] {
    appointments.toArray();
  };
};
