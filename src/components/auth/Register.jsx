// src/components/auth/Register.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { UserPlus, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    tenDangNhap: "",
    matKhau: "",
    confirmPassword: "",
    email: "",
    vaiTro: "NHANVIEN", // Giá trị mặc định
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Kiểm tra mật khẩu
    if (formData.matKhau !== formData.confirmPassword) {
      setError("Mật khẩu và mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    try {
      // 2. Gọi API đăng ký từ AuthContext
      await register({
        tenDangNhap: formData.tenDangNhap,
        matKhau: formData.matKhau,
        email: formData.email,
        vaiTro: formData.vaiTro,
      });

      // 3. Đăng ký thành công, điều hướng đến trang chính
      navigate("/service-types"); // Giống như Login
    } catch (err) {
      // 4. Xử lý lỗi (từ api.js hoặc AuthContext)
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-orange-100">
          {/* --- LOGO + TITLE --- */}
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-orange-100 rounded-full">
              <UserPlus className="w-7 h-7 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 ml-3 tracking-tight">
              Tạo tài khoản
            </h1>
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">
            Đăng ký tài khoản quản lý gara
          </h2>

          {/* --- FORM --- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="tenDangNhap"
                placeholder="Nhập tên đăng nhập..."
                value={formData.tenDangNhap}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Nhập email..."
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Vai trò
              </label>
              <select
                name="vaiTro"
                value={formData.vaiTro}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition bg-white"
              >
                <option value="NHANVIEN">Nhân viên</option>
                <option value="ADMIN">Quản lý (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="matKhau"
                placeholder="Nhập mật khẩu..."
                value={formData.matKhau}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu..."
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* --- THÔNG BÁO LỖI --- */}
            {error && (
              <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* --- NÚT ĐĂNG KÝ --- */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          {/* --- LINK QUAY LẠI ĐĂNG NHẬP --- */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Đã có tài khoản? </span>
            <Link
              to="/login"
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

Register.jsx;
