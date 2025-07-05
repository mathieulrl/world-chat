import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import { MessagingProvider } from "./contexts/MessagingContext";
import DebugPanel from "./components/DebugPanel";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MiniKitProvider>
          <MessagingProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            
            {/* Debug Panel Toggle Button */}
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="fixed top-4 right-4 z-50 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow-lg"
            >
              {showDebugPanel ? '🔍 Hide Debug' : '🐛 Show Debug'}
            </button>
            
            {/* Debug Panel */}
            <DebugPanel 
              isVisible={showDebugPanel} 
              onToggle={() => setShowDebugPanel(false)} 
            />
          </MessagingProvider>
        </MiniKitProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
