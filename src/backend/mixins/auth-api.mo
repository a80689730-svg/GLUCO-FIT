import AuthLib "../lib/auth";
import Principal "mo:core/Principal";

mixin () {
  /// Returns true if the caller is an admin
  public shared query ({ caller }) func isAdmin() : async Bool {
    AuthLib.isAdmin(caller);
  };

  /// Returns the caller's principal — useful for frontend debugging and admin setup
  public shared query ({ caller }) func getCallerPrincipal() : async Principal {
    caller;
  };

  /// Admin login for the Gluco Fit admin panel using hardcoded credentials.
  /// Returns true only when email and password match the configured admin credentials.
  public shared func adminLogin(email : Text, password : Text) : async Bool {
    AuthLib.adminLogin(email, password);
  };
};
