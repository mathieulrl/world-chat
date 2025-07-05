import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Wallet, Loader2 } from 'lucide-react';
import { useComethConnect } from '@/hooks/useComethConnect';

interface ComethWalletConnectProps {
  onWalletConnected: () => void;
}

export const ComethWalletConnect: React.FC<ComethWalletConnectProps> = ({ onWalletConnected }) => {
  const {
    address,
    isConnected,
    isPending,
    error,
    connectWallet,
    disconnectWallet,
  } = useComethConnect();

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');

  const handleConnect = async () => {
    try {
      setConnectionStatus('connecting');
      console.log('🔗 Connecting to Cometh wallet...');
      
      await connectWallet();
      
      setConnectionStatus('success');
      console.log('✅ Cometh wallet connected successfully');
      
      // Notify parent component that wallet is connected
      setTimeout(() => {
        onWalletConnected();
      }, 1000);
      
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Failed to connect Cometh wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setConnectionStatus('idle');
      console.log('✅ Cometh wallet disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect Cometh wallet:', error);
    }
  };

  // If already connected, show success state
  if (isConnected && address) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Cometh Wallet Connected</CardTitle>
            <CardDescription>
              Your wallet is ready for on-chain transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Wallet Address: {address}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button 
                onClick={onWalletConnected}
                className="w-full"
                size="lg"
              >
                Continue to Messaging App
              </Button>
              
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Wallet className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect Cometh Wallet</CardTitle>
          <CardDescription>
            Connect your Cometh wallet to enable on-chain messaging and payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionStatus === 'idle' && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>This app uses Cometh Connect for secure, gasless transactions.</p>
                <p className="mt-2">Your messages will be stored on-chain using your Safe wallet.</p>
              </div>
              
              <Button 
                onClick={handleConnect} 
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Cometh Wallet
                  </>
                )}
              </Button>
            </div>
          )}

          {connectionStatus === 'connecting' && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Connecting to your Cometh wallet...</p>
            </div>
          )}

          {connectionStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Wallet connected successfully! Loading messaging app...
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <>
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {typeof error === 'string' ? error : error?.message || 'Failed to connect wallet. Please try again.'}
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleConnect} 
                disabled={isPending}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </>
          )}

          {error && connectionStatus === 'idle' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {typeof error === 'string' ? error : error?.message || 'Connection error'}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center text-xs text-muted-foreground">
            <p>Make sure you have the Cometh Connect wallet installed.</p>
            <p className="mt-1">This enables secure, gasless transactions for messaging.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 