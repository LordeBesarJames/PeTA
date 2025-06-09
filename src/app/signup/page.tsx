"use client";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');
  const [popupMessage, setPopupMessage] = useState('');

  const PopupModal = ({ isOpen, onClose, type, message }: {
    isOpen: boolean;
    onClose: () => void;
    type: 'success' | 'error';
    message: string;
  }) => {
    if (!isOpen) return null;

    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      
        
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative pointer-events-auto"
          >
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {type === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h3 className={`mt-3 text-lg font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message}
              </h3>
              <div className="mt-6">
                <button
                  type="button"
                  className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'}`}
                  onClick={onClose}
                >
                  {type === 'success' ? 'Pergi ke Dashboard' : 'Registrasi Kembali'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  };

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPopupType('error');
        setPopupMessage(data.error || 'Registrasi gagal');
        setPopupOpen(true);
        throw new Error(data.error || 'Registration failed');
      }

      setPopupType('success');
      setPopupMessage('Registrasi Berhasil!');
      setPopupOpen(true);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-white">
      {/* Left image - hidden on mobile, shown on md and up */}
      <div className="w-full md:w-1/2 h-40 md:h-auto relative md:block">
        <Image
          src="/image/login-page.png"
          alt="PeTA Character"
          fill
          style={{ objectFit: "cover", objectPosition: "left center" }}
          className="absolute inset-0"
          priority
        />
      </div>

      {/* Right form */}
      <div className="w-full md:w-1/2 flex flex-col bg-[#3D4F3E] px-4 sm:px-6 md:px-8 py-6">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-4 md:mb-6"
        >
          <Image
            src="/image/logo.png"
            alt="PeTA Logo"
            width={40}
            height={40}
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold">PeTA</h1>
            <p className="text-xs -mt-1">Mulai perjalananmu dengan PeTA!</p>
          </div>
        </motion.div>

        {/* Centered registration form */}
        <div className="flex-grow flex flex-col justify-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-sm mx-auto"
          >
            {/* Card Container */}
            <motion.div
              variants={itemVariants}
              className="bg-[#48951e] rounded-lg shadow-lg p-6 md:p-8 border border-[#3D4F3E]"
            >
              {/* Registration title */}
              <div className="text-center mb-4 md:mb-5">
                <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                  REGISTER
                </h2>
                <p className="text-sm md:text-base mt-1 text-white">
                  Daftar untuk memulai perjalanan anda!
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleRegister}
                className="space-y-3 md:space-y-4"
              >
                {/* Username */}
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-white">
                    Username
                  </label>
                  <motion.div
                    animate={{
                      boxShadow:
                        activeInput === "username"
                          ? "0 0 0 0px #1a2e1a"
                          : "none",
                      borderColor:
                        activeInput === "username" ? "#1a2e1a" : "transparent",
                    }}
                    className="rounded-md overflow-hidden transition-all duration-300 border-2 hover:border-[#1a2e1a]"
                  >
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      required
                      onFocus={() => setActiveInput("username")}
                      onBlur={() => setActiveInput(null)}
                      className="w-full px-3 py-2 bg-white text-gray-900 focus:outline-none placeholder-gray-500 text-xs md:text-sm"
                    />
                  </motion.div>
                </div>

                {/* Email */}
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-white">
                    Email
                  </label>
                  <motion.div
                    animate={{
                      boxShadow:
                        activeInput === "email" ? "0 0 0 0px #1a2e1a" : "none",
                      borderColor:
                        activeInput === "email" ? "#1a2e1a" : "transparent",
                    }}
                    className="rounded-md overflow-hidden transition-all duration-300 border-2 hover:border-[#1a2e1a]"
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      required
                      onFocus={() => setActiveInput("email")}
                      onBlur={() => setActiveInput(null)}
                      className="w-full px-3 py-2 bg-white text-gray-900 focus:outline-none placeholder-gray-500 text-xs md:text-sm"
                    />
                  </motion.div>
                </div>

                {/* Password */}
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-white">
                    Password
                  </label>
                  <motion.div
                    animate={{
                      boxShadow:
                        activeInput === "password"
                          ? "0 0 0 0px #1a2e1a"
                          : "none",
                      borderColor:
                        activeInput === "password" ? "#1a2e1a" : "transparent",
                    }}
                    className="rounded-md overflow-hidden transition-all duration-300 border-2 hover:border-[#1a2e1a] relative"
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      required
                      onFocus={() => setActiveInput("password")}
                      onBlur={() => setActiveInput(null)}
                      className="w-full px-3 py-2 bg-white text-gray-900 focus:outline-none placeholder-gray-500 text-xs md:text-sm pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-green-600"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </motion.div>
                </div>

                {/* Phone */}
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-white">
                    Nomor Telepon
                  </label>
                  <motion.div
                    animate={{
                      boxShadow:
                        activeInput === "phone" ? "0 0 0 0px #1a2e1a" : "none",
                      borderColor:
                        activeInput === "phone" ? "#1a2e1a" : "transparent",
                    }}
                    className="rounded-md overflow-hidden transition-all duration-300 border-2 hover:border-[#1a2e1a]"
                  >
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Nomor Telepon"
                      required
                      onFocus={() => setActiveInput("phone")}
                      onBlur={() => setActiveInput(null)}
                      className="w-full px-3 py-2 bg-white text-gray-900 focus:outline-none placeholder-gray-500 text-xs md:text-sm"
                    />
                  </motion.div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center mt-2">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded-sm border flex items-center hover:cursor-pointer justify-center transition-colors ${
                      rememberMe
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-400"
                    }`}
                  >
                    {rememberMe && <Check size={12} className="text-white" />}
                  </button>
                  <label
                    className="ml-2 text-xs md:text-sm text-white cursor-pointer"
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    Remember Me
                  </label>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="w-full py-2 bg-[#3D4F3E] hover:cursor-pointer hover:bg-green-600 rounded-md text-white font-medium text-xs md:text-sm flex items-center justify-center transition-colors duration-300 mt-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin mr-1">↻</span>
                      Memproses...
                    </>
                  ) : (
                    "Daftar"
                  )}
                </motion.button>
              </form>

              {/* Login link */}
              <div className="text-center mt-3 pt-3 border-t border-[#3D4F3E]">
                <p className="text-xs text-white">
                  Sudah punya akun?{" "}
                  <motion.a
                    href="/login"
                    className="text-green-300 no-underline hover:underline font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    Login
                  </motion.a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Popup Modal */}
      <PopupModal
        isOpen={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          if (popupType === 'success') {
            router.push('/tambah-anak'); // Change to your dashboard route
          }
        }}
        type={popupType}
        message={popupMessage}
      />
    </div>
  );
}