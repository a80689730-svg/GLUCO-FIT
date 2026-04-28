import Common "common";

module {
  public type ProductCategory = { #DiabetesFood; #Medicine; #ExerciseEquipment };

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat; // in paise (smallest currency unit)
    category : ProductCategory;
    imageUrl : ?Text;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    unitPrice : Nat;
  };

  public type ShoppingOrder = {
    id : Nat;
    userId : Common.UserId;
    items : [OrderItem];
    totalAmount : Nat;
    orderNumber : Common.OrderNumber;
    createdAt : Common.Timestamp;
  };
};
