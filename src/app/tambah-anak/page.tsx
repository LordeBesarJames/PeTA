"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Search, Trash2, X, Edit, Mars, Venus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

// Updated interface to match database schema
export interface ChildData {
  id: string;
  name: string;
  weight: number;
  height: number;
  birthDate: Date;
  gender: "Laki-laki" | "Perempuan"; // Updated to match database values
}

export default function TambahAnakPage() {
  const { logout } = useAuth();
  const { user, loading: authLoading } = useAuth();
  const [searchquery, setsearchquery] = useState("");
  const [anak, setanak] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [show_delete_confirmation, setshow_delete_confirmation] =
    useState(false);
  const [anak_to_delete, setanak_to_delete] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [currentChild, setCurrentChild] = useState<ChildData | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });
  const [formData, setFormData] = useState({
    name: "",
    weight: 0,
    height: 0,
    birthDate: new Date(),
    gender: "Laki-laki" as "Laki-laki" | "Perempuan",
  });

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/anak", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          setError(
            errorData.error || "Sesi telah berakhir, silakan login kembali"
          );
          // Trigger logout
          await fetch("/api/logout", {
            method: "POST",
            credentials: "include",
          });
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setanak(data.children);
      } else {
        throw new Error(data.error || "Gagal mengambil data anak");
      }
    } catch (error: any) {
      console.error("Error fetching children:", error);
      setError(error.message || "Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  // Load data when user is available
  useEffect(() => {
    if (!authLoading && user) {
      fetchChildren();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError("Anda harus login terlebih dahulu untuk mengakses halaman ini.");
    }
  }, [user, authLoading]);

  // Auto hide notification after 10 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message: string) => {
    setNotification({ show: true, message });
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      weight: 0,
      height: 0,
      birthDate: new Date(),
      gender: "Laki-laki",
    });
  };

  const handleCreateChild = () => {
    resetFormData();
    setCurrentChild(null);
    setShowCreateModal(true);
  };

  const handleEditClick = (child: ChildData) => {
    setCurrentChild(child);
    setFormData({
      name: child.name,
      weight: child.weight,
      height: child.height,
      birthDate: new Date(child.birthDate),
      gender: child.gender,
    });
    setShowEditModal(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert("Nama anak tidak boleh kosong");
      return false;
    }
    if (formData.weight <= 0) {
      alert("Berat anak harus lebih dari 0");
      return false;
    }
    if (formData.height <= 0) {
      alert("Tinggi anak harus lebih dari 0");
      return false;
    }
    if (!formData.birthDate) {
      alert("Tanggal lahir harus diisi");
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (currentChild) {
      // Hide edit modal and show confirmation
      setShowEditModal(false);
      setShowEditConfirmation(true);
    } else {
      // Create new child
      await createChild();
    }
  };

  const createChild = async () => {
    try {
      const requestData = {
        nama_anak: formData.name.trim(),
        berat_anak: formData.weight,
        tinggi_anak: formData.height,
        tanggal_lahir: formData.birthDate.toISOString().split("T")[0],
        jenis_kelamin: formData.gender,
      };

      const response = await fetch("/api/anak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        showNotification(`Anda berhasil menambahkan data ${formData.name}`);
        resetFormData();
        await fetchChildren(); // Refresh data
      } else {
        throw new Error(data.error || "Gagal menambahkan data anak");
      }
    } catch (error: any) {
      console.error("Error creating child:", error);
      alert(error.message || "Terjadi kesalahan saat menambahkan data anak");
    }
  };

  const confirmEdit = async () => {
    if (!currentChild) return;

    try {
      const requestData = {
        nama_anak: formData.name.trim(),
        berat_anak: formData.weight,
        tinggi_anak: formData.height,
        tanggal_lahir: formData.birthDate.toISOString().split("T")[0],
        jenis_kelamin: formData.gender,
      };

      console.log("Updating child with data:", requestData);

      const response = await fetch(`/api/anak/${currentChild.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Update response:", data);

      if (data.success) {
        setShowEditConfirmation(false);
        setCurrentChild(null);
        showNotification(`Data ${formData.name} berhasil diubah`);
        resetFormData();
        await fetchChildren(); // Refresh data
      } else {
        throw new Error(data.error || "Gagal mengubah data anak");
      }
    } catch (error: any) {
      console.error("Error updating child:", error);
      alert(error.message || "Terjadi kesalahan saat mengubah data anak");
    }
  };

  const handleDelete = async () => {
    if (!anak_to_delete) return;

    try {
      const response = await fetch(`/api/anak/${anak_to_delete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Delete response:", data);

      if (data.success) {
        setshow_delete_confirmation(false);
        setanak_to_delete(null);
        showNotification("Data anak berhasil dihapus");
        await fetchChildren(); // Refresh data
      } else {
        throw new Error(data.error || "Gagal menghapus data anak");
      }
    } catch (error: any) {
      console.error("Error deleting child:", error);
      alert(error.message || "Terjadi kesalahan saat menghapus data anak");
    }
  };

  const cancelEditConfirmation = () => {
    // Hide confirmation and show edit modal again
    setShowEditConfirmation(false);
    setShowEditModal(true);
  };

  const formatDate = (date: Date) => {
    try {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const filteredChildren = anak.filter((child) =>
    child.name.toLowerCase().includes(searchquery.toLowerCase())
  );

  const getGenderBadgeStyles = (gender: "Laki-laki" | "Perempuan") => {
    if (gender === "Laki-laki") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    } else {
      return "bg-pink-100 text-pink-700 border border-pink-200";
    }
  };

  const getGenderIcon = (gender: "Laki-laki" | "Perempuan") => {
    return gender === "Laki-laki" ? <Mars size={14} /> : <Venus size={14} />;
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error if user not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Anda harus login terlebih dahulu untuk mengakses halaman ini.
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 left-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: "" })}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Overlay for modals */}
      {(show_delete_confirmation ||
        showEditModal ||
        showCreateModal ||
        showEditConfirmation) && (
        <div className="fixed inset-0 bg-black/50 z-20"></div>
      )}

      {/* Main Content with conditional blur */}
      <div
        className={`${
          show_delete_confirmation ||
          showEditModal ||
          showCreateModal ||
          showEditConfirmation
            ? "blur-sm"
            : ""
        } transition-all duration-200`}
      >
        <Navbar />
        <div className="container mx-auto px-4 sm:px-20 py-5">
          <nav className="text-sm text-gray-500 mb-4">
            <span>
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                Home
              </Link>
            </span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Data Anak</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 bg-[#BBD8A3] rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-center relative overflow-hidden min-h-[250px] hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="w-full sm:w-1/2 lg:w-2/5">
                <div className="h-48 sm:h-full flex items-center justify-center mt-3">
                  <img
                    src="/image/gambar-anak.png"
                    alt="Children"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="w-full sm:w-1/2 lg:w-4/5 flex items-center justify-center p-6 sm:p-8">
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl lg:text-6xl font-bold text-[#101828] mb-3 ml-10">
                    Buat Data Anak Anda
                  </h2>
                  <p className="text-sm sm:text-base text-[#101828] opacity-80 ml-10">
                    Tambahkan, Ubah, dan Hapus sesuai dengan yang anda butuhkan!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 pt-6 mx-2 sm:mx-0 border-gray-300">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold">Cari Data Anak Anda</h3>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleCreateChild}
                    className="bg-[#BBD8A3] hover:bg-[#A8C98A] hover:scale-105 px-6 py-2 rounded-lg font-medium text-[#101828] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Buat +
                  </button>
                </div>
              </div>

              <div className="mt-4 relative">
                <div className="w-full sm:w-80 px-4 py-2 border border-[#101828] rounded-lg focus-within:ring-2 focus-within:ring-[#BBD8A3] flex hover:border-[#BBD8A3] transition-colors duration-200">
                  <input
                    type="text"
                    placeholder="Cari Data"
                    className="w-full bg-transparent focus:outline-none"
                    value={searchquery}
                    onChange={(e) => setsearchquery(e.target.value)}
                  />
                  <Search className="ml-15 text-[#101828]" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Data Cards Grid */}
            {filteredChildren.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {anak.length === 0
                  ? "Belum ada data anak. Klik tombol 'Buat +' untuk menambah data anak pertama Anda."
                  : "Tidak ada data yang cocok dengan pencarian"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChildren.map((child, index) => (
                  <div
                    key={child.id}
                    className="bg-white border border-[#101828] rounded-lg p-4 shadow-sm hover:shadow-lg hover:scale-102 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Data Anak {index + 1}
                      </h4>
                      <button
                        className="text-red-500 hover:text-red-700 hover:bg-pink-100 p-2 rounded-full transition-all duration-200 hover:scale-110"
                        onClick={() => {
                          setanak_to_delete(child.id);
                          setshow_delete_confirmation(true);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Nama Lengkap Anak:</span>{" "}
                      {child.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Berat:</span> {child.weight}{" "}
                      kg
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Tinggi:</span>{" "}
                      {child.height} cm
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Tanggal Lahir:</span>{" "}
                      {formatDate(child.birthDate)}
                    </p>

                    <div className="mb-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getGenderBadgeStyles(
                          child.gender
                        )}`}
                      >
                        {getGenderIcon(child.gender)}
                        {child.gender}
                      </span>
                    </div>

                    <button
                      className="w-full bg-[#BBD8A3] hover:bg-[#A8C98A] hover:scale-105 text-[#101828] py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      onClick={() => handleEditClick(child)}
                    >
                      <Edit size={16} />
                      Edit Data
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Child Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tambah Data Anak Baru</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="hover:bg-gray-100 p-1 rounded-full transition-colors duration-200"
              >
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Anak
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBD8A3] hover:border-[#BBD8A3] transition-colors duration-200"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Berat Anak <b>(kg)</b>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBD8A3] hover:border-[#BBD8A3] transition-colors duration-200"
                    value={formData.weight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tinggi Anak <b>(cm)</b>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBD8A3] hover:border-[#BBD8A3] transition-colors duration-200"
                    value={formData.height || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBD8A3] hover:border-[#BBD8A3] transition-colors duration-200"
                  value={formData.birthDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      birthDate: new Date(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      formData.gender === "Laki-laki"
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, gender: "Laki-laki" })
                    }
                  >
                    <Mars size={16} />
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      formData.gender === "Perempuan"
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-pink-300"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, gender: "Perempuan" })
                    }
                  >
                    <Venus size={16} />
                    Perempuan
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#BBD8A3] hover:bg-[#A8C98A] hover:scale-105 text-[#101828] rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {show_delete_confirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl text-red-600 font-bold">
                Hapus Data Anak!
              </h2>
              <button
                onClick={() => setshow_delete_confirmation(false)}
                className="hover:bg-gray-100 p-1 rounded-full transition-colors duration-200"
              >
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <p className="mb-6">
              Kamu menghapus{" "}
              <span className="font-semibold">
                {anak.find((a) => a.id === anak_to_delete)?.name}
              </span>{" "}
              dari aplikasi ini, apa kamu yakin?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setshow_delete_confirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 hover:scale-105 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ya, Yakin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditModal && currentChild && (
        <div className="fixed inset-0 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Data Anak</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentChild(null);
                }}
                className="hover:bg-gray-100 p-1 rounded-full transition-colors duration-200"
              >
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Anak
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBD8A3] hover:border-[#BBD8A3] transition-colors duration-200"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Berat Anak <b>(kg)</b>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBD8A3] hover:border-[#BBD8A3] transition-colors duration-200"
                    value={formData.weight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tinggi Anak <b>(cm)</b>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBD8A3] hover:border-[#BBD8A3] transition-colors duration-200"
                    value={formData.height || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBD8A3] hover:border-[#BBD8A3] transition-colors duration-200"
                  value={formData.birthDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      birthDate: new Date(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      formData.gender === "Laki-laki"
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, gender: "Laki-laki" })
                    }
                  >
                    <Mars size={16} />
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      formData.gender === "Perempuan"
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-pink-300"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, gender: "Perempuan" })
                    }
                  >
                    <Venus size={16} />
                    Perempuan
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentChild(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#BBD8A3] hover:bg-[#A8C98A] hover:scale-105 text-[#101828] rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Konfirmasi Perubahan</h2>
              <button
                onClick={cancelEditConfirmation}
                className="hover:bg-gray-100 p-1 rounded-full transition-colors duration-200"
              >
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <p className="mb-6">
              Anda akan mengubah data anak{" "}
              <span className="font-semibold">{currentChild?.name}</span>.
              Apakah Anda yakin ingin menyimpan perubahan ini?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelEditConfirmation}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={confirmEdit}
                className="px-4 py-2 bg-[#BBD8A3] hover:bg-[#A8C98A] hover:scale-105 text-[#101828] rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function logout() {
  throw new Error("Function not implemented.");
}
