
import { useState, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ConversationSidebar from "./ConversationSidebar";
import { 
  loadConversations, 
  saveConversations, 
  createNewConversation,
  type Conversation,
  type Message 
} from "../utils/localStorage";
import { MessageCircle } from "lucide-react";

const MessagingApp = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    const savedConversations = loadConversations();
    setConversations(savedConversations);
    
    // Select the most recent conversation if available
    if (savedConversations.length > 0) {
      const mostRecent = savedConversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime)[0];
      setActiveConversationId(mostRecent.id);
    }
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const addMessage = (text: string) => {
    if (!activeConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      sender: "user",
    };

    const updatedConversations = conversations.map(conversation => {
      if (conversation.id === activeConversationId) {
        return {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          lastMessageTime: Date.now(),
        };
      }
      return conversation;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  const createConversation = () => {
    const newConversation = createNewConversation();
    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
    saveConversations(updatedConversations);
  };

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    if (activeConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        const mostRecent = updatedConversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime)[0];
        setActiveConversationId(mostRecent.id);
      } else {
        setActiveConversationId(null);
      }
    }
  };

  const clearCurrentConversation = () => {
    if (!activeConversationId) return;

    const updatedConversations = conversations.map(conversation => {
      if (conversation.id === activeConversationId) {
        return {
          ...conversation,
          messages: [],
        };
      }
      return conversation;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onCreateConversation={createConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{activeConversation.name}</h1>
                  <p className="text-sm text-gray-500">
                    {activeConversation.messages.length} message{activeConversation.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {activeConversation.messages.length > 0 && (
                <button
                  onClick={clearCurrentConversation}
                  className="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  Clear Messages
                </button>
              )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Start a conversation by typing below</p>
                </div>
              ) : (
                activeConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-4">
              <MessageInput onSendMessage={addMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageCircle className="h-20 w-20 mb-4 text-gray-300" />
            <p className="text-xl font-medium">Welcome to Simple Chat</p>
            <p className="text-sm">Create a new conversation to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingApp;
