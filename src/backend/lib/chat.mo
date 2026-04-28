import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Common "../types/common";
import ChatTypes "../types/chat";

module {
  /// Store a chat message and return it along with the incremented nextId
  public func addMessage(
    messages : List.List<ChatTypes.ChatMessage>,
    nextId : Nat,
    userId : Common.UserId,
    role : ChatTypes.MessageRole,
    content : Text,
  ) : (ChatTypes.ChatMessage, Nat) {
    let msg : ChatTypes.ChatMessage = {
      id = nextId;
      userId = userId;
      role = role;
      content = content;
      timestamp = Time.now();
    };
    messages.add(msg);
    (msg, nextId + 1);
  };

  /// Get all chat messages for a specific user, sorted by timestamp ascending.
  /// Returns only the last 50 messages for storage efficiency.
  public func getUserHistory(
    messages : List.List<ChatTypes.ChatMessage>,
    caller : Common.UserId,
  ) : [ChatTypes.ChatMessage] {
    let userMsgs = messages.filter(func(m : ChatTypes.ChatMessage) : Bool {
      m.userId == caller
    });
    let sorted = userMsgs.sort(func(a : ChatTypes.ChatMessage, b : ChatTypes.ChatMessage) : { #less; #equal; #greater } {
      Int.compare(a.timestamp, b.timestamp)
    });
    let allArr = sorted.toArray();
    let len = allArr.size();
    if (len <= 50) {
      allArr;
    } else {
      // Return last 50 messages
      allArr.sliceToArray((len - 50 : Nat).toInt(), len.toInt());
    };
  };
};
