import List "mo:core/List";
import DietTypes "../types/diet";
import DietLib "../lib/diet";

mixin (
  dietLogs : List.List<DietTypes.DietLogEntry>,
) {
  var nextDietLogId : Nat = 0;

  /// Log a food item; returns the created entry with estimated calories and grams
  public shared ({ caller }) func logFoodItem(
    foodName : Text,
    quantity : Text,
  ) : async DietTypes.DietLogEntry {
    let (entry, newId) = DietLib.logFood(dietLogs, nextDietLogId, caller, foodName, quantity);
    nextDietLogId := newId;
    entry;
  };

  /// Delete own diet log entry
  public shared ({ caller }) func deleteDietLog(entryId : Nat) : async Bool {
    DietLib.deleteLog(dietLogs, caller, entryId);
  };

  /// Get caller's own diet log entries
  public shared query ({ caller }) func getMyDietLogs() : async [DietTypes.DietLogEntry] {
    DietLib.getUserLogs(dietLogs, caller);
  };

  /// Admin: get all diet logs across all users
  public query func adminGetAllDietLogs() : async [DietTypes.DietLogEntry] {
    DietLib.getAllLogs(dietLogs);
  };
};
