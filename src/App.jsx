import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";

// Auth components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register"; // ✅ 1. Import Register

// Layout
import Layout from "./components/layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
// ... (các trang khác)
import ServiceSalesDetail from "./pages/ServiceSalesDetail";

// ===================== ProtectedRoute Component =====================
// ... (Giữ nguyên component ProtectedRoute của bạn) ...
const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin()) return <Navigate to="/login" replace />;

  return <Outlet />;
};

// ===================== Main App =====================
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />{" "}
              {/* ✅ 2. Thêm Route cho Register */}
              {/* --- Protected routes --- */}
              <Route element={<ProtectedRoute />}>
                {/* ... (Các route được bảo vệ khác giữ nguyên) ... */}
                <Route path="/" element={<Layout />}>
                  {/* Trang mặc định */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  {/* ... (Tất cả các route con khác) ... */}
                  <Route
                    path="sales/services/:id"
                    element={<ServiceSalesDetail />}
                  />
                </Route>
              </Route>
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
