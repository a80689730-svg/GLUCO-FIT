import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";

module {
  public type User = {
    name : Text;
    email : Text;
    passwordHash : Text; // plain text for demo
    createdAt : Int;
  };

  // Public API-safe type (no internal mutable containers)
  public type UserPublic = {
    name : Text;
    email : Text;
    createdAt : Int;
  };

  public func toPublic(u : User) : UserPublic {
    { name = u.name; email = u.email; createdAt = u.createdAt };
  };

  /// Register a new user. Returns #ok(email) or #err(message).
  public func registerUser(
    users : Map.Map<Text, User>,
    name : Text,
    email : Text,
    password : Text,
  ) : { #ok : Text; #err : Text } {
    let normalizedEmail = email.toLower();
    switch (users.get(normalizedEmail)) {
      case (?_) { #err("Email already registered") };
      case null {
        let user : User = {
          name = name;
          email = normalizedEmail;
          passwordHash = password;
          createdAt = Time.now();
        };
        users.add(normalizedEmail, user);
        #ok(normalizedEmail);
      };
    };
  };

  /// Login an existing user. Returns #ok(email) or #err(message).
  public func loginUser(
    users : Map.Map<Text, User>,
    email : Text,
    password : Text,
  ) : { #ok : Text; #err : Text } {
    let normalizedEmail = email.toLower();
    switch (users.get(normalizedEmail)) {
      case null { #err("Email not found") };
      case (?user) {
        if (user.passwordHash == password) {
          #ok(normalizedEmail);
        } else {
          #err("Invalid password");
        };
      };
    };
  };

  /// Internal lookup by email.
  public func getUserByEmail(users : Map.Map<Text, User>, email : Text) : ?User {
    users.get(email.toLower());
  };

  /// Return all users as public-safe records.
  public func getAllUsers(users : Map.Map<Text, User>) : [UserPublic] {
    let iter = users.values();
    var result : [UserPublic] = [];
    for (u in iter) {
      result := result.concat([toPublic(u)]);
    };
    result;
  };

  /// Return the total number of registered users.
  public func getUserCount(users : Map.Map<Text, User>) : Nat {
    users.size();
  };
};
