import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export async function createChatSession(userId: string, title: string): Promise<ChatSession> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert([{ user_id: userId, title }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase.from("chat_sessions").select("*").eq("user_id", userId).order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase.from("chat_messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(sessionId: string, content: string, role: "user" | "assistant"): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert([{ session_id: sessionId, content, role }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);

  if (error) throw error;
}
