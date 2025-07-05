import React, { useState, useEffect } from 'react';
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';
import { MessagingAppWithTransactions } from "../components/MessagingAppWithTransactions";

const Index = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user is already verified on component mount
  useEffect(() => {
    const verified = localStorage.getItem('worldapp_verified');
    if (verified === 'true') {
      setIsVerified(true);
    }
  }, []);

  const verifyPayload: VerifyCommandInput = {
    action: 'chat', // This is your action ID from the Developer Portal
    verification_level: VerificationLevel.Orb, // Orb | Device
  };

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setVerificationStatus('error');
      setErrorMessage('World App is not installed. Please install the World App to continue.');
      return;
    }

    setIsLoading(true);
    setVerificationStatus('idle');
    setErrorMessage('');

    try {
      // World App will open a drawer prompting the user to confirm the operation
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
      
      if (finalPayload.status === 'error') {
        setVerificationStatus('error');
        setErrorMessage(`Verification failed: ${JSON.stringify(finalPayload)}`);
        console.log('Error payload', finalPayload);
        return;
      }

      // For now, just accept the World App verification without backend verification
      // TODO: Implement backend verification when you have an API endpoint
      console.log('World App verification successful:', finalPayload);
      
      // Optional: Try backend verification if endpoint exists
      try {
        const verifyResponse = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payload: finalPayload as ISuccessResult,
            action: 'voting-action',
            signal: '0x12312',
          }),
        });

        if (verifyResponse.ok) {
          const verifyResponseJson = await verifyResponse.json();
          console.log('Backend verification successful:', verifyResponseJson);
        } else {
          console.log('Backend verification not available or failed - proceeding anyway');
        }
      } catch (backendError) {
        console.log('Backend verification not available - proceeding anyway:', backendError);
      }

      // Proceed with successful verification
      setVerificationStatus('success');
      localStorage.setItem('worldapp_verified', 'true');
      // Delay showing the main app to let user see success message
      setTimeout(() => {
        setIsVerified(true);
      }, 2000);
      console.log('Verification success!');
    } catch (error) {
      setVerificationStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Error: ${errorMessage}`);
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show main app if user is verified
  if (isVerified) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <MessagingAppWithTransactions />
      </div>
    );
  }

  // Show verification page if user is not verified
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">World App Verification</CardTitle>
          <CardDescription>
            Verify your identity using World App to access secure features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === 'idle' && (
            <Button 
              onClick={handleVerify} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify with World App'
              )}
            </Button>
          )}

          {verificationStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Verification successful! Loading your app...
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'error' && (
            <Button 
              onClick={handleVerify} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Make sure you have the World App installed on your device.</p>
          </div>
          
          {/* Temporary bypass for testing */}
          <div className="pt-4 border-t">
            <Button 
              onClick={() => {
                localStorage.setItem('worldapp_verified', 'true');
                setIsVerified(true);
              }}
              variant="ghost"
              className="w-full text-xs"
            >
              Skip verification (for testing)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
