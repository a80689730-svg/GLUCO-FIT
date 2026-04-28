import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import ChatTypes "../types/chat";
import ChatLib "../lib/chat";

mixin (
  chatMessages : List.List<ChatTypes.ChatMessage>,
) {
  var nextChatMessageId : Nat = 0;

  // IC management canister for HTTPS outcalls
  let ic = actor "aaaaa-aa" : actor {
    http_request : shared ({
      url : Text;
      max_response_bytes : ?Nat64;
      method : { #get; #head; #post };
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      transform : ?{ function : shared query ({ response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob };
      is_replicated : ?Bool;
    }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
  };

  /// Send a chat message; stores message, calls AI, stores response, returns AI text
  public shared ({ caller }) func sendChatMessage(userMessage : Text) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };

    // Store the user's message
    let (_, idAfterUser) = ChatLib.addMessage(chatMessages, nextChatMessageId, caller, #User, userMessage);
    nextChatMessageId := idAfterUser;

    // Build OpenAI-compatible request JSON
    let systemPrompt = "You are a helpful diabetes health assistant for Gluco Fit. Provide guidance on diet, exercise, blood sugar management, and medication questions. Always remind users to consult their doctor for medical decisions. Keep responses concise and friendly.";
    let requestBody = "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"system\",\"content\":\"" # escapeJson(systemPrompt) # "\"},{\"role\":\"user\",\"content\":\"" # escapeJson(userMessage) # "\"}],\"max_tokens\":500}";

    let bodyBytes = requestBody.encodeUtf8();

    let response = try {
      await ic.http_request({
        url = "https://api.openai.com/v1/chat/completions";
        max_response_bytes = ?8192;
        method = #post;
        headers = [
          { name = "Content-Type"; value = "application/json" },
          { name = "Authorization"; value = "Bearer OPENAI_API_KEY_PLACEHOLDER" },
        ];
        body = ?bodyBytes;
        transform = null;
        is_replicated = ?false;
      });
    } catch (_err) {
      let fallback = "I'm here to help with your diabetes questions! Currently experiencing connectivity issues. Please try again shortly, or consult your doctor for urgent medical advice.";
      let (_, idAfterFallback) = ChatLib.addMessage(chatMessages, nextChatMessageId, caller, #Assistant, fallback);
      nextChatMessageId := idAfterFallback;
      return fallback;
    };

    // Parse the AI response text from the JSON
    let aiText = parseOpenAiResponse(response.body);

    // Store the assistant's response
    let (_, idAfterAssistant) = ChatLib.addMessage(chatMessages, nextChatMessageId, caller, #Assistant, aiText);
    nextChatMessageId := idAfterAssistant;

    aiText;
  };

  /// Get caller's own chat history sorted by timestamp ascending (last 50 messages)
  public shared query ({ caller }) func getMyChatHistory() : async [ChatTypes.ChatMessage] {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    ChatLib.getUserHistory(chatMessages, caller);
  };

  /// Escape special JSON characters in a string
  private func escapeJson(s : Text) : Text {
    var t = s.replace(#char '\\', "\\\\");
    t := t.replace(#char '\u{22}', "\\\u{22}");
    t := t.replace(#char '\n', "\\n");
    t := t.replace(#char '\r', "\\r");
    t := t.replace(#char '\t', "\\t");
    t;
  };

  /// Extract the assistant content text from an OpenAI JSON response body
  private func parseOpenAiResponse(body : Blob) : Text {
    switch (body.decodeUtf8()) {
      case null {
        "I couldn't parse the response. Please try again or consult your doctor for urgent questions.";
      };
      case (?jsonText) {
        let marker = "\"content\":\"";
        switch (findAfter(jsonText, marker)) {
          case null {
            "I received a response but couldn't read it. Please try again.";
          };
          case (?afterMarker) {
            extractUntilQuote(afterMarker);
          };
        };
      };
    };
  };

  /// Return the substring of `s` after the first occurrence of `marker`, or null
  private func findAfter(s : Text, marker : Text) : ?Text {
    let parts = s.split(#text marker);
    // skip the first part (before the marker)
    ignore parts.next();
    // return the second part if it exists
    parts.next();
  };

  /// Extract text until the first unescaped double-quote
  private func extractUntilQuote(s : Text) : Text {
    var result = "";
    var escaped = false;
    for (ch in s.toIter()) {
      if (escaped) {
        if (ch == 'n') { result #= "\n" }
        else if (ch == 'r') { result #= "\r" }
        else if (ch == 't') { result #= "\t" }
        else { result #= Text.fromChar(ch) };
        escaped := false;
      } else if (ch == '\\') {
        escaped := true;
      } else if (ch == '\u{22}') {
        return result;
      } else {
        result #= Text.fromChar(ch);
      };
    };
    result;
  };
};
