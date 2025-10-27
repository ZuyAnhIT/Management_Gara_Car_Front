import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import OrderSidebar from "../components/layout/OrderSidebar";
import ProductCard from "../components/common/ProductCard";
import { Search, ClipboardList, ChevronsLeft } from "lucide-react";
import { serviceService } from "../services/serviceService";
import { serviceTypeService } from "../services/serviceTypeService";
import { formatCurrency } from "../utils/helpers";
import { useToast } from "../context/ToastContext";
import Loading from "../components/common/Loading";

const SalesManagement = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const { addToCart } = useCart();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State quản lý trạng thái đóng/mở của sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // State cho nút di chuyển
  const [buttonPosition, setButtonPosition] = useState({
    bottom: 24,
    right: 24,
  });
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const fetchOverview = () => {
  // sẽ gọi API tổng quan sau
};



  // Lấy danh sách Loại dịch vụ
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await serviceTypeService.getAll(0, 100);
        if (response?.content) {
          const categoryNames = response.content.map((c) => c.tenLoai);
          setCategories(["Tất cả", ...categoryNames]);
        }
      } catch (err) {
        showToast(err.message || "Lỗi tải loại dịch vụ", "error");
      }
    };
    fetchCategories();
  }, []);

// ⚙️ HÀM LẤY DỮ LIỆU DỊCH VỤ (đặt ngoài useEffect)
const fetchData = async () => {
  try {
    setLoading(true);

    const response = await serviceService.getAll(0, 1000);
    const list = response?.content || [];

    const mapped = list.map((item) => ({
      id: item.maDichVu,
      name: item.tenDichVu,
      category: item.tenLoaiDichVu,
      price: item.gia,
      soLuongTon: item.soLuongTon,
      soLuongBan: item.soLuongBan,
      moTa: item.moTa,
      image: item.anhDichVuUrl,
      status: item.trangThai,
      time: item.thoiGianUocTinh,
    }));

    setServices(mapped);
    setError("");
    fetchOverview(); // đồng bộ dashboard
  } catch (err) {
    showToast(err.message || "Lỗi khi tải dịch vụ", "error");
    setError("Không thể tải danh sách dịch vụ từ server.");
  } finally {
    setLoading(false);
  }
};

// 🪄 Gọi fetchData khi load trang lần đầu
useEffect(() => {
  fetchData();

  const reloadOverViewHandler = () => fetchOverview();
  window.addEventListener("reload-overview", reloadOverViewHandler);
  return () => window.removeEventListener("reload-overview", reloadOverViewHandler);
}, []);
// 🔥 chỉ chạy 1 lần khi load trang

  // Xử lý kéo thả nút
  const handleMouseDown = (e) => {
    if (!buttonRef.current) return;
    setIsDragging(true);

    const rect = buttonRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !buttonRef.current) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonWidth = buttonRef.current.offsetWidth;
    const buttonHeight = buttonRef.current.offsetHeight;

    // Tính toán vị trí mới (từ góc dưới phải)
    let newRight =
      viewportWidth - e.clientX - (buttonWidth - dragOffset.current.x);
    let newBottom =
      viewportHeight - e.clientY - (buttonHeight - dragOffset.current.y);

    // Giới hạn trong viewport
    newRight = Math.max(
      10,
      Math.min(newRight, viewportWidth - buttonWidth - 10)
    );
    newBottom = Math.max(
      10,
      Math.min(newBottom, viewportHeight - buttonHeight - 10)
    );

    setButtonPosition({ bottom: newBottom, right: newRight });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleViewDetails = (product) => {
    navigate(`/sales/services/${product.id}`, {
      state: { productData: product },
    });
  };

  // LOGIC LỌC DỮ LIỆU
  const filteredServices = services.filter((s) => {
    const isAvailable = s.status === "Còn hàng" || s.status === "Sắp hết";
    const matchCategory =
      selectedCategory === "Tất cả" || s.category === selectedCategory;
    const matchSearch = (s.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    return isAvailable && matchCategory && matchSearch;
  });

  if (loading) return <Loading />;
  return (
    <div className="flex h-screen overflow-hidden relative bg-gray-50 dark:bg-gray-800">
      {/* KHU VỰC SẢN PHẨM */}
      <div
        className={`flex-1 p-6 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "pr-[25rem]" : "pr-6"
        }`}
      >
        {/* Thanh tìm kiếm & lọc */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border dark:border-gray-700 mb-6 flex-shrink-0">
          <div className="relative mb-4">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên dịch vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Danh mục lọc */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Lưới sản phẩm */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-300 py-10">
              Đang tải dữ liệu...
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredServices.length > 0 ? (
                filteredServices.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={{ ...item, priceText: formatCurrency(item.price) }}
                    onAddToCart={addToCart}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center col-span-full py-10">
                  Không tìm thấy dịch vụ nào phù hợp.
                </p>
              )}
            </div>
          )}
        </div>

        {/* NÚT MỞ SIDEBAR - DI CHUYỂN ĐƯỢC */}
        {!isSidebarOpen && (
          <button
            ref={buttonRef}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
              // Chỉ toggle nếu không phải đang kéo
              if (!isDragging) {
                toggleSidebar();
              }
            }}
            style={{
              bottom: `${buttonPosition.bottom}px`,
              right: `${buttonPosition.right}px`,
            }}
            className={`fixed z-30 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-4 py-3 rounded-full shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all ${
              isDragging
                ? "cursor-grabbing scale-105"
                : "cursor-grab hover:scale-105"
            } active:scale-95`}
            title="Kéo để di chuyển, Click để mở đơn hàng"
          >
            <ChevronsLeft size={20} />
            <span className="font-semibold text-sm hidden sm:inline select-none">
              Tạo đơn hàng mới
            </span>
          </button>
        )}
      </div>

      {/* SIDEBAR ĐƠN HÀNG */}
      <div
        className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <OrderSidebar isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        onOrderCreated={() => {
    // Gọi lại dữ liệu sau khi tạo đơn thành công
    fetchOverview();
    // Reload lại danh sách dịch vụ
    fetchData();
  }}/>
      </div>
    </div>
  );
};

export default SalesManagement;
