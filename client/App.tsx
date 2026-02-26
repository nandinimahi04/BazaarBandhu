import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Individual Pages
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
import Landing from "./pages/Landing";
import SupplierDashboard from "./pages/SupplierDashboard";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import SupplierOrders from "./pages/SupplierOrders";
import Dashboard from "./pages/Dashboard"; // Optional: could be used instead of BazaarBandhu

// Context
import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g. login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafafa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Dynamic Home Route */}
        <Route
          path="/"
          element={
            user ? (
              user.userType === "supplier" ? <Navigate to="/supplier-dashboard" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <Landing />
            )
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/landing" element={<Landing />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            user ? (
              user.userType === "supplier" ? <Navigate to="/supplier-dashboard" replace /> : <BazaarBandhu />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/supplier-dashboard"
          element={
            user?.userType === "supplier" ? <SupplierDashboard /> : <Navigate to="/login" replace />
          }
        />

        {/* Feature Routes (Shared or Vendor Specific) */}
        <Route path="/profile" element={user ? <VendorProfile /> : <Navigate to="/login" replace />} />
        <Route path="/suppliers" element={user ? <Suppliers /> : <Navigate to="/login" replace />} />
        <Route path="/assistant" element={user ? <AIAssistant /> : <Navigate to="/login" replace />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" replace />} />
        <Route path="/deepseek-chat" element={user ? <DeepSeekChat /> : <Navigate to="/login" replace />} />
        <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" replace />} />
        <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" replace />} />
        <Route path="/supplier-orders" element={user?.userType === "supplier" ? <SupplierOrders /> : <Navigate to="/login" replace />} />
        <Route path="/credit" element={user ? <Credit /> : <Navigate to="/login" replace />} />
        <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" replace />} />

        {/* Alternative Vendor Dashboard */}
        <Route path="/vendor-analytics" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CartProvider>
        <AppContent />
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
