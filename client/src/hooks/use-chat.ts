import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";

// Use the integration paths directly since they are injected
const API_PREFIX = "/api/conversations";

export interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  messages?: Message[];
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: [API_PREFIX],
    queryFn: async () => {
      const res = await fetch(API_PREFIX);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    }
  });
}

export function useConversation(id: number | null) {
  return useQuery<Conversation>({
    queryKey: [API_PREFIX, id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`${API_PREFIX}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    }
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(API_PREFIX, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_PREFIX] });
    }
  });
}

export function useChatStream(conversationId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const queryClient = useQueryClient();

  // Load initial messages from query cache if available
  const { data: conversation } = useConversation(conversationId);
  
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  const sendMessage = async (content: string) => {
    // Optimistic update
    const tempUserMessage: Message = { role: "user", content };
    setMessages(prev => [...prev, tempUserMessage]);
    setIsStreaming(true);

    try {
      const res = await fetch(`${API_PREFIX}/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Handle SSE
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.content) {
                assistantMessage += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  
                  if (lastMsg.role === "assistant") {
                    lastMsg.content = assistantMessage;
                  } else {
                    newMessages.push({ role: "assistant", content: assistantMessage });
                  }
                  return newMessages;
                });
              }
              
              if (data.done) {
                setIsStreaming(false);
                queryClient.invalidateQueries({ queryKey: [API_PREFIX, conversationId] });
              }
            } catch (e) {
              console.error("Error parsing SSE", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Stream error", err);
      setIsStreaming(false);
    }
  };

  return { messages, isStreaming, sendMessage };
}
