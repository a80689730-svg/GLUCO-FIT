import Common "common";

module {
  public type PlanType = { #ThreeMonth; #SixMonth; #OneYear };
  public type KitStatus = { #Pending; #Received };

  public type Subscription = {
    id : Nat;
    userId : Common.UserId;
    planType : PlanType;
    amount : Nat;
    name : Text;
    phone : Text;
    email : Text;
    address : Text;
    orderNumber : Common.OrderNumber;
    purchaseDate : Common.Timestamp;
    kitStatus : KitStatus;
  };
};
