import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getComethConfig } from '@/config/cometh';
import { getComethConnectService } from '@/services/comethConnectService';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

export const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [comethStatus, setComethStatus] = useState<any>(null);

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addLog = (level: 'info' | 'warn' | 'error' | 'success', ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        data: args.length > 1 ? args : undefined
      }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('info', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  // Check Cometh status
  const checkComethStatus = async () => {
    try {
      // First, log environment variables
      console.log('🔍 Environment Variables Check:');
      console.log('VITE_COMETH_API_KEY:', import.meta.env.VITE_COMETH_API_KEY ? '✅ Set' : '❌ Missing');
      console.log('VITE_4337_BUNDLER_URL:', import.meta.env.VITE_4337_BUNDLER_URL || 'Using default');
      console.log('VITE_4337_PAYMASTER_URL:', import.meta.env.VITE_4337_PAYMASTER_URL || 'Using default');
      console.log('VITE_ENTRYPOINT_ADDRESS:', import.meta.env.VITE_ENTRYPOINT_ADDRESS || 'Using default');
      
      // Check for missing required variables
      const missingVars = [];
      if (!import.meta.env.VITE_COMETH_API_KEY) missingVars.push('VITE_COMETH_API_KEY');
      
      if (missingVars.length > 0) {
        console.log('❌ Missing required environment variables:', missingVars.join(', '));
        console.log('📋 Add these to your .env file:');
        console.log('VITE_COMETH_API_KEY=your_cometh_api_key');
        console.log('VITE_4337_BUNDLER_URL=https://bundler.cometh.io/480');
        console.log('VITE_4337_PAYMASTER_URL=https://paymaster.cometh.io/480');
        console.log('VITE_ENTRYPOINT_ADDRESS=0x0000000071727De22E5E9d8BAf0edAc6f37da032');
      }
      
      const config = getComethConfig();
      const service = getComethConnectService();
      
      setComethStatus({
        config: service.getConfig(),
        initialized: service.isConfigured(),
        missingVars: missingVars,
      });
    } catch (error) {
      setComethStatus({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Test Cometh transaction
  const testComethTransaction = async () => {
    try {
      const service = getComethConnectService();
      
      console.log('🧪 Testing Cometh Connect service...');
      console.log('✅ Service configured:', service.isConfigured());
      console.log('📊 Config:', service.getConfig());
      
      // Test that we can get the provider config
      const providerConfig = service.getConnectProviderConfig();
      console.log('🔧 Provider config:', providerConfig);
      
      console.log('✅ Cometh Connect service test successful!');
    } catch (error) {
      console.error('❌ Cometh Connect service test error:', error);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Get log level color
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500';
      case 'warn': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        {isVisible ? '🔽 Hide Logs' : '📊 Show Logs'}
      </Button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 w-96 h-96 z-40">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex justify-between items-center">
                <span>Debug Panel</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={checkComethStatus}>
                    🔍 Check Cometh
                  </Button>
                  <Button size="sm" onClick={testComethTransaction}>
                    🧪 Test Service
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearLogs}>
                    🗑️ Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-80">
                <div className="space-y-2">
                  {/* Cometh Status */}
                  {comethStatus && (
                    <div className="p-2 bg-gray-100 rounded text-xs">
                      <div className="font-semibold mb-1">Cometh Connect Status:</div>
                      {comethStatus.error ? (
                        <div className="text-red-600">{comethStatus.error}</div>
                      ) : (
                        <div>
                          <div>API Key: {comethStatus.config.apiKey}</div>
                          <div>Bundler: {comethStatus.config.bundlerUrl}</div>
                          <div>Paymaster: {comethStatus.config.paymasterUrl}</div>
                          <div>EntryPoint: {comethStatus.config.entryPointAddress}</div>
                          <div>Initialized: {comethStatus.initialized ? '✅' : '❌'}</div>
                          {comethStatus.missingVars && comethStatus.missingVars.length > 0 && (
                            <div className="mt-2 p-2 bg-red-100 rounded">
                              <div className="font-semibold text-red-800">Missing Variables:</div>
                              <div className="text-red-700">{comethStatus.missingVars.join(', ')}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Logs */}
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Badge className={`w-12 text-center ${getLogLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-gray-500">{log.timestamp}</span>
                      </div>
                      <div className="ml-14 mt-1 break-all">
                        {log.message}
                        {log.data && (
                          <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}; 