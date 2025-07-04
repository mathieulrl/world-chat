
import { useState } from "react";
import { Send } from "lucide-react";
import MoneyActions from "./MoneyActions";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendMoney: (amount: number) => void;
  onRequestMoney: (amount: number) => void;
}

const MessageInput = ({ onSendMessage, onSendMoney, onRequestMoney }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 md:space-x-3">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
          rows={1}
          style={{
            minHeight: "40px",
            maxHeight: "120px",
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors duration-200 flex items-center justify-center min-w-[40px]"
      >
        <Send className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      <MoneyActions onSendMoney={onSendMoney} onRequestMoney={onRequestMoney} />
    </form>
  );
};

export default MessageInput;
