import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChatMessage,
  ChatSession,
  createChatSession,
  deleteChatSession,
  getChatMessages,
  getChatSessions,
  sendMessage,
} from "@/services/chatService";
import { AIMessage, getAIResponse } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Highlight } from "prism-react-renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ComponentPropsWithoutRef } from "react";

export default function ChatInterface() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    try {
      const data = await getChatSessions(user!.id);
      setSessions(data);
    } catch (error) {
      toast.error("Failed to load chat sessions");
    }
  }, [user]);

  const loadMessages = useCallback(async () => {
    if (!currentSession) return;
    try {
      const data = await getChatMessages(currentSession.id);
      setMessages(data);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  }, [currentSession]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, loadSessions]);

  useEffect(() => {
    if (currentSession) {
      loadMessages();
    }
  }, [currentSession, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const createNewSession = async () => {
    if (!user) return;
    try {
      const session = await createChatSession(user.id, "New Chat");
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setMessages([]);
    } catch (error) {
      toast.error("Failed to create new chat session");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentSession || isLoading || !user) return;

    setIsLoading(true);
    try {
      // Envoyer le message de l'utilisateur
      const userMessage = await sendMessage(currentSession.id, input, "user");
      setMessages([...messages, userMessage]);
      setInput("");

      // Préparer l'historique des conversations pour l'IA
      const conversationHistory: AIMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Indiquer que l'IA est en train de réfléchir
      setIsTyping(true);

      // Obtenir la réponse de l'IA
      const aiResponse = await getAIResponse(user.id, input, conversationHistory);

      // Envoyer la réponse de l'IA
      const assistantMessage = await sendMessage(currentSession.id, aiResponse.content, "assistant");
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      toast.success("Chat session deleted");
    } catch (error) {
      toast.error("Failed to delete chat session");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "HH:mm, d MMMM yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  // Composant pour le rendu Markdown avec support de la coloration syntaxique
  const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          code(props: ComponentPropsWithoutRef<"code">) {
            const { children, className } = props;
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            if (!className) {
              return <code {...props} />;
            }

            return (
              <Highlight code={String(children).replace(/\n$/, "")} language={language || "typescript"} theme={undefined}>
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre className={cn(className, "rounded-md p-4")} style={style}>
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        <span className="select-none opacity-50 mr-4">{i + 1}</span>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r p-4">
        <Button onClick={createNewSession} className="w-full mb-4" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className={cn("p-3 mb-2 cursor-pointer hover:bg-accent transition-colors", currentSession?.id === session.id ? "bg-accent" : "")}
              onClick={() => setCurrentSession(session)}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{session.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex items-start gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-[80%]",
                        message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                      )}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownRenderer content={message.content} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-right">{formatDate(message.created_at)}</div>
                    </div>
                  </div>
                ))}

                {/* Indicateur de frappe */}
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>L'assistant est en train de réfléchir...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Sélectionnez une conversation ou créez-en une nouvelle</div>
        )}
      </div>
    </div>
  );
}
