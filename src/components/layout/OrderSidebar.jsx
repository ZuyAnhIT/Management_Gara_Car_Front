import React, { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  Send,
  ChevronsRight,
  ClipboardList,
  User,
  Car,
  MessageSquare,
} from "lucide-react"; // Thêm icons
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { repairService } from "../../services/repairService";
import { machineService } from "../../services/machineService";
import { VehicleService } from "../../services/VehicleService";
import AutocompleteInput from "../common/AutocompleteInput";
import { formatCurrency } from "../../utils/helpers";

// ✅ PROPS MỚI: isOpen và onToggle để điều khiển từ bên ngoài
function OrderSidebar({ isOpen, onToggle, onOrderCreated }) {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // State và các hàm xử lý logic giữ nguyên...
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [repairDescription, setRepairDescription] = useState("");
  const [mechanicDisplay, setMechanicDisplay] = useState("");
  const [vehicleDisplay, setVehicleDisplay] = useState("");

  const formatMechanic = (mechanic) =>
    mechanic ? `${mechanic.tenTho} - ${mechanic.soDienThoai}` : "";
  const formatVehicle = (vehicle) =>
    vehicle ? `${vehicle.bienSo} - ${vehicle.tenKhachHang || "N/A"}` : "";

  const handleSelectMechanic = (mechanic) => {
    setSelectedMechanic(mechanic);
    setMechanicDisplay(formatMechanic(mechanic));
  };
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleDisplay(formatVehicle(vehicle));
  };

  const handleCreateRepairOrder = async () => {
    // Logic tạo đơn giữ nguyên
    if (cartItems.length === 0) {
      showToast("Vui lòng thêm dịch vụ.", "warning");
      return;
    }
    if (!selectedMechanic) {
      showToast("Vui lòng chọn thợ.", "warning");
      return;
    }
    if (!selectedVehicle) {
      showToast("Vui lòng chọn xe.", "warning");
      return;
    }

    const chiTietList = cartItems.map((item) => ({
      maDichVu: item.id,
      soLuong: item.qty,
    }));
    const payload = {
      maXe: selectedVehicle.maXe,
      maTho: selectedMechanic.maTho,
      bienSo: selectedVehicle.bienSo,
      tenTho: selectedMechanic.tenTho,
      moTa: repairDescription || "",
      chiTietList: chiTietList,
    };

    setLoading(true);
    try {
      const response = await repairService.create(payload);
      showToast(response.message || "Tạo phiếu thành công!", "success");
      window.dispatchEvent(new Event("reload-services"));

      clearCart();
      setSelectedMechanic(null);
      setSelectedVehicle(null);
      setRepairDescription("");
      setMechanicDisplay("");
      setVehicleDisplay("");
      
      if (onOrderCreated) onOrderCreated();
    } catch (err) {
      showToast(err.message || "Tạo phiếu thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    // ✅ Giao diện co giãn và có hiệu ứng transition
    <aside
      className={`bg-white dark:bg-gray-900 border-l dark:border-gray-700 shadow-lg flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isOpen ? "w-96" : "w-0 overflow-hidden"
      }`}
    >
      {/* Thêm một container để nội dung không bị tràn khi thu gọn */}
      <div
        className={`flex flex-col h-full transition-opacity duration-200 ${
          isOpen ? "opacity-100 p-4" : "opacity-0 invisible p-0"
        }`}
      >
        {/* Header với nút thu gọn */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h5 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <ClipboardList size={20} className="text-orange-500" />
            Tạo Phiếu Sửa Chữa
          </h5>
          <button
            onClick={onToggle}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Đóng / Mở"
          >
            {/* Icon thay đổi tùy trạng thái */}
            <ChevronsRight
              size={20}
              className={`transition-transform duration-300 ${
                isOpen ? "" : "-scale-x-100"
              }`}
            />
          </button>
        </div>

        {/* Nội dung có thể cuộn */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {/* ✅ KHU VỰC THÔNG TIN THỢ */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
            <h6 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
              <User size={16} className="text-blue-500" /> Thông tin Thợ
            </h6>
            <AutocompleteInput
              placeholder="Tìm thợ theo tên ..."
              fetchSuggestions={machineService.search}
              searchParamKey={"tenTho"}
              secondarySearchParamKey={"soDienThoai"}
              displayFormat={formatMechanic}
              onSelect={handleSelectMechanic}
              initialDisplayValue={mechanicDisplay}
              required={true}
            />
          </div>

          {/* ✅ KHU VỰC THÔNG TIN XE */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
            <h6 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
              <Car size={16} className="text-green-500" /> Thông tin Xe
            </h6>
            <AutocompleteInput
              placeholder="Tìm xe theo biển số..."
              fetchSuggestions={VehicleService.search}
              searchParamKey={"bienSo"}
              displayFormat={formatVehicle}
              onSelect={handleSelectVehicle}
              initialDisplayValue={vehicleDisplay}
              required={true}
            />
          </div>

          {/* ✅ KHU VỰC MÔ TẢ */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
            <h6 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
              <MessageSquare size={16} className="text-purple-500" /> Mô tả
            </h6>
            <textarea
              name="moTa"
              value={repairDescription}
              onChange={(e) => setRepairDescription(e.target.value)}
              placeholder="Mô tả sửa chữa (nếu có)..."
              rows="3" // Tăng chiều cao một chút
              className="w-full input-style text-sm"
            ></textarea>
          </div>

          {/* DANH SÁCH DỊCH VỤ ĐÃ CHỌN */}
          <div>
            <h6 className="text-base font-semibold text-gray-700 dark:text-gray-200 mt-5 mb-2">
              Dịch vụ đã chọn ({cartItems.length})
            </h6>
            {cartItems.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-800 dark:text-gray-100 text-base w-4/5">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                        title="Xóa dịch vụ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="px-2 py-0.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 text-sm font-semibold w-8 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="px-2 py-0.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                        {formatCurrency(item.qty * item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
                <p className="text-base">Chưa chọn dịch vụ nào</p>
              </div>
            )}
          </div>
        </div>

        {/* TỔNG TIỀN & NÚT TẠO ĐƠN */}
        <div className="border-t dark:border-gray-700 pt-4 mt-auto space-y-3 flex-shrink-0">
          <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-100 text-md">
            <span>Tổng tiền dịch vụ:</span>
            <span className="text-orange-600">{formatCurrency(total)}</span>
          </div>
          <button
            onClick={handleCreateRepairOrder}
            disabled={
              cartItems.length === 0 ||
              loading ||
              !selectedMechanic ||
              !selectedVehicle
            }
            className={`w-full flex items-center justify-center gap-2 mt-2 py-2.5 rounded-lg text-white font-semibold transition ${
              cartItems.length === 0 ||
              loading ||
              !selectedMechanic ||
              !selectedVehicle
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-400 hover:opacity-90 active:scale-95"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={18} />
            )}
            <span>{loading ? "Đang xử lý..." : "Tạo Đơn Sửa Chữa"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default OrderSidebar;
