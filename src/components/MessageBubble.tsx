
import { Message } from "../utils/localStorage";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex justify-end">
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm">
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
