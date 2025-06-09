"use client";

import { useState, useEffect } from "react";
import { X, Clock, Users } from "lucide-react";
import Navbar from "@/components/navbar";

interface Recipe {
  id: number;
  name: string;
  tags: string[];
  description: string;
  image: string;
}

export default function RecipeFinderPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [flyingImageId, setFlyingImageId] = useState<number | null>(null);
  const [flyingImageRect, setFlyingImageRect] = useState<DOMRect | null>(null);

  const filters = ["Protein", "Lemak", "Karbohidrat"];

  const recipes: Recipe[] = [
    {
      id: 1,
      name: "Bubur Ayam",
      tags: ["Karbohidrat", "Protein"],
      description:
        "Bubur ayam adalah makanan tradisional Indonesia yang terbuat dari beras yang dimasak hingga lembut dan disajikan dengan suwiran ayam, telur, dan berbagai pelengkap lainnya.",
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Soto Ayam",
      tags: ["Protein"],
      description:
        "Soto ayam adalah sup tradisional Indonesia dengan kuah kuning yang kaya rempah, berisi daging ayam, tauge, dan disajikan dengan nasi atau lontong.",
      image:
        "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Sop Buntut",
      tags: ["Lemak", "Protein"],
      description:
        "Sop buntut adalah sup yang terbuat dari ekor sapi yang dimasak dengan sayuran seperti wortel, kentang, dan bawang bombay dalam kuah yang gurih.",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilters =
      activeFilters.length === 0 ||
      activeFilters.every((filter) => recipe.tags.includes(filter));
    return matchesSearch && matchesFilters;
  });

  const handleSeeMore = (recipe: Recipe) => {
    const imageElement = document.getElementById(`recipe-image-${recipe.id}`);
    if (imageElement) {
      const rect = imageElement.getBoundingClientRect();
      setFlyingImageRect(rect);
      setFlyingImageId(recipe.id);
    }

    setTimeout(() => {
      setSelectedRecipe(recipe);
      setShowModal(true);
    }, 600);

    setTimeout(() => {
      setFlyingImageId(null);
      setFlyingImageRect(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes flyToFront {
          0% {
            transform: scale(1) translateZ(0) rotateY(0deg);
            opacity: 1;
            border-radius: 12px;
          }
          50% {
            transform: scale(1.5) translateZ(100px) rotateY(-10deg);
            opacity: 0.9;
            border-radius: 16px;
          }
          100% {
            transform: scale(2) translateZ(200px) rotateY(0deg);
            opacity: 0;
            border-radius: 20px;
          }
        }

        .animate-slide-in-top {
          animation: slideInFromTop 0.8s ease-out;
        }

        .animate-slide-in-bottom {
          animation: slideInFromBottom 0.8s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInFromLeft 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fly-to-front {
          animation: flyToFront 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .flying-image {
          position: fixed;
          z-index: 9999;
          pointer-events: none;
          perspective: 1000px;
        }
      `}</style>

      {/* Main Content with Blur Effect */}
      <div
        className={`${showModal ? "blur-sm" : ""} transition-all duration-200`}
      >
        <Navbar />

        <main className="container mx-auto px-6 sm:px-12 lg:px-16 mt-8">
          <h1
            className={`text-4xl font-bold mb-8 ${
              isLoaded ? "animate-slide-in-top" : "opacity-0"
            }`}
          >
            Cari Resep Kamu!
          </h1>

          {/* Search Section */}
          <section
            className={`mb-8 mx-4 sm:mx-8 lg:mx-12 bg-[#BBD8A3] rounded-lg shadow-lg flex flex-col sm:flex-row items-center relative overflow-hidden min-h-[250px] hover:shadow-xl transition-shadow duration-300 ${
              isLoaded ? "animate-slide-in-left" : "opacity-0"
            }`}
          >
            <div className="flex flex-col sm:flex-row w-full h-full">
              <div className="w-full sm:w-3/5 lg:w-2/3 flex items-center p-6 sm:p-8 md:p-10">
                <div className="w-full">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828] mb-4">
                    MASUKKAN NAMA RESEP!
                  </h2>
                  <div className="flex gap-2 max-w-xl">
                    <input
                      type="text"
                      placeholder="Masukkan nama resep"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm bg-white"
                      aria-label="Search recipes"
                    />
                    <button className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm cursor-pointer">
                      Cari
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-[#101828] opacity-80">
                    Pastikan nama makananmu sudah benar!
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-2/5 lg:w-1/3 flex justify-center items-center ">
                <div className="relative w-full h-full">
                  <div className="w-full h-full  rounded-lg flex items-center justify-center">
                    <img src={"/image/plate.png"}></img>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Filter Section */}
          <section
            className={`mb-8 mx-4 sm:mx-8 lg:mx-12 ${
              isLoaded ? "animate-slide-in-bottom" : "opacity-0"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              Filter Resep Anda <span className="ml-2">☰</span>
            </h2>
            <div className="flex gap-4 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 ${
                    activeFilters.includes(filter)
                      ? "bg-green-400 text-white shadow-md hover:cursor-pointer"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-green-400 cursor-pointer "
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </section>

          {/* Recipe Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 mx-4 sm:mx-8 lg:mx-12">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe, index) => (
                <article
                  key={recipe.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden card-hover ${
                    isLoaded ? "animate-fade-in" : "opacity-0"
                  }`}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      id={`recipe-image-${recipe.id}`}
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{recipe.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSeeMore(recipe)}
                      className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      See More
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600 text-lg py-12">
                Tidak ada resep ditemukan.
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Flying Image Effect */}
      {flyingImageId && flyingImageRect && (
        <div
          className="flying-image animate-fly-to-front"
          style={{
            left: flyingImageRect.left,
            top: flyingImageRect.top,
            width: flyingImageRect.width,
            height: flyingImageRect.height,
          }}
        >
          <img
            src={recipes.find((r) => r.id === flyingImageId)?.image}
            alt="Flying image"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      )}

      {/* Modal Background Overlay */}
      {showModal && <div className="fixed inset-0 bg-black/50 z-20"></div>}

      {/* Modal */}
      {showModal && selectedRecipe && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-fade-in">
            <div className="p-6 lg:p-8">
              <button
                onClick={() => setShowModal(false)}
                className="float-right text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">
                    {selectedRecipe.name}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {selectedRecipe.description}
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Info Resep</h3>
                    <div className="flex items-center gap-4 text-gray-700">
                      <Users className="text-blue-500" size={20} />
                      <span className="font-medium">1 Porsi</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-700">
                      <Clock className="text-blue-500" size={20} />
                      <span className="font-medium">20 Menit</span>
                    </div>
                  </div>
                </div>
                <div className="lg:w-80 flex-shrink-0">
                  <div className="relative h-60 rounded-2xl overflow-hidden">
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Bahan</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>80 gr beras putih, cuci bersih</li>
                  <li>100ml kaldu ayam</li>
                  <li>1/8 sdt garam</li>
                  <li>20 gr dada ayam rebus, suwir</li>
                  <li>1 butir telur ayam rebus</li>
                  <li>10 gr kacang kedelai goreng</li>
                  <li>Daun seledri secukupnya</li>
                </ul>
              </div>

              <div className="mt-8 bg-green-100 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Cara Memasak</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex">
                    <span className="font-bold mr-2">1.</span>
                    <span>
                      Tuang beras dan kaldu ayam ke dalam panci, masak dengan
                      api sedang sambil diaduk secara berkala agar tidak gosong.
                    </span>
                  </li>
                  <li className="flex">
                    <span className="font-bold mr-2">2.</span>
                    <span>Siapkan mangkuk bersih, tuang bubur secukupnya.</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold mr-2">3.</span>
                    <span>
                      Tambahkan suwiran ayam, 2 potong telur, kacang kedelai,
                      dan daun bawang.
                    </span>
                  </li>
                  <li className="flex">
                    <span className="font-bold mr-2">4.</span>
                    <span>Taburkan daun seledri, sajikan.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
