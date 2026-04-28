import Map "mo:core/Map";
import Text "mo:core/Text";
import UsersLib "../lib/users";

mixin (users : Map.Map<Text, UsersLib.User>) {
  /// Register a new user account.
  public shared func registerUser(name : Text, email : Text, password : Text) : async { #ok : Text; #err : Text } {
    UsersLib.registerUser(users, name, email, password);
  };

  /// Login with email and password.
  public shared func loginUser(email : Text, password : Text) : async { #ok : Text; #err : Text } {
    UsersLib.loginUser(users, email, password);
  };

  /// Get all registered users (admin monitoring — frontend guards access).
  public shared func getAllUsers() : async [{ name : Text; email : Text; createdAt : Int }] {
    UsersLib.getAllUsers(users);
  };

  /// Get total number of registered users.
  public shared query func getUserCount() : async Nat {
    UsersLib.getUserCount(users);
  };
};
