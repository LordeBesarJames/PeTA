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

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const phone = formData.get("phone");

    if (username && email && password && phone) {
      setTimeout(() => {
        router.push("/dashboard");
        setIsPending(false);
      }, 1000);
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
            className="w-full max-w-sm mx-auto" // Diubah ke max-w-sm
          >
            {/* Card Container - made larger */}
            <motion.div
              variants={itemVariants}
              className="bg-[#48951e] rounded-lg shadow-lg p-6 md:p-8 border border-[#3D4F3E]" // Padding diperbesar
            >
              {/* Registration title - made smaller */}
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
    </div>
  );
}
