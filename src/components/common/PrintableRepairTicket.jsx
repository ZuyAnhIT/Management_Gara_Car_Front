import React from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { formatDateTime } from "../../utils/helpers";

const PrintableRepairTicket = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="p-8 font-sans text-gray-800 bg-white w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-1 tracking-wide">PHIẾU SỬA CHỮA</h1>
        <p className="text-base text-gray-600">Garage Management System</p>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 mb-8 border-y py-4 border-dashed">
        <div>
          <p className="text-sm font-semibold text-gray-600">Biển số xe:</p>
          <p className="text-xl font-bold tracking-wider">{data.bienSo}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600">Ngày lập phiếu:</p>
          <p className="text-lg font-medium">{formatDateTime(data.ngayLap)}</p>
        </div>

        <div className="col-span-2">
          <p className="text-sm font-semibold text-gray-600">Mô tả:</p>
          <p className="text-lg whitespace-pre-line">{data.moTa}</p>
        </div>
      </div>

      {/* Table */}
      <h2 className="text-lg font-bold mb-3">Dịch vụ cần thực hiện</h2>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="p-2 font-bold w-14 text-center">STT</th>
            <th className="p-2 font-bold">Tên dịch vụ</th>
            <th className="p-2 font-bold text-center w-16">SL</th>
          </tr>
        </thead>
        <tbody>
          {data.chiTietList.map((item, i) => (
            <tr className="border-b border-dashed" key={i}>
              <td className="p-2 font-semibold text-center">{i + 1}</td>
              <td className="p-2">{item.tenDichVu}</td>
              <td className="p-2 font-bold text-center">{item.soLuong}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/**
 * ✅ Hàm EXPORT PDF - Dùng chung
 */
export const exportRepairPDF = async (data) => {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "210mm"; // ✅ Kích thước chuẩn A4
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  const ref = React.createRef();
  root.render(<PrintableRepairTicket data={data} ref={ref} />);

  await new Promise((r) => setTimeout(r, 350)); // ✅ chờ render

  const element = ref.current;

  const canvas = await html2canvas(element, {
    scale: window.devicePixelRatio * 1.25, // ✅ tăng độ nét PDF
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  document.body.removeChild(container);

  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  const pageHeight = pdf.internal.pageSize.getHeight();

  let remainingHeight = pdfHeight;
  let position = 0;

  pdf.addImage(img, "PNG", 0, position, pdfWidth, pdfHeight);
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(img, "PNG", 0, position, pdfWidth, pdfHeight);
    remainingHeight -= pageHeight;
  }

  pdf.save(`Phieu_Sua_Chua_${data.maPhieu}.pdf`);
};

export default PrintableRepairTicket;
