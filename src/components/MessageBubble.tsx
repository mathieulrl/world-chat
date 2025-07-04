
import { Message } from "../utils/localStorage";
import { DollarSign, Download, Upload } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onPayRequest?: (messageId: string, amount: number) => void;
}

const MessageBubble = ({ message, onPayRequest }: MessageBubbleProps) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  if (message.type === "money_request") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
          <div className="bg-blue-100 border border-blue-200 px-3 md:px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Download className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Money Request</span>
            </div>
            <p className="text-lg font-semibold text-blue-900 mb-2">
              {formatAmount(message.amount || 0, message.currency)}
            </p>
            {message.text && (
              <p className="text-sm text-blue-700 mb-3">{message.text}</p>
            )}
            {message.status === "pending" && onPayRequest && (
              <button
                onClick={() => onPayRequest(message.id, message.amount || 0)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
              >
                Pay Request
              </button>
            )}
            {message.status === "completed" && (
              <span className="text-xs text-green-600 font-medium">✓ Paid</span>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "money_sent") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
          <div className="bg-green-100 border border-green-200 px-3 md:px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Upload className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Money Sent</span>
            </div>
            <p className="text-lg font-semibold text-green-900 mb-2">
              {formatAmount(message.amount || 0, message.currency)}
            </p>
            {message.text && (
              <p className="text-sm text-green-700">{message.text}</p>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
        <div className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-2xl rounded-br-md shadow-sm">
          <p className="text-sm md:text-base leading-relaxed break-words">{message.text}</p>
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
