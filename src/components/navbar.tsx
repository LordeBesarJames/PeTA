// components/navbar.tsx
import Link from "next/link";
import { Home, UtensilsCrossed, Baby, Activity } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
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
                  href="/"
                  className="relative flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200 px-2 py-1 group"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  href="/data-anak"
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
                <Link href="/" className="block h-full w-full">
                  <Image
                    src="/image/logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
