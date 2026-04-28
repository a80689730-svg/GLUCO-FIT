import Common "common";

module {
  public type DietLogEntry = {
    id : Nat;
    userId : Common.UserId;
    timestamp : Common.Timestamp;
    foodName : Text;
    quantity : Text;
    calories : Nat;
    grams : Float;
  };
};
