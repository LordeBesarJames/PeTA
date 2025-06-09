"use client";
import Navbar from "@/components/navbar";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  ChefHat,
  Calendar,
  Activity,
  Heart,
  Award,
  Baby,
  Book,
  Target,
  Image,
} from "lucide-react";
import { image } from "framer-motion/client";

export default function TambahAnakPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    totalChildren: 0,
    avgGrowth: 0,
    recipesShared: 0,
    weeklyProgress: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Mock data untuk banner slider dengan warna yang selaras dengan navbar hijau
  const bannerSlides = [
    {
      id: 1,
      title: "Pantau Pertumbuhan Anak",
      subtitle:
        "Lacak perkembangan nutrisi dan kesehatan anak Anda dengan mudah",
      bgColor: "bg-[#7FB069]", // Hijau lebih gelap dari navbar
      icon: <Activity className="w-16 h-16 text-white" />,
      imageSrc: "/image/gambar-anak.png", // Kosongkan untuk placeholder, atau isi dengan URL gambar
      imagePlaceholder: "Gambar anak-anak yang sedang bermain",
    },
    {
      id: 2,
      title: "Resep Sehat & Bergizi",
      subtitle:
        "Temukan beragam resep makanan sehat untuk mendukung tumbuh kembang anak",
      bgColor: "bg-[#8FBC8F]", // Sage green yang lembut
      icon: <ChefHat className="w-16 h-16 text-white" />,
      imageSrc: "/image/sushi2.png", // Kosongkan untuk placeholder, atau isi dengan URL gambar
      imagePlaceholder: "Gambar berbagai makanan sehat untuk anak",
    },
    {
      id: 3,
      title: "Tracker Gizi Harian",
      subtitle:
        "Monitor asupan gizi harian dan dapatkan rekomendasi yang tepat",
      bgColor: "bg-[#98D982]", // Hijau terang yang segar
      icon: <TrendingUp className="w-16 h-16 text-white" />,
      imageSrc: "/image/tracker.png", // Kosongkan untuk placeholder, atau isi dengan URL gambar
      imagePlaceholder: "Gambar grafik pertumbuhan anak",
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mock stats animation
  useEffect(() => {
    const animateStats = () => {
      setTimeout(
        () => setStats((prev) => ({ ...prev, totalChildren: 12 })),
        100
      );
      setTimeout(() => setStats((prev) => ({ ...prev, avgGrowth: 98 })), 300);
      setTimeout(
        () => setStats((prev) => ({ ...prev, recipesShared: 45 })),
        500
      );
      setTimeout(
        () => setStats((prev) => ({ ...prev, weeklyProgress: 87 })),
        700
      );
    };
    animateStats();
  }, []);

  // Animation on page load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length
    );
  };

  const mainFeatures = [
    {
      title: "Data Anak",
      description: "Kelola informasi lengkap tentang anak-anak Anda",
      icon: <Users className="w-8 h-8" />,
      color: "from-[#7FB069] to-[#6BA055]", // Hijau selaras dengan navbar
      hoverColor: "hover:from-[#6BA055] hover:to-[#5A8A47]",
      count: stats.totalChildren,
      label: "Anak Terdaftar",
    },
    {
      title: "Tracker Gizi",
      description: "Pantau asupan gizi dan pertumbuhan harian",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-[#8FBC8F] to-[#7AA67A]", // Sage green
      hoverColor: "hover:from-[#7AA67A] hover:to-[#669966]",
      count: stats.avgGrowth,
      label: "Rata-rata Progress",
    },
    {
      title: "Resep",
      description: "Koleksi resep sehat untuk anak-anak",
      icon: <ChefHat className="w-8 h-8" />,
      color: "from-[#98D982] to-[#7FC464]", // Hijau terang
      hoverColor: "hover:from-[#7FC464] hover:to-[#66B04A]",
      count: stats.recipesShared,
      label: "Resep Tersedia",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Banner Slider */}
        <div
          className={`relative mb-12 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="relative h-80 sm:h-96">
            {bannerSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <div className={`h-full ${slide.bgColor} flex items-center`}>
                  <div className="container mx-auto px-8 flex items-center justify-between">
                    {/* Left Content */}
                    <div className="text-white space-y-4 flex-1 pr-8">
                      <div className="flex items-center space-x-4 mb-4">
                        {slide.icon}
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                        {slide.title}
                      </h2>
                      <p className="text-xl sm:text-2xl text-white/90 max-w-2xl">
                        {slide.subtitle}
                      </p>
                      <div className="flex space-x-4 mt-6">
                        <button className="bg-white text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg">
                          Mulai Sekarang
                        </button>
                        <button className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-gray-800 transition-all duration-200">
                          Pelajari Lebih
                        </button>
                      </div>
                    </div>

                    {/* Right Image */}
                    <div className="hidden lg:block flex-1 max-w-md">
                      {slide.imageSrc ? (
                        <div className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-white/30">
                          <img
                            src={slide.imageSrc}
                            alt={slide.imagePlaceholder}
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 h-64 flex flex-col items-center justify-center text-center border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
                          <Image className="w-16 h-16 text-white/80 mb-4" />
                          <p className="text-white/90 font-medium text-lg mb-2">
                            Placeholder Gambar
                          </p>
                          <p className="text-white/70 text-sm">
                            {slide.imagePlaceholder}
                          </p>
                          <button className="mt-4 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                            Upload Gambar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? "bg-white scale-125" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 transform transition-all duration-1000 delay-200 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {[
            {
              label: "Total Anak",
              value: stats.totalChildren,
              icon: <Users className="w-5 h-5" />,
              color: "text-[#4A7C59]",
            },
            {
              label: "Progress Rata-rata",
              value: `${stats.avgGrowth}%`,
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-[#5A8A47]",
            },
            {
              label: "Resep Tersedia",
              value: stats.recipesShared,
              icon: <ChefHat className="w-5 h-5" />,
              color: "text-[#3D6B3D]",
            },
            {
              label: "Progress Minggu Ini",
              value: `${stats.weeklyProgress}%`,
              icon: <Target className="w-5 h-5" />,
              color: "text-[#2E5A2E]",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-[#ACD3A8]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={stat.color}>{stat.icon}</div>
                <span className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Features */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 transform transition-all duration-1000 delay-400 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${feature.color} ${feature.hoverColor} rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden`}
              style={{
                animationDelay: `${600 + index * 200}ms`,
                animation: isLoaded
                  ? "slideInUp 0.8s ease-out forwards"
                  : "none",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                    {feature.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{feature.count}</div>
                    <div className="text-sm opacity-90">{feature.label}</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  {feature.description}
                </p>
                <div className="mt-6">
                  <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105">
                    Buka →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#7FB069] to-[#8FBC8F] text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4">Siap Memulai?</h3>
            <p className="text-xl mb-8 text-white/90">
              Mulai pantau pertumbuhan dan gizi anak Anda hari ini
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-white text-[#4A7C59] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg duration-200">
                <Users className="w-5 h-5 inline mr-2" />
                Tambah Data Anak
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#4A7C59] transform hover:scale-105 transition-all shadow-lg duration-200">
                <Book className="w-5 h-5 inline mr-2" />
                Panduan Lengkap
              </button>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white/20 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <h4 className="font-semibold text-lg mb-4">Kontak</h4>
                <p className="text-white/80">Email: info@childnutrition.com</p>
                <p className="text-white/80">Phone: +62 123 4567 890</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-4">Fitur</h4>
                <ul className="space-y-2 text-white/80">
                  <li>Tracker Gizi</li>
                  <li>Data Anak</li>
                  <li>Resep Sehat</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-4">Dukungan</h4>
                <ul className="space-y-2 text-white/80">
                  <li>FAQ</li>
                  <li>Panduan</li>
                  <li>Tim Support</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-8 pt-4 border-t border-white/20">
              <p className="text-white/70">
                © 2025 Child Nutrition Tracker. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
