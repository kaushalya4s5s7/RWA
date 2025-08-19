import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ping } from "./api/authApi";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Marketplace from "./pages/marketplace/marketplace";
import Admin from "./pages/admin/admin";
import Issuer from "./pages/Issuer/issuer";
import About from "./pages/about/about";
import Dashboard from "./pages/dashboard/dashboard";
import Login from "./pages/login/login";
import ManagerDashboard from "./pages/managerdashboard/managerDashboard";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { SuiWalletProvider } from "./context/SuiWalletContext";

const App = () => {
  useEffect(() => {
    // Initial ping
    ping().catch(console.error);
    
    // Setup interval to ping every 5 minutes
    const pingInterval = setInterval(() => {
      ping().catch(console.error);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(pingInterval);
  }, []);

  return (
  <TooltipProvider>
    <BrowserRouter>
      <AuthProvider>
        <SuiWalletProvider>
          <div className="relative min-h-screen">
            <div className="content">
              <Toaster />
            <Sonner />
            <HotToaster />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              
              {/* Protected Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/issuer" 
                element={
                  <ProtectedRoute allowedRoles={['issuer']}>
                    <Issuer />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'issuer', 'manager', 'user']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketplace" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'issuer', 'manager', 'user']}>
                    <Marketplace />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        </SuiWalletProvider>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
  );
};

export default App;