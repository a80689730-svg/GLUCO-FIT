import List "mo:core/List";
import Runtime "mo:core/Runtime";
import ShoppingTypes "../types/shopping";
import ShoppingLib "../lib/shopping";

mixin (
  products : List.List<ShoppingTypes.Product>,
  shoppingOrders : List.List<ShoppingTypes.ShoppingOrder>,
) {
  var nextShoppingOrderId : Nat = 0;

  /// Get all products in the catalog
  public query func getProducts() : async [ShoppingTypes.Product] {
    ShoppingLib.getAllProducts(products);
  };

  /// Place a shopping order; returns the created order with order number
  public shared ({ caller }) func placeOrder(
    items : [ShoppingTypes.OrderItem],
  ) : async ShoppingTypes.ShoppingOrder {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    let (order, newId) = ShoppingLib.placeOrder(shoppingOrders, products, nextShoppingOrderId, caller, items);
    nextShoppingOrderId := newId;
    order;
  };

  /// Get caller's own orders sorted by date descending
  public shared query ({ caller }) func getMyOrders() : async [ShoppingTypes.ShoppingOrder] {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    ShoppingLib.getUserOrders(shoppingOrders, caller);
  };

  /// Admin: get all orders across all users
  public query func adminGetAllOrders() : async [ShoppingTypes.ShoppingOrder] {
    ShoppingLib.getAllOrders(shoppingOrders);
  };
};
