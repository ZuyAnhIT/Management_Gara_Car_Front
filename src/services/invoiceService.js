import { apiCall } from "./api";

/**
 * Service quản lý Hóa đơn
 * Đường dẫn gốc: /api/hoadon
 */
export const invoiceService = {
  /**
   * Lấy danh sách hóa đơn có phân trang và sắp xếp
   */
  async getAll(
    page = 0,
    size = 10,
    sortBy = "ngayLapHoaDon",
    sortDirection = "desc"
  ) {
    const params = new URLSearchParams({
      page,
      size,
      sortBy,
      sortDirection,
    });
    return await apiCall(`/api/hoadon/hienThiDanhSach?${params.toString()}`);
  },

  /**
   * Tìm kiếm hóa đơn theo nhiều tiêu chí
   * @param {object} criteria - { maPhieu, tongTienMin, tongTienMax, trangThai }
   */
  async search(
    criteria = {},
    page = 0,
    size = 10,
    sortBy = "ngayLapHoaDon",
    sortDirection = "desc"
  ) {
    const params = new URLSearchParams({
      page,
      size,
      sortBy,
      sortDirection,
    });

    // Chỉ thêm các tham số tìm kiếm nếu chúng có giá trị
    if (criteria.trangThai) params.append("trangThai", criteria.trangThai);

    return await apiCall(`/api/hoadon/timKiem?${params.toString()}`);
  },

    
  async updateStatus(maHoaDon, trangThai) {
    const encodedStatus = encodeURIComponent(trangThai);
    return await apiCall(
      `/api/hoadon/${maHoaDon}/trangThai?trangThai=${encodedStatus}`,
      { method: "PATCH" }
    );
  },

  /**
   * Cập nhật kiểu thanh toán
   */
  async updatePaymentMethod(maHoaDon, kieuThanhToan) {
    const encodedMethod = encodeURIComponent(kieuThanhToan);
    return await apiCall(
      `/api/hoadon/${maHoaDon}/kieuThanhToan?kieuThanhToan=${encodedMethod}`,
      { method: "PATCH" }
    );
  },
  
};
