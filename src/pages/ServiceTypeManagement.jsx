import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import Table from "../components/common/Table";
import SearchWithOptions from "../components/common/SearchBar";
import SortControls from "../components/common/SortControls";
import Pagination from "../components/common/Pagination";
import Box from "../components/common/Box";
import BoxOnView from "../components/common/BoxOnView";
import ConfirmModal from "../components/common/ConfirmModal";
import { serviceTypeService } from "../services/serviceTypeService";
import { formatDateTime } from "../utils/helpers";
import { Plus } from "lucide-react";
import Loading from "../components/common/Loading";

const getStatusColor = (status) => {
  switch (status) {
    case "Hoạt động":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "Đã xóa":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const ServiceTypeManagement = () => {
  const { showToast } = useToast();
  const [overview, setOverview] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchField, setSearchField] = useState("tenLoai");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: "tenLoai",
    sortDirection: "asc",
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingData, setEditingData] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
 
  const fetchOverview = useCallback(async () => {
      try {
        const res = await serviceTypeService.getthongkeLoaiDichVu();
        setOverview(res.data || res);
      } catch (err) {
        showToast(err.message || "Lỗi khi tải tổng quan", "error");
      } finally {
        setLoading(false);
      }
    }, []);
  // === FETCH DATA ===
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { page, size } = pagination;
      const { sortBy, sortDirection } = sortConfig;
      let responseData;
      if (debouncedSearchTerm) {
        const searchCriteria = { [searchField]: debouncedSearchTerm };
        responseData = await serviceTypeService.search(
          searchCriteria,
          page,
          size,
          sortBy,
          sortDirection
        );
      } else {
        responseData = await serviceTypeService.getAll(
          page,
          size,
          sortBy,
          sortDirection
        );
      }
      if (responseData && responseData.content) {
        setData(
          responseData.content.map((item) => ({ ...item, id: item.maLoai }))
        );
        setPagination((prev) => ({
          ...prev,
          totalPages: responseData.totalPages || 1,
        }));
      } else {
        setData([]);
        setPagination((prev) => ({ ...prev, totalPages: 1, page: 0 }));
      }
    } catch (err) {
      showToast(err.message || "Không thể tải danh sách.", "error");
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((p) => ({ ...p, page: 0 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // ======== useEffect ========
    useEffect(() => {
      fetchOverview();
    }, [fetchOverview]);

  // === CRUD HANDLERS ===
  const handleCreateNew = () => {
    setEditingData(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingData(row);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    setItemToDelete(row);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await serviceTypeService.delete(itemToDelete.maLoai);
      showToast(response.message || "Xóa thành công!", "success");
      fetchData();
      fetchOverview();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSave = async (formData) => {
    try {
      let response;
      if (modalMode === "create") {
        response = await serviceTypeService.create(formData);
        showToast(response.message || "Thêm mới thành công!", "success");
      } else {
        const payload = {};
        if (formData.tenLoai && formData.tenLoai.trim() !== "") {
          payload.tenLoai = formData.tenLoai;
        }
        if (formData.trangThai) {
          payload.trangThai = formData.trangThai;
        }

        response = await serviceTypeService.update(editingData.maLoai, payload);
        showToast(response.message || "Cập nhật thành công!", "success");
      }
      setIsModalOpen(false);
      fetchData();
      fetchOverview();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const overviewFields = overview
    ? [
        {
          label: "Tổng số Dịch vụ",
          value: overview.tongSoLoaiDichVu,
          icon: "package",
          color: "text-orange-500",
          bg: "bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 dark:from-orange-900/40 dark:via-orange-800/40 dark:to-orange-700/40",
          border: "border-l-4 border-orange-400",
        },
        {
          label: "Tổng số Lượng tồn",
          value: overview.soLoaiDichVuHoatDong,
          icon: "layers",
          color: "text-sky-500",
          bg: "bg-gradient-to-r from-sky-100 via-sky-200 to-sky-300 dark:from-sky-900/40 dark:via-sky-800/40 dark:to-sky-700/40",
          border: "border-l-4 border-sky-400",
        },
        {
          label: "Số loại dịch vụ mới ",
          value: overview.soLoaiDichVuMoiThangQua,
          icon: "layers",
          color: "text-sky-500",
          bg: "bg-gradient-to-r from-sky-100 via-sky-200 to-sky-300 dark:from-sky-900/40 dark:via-sky-800/40 dark:to-sky-700/40",
          border: "border-l-4 border-sky-400",
        },
      ]
    : [];
 
  // === CONFIG ===
  const createServiceTypeFields = [
    {
      name: "tenLoai",
      label: "Tên Loại Dịch Vụ",
      type: "text",
      required: true,
      defaultValue: "",
    },
  ];

  const editServiceTypeFields = [
    { name: "tenLoai", label: "Tên Loại Dịch Vụ Mới", type: "text" },
    {
      name: "trangThai",
      label: "Trạng Thái",
      type: "select",
      options: ["Hoạt động", "Đã xóa"],
      required: true,
    },
  ];

  const sortOptions = [
    { value: "tenLoai", label: "Sắp xếp theo Tên" },
    { value: "ngayTao", label: "Sắp xếp theo Ngày tạo" },
  ];

  const searchOptions = [
    { value: "tenLoai", label: "Tìm theo Tên" },
    { value: "trangThai", label: "Tìm theo Trạng thái" },
  ];

  const columns = [
    { key: "maLoai", label: "Mã Loại" },
    { key: "tenLoai", label: "Tên Loại Dịch Vụ" },
    {
      key: "trangThai",
      label: "Trạng Thái",
      render: (value) => (
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    { key: "ngayTao", label: "Ngày Tạo", render: (value) => formatDateTime(value) },
  ];

  if (loading) return <Loading />;
  // === RENDER ===
  return (
    <div className="space-y-6 transition-colors duration-300">
      {/* Header box */}
      <BoxOnView title="Tổng quan hệ thống" fields={overviewFields} />

      {/* Search + Sort */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center
 transition-colors duration-300">
  <div className="w-full sm:w-auto flex-1 min-w-[250px]">
  <SearchWithOptions
          searchField={searchField}
          searchTerm={searchTerm}
          onSearchFieldChange={setSearchField}
          onSearchTermChange={setSearchTerm}
          options={searchOptions}
          placeholder="Nhập giá trị cần tìm..."
        />
</div>

        
        <SortControls
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
          options={sortOptions}
        />
        <button
          onClick={handleCreateNew}
          className="w-full sm:w-auto justify-center active:scale-95 shadow-sm
 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md transition-colors duration-300">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) =>
          setPagination((prev) => ({ ...prev, page: newPage }))
        }
      />

      {/* Box modal */}
      {isModalOpen && (
        <Box
          title={
            modalMode === "create"
              ? "Thêm mới Loại Dịch vụ"
              : "Cập nhật Loại Dịch vụ"
          }
          fields={
            modalMode === "create"
              ? createServiceTypeFields
              : editServiceTypeFields
          }
          initialData={editingData}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
          mode={modalMode}
        />
      )}

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa loại dịch vụ"
        message={`Bạn có chắc chắn muốn xóa loại dịch vụ "${
          itemToDelete?.tenLoai || ""
        }" không? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
};

export default ServiceTypeManagement;
