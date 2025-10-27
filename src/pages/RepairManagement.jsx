import React, { useState, useEffect, useCallback} from "react";
import { useNavigate } from "react-router-dom";


import { useToast } from "../context/ToastContext";
import { repairService } from "../services/repairService";
import Table from "../components/common/Table";
import SearchWithOptions from "../components/common/SearchBar";
import SortControls from "../components/common/SortControls";
import Pagination from "../components/common/Pagination";
import RepairDetailsModal from "../components/common/RepairDetailsModal";
import Box from "../components/common/Box"; // Import Box component
import BoxOnView from "../components/common/BoxOnView";
import { statisticService } from "../services/statisticService";
import { Plus } from "lucide-react";
import { formatDateTime, formatCurrency } from "../utils/helpers";
import Loading from "../components/common/Loading";

const getStatusColor = (status) => {
  switch (status) {
    case "Hoàn thành":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "Đã giao":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "Đang sửa":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "Chờ xử lý":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Hủy sửa":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const RepairManagement = () => {
  const { showToast } = useToast();
  const [overview, setOverview] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // States for modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  // States for search, sort, pagination
  const [searchField, setSearchField] = useState("bienSo");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: "ngayLap",
    sortDirection: "desc",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((p) => ({ ...p, page: 0 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { page, size } = pagination;
      const { sortBy, sortDirection } = sortConfig;
      let responseData;

      if (debouncedSearchTerm) {
        const criteria = { [searchField]: debouncedSearchTerm };
        responseData = await repairService.search(
          criteria,
          page,
          size,
          sortBy,
          sortDirection
        );
      } else {
        responseData = await repairService.getAll(
          page,
          size,
          sortBy,
          sortDirection
        );
      }

      if (responseData?.data?.content) {
        setRepairs(
          responseData.data.content.map((r) => ({ ...r, id: r.maPhieu }))
        );
        setPagination((p) => ({
          ...p,
          totalPages: responseData.data.totalPages || 1,
        }));
      } else if (responseData?.content) {
        setRepairs(responseData.content.map((r) => ({ ...r, id: r.maPhieu })));
        setPagination((p) => ({
          ...p,
          totalPages: responseData.totalPages || 1,
        }));
      } else {
        setRepairs([]);
        setPagination((p) => ({ ...p, totalPages: 1, page: 0 }));
      }
    } catch (err) {
      showToast(
        err.message || "Không thể tải danh sách phiếu sửa chữa.",
        "error"
      );
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.size,
    sortConfig,
    debouncedSearchTerm,
    searchField,
    showToast,
  ]);
// ======== GỌI API: TỔNG QUAN ========
  const fetchOverview = useCallback(async () => {
    try {
      const res = await statisticService.getThongKePhieu();
      setOverview(res.data || res);
    } catch (err) {
      showToast(err.message || "Lỗi khi tải tổng quan", "error");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchOverview();
    fetchData();
  }, [fetchOverview, fetchData]);

  // === EVENT HANDLERS ===
  const handleViewDetails = (row) => {
    setSelectedRepair(row);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedRepair(row);
    setIsEditModalOpen(true);
  };

  const handleUpdateStatus = async (formData) => {
    if (!selectedRepair || !formData.trangThai) return;
    try {
      setLoading(true);
      const response = await repairService.updateStatus(
        selectedRepair.maPhieu,
        formData.trangThai
      );
      showToast(
        response.message || "Cập nhật trạng thái thành công!",
        "success"
      );
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // === UI CONFIGURATIONS ===
  const editStatusFields = [
    {
      name: "trangThai",
      label: "Trạng Thái Mới",
      type: "select",
      options: ["Chờ xử lý", "Đang sửa", "Đã giao", "Hoàn thành", "Hủy sửa"],
      required: true,
    },
  ];

  const columns = [
    { key: "maPhieu", label: "Mã Phiếu" },
    { key: "maXe", label: "Mã Xe" },
    { key: "bienSo", label: "Biển Số" },
    { key: "maTho", label: "Mã Thợ" },
    { key: "tenTho", label: "Thợ Phụ Trách" },
    { key: "ngayLap", label: "Ngày Lập", render: (value) => formatDateTime(value) },
    {
      key: "moTa",
      label: "Mô Tả",
      render: (value) => (
        <span
          className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate block"
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      key: "trangThai",
      label: "Trạng Thái",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "tongTien",
      label: "Tổng Tiền",
      render: (value) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
  ];

  const searchOptions = [
    { value: "bienSo", label: "Tìm theo Biển số" },
    { value: "trangThai", label: "Tìm theo Trạng thái" },
  ];

  const sortOptions = [
    { value: "ngayLap", label: "Sắp xếp theo Ngày lập" },
    { value: "tongTien", label: "Sắp xếp theo Tổng tiền" },
  ];
const overviewFields = overview
    ? [
        {
          label: "Số phiếu đã giao",
          value: overview.soPhieuDaGiao,
          icon: "package",
          color: "text-orange-500",
          bg: "bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 dark:from-orange-900/40 dark:via-orange-800/40 dark:to-orange-700/40",
          border: "border-l-4 border-orange-400",
          
        },
        {
          label: "Số phiếu đang sửa",
          value: overview.soPhieuDangSua,
          icon: "layers",
          color: "text-sky-500",
          bg: "bg-gradient-to-r from-sky-100 via-sky-200 to-sky-300 dark:from-sky-900/40 dark:via-sky-800/40 dark:to-sky-700/40",
          border: "border-l-4 border-sky-400",
         
        },
        {
          label: "Số phiếu chờ xử lí",
          value: overview.soPhieuChoXuLy,
          icon: "wrench",
          color: "text-emerald-500",
          bg: "bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-300 dark:from-emerald-900/40 dark:via-emerald-800/40 dark:to-emerald-700/40",
          border: "border-l-4 border-emerald-400",
          
        },
        {
          label: "Tổng doanh thu",
          value: overview.tongDoanhThu,
          icon: "shopping-bag",
          color: "text-violet-500",
          bg: "bg-gradient-to-r from-violet-100 via-violet-200 to-violet-300 dark:from-violet-900/40 dark:via-violet-800/40 dark:to-violet-700/40",
          border: "border-l-4 border-violet-400",
          
        },
      ]
    : [];

    if (loading) return <Loading />;
  return (
    <div className="space-y-6 transition-colors duration-300">
      <BoxOnView title="Tổng quan phiếu sửa chữa" fields={overviewFields} />
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center
">        
      <div className="w-full sm:w-auto flex-1 min-w-[250px]">
   <SearchWithOptions
          searchField={searchField}
          searchTerm={searchTerm}
          options={searchOptions}
          onSearchFieldChange={setSearchField}
          onSearchTermChange={setSearchTerm}
          placeholder="Nhập giá trị tìm kiếm..."
          module = "repair"
        />
</div>

       
        <SortControls
          sortConfig={sortConfig}
          options={sortOptions}
          onSortChange={setSortConfig}
        />
        <button
         onClick={() => navigate("/sales")}
        className="w-full sm:w-auto justify-center active:scale-95 shadow-sm
 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition">
          <Plus size={18} /> Lập phiếu mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md overflow-x-auto">
        <Table
          columns={columns}
          data={repairs}
          loading={loading}
          onView={handleViewDetails}
          onEdit={handleEdit}
        />
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      <RepairDetailsModal
  isOpen={isDetailModalOpen}
  onClose={() => setIsDetailModalOpen(false)}
  data={selectedRepair}
  onStatusChange={(maPhieu, newStatus) => {
    // Gọi lại 2 hàm sau khi cập nhật trạng thái thành công
    fetchData();
    fetchOverview();
  }}
/>


      {isEditModalOpen && (
        <Box
          title={`Cập nhật P.S.C #${selectedRepair?.maPhieu}`}
          fields={editStatusFields}
          initialData={selectedRepair}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateStatus}
          mode="edit"
        />
      )}
    </div>
  );
};

export default RepairManagement;
