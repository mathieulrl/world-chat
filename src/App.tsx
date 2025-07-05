import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import { MessagingProvider } from "./contexts/MessagingContext";
import { DebugPanel } from "./components/DebugPanel";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { setupGlobalTestFunctions } from "./utils/global-test-functions";

const queryClient = new QueryClient();

const App = () => {
  // Setup global test functions for browser console debugging
  useEffect(() => {
    setupGlobalTestFunctions();
  }, []);

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
            <DebugPanel />
          </MessagingProvider>
        </MiniKitProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
