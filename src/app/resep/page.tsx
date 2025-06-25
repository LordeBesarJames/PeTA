"use client";

import { useState, useEffect } from "react";
import { X, Clock, Users, Heart, Bookmark } from "lucide-react";
import Navbar from "@/components/navbar";
import { Recipe as RecipeType } from "../../../types/resep/resep";
import Link from "next/link";

interface Recipe {
  id: string;
  name: string;
  tags: string[];
  description: string;
  image: string;
  waktu_masak?: number;
}

interface DetailedRecipe {
  resep_id: string;
  nama_resep: string;
  deskripsi_resep: string;
  waktu_masak: number;
  bahan: string;
  cara_masak: string;
  image_url: string;
  protein: boolean;
  lemak: boolean;
  karbohidrat: boolean;
}

function mapRecipeTypeToRecipe(recipe: RecipeType): Recipe {
  const tags: string[] = [];
  if (recipe.protein) tags.push("Protein");
  if (recipe.lemak) tags.push("Lemak");
  if (recipe.karbohidrat) tags.push("Karbohidrat");

  return {
    id: recipe.resep_id,
    name: recipe.nama_resep,
    description: recipe.deskripsi_resep,
    image: recipe.image_url,
    tags: tags,
    waktu_masak: recipe.waktu_masak,
  };
}

// Helper function to parse ingredients and cooking steps
function parseIngredients(bahanString: string): string[] {
  if (!bahanString) return [];
  return bahanString
    .replace(/\\n/g, "\n")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item !== "" && item !== "-" && item !== "•");
}

function parseCookingSteps(caraMasakString: string): string[] {
  if (!caraMasakString) return [];
  return caraMasakString
    .replace(/\\n/g, "\n")
    .split("\n")
    .map((step) => step.trim())
    .filter(
      (step) => step !== "" && step !== "-" && !step.match(/^\d+\.?\s*$/)
    );
}

export default function RecipeFinderPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [detailedRecipe, setDetailedRecipe] = useState<DetailedRecipe | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [flyingImageId, setFlyingImageId] = useState<string | null>(null);
  const [flyingImageRect, setFlyingImageRect] = useState<DOMRect | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Set<string>>(
    new Set()
  );
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const filters = ["Protein", "Lemak", "Karbohidrat"];
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("/api/resep");
        if (!response.ok) {
          console.error("Gagal fetch resep:", response.status);
          return;
        }
        const result = await response.json();
        if (result.success) {
          const mappedData = (result.data as RecipeType[]).map(
            mapRecipeTypeToRecipe
          );
          setRecipes(mappedData);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, []);

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

  const toggleLike = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const toggleBookmark = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
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

  const fetchRecipeDetails = async (recipeId: string) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/resep?id=${recipeId}`);
      if (!response.ok) {
        console.error("Gagal fetch detail resep:", response.status);
        return null;
      }
      const result = await response.json();
      if (result.success) {
        return result.data as DetailedRecipe;
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
    return null;
  };

  const handleSeeMore = async (recipe: Recipe) => {
    const imageElement = document.getElementById(`recipe-image-${recipe.id}`);
    if (imageElement) {
      const rect = imageElement.getBoundingClientRect();
      setFlyingImageRect(rect);
      setFlyingImageId(recipe.id);
    }

    const details = await fetchRecipeDetails(recipe.id);
    if (details) {
      setDetailedRecipe(details);
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

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS for enhanced animations */}
      <style jsx>{`
        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .card-floating {
          animation: cardFloat 3s ease-in-out infinite;
        }
      `}</style>

      {/* Main Content with Blur Effect */}
      <div
        className={`${showModal ? "blur-sm" : ""} transition-all duration-200`}
      >
        <Navbar />

        <main className="container mx-auto px-6 sm:px-12 lg:px-16 mt-8">
          <nav className="text-sm text-gray-500 mb-4 ml-11">
            <span>
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                Home
              </Link>
            </span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Resep</span>
          </nav>

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
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 px-4 py-3 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm bg-white"
                      aria-label="Search recipes"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm cursor-pointer button-ripple"
                    >
                      Cari
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-[#101828] opacity-80">
                    Pastikan nama makananmu sudah benar!
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-2/5 lg:w-1/3 flex justify-center items-center">
                <div className="relative w-full h-full">
                  <div className="w-full h-full rounded-lg flex items-center justify-center">
                    <img src="/image/plate.png" alt="Plate illustration" />
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
                  className={`px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 button-ripple ${
                    activeFilters.includes(filter)
                      ? "bg-green-400 text-white shadow-md hover:cursor-pointer"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-green-400 cursor-pointer"
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
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden card-hover group relative ${
                    isLoaded ? "animate-fade-in" : "opacity-0"
                  } ${hoveredCard === recipe.id ? "card-floating" : ""}`}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                  onMouseEnter={() => setHoveredCard(recipe.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Shimmer effect overlay */}
                  <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>

                  <div className="relative h-48 overflow-hidden">
                    <img
                      id={`recipe-image-${recipe.id}`}
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/40 transition-colors duration-300"></div>

                    {/* Time indicator */}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Clock size={12} />
                      <span>{recipe.waktu_masak || 20} min</span>
                    </div>
                  </div>

                  <div className="p-6 relative z-20">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors duration-200">
                      {recipe.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full tag-hover cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSeeMore(recipe)}
                      className="w-full py-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-400 hover:text-green-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 button-ripple font-medium"
                    >
                      Lihat Detail
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
                onClick={() => {
                  setShowModal(false);
                  setDetailedRecipe(null);
                }}
                className="float-right text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              {isLoadingDetails ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <>
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
                          <span className="font-medium">
                            {detailedRecipe?.waktu_masak ||
                              selectedRecipe.waktu_masak ||
                              20}{" "}
                            Menit
                          </span>
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

                  {/* Ingredients Section */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Bahan</h3>
                    {detailedRecipe?.bahan ? (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {parseIngredients(detailedRecipe.bahan).map(
                          (ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Data bahan tidak tersedia</p>
                    )}
                  </div>

                  {/* Cooking Steps Section */}
                  <div className="mt-8 bg-green-100 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Cara Memasak</h3>
                    {detailedRecipe?.cara_masak ? (
                      <ol className="space-y-3 text-gray-700">
                        {parseCookingSteps(detailedRecipe.cara_masak).map(
                          (step, index) => (
                            <li key={index} className="flex">
                              <span className="font-bold mr-2">
                                {index + 1}.
                              </span>
                              <span>{step}</span>
                            </li>
                          )
                        )}
                      </ol>
                    ) : (
                      <p className="text-gray-500">
                        Data cara memasak tidak tersedia
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
