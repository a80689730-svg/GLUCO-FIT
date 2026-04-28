import List "mo:core/List";
import SubTypes "../types/subscriptions";
import SubsLib "../lib/subscriptions";

mixin (
  subscriptions : List.List<SubTypes.Subscription>,
) {
  var nextSubscriptionId : Nat = 0;

  /// Subscribe to a plan; returns the created subscription with order number
  public shared ({ caller }) func subscribePlan(
    planType : SubTypes.PlanType,
    name : Text,
    phone : Text,
    email : Text,
    address : Text,
  ) : async SubTypes.Subscription {
    let (sub, newId) = SubsLib.subscribe(subscriptions, nextSubscriptionId, caller, planType, name, phone, email, address);
    nextSubscriptionId := newId;
    sub;
  };

  /// Mark kit as received for caller's subscription
  public shared ({ caller }) func markKitReceived(subscriptionId : Nat) : async Bool {
    SubsLib.markKitReceived(subscriptions, caller, subscriptionId);
  };

  /// Get caller's own subscriptions
  public shared query ({ caller }) func getMySubscriptions() : async [SubTypes.Subscription] {
    SubsLib.getUserSubscriptions(subscriptions, caller);
  };

  /// Admin: get all subscriptions across all users
  public query func adminGetAllSubscriptions() : async [SubTypes.Subscription] {
    SubsLib.getAllSubscriptions(subscriptions);
  };
};
