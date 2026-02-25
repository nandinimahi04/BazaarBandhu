import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BazaarBandhu from "./pages/BazaarBandhu";
import VendorProfile from "./pages/VendorProfile";
import Register from "./pages/Register";
import Suppliers from "./pages/Suppliers";
import Chat from "./pages/Chat";
import DeepSeekChat from "./pages/DeepSeekChat";
import Orders from "./pages/Orders";
import Credit from "./pages/Credit";
import NotFound from "./pages/NotFound";
import AIAssistant from "./pages/AIAssistant";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BazaarBandhu />} />
          <Route path="/profile" element={<VendorProfile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/chat" element={<Chat />} />
<Route path="/deepseek-chat" element={<DeepSeekChat />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/credit" element={<Credit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
