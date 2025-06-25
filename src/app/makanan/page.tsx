"use client";

import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface FoodItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

export default function MakananPage() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [porsiMap, setPorsiMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/makanan")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFoodItems(data.makanan);
        }
      });
  }, []);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
    // In a real app, you would filter foodItems based on searchValue
  };

  const openFoodDetail = (food: FoodItem) => {
    setSelectedFood(food);
    setShowModal(true);
  };

  const handleSaveFood = () => {
    if (selectedFood) {
      const porsiInput = document.getElementById(
        "porsi-input"
      ) as HTMLInputElement;
      const jumlah = porsiInput ? parseFloat(porsiInput.value) : 100;
      setPorsiMap((prev) => ({ ...prev, [selectedFood.id]: jumlah }));

      if (!checkedItems.includes(selectedFood.id)) {
        setCheckedItems((prev) => [...prev, selectedFood.id]);
      }
    }
    setShowModal(false);
  };

  const checkedFoods = foodItems.filter((food) =>
    checkedItems.includes(food.id)
  );

  const handleSaveChecklist = async () => {
    const anak_id = localStorage.getItem("anak_id");
    if (!anak_id) return alert("Anak belum dipilih!");

    const tanggal = new Date().toISOString().split("T")[0];
    const params = new URLSearchParams(window.location.search);
    const mealParam = params.get("meal");

    const enumMap = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
    } as const;

    const totalGizi = checkedFoods.reduce(
      (acc, food) => {
        const porsi = porsiMap[food.id] || 100;
        const factor = porsi / 100;
        acc.kalori += food.calories * factor;
        acc.protein += food.protein * factor;
        acc.lemak += food.fat * factor;
        acc.karbo += food.carbs * factor;
        return acc;
      },
      { kalori: 0, protein: 0, lemak: 0, karbo: 0 }
    );

    const jam_makan = enumMap[mealParam as keyof typeof enumMap]; // (bisa kamu ubah dari query param / dropdown)
    const status_gizi =
      totalGizi.kalori >= 500 &&
      totalGizi.protein >= 10 &&
      totalGizi.lemak >= 10 &&
      totalGizi.karbo >= 40
        ? "sudah terpenuhi"
        : "belum terpenuhi";

    const makanan = checkedFoods.map((food) => ({
      id_makanan: food.id,
      jumlah_porsi: (porsiMap[food.id] || 100) / 100,
    }));

    const payload = {
      anak_id,
      jam_makan,
      tanggal,
      status_gizi,
      makanan,
    };

    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        console.error("SERVER RESPONSE:", result);
        throw new Error(result.error || "Unknown server error");
      }
      alert("Makanan berhasil disimpan ke tracker!");
      console.log(result);
      window.location.href = "/tracker"; // ⬅️ redirect otomatis
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert("Gagal menyimpan makanan ke tracker.");
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans relative pb-20">
      <Navbar />

      <div className="px-4 sm:px-8 lg:px-12 mt-6 sm:mt-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8"
        >
          Cari Makanan Kamu!
        </motion.h1>
        <nav className="text-sm text-gray-500 mb-4 ml-5">
          <span>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700"
            >
              Home
            </Link>
          </span>
          <span>
            <span className="mx-2">›</span>
            <Link href="/tracker" className="text-gray-500 hover:text-gray-700">
              Tracker
            </Link>
          </span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Makanan</span>
        </nav>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#ACD3A8] rounded-xl flex flex-col lg:flex-row items-center justify-between relative mx-0 sm:mx-4 py-6 sm:py-8"
        >
          <div className="w-full lg:w-1/2 space-y-4 px-6 sm:px-10 pr-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#263A29] uppercase">
              Masukkan Nama Makanan Anda!
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Masukkan nama makanan"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-white rounded-lg px-4 py-3 flex-1 outline-none placeholder:text-gray-500 text-black shadow-sm"
              />
              <button
                onClick={handleSearch}
                className="bg-[#6FCF97] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5bb381] transition-all shadow-sm whitespace-nowrap"
              >
                Cari Makanan
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#263A29] font-semibold">
              Pastikan nama makananmu sudah benar!
            </p>
          </div>

          <div className="w-full lg:w-1/2 mt-6 lg:mt-0 flex justify-center lg:justify-end px-6 lg:px-0">
            <div className="sm:h-56 h-full flex items-center justify-center">
              <div className="flex items-center justify-center">
                <img
                  src={"/image/ayam.png"}
                  alt="Ayam"
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 mt-8 sm:mt-10 flex items-center justify-between border-b pb-2">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl sm:text-2xl font-extrabold text-black"
        >
          Find It Here!
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-xs sm:text-sm text-gray-700"
        >
          {checkedItems.length} item Checked <Check className="w-4 h-4" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {foodItems.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            className="bg-gradient-to-br from-[#EAF4FB] to-[#F0F7FF] border border-black rounded-xl shadow-sm p-4 flex flex-col justify-between transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-3">
                <h3 className="text-base sm:text-lg font-bold mb-2 text-black">
                  {food.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {food.description}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleCheck(food.id)}
                className={`w-6 h-6 sm:w-7 sm:h-7 mt-1 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                  checkedItems.includes(food.id)
                    ? "bg-[#6FCF97] border-[#6FCF97] text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                {checkedItems.includes(food.id) && (
                  <Check className="w-4 h-4" />
                )}
              </motion.button>
            </div>
            <div className="text-right mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs sm:text-sm border bg-green-300 border-[#6FCF97] px-3 sm:px-4 py-1 rounded text-[#263A29] hover:bg-[#6FCF97] hover:text-white font-semibold transition-colors"
                onClick={() => openFoodDetail(food)}
              >
                See Detail
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Checklist Panel - Bottom Left */}
      {checkedItems.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className="bg-[#6FCF97] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5bb381] transition-all shadow-lg flex gap-2 items-center"
            >
              {showChecklist ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
              Checklist ({checkedItems.length})
            </button>

            <AnimatePresence>
              {showChecklist && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto p-3">
                    {checkedFoods.length > 0 ? (
                      <ul className="space-y-2">
                        {checkedFoods.map((food) => (
                          <motion.li
                            key={food.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm font-medium">
                              {food.name}
                            </span>
                            <button
                              onClick={() => toggleCheck(food.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Belum ada makanan yang dipilih
                      </p>
                    )}
                  </div>
                  {checkedFoods.length > 0 && (
                    <div className="border-t p-3 bg-gray-50">
                      <button
                        className="w-full bg-[#6FCF97] text-white py-2 rounded font-semibold hover:bg-[#5bb381] transition-colors text-sm"
                        onClick={handleSaveChecklist}
                      >
                        Simpan Semua
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showModal && selectedFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 px-4"
          >
            {/* BACKDROP HITAM TRANSPARAN */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => setShowModal(false)}
            ></motion.div>

            {/* KONTEN MODAL */}
            <div className="relative z-10 flex items-center justify-center min-h-full py-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md relative shadow-lg max-h-[90vh] overflow-y-auto"
              >
                {/* Tombol Close */}
                <button
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-black transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Judul */}
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-[#1A1A1A] pr-8">
                  {selectedFood.name}
                </h2>

                {/* Konten */}
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-800">
                  <div className="flex justify-between font-semibold text-[#263A29]">
                    <span>Ukuran Porsi</span>
                    <span>100 gr</span>
                  </div>

                  {/* Garis Hijau */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-2 bg-[#C8E6C9] rounded-full origin-left"
                  ></motion.div>

                  {/* Nutrition Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block font-semibold text-[#263A29]">
                      Kalori
                    </label>
                    <div className="h-[2px] bg-[#263A29] mb-1"></div>
                    <p className="text-gray-600 text-right text-xs sm:text-sm">
                      {selectedFood.calories}kkal
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block font-semibold text-[#263A29]">
                      Karbohidrat
                    </label>
                    <div className="h-[2px] bg-[#263A29] mb-1"></div>
                    <p className="text-gray-600 text-right text-xs sm:text-sm">
                      {selectedFood.carbs} gr
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block font-semibold text-[#263A29]">
                      Lemak
                    </label>
                    <div className="h-[2px] bg-[#263A29] mb-1"></div>
                    <p className="text-gray-600 text-right text-xs sm:text-sm">
                      {selectedFood.fat} gr
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block font-semibold text-[#263A29]">
                      Protein
                    </label>
                    <div className="h-[2px] bg-[#263A29] mb-1"></div>
                    <p className="text-gray-600 text-right text-xs sm:text-sm">
                      {selectedFood.protein} gr
                    </p>
                  </motion.div>

                  {/* Tambah ke catatan */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-3 sm:mt-4"
                  >
                    <p className="font-semibold text-[#263A29] mb-2">
                      Tambah ke Catatan Makanan
                    </p>
                    <div className="flex gap-2">
                      <input
                        id="porsi-input"
                        type="number"
                        defaultValue={100}
                        className="w-20 sm:w-24 border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm"
                      />
                      <select className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm flex-1">
                        <option value="g">gram (g)</option>
                        <option value="ml">ml</option>
                      </select>
                    </div>
                  </motion.div>

                  {/* Tombol Simpan */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveFood}
                    className="mt-4 sm:mt-6 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 font-semibold transition-colors text-sm sm:text-base"
                  >
                    Simpan
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
