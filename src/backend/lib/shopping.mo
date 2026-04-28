import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import ShoppingTypes "../types/shopping";

module {
  /// Return all products in the catalog
  public func getAllProducts(products : List.List<ShoppingTypes.Product>) : [ShoppingTypes.Product] {
    products.toArray();
  };

  /// Seed initial product catalog (15 products across 3 categories)
  public func seedProducts(products : List.List<ShoppingTypes.Product>) {
    // Only seed if empty
    if (products.size() > 0) return;

    let catalog : [ShoppingTypes.Product] = [
      // DiabetesFood (6 items)
      { id = 0; name = "Brown Rice (1 kg)"; description = "Low glycemic index brown rice — ideal for blood sugar management"; price = 12000; category = #DiabetesFood; imageUrl = ?"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
      { id = 1; name = "Diabetic Digestive Biscuits (200g)"; description = "Sugar-free whole-wheat biscuits with no added sugars"; price = 8500; category = #DiabetesFood; imageUrl = ?"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80" },
      { id = 2; name = "Oats (500g)"; description = "Rolled oats with low GI — slow energy release, great for diabetics"; price = 9500; category = #DiabetesFood; imageUrl = ?"https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=400&q=80" },
      { id = 3; name = "Quinoa (500g)"; description = "High-protein, low-GI grain packed with fibre and nutrients"; price = 24900; category = #DiabetesFood; imageUrl = ?"https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80" },
      { id = 4; name = "Sugar-Free Dark Chocolate (100g)"; description = "70% cocoa dark chocolate sweetened with stevia — no added sugar"; price = 17500; category = #DiabetesFood; imageUrl = ?"https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&q=80" },
      { id = 5; name = "Flaxseed Powder (250g)"; description = "Ground flaxseeds rich in omega-3 fatty acids and dietary fibre"; price = 11000; category = #DiabetesFood; imageUrl = ?"https://images.unsplash.com/photo-1611073615830-9661adf9f25e?w=400&q=80" },
      // Medicine (5 items)
      { id = 6; name = "Blood Glucose Monitor Kit"; description = "Accurate digital glucometer with memory, carrying case, and 10 test strips"; price = 149900; category = #Medicine; imageUrl = ?"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80" },
      { id = 7; name = "Glucometer Test Strips (50 pcs)"; description = "Compatible test strips for most standard glucometers"; price = 79900; category = #Medicine; imageUrl = ?"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80" },
      { id = 8; name = "Lancets (100 pcs)"; description = "Thin-gauge, painless lancets for fingertip blood sampling"; price = 29900; category = #Medicine; imageUrl = ?"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80" },
      { id = 9; name = "Insulin Syringes (50 pcs)"; description = "0.5 ml insulin syringes — sterile, single-use, 31G needle"; price = 34900; category = #Medicine; imageUrl = ?"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" },
      { id = 10; name = "Diabetic Foot Cream (100ml)"; description = "Urea-based moisturising cream specially formulated for diabetic feet"; price = 45000; category = #Medicine; imageUrl = ?"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80" },
      // ExerciseEquipment (4 items)
      { id = 11; name = "Resistance Bands Set (5 levels)"; description = "Latex-free resistance bands — light to extra-heavy for progressive training"; price = 59900; category = #ExerciseEquipment; imageUrl = ?"https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80" },
      { id = 12; name = "Yoga Mat (6mm)"; description = "Non-slip, eco-friendly TPE yoga mat with carry strap"; price = 89900; category = #ExerciseEquipment; imageUrl = ?"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80" },
      { id = 13; name = "Adjustable Dumbbells (2 kg pair)"; description = "Rubber-coated adjustable dumbbell set ideal for home workouts"; price = 119900; category = #ExerciseEquipment; imageUrl = ?"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
      { id = 14; name = "Pedometer Clip"; description = "Accurate step counter with calorie tracker — clip to belt or pocket"; price = 39900; category = #ExerciseEquipment; imageUrl = ?"https://images.unsplash.com/photo-1510017803434-a899398421b3?w=400&q=80" },
    ];

    for (product in catalog.values()) {
      products.add(product);
    };
  };

  /// Place a shopping order; returns the created order and incremented nextId
  public func placeOrder(
    orders : List.List<ShoppingTypes.ShoppingOrder>,
    products : List.List<ShoppingTypes.Product>,
    nextId : Nat,
    caller : Common.UserId,
    items : [ShoppingTypes.OrderItem],
  ) : (ShoppingTypes.ShoppingOrder, Nat) {
    if (items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    // Validate all products exist and calculate total
    var total : Nat = 0;
    for (item in items.values()) {
      let found = products.find(func(p : ShoppingTypes.Product) : Bool { p.id == item.productId });
      switch (found) {
        case null { Runtime.trap("Product not found: " # debug_show(item.productId)) };
        case (?_p) {};
      };
      total += item.unitPrice * item.quantity;
    };

    let now = Time.now();
    // Order number: ORD + nextId + last 6 digits of timestamp
    let orderNumber = "ORD" # nextId.toText() # (now % 1_000_000 : Int).toText();

    let order : ShoppingTypes.ShoppingOrder = {
      id = nextId;
      userId = caller;
      items = items;
      totalAmount = total;
      orderNumber = orderNumber;
      createdAt = now;
    };

    orders.add(order);
    (order, nextId + 1);
  };

  /// Get all orders for a specific user, sorted by createdAt descending
  public func getUserOrders(
    orders : List.List<ShoppingTypes.ShoppingOrder>,
    caller : Common.UserId,
  ) : [ShoppingTypes.ShoppingOrder] {
    let userOrders = orders.filter(func(o : ShoppingTypes.ShoppingOrder) : Bool {
      o.userId == caller
    });
    let sorted = userOrders.sort(func(a : ShoppingTypes.ShoppingOrder, b : ShoppingTypes.ShoppingOrder) : { #less; #equal; #greater } {
      Int.compare(b.createdAt, a.createdAt)
    });
    sorted.toArray();
  };

  /// Get all orders (admin), sorted by createdAt descending
  public func getAllOrders(orders : List.List<ShoppingTypes.ShoppingOrder>) : [ShoppingTypes.ShoppingOrder] {
    let sorted = orders.sort(func(a : ShoppingTypes.ShoppingOrder, b : ShoppingTypes.ShoppingOrder) : { #less; #equal; #greater } {
      Int.compare(b.createdAt, a.createdAt)
    });
    sorted.toArray();
  };
};
