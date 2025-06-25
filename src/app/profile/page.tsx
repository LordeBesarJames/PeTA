// app/profile/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  CheckCircle,
  Camera,
  Shield,
  Info,
  RefreshCw,
} from "lucide-react";

interface ProfileData {
  nama: string;
  email: string;
  no_telp: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileData, setProfileData] = useState<ProfileData>({
    nama: "",
    email: "",
    no_telp: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [originalData, setOriginalData] = useState<ProfileData>({
    nama: "",
    email: "",
    no_telp: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info" | "warning";
    text: string;
  } | null>(null);

  // Initialize data when user is loaded
  useEffect(() => {
    if (user) {
      const userData = {
        nama: user.nama,
        email: user.email,
        no_telp: user.no_telp,
      };
      setProfileData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      profileData.nama !== originalData.nama ||
      profileData.email !== originalData.email ||
      profileData.no_telp !== originalData.no_telp;
    setHasUnsavedChanges(hasChanges);
  }, [profileData, originalData]);

  // Password strength checker
  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };

    setPasswordStrength(calculateStrength(passwordData.newPassword));
  }, [passwordData.newPassword]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const showMessage = (
    type: "success" | "error" | "info" | "warning",
    text: string
  ) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleEditToggle = () => {
    if (isEditing && hasUnsavedChanges) {
      if (
        window.confirm(
          "Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan?"
        )
      ) {
        setProfileData(originalData);
        setIsEditing(false);
      }
    } else {
      setIsEditing(!isEditing);
    }
  };

  const validateProfile = (): boolean => {
    if (!profileData.nama.trim()) {
      showMessage("error", "Nama tidak boleh kosong");
      return false;
    }

    if (profileData.nama.trim().length < 2) {
      showMessage("error", "Nama minimal 2 karakter");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      showMessage("error", "Format email tidak valid");
      return false;
    }

    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(profileData.no_telp.trim())) {
      showMessage("error", "Nomor telepon tidak valid (10-15 digit)");
      return false;
    }

    return true;
  };

  const validatePassword = (): boolean => {
    if (!passwordData.currentPassword) {
      showMessage("error", "Password saat ini harus diisi");
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("error", "Password baru minimal 6 karakter");
      return false;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      showMessage(
        "error",
        "Password baru harus berbeda dari password saat ini"
      );
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Konfirmasi password tidak cocok");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengupdate profil");
      }

      setOriginalData(profileData);
      setIsEditing(false);
      await refreshUser();
      showMessage("success", "Profil berhasil diperbarui");
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengubah password");
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      showMessage("success", "Password berhasil diubah");
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Lemah";
    if (passwordStrength <= 3) return "Sedang";
    return "Kuat";
  };

  const getMessageIcon = () => {
    switch (message?.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getMessageStyle = () => {
    switch (message?.type) {
      case "success":
        return "bg-green-50 text-green-800 border-green-200";
      case "error":
        return "bg-red-50 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-50 text-blue-800 border-blue-200";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#5A674F] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Memuat profil...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header with Breadcrumb */}
          <div className="mb-8">
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
              <span className="text-gray-900 font-medium">Profil</span>
            </nav>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#101828]">Profil Saya</h1>
              <p className="text-gray-600 text-lg">
                Kelola informasi akun dan keamanan Anda
              </p>
            </div>
          </div>

          {/* Message Alert with Animation */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 border shadow-sm animate-fade-in ${getMessageStyle()}`}
            >
              {getMessageIcon()}
              <span className="flex-1">{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Avatar Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center sticky top-8">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#BBD8A3] to-[#BBD8A3] rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border-2 border-gray-100 hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {user.nama}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Akun Terverifikasi</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Information Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r bg-[#BBD8A3] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-[#101828]">
                        Informasi Profil
                      </h2>
                      <p className="text-gray-600">Kelola data pribadi Anda</p>
                    </div>
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4" />
                          Batal
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 text-[#101828]" />
                          <p className="text-[#101828]">Edit</p>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.nama}
                        onChange={(e) =>
                          handleProfileChange("nama", e.target.value)
                        }
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#5A674F] focus:border-[#5A674F] transition-all ${
                          isEditing
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 cursor-not-allowed"
                        }`}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Nama akan ditampilkan pada profil publik Anda
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          handleProfileChange("email", e.target.value)
                        }
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#5A674F] focus:border-[#5A674F] transition-all ${
                          isEditing
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 cursor-not-allowed"
                        }`}
                        placeholder="Masukkan email"
                      />
                    </div>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Email digunakan untuk login dan notifikasi penting
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.no_telp}
                        onChange={(e) =>
                          handleProfileChange("no_telp", e.target.value)
                        }
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#5A674F] focus:border-[#5A674F] transition-all ${
                          isEditing
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 cursor-not-allowed"
                        }`}
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format: +62xxx atau 08xxx (10-15 digit)
                      </p>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isLoading || !hasUnsavedChanges}
                        className="flex items-center gap-2 px-6 py-3 bg-[#5A674F] text-white rounded-xl hover:bg-[#4a5640] focus:ring-2 focus:ring-[#5A674F] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Security Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Keamanan Password
                      </h2>
                      <p className="text-red-100">Jaga keamanan akun Anda</p>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <Lock className="h-4 w-4" />
                      {isChangingPassword ? "Tutup" : "Ubah Password"}
                    </button>
                  </div>
                </div>

                {isChangingPassword && (
                  <div className="p-6 space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            handlePasswordChange(
                              "currentPassword",
                              e.target.value
                            )
                          }
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                          placeholder="Masukkan password saat ini"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("current")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Password Baru
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            handlePasswordChange("newPassword", e.target.value)
                          }
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                          placeholder="Masukkan password baru (minimal 6 karakter)"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordData.newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              Kekuatan Password:
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                passwordStrength <= 2
                                  ? "text-red-600"
                                  : passwordStrength <= 3
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{
                                width: `${(passwordStrength / 5) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Konfirmasi Password Baru
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            handlePasswordChange(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                          className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 transition-all ${
                            passwordData.confirmPassword &&
                            passwordData.newPassword !==
                              passwordData.confirmPassword
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-red-500"
                          }`}
                          placeholder="Konfirmasi password baru"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {passwordData.confirmPassword &&
                        passwordData.newPassword !==
                          passwordData.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            Password tidak cocok
                          </p>
                        )}
                    </div>

                    {/* Change Password Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isLoading ? "Mengubah..." : "Ubah Password"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
