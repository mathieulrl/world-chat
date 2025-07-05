import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComethConnect } from '@/hooks/useComethConnect';

export const ComethTest: React.FC = () => {
  const {
    address,
    isConnected,
    isPending,
    error,
    connectWallet,
    disconnectWallet,
    signMessageWithWallet,
  } = useComethConnect();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const handleSignMessage = async () => {
    try {
      const signature = await signMessageWithWallet('Hello from Chatterbox!');
      console.log('Message signed:', signature);
    } catch (error) {
      console.error('Message signing failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Cometh Connect Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </div>
          {address && (
            <div className="text-sm">
              <strong>Address:</strong> {address}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600">
              <strong>Error:</strong> {error.message}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={isPending}
              className="w-full"
            >
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={handleSignMessage}
                className="w-full"
              >
                Sign Test Message
              </Button>
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 