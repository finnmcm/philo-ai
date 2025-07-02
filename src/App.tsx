import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DilemmaSubmissionPage from "./pages/DilemmaSubmission";
import PhilosopherMatchPage from "./pages/PhilosopherMatch";
import ChatPage from "./pages/Chat";
import ExplorePhilosophersPage from "./pages/ExplorePhilosophersPage";
import NotFound from "./pages/NotFound";
import SignUpPage from "./pages/SignUpPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/match" element={<PhilosopherMatchPage />} />
          <Route path="/explore" element={<ExplorePhilosophersPage />} />
          <Route path="/chat/:philosopher?" element={<ChatPage />} />
          <Route path="/auth/signup" element={<SignUpPage/>}/>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
