// components/navbar.tsx
"use client";
import Link from "next/link";
import {
  Home,
  UtensilsCrossed,
  Baby,
  Activity,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    router.push("/");
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    router.push("/profile");
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Green rectangle with bottom border */}
      <div className="w-full h-16 bg-[#ACD3A8] border-b-4 border-[#5A674F]"></div>

      {/* Floating navbar container positioned below the rectangle */}
      <div className="relative -mt-6">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="bg-[#5A674F] rounded-[100px] shadow-lg h-14 flex items-center border-2 border-white">
            <div className="w-full flex items-center justify-between px-6">
              {/* Left-aligned navigation items */}
              <div className="flex items-center space-x-8">
                <Link
                  href="/dashboard"
                  className="relative flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200 px-2 py-1 group"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  href="/tambah-anak"
                  className="relative flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200 px-2 py-1 group"
                >
                  <Baby className="h-5 w-5" />
                  <span>Data Anak</span>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  href="/resep"
                  className="relative flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200 px-2 py-1 group"
                >
                  <UtensilsCrossed className="h-5 w-5" />
                  <span>Resep</span>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  href="/tracker"
                  className="relative flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200 px-2 py-1 group"
                >
                  <Activity className="h-5 w-5" />
                  <span>Tracker</span>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>

              {/* Centered logo that links to home */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-10 w-10">
                <Link href="/dashboard" className="block h-full w-full">
                  <Image
                    src="/image/logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>

              {/* Right-aligned user section */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200 px-2 py-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="hidden sm:block">{user.nama}</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.nama}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200 px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
