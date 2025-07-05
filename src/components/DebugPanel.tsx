import React, { useState, useEffect } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

interface DebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addLog = (level: LogEntry['level'], ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        data: args.length > 1 ? args : undefined,
      };
      
      setLogs(prev => [...prev.slice(-50), newLog]); // Keep last 50 logs
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.info = (...args) => {
      originalInfo(...args);
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

    // Cleanup
    return () => {
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-64 bg-black bg-opacity-90 text-white rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-center p-2 border-b border-gray-600">
        <h3 className="text-sm font-bold">Debug Panel</h3>
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
          >
            Clear
          </button>
          <button
            onClick={onToggle}
            className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded"
          >
            Hide
          </button>
        </div>
      </div>
      
      <div className="h-56 overflow-y-auto p-2 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-gray-400">No logs yet...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-1">
              <span className="text-gray-400">[{log.timestamp}]</span>
              <span className={`ml-1 ${getLevelColor(log.level)}`}>
                {log.message}
              </span>
              {log.data && (
                <pre className="mt-1 text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugPanel; 