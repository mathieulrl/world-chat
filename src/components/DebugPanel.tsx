import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getComethConfig } from '@/config/cometh';
import { getComethService } from '@/services/comethService';

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
      const config = getComethConfig();
      const service = getComethService(config);
      
      setComethStatus({
        config: {
          apiKey: config.apiKey ? '✅ Set' : '❌ Missing',
          safeAddress: config.safeAddress,
          bundlerUrl: config.bundlerUrl,
          paymasterUrl: config.paymasterUrl,
        },
        service: service,
        initialized: service.isServiceInitialized(),
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
      const config = getComethConfig();
      const service = getComethService(config);
      
      console.log('🧪 Testing Cometh transaction...');
      
      const result = await service.storeMessageMetadata(
        'test-blob-id',
        'test-conversation',
        'text',
        '0x1234567890123456789012345678901234567890'
      );
      
      console.log('📊 Test transaction result:', result);
      
      if (result.success) {
        console.log('✅ Test transaction successful!');
      } else {
        console.log('❌ Test transaction failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Test transaction error:', error);
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
                    🧪 Test TX
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
                      <div className="font-semibold mb-1">Cometh Status:</div>
                      {comethStatus.error ? (
                        <div className="text-red-600">{comethStatus.error}</div>
                      ) : (
                        <div>
                          <div>API Key: {comethStatus.config.apiKey}</div>
                          <div>Safe: {comethStatus.config.safeAddress}</div>
                          <div>Initialized: {comethStatus.initialized ? '✅' : '❌'}</div>
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