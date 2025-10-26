// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiCall } from "../services/api"; // Đảm bảo đường dẫn này đúng

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // 'loading' này CHỈ DÙNG cho lần tải trang đầu tiên
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); // Hoàn tất kiểm tra ban đầu
  }, []);

  // ✅ HÀM LOGIN (Đã BỎ setLoading)
  const login = async (username, password) => {
    try {
      const apiResponse = await apiCall("/api/auth/dangNhap", {
        method: "POST",
        data: { tenDangNhap: username, matKhau: password },
      });

      if (apiResponse && apiResponse.data && apiResponse.data.token) {
        const authData = apiResponse.data;
        const userData = { ...authData };
        delete userData.token;

        setUser(userData); // ✅ Chỉ cần gọi setUser là đủ
        localStorage.setItem("authToken", authData.token);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error(
          apiResponse.message || "Phản hồi đăng nhập không hợp lệ."
        );
      }
    } catch (error) {
      throw error;
    }
  };

  // ✅ HÀM REGISTER (Đã BỎ setLoading)
  const register = async (registerData) => {
    try {
      const apiResponse = await apiCall("/api/auth/dangKy", {
        method: "POST",
        data: registerData,
      });

      if (apiResponse && apiResponse.data && apiResponse.data.token) {
        const authData = apiResponse.data;
        const userData = { ...authData };
        delete userData.token;

        setUser(userData); // ✅ Chỉ cần gọi setUser là đủ
        localStorage.setItem("authToken", authData.token);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error(
          apiResponse.message || "Phản hồi đăng ký không hợp lệ."
        );
      }
    } catch (error) {
      throw error;
    }
  };

  // ... (logout and isAdmin giữ nguyên) ...
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  const isAdmin = () => user?.vaiTro === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading, // ProtectedRoute sẽ dùng state này
        login,
        logout,
        register,
        isAdmin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
