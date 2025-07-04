import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from './MessageBubble';
import { useMessaging } from '../contexts/MessagingContext';
import { Send, DollarSign, Download, MessageCircle, Menu } from 'lucide-react';

interface ChatInterfaceProps {
  onToggleMobileSidebar?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onToggleMobileSidebar }) => {
  const { 
    currentConversation, 
    messages, 
    sendMessage, 
    sendPayment, 
    requestMoney,
    currentUser,
    isLoading 
  } = useMessaging();
  
  const [newMessage, setNewMessage] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentToken, setPaymentToken] = useState<'WLD' | 'USDC'>('WLD');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestToken, setRequestToken] = useState<'WLD' | 'USDC'>('WLD');
  const [requestDescription, setRequestDescription] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    
    await sendMessage(newMessage, currentConversation.id);
    setNewMessage('');
  };

  const handleSendPayment = async () => {
    if (!paymentAmount || !currentConversation || !currentUser) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const otherParticipant = currentConversation.participants.find(p => p.id !== currentUser.id);
    if (!otherParticipant) return;

    await sendPayment(amount, paymentToken, otherParticipant.address, currentConversation.id);
    setPaymentAmount('');
    setIsPaymentDialogOpen(false);
  };

  const handleRequestMoney = async () => {
    if (!requestAmount || !currentConversation || !currentUser) return;
    
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) return;

    await requestMoney(amount, requestToken, requestDescription, currentConversation.id);
    setRequestAmount('');
    setRequestDescription('');
    setIsRequestDialogOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header for no conversation state */}
        <div className="p-3 md:p-4 border-b border-border bg-background md:hidden">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobileSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="ml-3 font-semibold">Chats</h2>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">Choose a conversation to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipant = currentConversation.participants.find(p => p.id !== currentUser?.id);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-border bg-background">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipant?.profilePicture} />
            <AvatarFallback>
              {otherParticipant?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold">{otherParticipant?.username || 'Unknown User'}</h2>
            <p className="text-sm text-muted-foreground">
              {otherParticipant?.address 
                ? `${otherParticipant.address.slice(0, 6)}...${otherParticipant.address.slice(-4)}`
                : 'No address'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 md:p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === currentUser?.id;
            const sender = isOwnMessage 
              ? currentUser 
              : currentConversation.participants.find(p => p.id === message.senderId);
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
                senderName={sender?.username || 'Unknown User'}
                senderAvatar={sender?.profilePicture}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-border bg-background">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading || !currentUser}
            className="flex-1"
          />
          
          {/* Request Money Dialog */}
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" disabled={isLoading || !currentUser}>
                <Download className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Money</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="request-amount">Amount</Label>
                  <Input
                    id="request-amount"
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="request-token">Token</Label>
                  <Select value={requestToken} onValueChange={(value: 'WLD' | 'USDC') => setRequestToken(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WLD">WLD</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="request-description">Description (optional)</Label>
                  <Textarea
                    id="request-description"
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    placeholder="What's this for?"
                    rows={3}
                  />
                </div>
                <Button onClick={handleRequestMoney} className="w-full" disabled={!requestAmount}>
                  Request Money
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Send Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" disabled={isLoading || !currentUser}>
                <DollarSign className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="token">Token</Label>
                  <Select value={paymentToken} onValueChange={(value: 'WLD' | 'USDC') => setPaymentToken(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WLD">WLD</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendPayment} className="w-full" disabled={!paymentAmount}>
                  Send Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading || !currentUser}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 