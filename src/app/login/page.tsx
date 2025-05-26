"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff } from "lucide-react";

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

export default function LoginPage() {
  const router = useRouter();
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (email && password) {
      // Simulate API call
      setTimeout(() => {
        router.push("/dashboard");
        setIsPending(false);
      }, 1000);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-white">
      {/* Left image - hidden on mobile, shown on md and up */}
      <div className="w-full md:w-1/2 h-48 md:h-auto relative md:block">
        <Image
          src="/image/login-page.png"
          alt="PeTA Character"
          fill
          style={{ objectFit: "cover", objectPosition: "left center" }}
          className="absolute inset-0"
          priority
        />
      </div>

      {/* Right form - full width on mobile, half on desktop */}
      <div className="w-full md:w-1/2 flex flex-col bg-[#3D4F3E] px-4 sm:px-6 md:px-12 py-6 md:py-8">
        {/* Logo and title positioned top-left */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <Image
            src="/image/logo.png"
            alt="PeTA Logo"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">PeTA</h1>
            <p className="text-xs md:text-sm -mt-1">
              Mulai perjalananmu dengan PeTA!
            </p>
          </div>
        </motion.div>

        {/* Centered login form */}
        <div className="flex-grow flex flex-col justify-center md:justify-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
          >
            {/* Card Container */}
            <motion.div
              variants={itemVariants}
              className="bg-[#48951e] rounded-xl shadow-lg p-6 md:p-8 border border-[#3D4F3E]"
            >
              {/* Login title */}
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white">
                  LOGIN
                </h2>
                <p className="text-lg md:text-xl mt-2 text-white">
                  Gunakan akun kamu!
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  <label className="block text-sm md:text-base font-medium text-white">
                    Email
                  </label>
                  <motion.div
                    animate={{
                      boxShadow:
                        activeInput === "email" ? "0 0 0 0px #1a2e1a" : "none",
                      borderColor:
                        activeInput === "email" ? "#1a2e1a" : "transparent",
                    }}
                    className="rounded-lg overflow-hidden transition-all duration-300 border-2 hover:border-[#1a2e1a]"
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder="Masukkan Email"
                      required
                      onFocus={() => setActiveInput("email")}
                      onBlur={() => setActiveInput(null)}
                      className="w-full px-4 py-2 md:py-3 bg-white text-gray-900 focus:outline-none placeholder-gray-500 text-sm md:text-base"
                    />
                  </motion.div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <label className="block text-sm md:text-base font-medium text-white">
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
                    className="rounded-lg overflow-hidden transition-all duration-300 border-2 hover:border-[#1a2e1a] relative"
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Masukkan Password"
                      required
                      onFocus={() => setActiveInput("password")}
                      onBlur={() => setActiveInput(null)}
                      className="w-full px-4 py-2 md:py-3 bg-white text-gray-900 focus:outline-none placeholder-gray-500 text-sm md:text-base pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-green-600"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </motion.div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-2 md:py-3 bg-[#3D4F3E] hover:bg-green-600 rounded-lg text-white font-semibold hover:cursor-pointer flex items-center justify-center gap-2 transition-colors duration-300 text-sm md:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin">↻</span>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Login
                    </>
                  )}
                </motion.button>
              </form>

              <div className="text-center mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#3D4F3E]">
                <p className="text-xs md:text-sm text-white">
                  Belum punya akun?{" "}
                  <motion.a
                    href="/signup"
                    className="text-green-300 no-underline hover:underline hover:cursor-pointer font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    Daftar
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
