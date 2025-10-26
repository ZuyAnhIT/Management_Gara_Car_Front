// src/components/auth/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Wrench, AlertCircle } from "lucide-react";
// 1. Thêm 'Link' vào import
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 2. AuthContext đã được cập nhật để gọi API thật
      await login(formData.username, formData.password);
      navigate("/service-types");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-orange-100">
          {/* ... (Phần Logo và Tiêu đề giữ nguyên) ... */}
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-orange-100 rounded-full">
              <Wrench className="w-7 h-7 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 ml-3 tracking-tight">
              Garage Management
            </h1>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">
            Đăng nhập hệ thống quản lý gara
          </h2>

          {/* --- FORM (Giữ nguyên) --- */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ... (Các input Tên đăng nhập và Mật khẩu giữ nguyên) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập..."
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu..."
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* --- THÔNG BÁO LỖI (Giữ nguyên) --- */}
            {error && (
              <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* --- NÚT ĐĂNG NHẬP (Giữ nguyên) --- */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          {/* === 3. THÊM PHẦN NÀY VÀO === */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
            <Link
              to="/register"
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Đăng ký ngay
            </Link>
          </div>
          {/* === KẾT THÚC PHẦN THÊM === */}

          {/* --- FOOTER (Giữ nguyên) --- */}
          <p className="text-xs text-gray-500 mt-6 text-center">
            © 2025 Garage Management System — Powered by React & Spring Boot
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
