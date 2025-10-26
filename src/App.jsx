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
// import { CartProvider } from "./context/CartContext"; // Vẫn vô hiệu hóa

// Auth components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Layout
import Layout from "./components/layout/Layout";

// Pages
// import Dashboard from "./pages/Dashboard"; // Vô hiệu hóa
import ServiceTypeManagement from "./pages/ServiceTypeManagement"; // (Giữ lại file này)

// (SỬA LỖI): Vô hiệu hóa TẤT CẢ các import trang bị lỗi
// import InvoiceManagement from "./pages/InvoiceManagement";
// import CustomerManagement from "./pages/CustomerManagement";
// import MachineManagement from "./pages/MachineManagement";
// import ServiceManagement from "./pages/ServiceManagement";
// import ServiceDetail from "./pages/ServiceDetail";
// import SalesManagement from "./pages/SalesManagement";
// import VehicleManagement from "./pages/VehicleMangement";
// import RepairManagement from "./pages/RepairManagement";
// import ServiceSalesDetail from "./pages/ServiceSalesDetail";

// ===================== ProtectedRoute Component =====================
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
          {/* <CartProvider> */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- Protected routes --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                {/* Trang chủ mặc định */}
                <Route
                  index
                  element={<Navigate to="/service-types" replace />}
                />

                {/* (Giữ lại trang duy nhất này) */}
                <Route
                  path="service-types"
                  element={<ServiceTypeManagement />}
                />

                {/* (SỬA LỖI): Vô hiệu hóa TẤT CẢ các route bị lỗi */}
                {/* <Route path="dashboard" element={<Dashboard />} /> */}
                {/* <Route path="invoice" element={<InvoiceManagement />} /> */}
                {/* <Route path="customers" element={<CustomerManagement />} /> */}
                {/* <Route path="machine" element={<MachineManagement />} /> */}
                {/* <Route path="repairs" element={<RepairManagement />} /> */}
                {/* <Route path="services" element={<ServiceManagement />} /> */}
                {/* <Route path="services/:id" element={<ServiceDetail />} /> */}
                {/* <Route path="vehicles" element={<VehicleManagement />} /> */}
                {/* <Route path="sales" element={<SalesManagement />} /> */}
                {/* <Route
                    path="sales/services/:id"
                    element={<ServiceSalesDetail />}
                  /> */}
              </Route>
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          {/* </CartProvider> */}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
