import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Types "../types/subscriptions";
import Common "../types/common";

module {
  func makeOrderNumber(id : Nat, now : Int) : Common.OrderNumber {
    let ts = Int.abs(now / 1_000_000_000);
    // Simple pseudo-random: combine id and timestamp
    let rand = (ts * 6364136223846793005 + id * 1442695040888963407) % 100000;
    "ORD-" # ts.toText() # "-" # rand.toText();
  };

  public func planAmount(planType : Types.PlanType) : Nat {
    switch (planType) {
      case (#ThreeMonth) 4999;
      case (#SixMonth)   8999;
      case (#OneYear)    14999;
    };
  };

  public func subscribe(
    subs : List.List<Types.Subscription>,
    nextId : Nat,
    caller : Common.UserId,
    planType : Types.PlanType,
    name : Text,
    phone : Text,
    email : Text,
    address : Text,
  ) : (Types.Subscription, Nat) {
    let now = Time.now();
    let sub : Types.Subscription = {
      id = nextId;
      userId = caller;
      planType;
      amount = planAmount(planType);
      name;
      phone;
      email;
      address;
      orderNumber = makeOrderNumber(nextId, now);
      purchaseDate = now;
      kitStatus = #Pending;
    };
    subs.add(sub);
    (sub, nextId + 1);
  };

  public func markKitReceived(
    subs : List.List<Types.Subscription>,
    caller : Common.UserId,
    subscriptionId : Nat,
  ) : Bool {
    var found = false;
    subs.mapInPlace(func(s : Types.Subscription) : Types.Subscription {
      if (s.id == subscriptionId and Principal.equal(s.userId, caller)) {
        found := true;
        { s with kitStatus = #Received };
      } else s;
    });
    found;
  };

  public func getUserSubscriptions(
    subs : List.List<Types.Subscription>,
    caller : Common.UserId,
  ) : [Types.Subscription] {
    subs.filter(func(s : Types.Subscription) : Bool {
      Principal.equal(s.userId, caller)
    }).toArray();
  };

  public func getAllSubscriptions(
    subs : List.List<Types.Subscription>,
  ) : [Types.Subscription] {
    subs.toArray();
  };
};
