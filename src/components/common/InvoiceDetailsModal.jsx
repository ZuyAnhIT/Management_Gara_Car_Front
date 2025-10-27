import React, { useState } from "react";
import Loading from "./Loading";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useToast } from "../../context/ToastContext";
import {
  X,
  FileText,
  Calendar,
  Tag,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { formatDateTime, formatCurrency } from "../../utils/helpers";

const InvoiceDetailsModal = ({ isOpen, onClose, data }) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !data) return null;

  const exportInvoicePDF = async () => {
  try {
    setLoading(true);

    // ✅ Tạo nội dung in với giao diện đẹp như PrintableRepairTicket
    const printEl = document.createElement("div");
    printEl.style.width = "210mm";
    printEl.style.padding = "32px";
    printEl.style.fontFamily = "sans-serif";
    printEl.style.backgroundColor = "white";
    printEl.innerHTML = `
      <div style="text-align:center; margin-bottom:24px;">
        <h1 style="font-size:24px; font-weight:bold; margin-bottom:4px;">HÓA ĐƠN THANH TOÁN</h1>
        <p style="color:#555;">Garage Management System</p>
      </div>

      <div style="font-size:14px; border-top:1px dashed #aaa; border-bottom:1px dashed #aaa; padding:12px 0; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between;">
          <span><strong>Mã hóa đơn:</strong> #${data.maHoaDon}</span>
          <span><strong>Mã phiếu sửa:</strong> #${data.maPhieu}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:6px;">
          <span><strong>Ngày lập:</strong> ${formatDateTime(data.ngayLapHoaDon)}</span>
          <span><strong>Thanh toán:</strong> ${formatDateTime(data.thoiGianThanhCong)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:6px;">
          <span><strong>Hình thức:</strong> ${data.kieuThanhToan}</span>
          <span><strong>Trạng thái:</strong> ${data.trangThai}</span>
        </div>
      </div>

      <div style="font-size:15px; font-weight:bold; margin-bottom:12px;">
        Tổng tiền: <span style="color:#0056ff;">${formatCurrency(data.tongTien)}</span>
      </div>

      <h3 style="font-size:16px; font-weight:bold; margin-bottom:8px;">Chi tiết dịch vụ thanh toán</h3>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="border-bottom:2px solid #000;">
            <th style="padding:6px; text-align:left;">Tên dịch vụ</th>
            <th style="padding:6px; text-align:center; width:40px;">SL</th>
            <th style="padding:6px; text-align:right;">Đơn giá</th>
            <th style="padding:6px; text-align:right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${data.chiTietList.map(
            (item) => `
            <tr style="border-bottom:1px dashed #aaa;">
              <td style="padding:6px;">${item.tenDichVu}</td>
              <td style="padding:6px; text-align:center;">${item.soLuong}</td>
              <td style="padding:6px; text-align:right;">${formatCurrency(item.donGia)}</td>
              <td style="padding:6px; text-align:right; font-weight:bold;">${formatCurrency(item.thanhTien)}</td>
            </tr>
          `
          ).join("")}
        </tbody>
      </table>
    `;

    // ✅ Render ẩn để screenshot
    document.body.appendChild(printEl);

    const canvas = await html2canvas(printEl, {
      scale: window.devicePixelRatio * 1.25,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    document.body.removeChild(printEl);

    // ✅ Xuất PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`HoaDon_${data.maHoaDon}.pdf`);
    showToast(" Xuất PDF thành công!", "success");
    setTimeout(() => onClose(), 200);

  } catch (err) {
    console.error(err);
    showToast(" Xuất PDF thất bại!", "error");
  } finally {
    setLoading(false);
  }
};


  const getStatusChipColor = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Chưa thanh toán":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Chi tiết Hóa đơn #{data.maHoaDon}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div id="invoice-content" className="p-6">
          <InvoiceBody data={data} getStatusChipColor={getStatusChipColor} />
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex gap-3 justify-end">
          {data.trangThai === "Đã thanh toán" && (
            <button
              onClick={exportInvoicePDF}
              className="px-5 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition"
            >
              Xuất PDF
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

const InvoiceBody = ({ data, getStatusChipColor }) => (
  <>
    <div className="flex items-center gap-2 mb-6">
      <FileText size={20} className="text-orange-500" />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Chi tiết Hóa đơn #{data?.maHoaDon}
      </h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
      <InfoItem icon={<Tag size={16} />} label="Mã Phiếu Sửa" value={`#${data.maPhieu}`} />
      <InfoItem icon={<Calendar size={16} />} label="Ngày Lập Hóa Đơn" value={formatDateTime(data.ngayLapHoaDon)} />
      <InfoItem icon={<Calendar size={16} />} label="Thời Gian Thanh Toán" value={formatDateTime(data.thoiGianThanhCong)} />
      <InfoItem icon={<CreditCard size={16} />} label="Kiểu Thanh Toán" value={data.kieuThanhToan} />
      <InfoItem
        icon={<Tag size={16} />}
        label="Trạng Thái"
        value={
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusChipColor(data.trangThai)}`}>
            {data.trangThai}
          </span>
        }
      />
      <InfoItem icon={<DollarSign size={16} />} label="Tổng tiền" value={formatCurrency(data.tongTien)} isBold />
    </div>

    <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">
      Chi tiết dịch vụ thanh toán:
    </h4>

    <div className="border rounded-lg overflow-hidden dark:border-gray-700">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-3 text-left font-semibold">Tên Dịch Vụ</th>
            <th className="p-3 text-center font-semibold">SL</th>
            <th className="p-3 text-right font-semibold">Đơn Giá</th>
            <th className="p-3 text-right font-semibold">Thành Tiền</th>
          </tr>
        </thead>
        <tbody>
          {data.chiTietList.map((it, idx) => (
            <tr key={idx} className="border-t dark:border-gray-700">
              <td className="p-3">{it.tenDichVu}</td>
              <td className="p-3 text-center">{it.soLuong}</td>
              <td className="p-3 text-right">{formatCurrency(it.donGia)}</td>
              <td className="p-3 text-right">{formatCurrency(it.thanhTien)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

const InfoItem = ({ icon, label, value, isBold }) => (
  <div className="flex items-start gap-3">
    <span className="text-gray-500 dark:text-gray-400 mt-0.5">{icon}</span>
    <div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p
        className={`text-gray-800 dark:text-gray-100 ${
          isBold ? "font-bold text-base" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default InvoiceDetailsModal;
