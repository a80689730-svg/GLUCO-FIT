import Common "common";

module {
  public type MessageRole = { #User; #Assistant };

  public type ChatMessage = {
    id : Nat;
    userId : Common.UserId;
    role : MessageRole;
    content : Text;
    timestamp : Common.Timestamp;
  };
};
