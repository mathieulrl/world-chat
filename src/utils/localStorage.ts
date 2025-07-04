
export interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender: "user";
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  lastMessageTime: number;
}

const CONVERSATIONS_KEY = "simple-chat-conversations";

export const loadConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading conversations from localStorage:", error);
  }
  return [];
};

export const saveConversations = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversations to localStorage:", error);
  }
};

export const createNewConversation = (): Conversation => {
  const now = Date.now();
  return {
    id: now.toString(),
    name: `Chat ${new Date(now).toLocaleDateString()}`,
    messages: [],
    lastMessageTime: now,
  };
};
