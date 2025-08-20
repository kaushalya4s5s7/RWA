import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { ping } from "./api/authApi";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { SuiWalletProvider } from "./context/SuiWalletContext";

// Lazy load heavy components
const Marketplace = lazy(() => import("./pages/marketplace/marketplace"));
const Admin = lazy(() => import("./pages/admin/admin"));
const Issuer = lazy(() => import("./pages/Issuer/issuer"));
const About = lazy(() => import("./pages/about/about"));
const Dashboard = lazy(() => import("./pages/dashboard/dashboard"));
const Login = lazy(() => import("./pages/login/login"));
const ManagerDashboard = lazy(() => import("./pages/managerdashboard/managerDashboard"));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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
              <Route path="/login" element={
                <Suspense fallback={<Loading />}>
                  <Login />
                </Suspense>
              } />
              <Route path="/about" element={
                <Suspense fallback={<Loading />}>
                  <About />
                </Suspense>
              } />
              
              {/* Protected Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Suspense fallback={<Loading />}>
                      <Admin />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/issuer" 
                element={
                  <ProtectedRoute allowedRoles={['issuer']}>
                    <Suspense fallback={<Loading />}>
                      <Issuer />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'issuer', 'manager', 'user']}>
                    <Suspense fallback={<Loading />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketplace" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'issuer', 'manager', 'user']}>
                    <Suspense fallback={<Loading />}>
                      <Marketplace />
                    </Suspense>
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