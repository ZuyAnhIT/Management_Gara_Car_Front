import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { VehicleService } from "../services/VehicleService";
import { customerService } from "../services/customerService";
import Table from "../components/common/Table";
import SearchWithOptions from "../components/common/SearchBar";
import SortControls from "../components/common/SortControls";
import Pagination from "../components/common/Pagination";
import Box from "../components/common/Box";
import BoxOnView from "../components/common/BoxOnView";
import ConfirmModal from "../components/common/ConfirmModal";
import AutocompleteInput from "../components/common/AutocompleteInput";
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

const VehicleManagement = () => {
  const { showToast } = useToast();
  const [overview, setOverview] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, sort, pagination
  const [searchField, setSearchField] = useState("bienSo");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 1 });
  const [sortConfig, setSortConfig] = useState({ sortBy: "maXe", sortDirection: "desc" });

  // Modal & form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingData, setEditingData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentFormData, setCurrentFormData] = useState({});

  // Confirm delete
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Customer selection
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((p) => ({ ...p, page: 0 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { page, size } = pagination;
      const { sortBy, sortDirection } = sortConfig;
      let responseData;

      if (debouncedSearchTerm) {
        const criteria = { [searchField]: debouncedSearchTerm };
        responseData = await VehicleService.search(criteria, page, size, sortBy, sortDirection);
      } else {
        responseData = await VehicleService.getAll(page, size, sortBy, sortDirection);
      }

      const data = responseData.data || responseData;
      setVehicles(data.content?.map((v) => ({ ...v, id: v.maXe })) || []);
      setPagination((p) => ({ ...p, totalPages: data.totalPages || 1 }));
    } catch (err) {
      showToast(err.message || "Không thể tải danh sách xe.", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, sortConfig, debouncedSearchTerm, searchField, showToast]);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await VehicleService.getThongKeXe();
      setOverview(res.data || res);
    } catch (err) {
      console.error("Lỗi khi tải tổng quan:", err);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchData();
  }, [fetchOverview, fetchData]);

  // Validate & save
  const handleSave = async (formDataFromBox) => {
    const errors = {};
    const formData = { ...currentFormData, ...formDataFromBox };

    if (!selectedCustomer?.maKhachHang) {
      errors.khachHang = "Vui lòng chọn khách hàng hợp lệ.";
    }
    if (!formData.bienSo?.trim()) {
      errors.bienSo = "Vui lòng nhập biển số xe.";
    }
    if (!formData.hangXe?.trim()) {
      errors.hangXe = "Vui lòng nhập hãng xe.";
    }
    if (!formData.dongXe?.trim()) {
      errors.dongXe = "Vui lòng nhập dòng xe.";
    }
    if (formData.namSanXuat) {
  const nam = parseInt(formData.namSanXuat, 10);
  if (isNaN(nam) || nam < 2000 || nam > new Date().getFullYear()) {
    errors.namSanXuat = "Năm sản xuất không hợp lệ.";
  }
}

    if (!formData.mauSac?.trim()) {
      errors.mauSac = "Vui lòng nhập màu sắc của xe.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setCurrentFormData(formData);
      showToast(Object.values(errors)[0], "error");

       const fieldOrder = [
    "khachHang",
    "bienSo",
    "hangXe",
    "dongXe",
    "namSanXuat",
    "mauSac",
  ];
       const firstErrorField = fieldOrder.find((field) => errors[field]);
      setTimeout(() => {
        const input = document.getElementById(firstErrorField) || document.querySelector(`[name="${firstErrorField}"]`);
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    try {
      const finalData = {
        ...formData,
        maKhachHang: selectedCustomer.maKhachHang,
        tenKhachHang: selectedCustomer.tenKhachHang,
      };

      if (modalMode === "create") {
        await VehicleService.create(finalData);
        showToast("Thêm xe mới thành công!", "success");
      } else {
        await VehicleService.update(editingData.maXe, finalData);
        showToast("Cập nhật xe thành công!", "success");
      }

      setIsModalOpen(false);
      setEditingData(null);
      setCurrentFormData({});
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Fetch gợi ý khách hàng
  const fetchCustomerSuggestions = useCallback(async (criteria) => {
    try {
      const isPhone = /^\d+$/.test(criteria.tenKhachHang);
      const searchCriteria = {
        tenKhachHang: !isPhone ? criteria.tenKhachHang : undefined,
        soDienThoai: isPhone ? criteria.tenKhachHang : undefined,
      };
      const response = await customerService.search(searchCriteria, 0, 10);
      return response.data || response;
    } catch {
      return { content: [] };
    }
  }, []);

  const handleCreateNew = () => {
    setModalMode("create");
    setEditingData(null);
    setSelectedCustomer(null);
    setCurrentFormData({});
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setModalMode("edit");
    setEditingData(row);
    setSelectedCustomer({ maKhachHang: row.maKhachHang, tenKhachHang: row.tenKhachHang });
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    setItemToDelete(row);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await VehicleService.delete(itemToDelete.maXe);
      showToast("Xóa xe thành công!", "success");
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
    setCurrentFormData({});
    setFormErrors({});
  };
  
  const columns = [
    { key: "maXe", label: "Mã Xe" },
    { key: "bienSo", label: "Biển Số" },
    { key: "hangXe", label: "Hãng Xe" },
    { key: "dongXe", label: "Dòng Xe" },
    { key: "namSanXuat", label: "Năm Sản Xuất" },
    { key: "mauSac", label: "Màu Sắc" },
    { key: "tenKhachHang", label: "Tên Khách Hàng" },
    {
      key: "trangThai",
      label: "Trạng Thái",
      render: (v) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(v)}`}>{v}</span>
      ),
    },
  ];

  const searchOptions = [
    { value: "bienSo", label: "Tìm theo Biển Số" },
    { value: "hangXe", label: "Tìm theo Hãng Xe" },
    { value: "tenKhachHang", label: "Tìm theo Tên Khách" },
  ];

  const sortOptions = [
    { value: "maXe", label: "Sắp xếp theo Mã xe" },
    { value: "bienSo", label: "Sắp xếp theo Biển số" },
  ];

  const overviewFields = overview
    ? [
        { label: "Tổng số Xe", value: overview.tongSoXe, icon: "package" },
        { label: "Tổng số xe hoạt động", value: overview.soXeHoatDong, icon: "layers" },
      ]
    : [];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 transition-colors duration-300">
      <BoxOnView title="Tổng quan Xe" fields={overviewFields} />

      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md flex flex-wrap gap-4 justify-between items-center">
        <SearchWithOptions
          searchField={searchField}
          searchTerm={searchTerm}
          onSearchFieldChange={setSearchField}
          onSearchTermChange={setSearchTerm}
          options={searchOptions}
          placeholder="Nhập giá trị tìm kiếm..."
        />
        <SortControls sortConfig={sortConfig} onSortChange={setSortConfig} options={sortOptions} />
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 active:scale-95 shadow-sm"
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md">
        <Table columns={columns} data={vehicles} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {isModalOpen && (
        <Box
          title={modalMode === "create" ? "Thêm mới Xe" : "Cập nhật Xe"}
          fields={[
            {
              label: "Tên Khách Hàng*",
              render: () => (
                <AutocompleteInput
                  placeholder="Nhập tên hoặc SĐT khách..."
                  fetchSuggestions={fetchCustomerSuggestions}
                  searchParamKey="tenKhachHang"
                  displayFormat={(kh) => `${kh.tenKhachHang} - ${kh.soDienThoai}`}
                  onSelect={setSelectedCustomer}
                  initialDisplayValue={editingData?.tenKhachHang || ""}
                  required
                />
              ),
            },
            { name: "bienSo", label: "Biển Số*", type: "text", required: true },
            { name: "hangXe", label: "Hãng Xe*", type: "text", required: true },
            { name: "dongXe", label: "Dòng Xe", type: "text" },
            {
              name: "namSanXuat",
              label: "Năm Sản Xuất",
              type: "number",
              props: { min: "2000", max: new Date().getFullYear().toString() },
            },
            { name: "mauSac", label: "Màu Sắc", type: "text" },
          ]}
          initialData={
  Object.keys(currentFormData).length > 0
    ? currentFormData
    : editingData || {}
}
          formErrors={formErrors}
          onClose={handleCloseModal}
          onSubmit={handleSave}
          mode={modalMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa Xe"
      >
        <p>
          Bạn có chắc chắn muốn xóa xe{" "}
          <strong className="text-red-600">"{itemToDelete?.bienSo}"</strong>?
        </p>
      </ConfirmModal>
    </div>
  );
};

export default VehicleManagement;
