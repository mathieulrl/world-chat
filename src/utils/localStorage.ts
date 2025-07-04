
import { Message } from "../components/MessagingApp";

const MESSAGES_KEY = "simple-chat-messages";

export const loadMessages = (): Message[] => {
  try {
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading messages from localStorage:", error);
  }
  return [];
};

export const saveMessages = (messages: Message[]): void => {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving messages to localStorage:", error);
  }
};
