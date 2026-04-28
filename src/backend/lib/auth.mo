import Principal "mo:core/Principal";

module {
  // TODO: Populate this list with real admin principals before production deployment.
  // Example: "xxxxx-xxxxx-xxxxx-xxxxx-cai"
  let ADMIN_PRINCIPALS : [Text] = [];

  let ADMIN_EMAIL = "namratakutwade@gmail.com";
  let ADMIN_PASSWORD = "Charlie";

  public func isAdmin(caller : Principal) : Bool {
    let callerText = caller.toText();
    for (adminText in ADMIN_PRINCIPALS.values()) {
      if (adminText == callerText) return true;
    };
    false;
  };

  /// Hardcoded admin login for the Gluco Fit admin panel.
  /// Returns true only when email and password match the configured admin credentials.
  public func adminLogin(email : Text, password : Text) : Bool {
    email == ADMIN_EMAIL and password == ADMIN_PASSWORD;
  };
};
