import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../types/messaging';
import { useMessaging } from '../contexts/MessagingContext';
import { Send, CheckCircle, XCircle, Clock, Download, Upload } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  senderName: string;
  senderAvatar?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  senderName,
  senderAvatar,
}) => {
  const { acceptMoneyRequest, declineMoneyRequest, currentUser } = useMessaging();

  const getPaymentStatusIcon = () => {
    switch (message.paymentStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getPaymentStatusText = () => {
    switch (message.paymentStatus) {
      case 'success':
        return 'Payment successful';
      case 'failed':
        return 'Payment failed';
      case 'pending':
        return 'Payment pending';
      default:
        return '';
    }
  };

  const handleAcceptRequest = async () => {
    if (message.id) {
      await acceptMoneyRequest(message.id, message.conversationId);
    }
  };

  const handleDeclineRequest = async () => {
    if (message.id) {
      await declineMoneyRequest(message.id, message.conversationId);
    }
  };

  const renderPaymentRequest = () => {
    const canRespond = !isOwnMessage && message.requestStatus === 'pending';
    const isAccepted = message.requestStatus === 'accepted';
    const isDeclined = message.requestStatus === 'declined';

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Download className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">
            {message.content}
          </span>
          {isAccepted && <CheckCircle className="h-4 w-4 text-green-500" />}
          {isDeclined && <XCircle className="h-4 w-4 text-red-500" />}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {message.paymentAmount} {message.paymentToken}
          </Badge>
          <span className="text-xs text-blue-600">
            {isAccepted ? 'Request accepted' : isDeclined ? 'Request declined' : 'Money request'}
          </span>
        </div>
        
        {canRespond && (
          <div className="flex space-x-2 mt-2">
            <Button 
              size="sm" 
              onClick={handleAcceptRequest}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleDeclineRequest}
              className="text-red-500 border-red-500 hover:bg-red-50"
            >
              Decline
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderPaymentMessage = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Upload className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-800">
            {message.content}
          </span>
          {getPaymentStatusIcon()}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {message.paymentAmount} {message.paymentToken}
          </Badge>
          <span className="text-xs text-green-600">
            {getPaymentStatusText()}
          </span>
        </div>
        
        {message.paymentReference && (
          <p className="text-xs text-green-600">
            Ref: {message.paymentReference}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={senderAvatar} />
            <AvatarFallback>
              {senderName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`rounded-lg px-4 py-2 ${
          message.messageType === 'payment'
            ? 'bg-green-50 border border-green-200'
            : message.messageType === 'payment_request'
            ? 'bg-blue-50 border border-blue-200'
            : isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}>
          {message.messageType === 'payment_request' ? (
            renderPaymentRequest()
          ) : message.messageType === 'payment' ? (
            renderPaymentMessage()
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
          
          <div className={`flex items-center space-x-1 mt-1 ${
            isOwnMessage ? 'justify-end' : 'justify-start'
          }`}>
            <span className="text-xs opacity-70">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
