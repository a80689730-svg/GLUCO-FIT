import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat32 "mo:core/Nat32";
import Float "mo:core/Float";
import Char "mo:core/Char";
import Principal "mo:core/Principal";
import Types "../types/diet";
import Common "../types/common";

module {
  // ---------------------------------------------------------------------------
  // Nutrition lookup table: (calories_per_100g, grams_per_unit)
  // unit = "bowl" | "piece" | "cup" | "plate"
  // ---------------------------------------------------------------------------
  type FoodData = {
    calPer100g : Nat;
    gramsPerBowl : Float;
    gramsPerPiece : Float;
    gramsPerCup : Float;
    gramsPerPlate : Float;
  };

  let FOOD_DB : [(Text, FoodData)] = [
    ("rice",       { calPer100g = 130; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 185.0; gramsPerPlate = 300.0 }),
    ("white rice", { calPer100g = 130; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 185.0; gramsPerPlate = 300.0 }),
    ("brown rice", { calPer100g = 111; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 185.0; gramsPerPlate = 300.0 }),
    ("chapati",    { calPer100g = 297; gramsPerBowl = 60.0;  gramsPerPiece = 40.0;  gramsPerCup = 60.0;  gramsPerPlate = 120.0 }),
    ("roti",       { calPer100g = 297; gramsPerBowl = 60.0;  gramsPerPiece = 40.0;  gramsPerCup = 60.0;  gramsPerPlate = 120.0 }),
    ("dal",        { calPer100g = 116; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 200.0; gramsPerPlate = 250.0 }),
    ("lentils",    { calPer100g = 116; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 200.0; gramsPerPlate = 250.0 }),
    ("idli",       { calPer100g = 58;  gramsPerBowl = 160.0; gramsPerPiece = 40.0;  gramsPerCup = 160.0; gramsPerPlate = 200.0 }),
    ("samosa",     { calPer100g = 262; gramsPerBowl = 150.0; gramsPerPiece = 60.0;  gramsPerCup = 150.0; gramsPerPlate = 200.0 }),
    ("naan",       { calPer100g = 310; gramsPerBowl = 90.0;  gramsPerPiece = 90.0;  gramsPerCup = 90.0;  gramsPerPlate = 180.0 }),
    ("paratha",    { calPer100g = 326; gramsPerBowl = 80.0;  gramsPerPiece = 80.0;  gramsPerCup = 80.0;  gramsPerPlate = 160.0 }),
    ("curry",      { calPer100g = 150; gramsPerBowl = 250.0; gramsPerPiece = 250.0; gramsPerCup = 240.0; gramsPerPlate = 350.0 }),
    ("sabzi",      { calPer100g = 80;  gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 200.0; gramsPerPlate = 250.0 }),
    ("vegetable",  { calPer100g = 80;  gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 200.0; gramsPerPlate = 250.0 }),
    ("salad",      { calPer100g = 25;  gramsPerBowl = 150.0; gramsPerPiece = 150.0; gramsPerCup = 120.0; gramsPerPlate = 200.0 }),
    ("poha",       { calPer100g = 110; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 180.0; gramsPerPlate = 280.0 }),
    ("upma",       { calPer100g = 113; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 180.0; gramsPerPlate = 280.0 }),
    ("dosa",       { calPer100g = 168; gramsPerBowl = 100.0; gramsPerPiece = 100.0; gramsPerCup = 100.0; gramsPerPlate = 200.0 }),
    ("uttapam",    { calPer100g = 153; gramsPerBowl = 120.0; gramsPerPiece = 120.0; gramsPerCup = 120.0; gramsPerPlate = 240.0 }),
    ("biryani",    { calPer100g = 200; gramsPerBowl = 250.0; gramsPerPiece = 250.0; gramsPerCup = 200.0; gramsPerPlate = 400.0 }),
    ("pulao",      { calPer100g = 180; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 185.0; gramsPerPlate = 350.0 }),
    ("khichdi",    { calPer100g = 125; gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 180.0; gramsPerPlate = 300.0 }),
    ("curd",       { calPer100g = 60;  gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 200.0; gramsPerPlate = 250.0 }),
    ("yogurt",     { calPer100g = 60;  gramsPerBowl = 200.0; gramsPerPiece = 200.0; gramsPerCup = 200.0; gramsPerPlate = 250.0 }),
    ("milk",       { calPer100g = 61;  gramsPerBowl = 250.0; gramsPerPiece = 250.0; gramsPerCup = 240.0; gramsPerPlate = 300.0 }),
    ("egg",        { calPer100g = 155; gramsPerBowl = 100.0; gramsPerPiece = 50.0;  gramsPerCup = 100.0; gramsPerPlate = 150.0 }),
    ("chicken",    { calPer100g = 165; gramsPerBowl = 200.0; gramsPerPiece = 100.0; gramsPerCup = 200.0; gramsPerPlate = 300.0 }),
    ("fish",       { calPer100g = 136; gramsPerBowl = 200.0; gramsPerPiece = 100.0; gramsPerCup = 200.0; gramsPerPlate = 250.0 }),
    ("paneer",     { calPer100g = 265; gramsPerBowl = 150.0; gramsPerPiece = 50.0;  gramsPerCup = 150.0; gramsPerPlate = 200.0 }),
    ("bread",      { calPer100g = 265; gramsPerBowl = 80.0;  gramsPerPiece = 30.0;  gramsPerCup = 80.0;  gramsPerPlate = 120.0 }),
    ("oats",       { calPer100g = 389; gramsPerBowl = 150.0; gramsPerPiece = 150.0; gramsPerCup = 120.0; gramsPerPlate = 200.0 }),
    ("banana",     { calPer100g = 89;  gramsPerBowl = 120.0; gramsPerPiece = 120.0; gramsPerCup = 150.0; gramsPerPlate = 200.0 }),
    ("apple",      { calPer100g = 52;  gramsPerBowl = 150.0; gramsPerPiece = 150.0; gramsPerCup = 130.0; gramsPerPlate = 200.0 }),
    ("orange",     { calPer100g = 47;  gramsPerBowl = 130.0; gramsPerPiece = 130.0; gramsPerCup = 180.0; gramsPerPlate = 200.0 }),
  ];

  // Parse quantity string: "2 bowl", "1 piece", "3 cup", "1 plate", "200 g", "0.5 kg"
  // Returns (count, unit)
  func parseQuantity(qty : Text) : (Float, Text) {
    let lower = qty.toLower();
    let parts = lower.split(#char ' ').toArray();
    if (parts.size() < 2) {
      return (1.0, "bowl");
    };
    let numPart = parts[0];
    let unitPart = parts[1];
    let count : Float = parseFloat(numPart);
    (count, unitPart);
  };

  // Simple float parser returning 1.0 on failure
  func parseFloat(t : Text) : Float {
    let dotParts = t.split(#char '.').toArray();
    if (dotParts.size() == 1) {
      switch (parseNat(dotParts[0])) {
        case (?n) n.toFloat();
        case null 1.0;
      };
    } else if (dotParts.size() == 2) {
      let wholePart = switch (parseNat(dotParts[0])) { case (?n) n; case null 0 };
      let fracPart = switch (parseNat(dotParts[1])) { case (?n) n; case null 0 };
      let fracLen = dotParts[1].size();
      var divisor : Float = 1.0;
      var i = 0;
      while (i < fracLen) { divisor := divisor * 10.0; i += 1 };
      wholePart.toFloat() + fracPart.toFloat() / divisor;
    } else 1.0;
  };

  func parseNat(t : Text) : ?Nat {
    if (t.isEmpty()) return null;
    var result : Nat = 0;
    for (c in t.toIter()) {
      let code = c.toNat32().toNat();
      let zero = '0'.toNat32().toNat();
      let nine = '9'.toNat32().toNat();
      if (code >= zero and code <= nine) {
        result := result * 10 + (code - zero);
      } else {
        return null;
      };
    };
    ?result;
  };

  func lookupFood(name : Text) : ?FoodData {
    let lower = name.toLower();
    for ((key, data) in FOOD_DB.values()) {
      if (lower.contains(#text key) or key.contains(#text lower)) {
        return ?data;
      };
    };
    null;
  };

  // Returns (calories, grams) estimate for a food item and quantity
  public func estimateNutrition(foodName : Text, quantity : Text) : (Nat, Float) {
    let (count, unit) = parseQuantity(quantity);
    let foodData = lookupFood(foodName);
    let baseGrams : Float = switch (foodData) {
      case null 150.0;
      case (?data) {
        if (unit == "g") 1.0
        else if (unit == "kg") 1000.0
        else if (unit == "piece" or unit == "pieces" or unit == "pc" or unit == "pcs") data.gramsPerPiece
        else if (unit == "cup" or unit == "cups") data.gramsPerCup
        else if (unit == "plate" or unit == "plates") data.gramsPerPlate
        else data.gramsPerBowl;
      };
    };
    let totalGrams : Float = count * baseGrams;
    let calPer100g : Nat = switch (foodData) {
      case null 100;
      case (?data) data.calPer100g;
    };
    let caloriesFloat = totalGrams * calPer100g.toFloat() / 100.0;
    let calories : Nat = Int.abs(caloriesFloat.toInt());
    (calories, totalGrams);
  };

  public func logFood(
    logs : List.List<Types.DietLogEntry>,
    nextId : Nat,
    caller : Common.UserId,
    foodName : Text,
    quantity : Text,
  ) : (Types.DietLogEntry, Nat) {
    let (calories, grams) = estimateNutrition(foodName, quantity);
    let entry : Types.DietLogEntry = {
      id = nextId;
      userId = caller;
      timestamp = Time.now();
      foodName;
      quantity;
      calories;
      grams;
    };
    logs.add(entry);
    (entry, nextId + 1);
  };

  public func deleteLog(
    logs : List.List<Types.DietLogEntry>,
    caller : Common.UserId,
    entryId : Nat,
  ) : Bool {
    let sizeBefore = logs.size();
    let filtered = logs.filter(func(e : Types.DietLogEntry) : Bool {
      not (e.id == entryId and Principal.equal(e.userId, caller))
    });
    logs.clear();
    logs.append(filtered);
    logs.size() < sizeBefore;
  };

  public func getUserLogs(
    logs : List.List<Types.DietLogEntry>,
    caller : Common.UserId,
  ) : [Types.DietLogEntry] {
    let userLogs = logs.filter(func(e : Types.DietLogEntry) : Bool {
      Principal.equal(e.userId, caller)
    });
    let sorted = userLogs.sort(func(a : Types.DietLogEntry, b : Types.DietLogEntry) : { #less; #equal; #greater } {
      Int.compare(b.timestamp, a.timestamp)
    });
    sorted.toArray();
  };

  public func getAllLogs(
    logs : List.List<Types.DietLogEntry>,
  ) : [Types.DietLogEntry] {
    logs.toArray();
  };
};
