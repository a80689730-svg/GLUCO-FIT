import List "mo:core/List";
import AppointmentTypes "../types/appointments";
import AppointmentsLib "../lib/appointments";

mixin (
  doctors : List.List<AppointmentTypes.Doctor>,
  appointments : List.List<AppointmentTypes.Appointment>,
) {
  var nextAppointmentId : Nat = 0;

  /// Get all doctor profiles
  public query func getDoctors() : async [AppointmentTypes.Doctor] {
    AppointmentsLib.getAllDoctors(doctors);
  };

  /// Book an appointment with a doctor
  public shared ({ caller }) func bookAppointment(
    doctorId : Nat,
    slot : Text,
    callType : AppointmentTypes.CallType,
  ) : async AppointmentTypes.Appointment {
    let (appt, newId) = AppointmentsLib.bookAppointment(appointments, nextAppointmentId, caller, doctorId, slot, callType);
    nextAppointmentId := newId;
    appt;
  };

  /// Cancel one of caller's appointments
  public shared ({ caller }) func cancelAppointment(appointmentId : Nat) : async Bool {
    AppointmentsLib.cancelAppointment(appointments, caller, appointmentId);
  };

  /// Get caller's own appointments
  public shared query ({ caller }) func getMyAppointments() : async [AppointmentTypes.Appointment] {
    AppointmentsLib.getUserAppointments(appointments, caller);
  };

  /// Admin: get all appointments across all users
  public query func adminGetAllAppointments() : async [AppointmentTypes.Appointment] {
    AppointmentsLib.getAllAppointments(appointments);
  };
};
