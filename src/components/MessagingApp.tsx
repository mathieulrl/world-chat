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
import { MessageCircle, Menu, X } from "lucide-react";

const MessagingApp = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-80 md:w-80 bg-white
      `}>
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={createConversation}
          onDeleteConversation={deleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="bg-white shadow-sm border-b p-3 md:p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-md"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="bg-blue-500 p-2 rounded-full">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">{activeConversation.name}</h1>
                  <p className="text-xs md:text-sm text-gray-500">
                    {activeConversation.messages.length} message{activeConversation.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {activeConversation.messages.length > 0 && (
                <button
                  onClick={clearCurrentConversation}
                  className="text-xs md:text-sm text-red-500 hover:text-red-700 px-2 md:px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {activeConversation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="h-12 w-12 md:h-16 md:w-16 mb-4 text-gray-300" />
                  <p className="text-base md:text-lg font-medium">No messages yet</p>
                  <p className="text-xs md:text-sm">Start a conversation by typing below</p>
                </div>
              ) : (
                activeConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-3 md:p-4">
              <MessageInput onSendMessage={addMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mb-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <MessageCircle className="h-16 w-16 md:h-20 md:w-20 mb-4 text-gray-300" />
            <p className="text-lg md:text-xl font-medium text-center">Welcome to Simple Chat</p>
            <p className="text-sm md:text-base text-center">Create a new conversation to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingApp;
