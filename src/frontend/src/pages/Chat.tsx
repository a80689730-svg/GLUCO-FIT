import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Bot, LogIn, MessageCircle, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMyChatHistory, useSendChatMessage } from "../hooks/useBackend";
import type { ChatMessage } from "../types";

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "User";
  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-ocid={`chat.message.${isUser ? "user" : "assistant"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        }`}
      >
        {message.content}
        <div
          className={`text-xs mt-1 opacity-60 ${isUser ? "text-right" : "text-left"}`}
        >
          {new Date(Number(message.timestamp) / 1_000_000).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3" data-ocid="chat.loading_state">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "What foods should I avoid?",
  "How to manage blood sugar?",
  "Best exercises for diabetes?",
];

export default function Chat() {
  const { isAuthenticated, login } = useInternetIdentity();
  const { data: history, isLoading } = useMyChatHistory();
  const sendMessage = useSendChatMessage();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    if (!isAuthenticated) {
      login();
      return;
    }
    setInput("");
    try {
      await sendMessage.mutateAsync(text);
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4" data-ocid="chat.auth_required">
          <MessageCircle className="w-12 h-12 text-primary/40 mx-auto" />
          <h2 className="text-xl font-display font-bold">
            AI Health Assistant
          </h2>
          <p className="text-muted-foreground">
            Login to chat with your personal health assistant
          </p>
          <Button onClick={() => login()} data-ocid="chat.login_button">
            <LogIn className="w-4 h-4 mr-2" />
            Login to Chat
          </Button>
        </div>
      </div>
    );
  }

  const msgs = history ?? [];

  return (
    <div
      className="container mx-auto px-4 py-6 flex flex-col"
      style={{ height: "calc(100vh - 4rem - 2rem)" }}
      data-ocid="chat.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-foreground text-base">
            AI Health Assistant
          </h1>
          <p className="text-xs text-muted-foreground">
            Ask anything about diabetes management
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 pr-2 mb-4" data-ocid="chat.messages">
        <div className="space-y-4 pb-2">
          {isLoading ? (
            <div className="space-y-4">
              {["a", "b", "c"].map((k) => (
                <div key={k} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <Skeleton className="h-14 w-2/3 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : msgs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 gap-3"
              data-ocid="chat.empty_state"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-primary" />
              </div>
              <p className="font-display font-semibold text-foreground">
                How can I help you?
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Ask me about diabetes management, diet tips, medication, or
                exercise guidance.
              </p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground border border-border transition-smooth"
                    data-ocid="chat.suggestion_button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            msgs.map((msg) => (
              <MessageBubble key={String(msg.id)} message={msg} />
            ))
          )}
          {sendMessage.isPending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2 items-end border border-input rounded-xl p-2 bg-card focus-within:ring-1 focus-within:ring-ring">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about diabetes management…"
          className="border-0 shadow-none resize-none min-h-[40px] max-h-32 focus-visible:ring-0 text-sm bg-transparent p-1"
          rows={1}
          disabled={sendMessage.isPending}
          data-ocid="chat.input"
        />
        <Button
          size="icon"
          className="shrink-0 w-9 h-9 rounded-lg"
          onClick={() => void handleSend()}
          disabled={!input.trim() || sendMessage.isPending}
          data-ocid="chat.send_button"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
