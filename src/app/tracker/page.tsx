"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Calendar,
  Utensils,
  Sun,
  Coffee,
  User,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Link from "next/link";

interface ChildData {
  id: string;
  name: string;
  weight: number;
  height: number;
  birthDate: Date;
  gender: string;
}

interface MealData {
  id: string;
  name: string;
  fat: number;
  carb: number;
  protein: number;
  calories: number;
}

interface MealEntry {
  mealType: "breakfast" | "lunch" | "dinner";
  data: MealData[];
}

export default function TrackerPage() {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [mealEntries, setMealEntries] = useState<Record<string, MealEntry[]>>(
    {}
  );
  const [dropdownMeal, setDropdownMeal] = useState<{
    mealType: string;
    isOpen: boolean;
  }>({ mealType: "", isOpen: false });
  const [statusGizi, setStatusGizi] = useState("belum terpenuhi");
  const [nutritionData, setNutritionData] = useState({
    total: { fat: 0, carb: 0, protein: 0, calories: 0 },
    breakfast: { fat: 0, carb: 0, protein: 0, calories: 0 },
    lunch: { fat: 0, carb: 0, protein: 0, calories: 0 },
    dinner: { fat: 0, carb: 0, protein: 0, calories: 0 },
  });

  useEffect(() => {
    if (!selectedChild) return;
    const dateKey = selectedDay.toISOString().split("T")[0];

    fetch(`/api/tracker?anak_id=${selectedChild.id}&tanggal=${dateKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMealEntries((prev) => ({ ...prev, [dateKey]: data.meals }));

          // Calculate total nutrition for the day
          const totalNutrition = { fat: 0, carb: 0, protein: 0, calories: 0 };
          const mealNutrition = {
            breakfast: { fat: 0, carb: 0, protein: 0, calories: 0 },
            lunch: { fat: 0, carb: 0, protein: 0, calories: 0 },
            dinner: { fat: 0, carb: 0, protein: 0, calories: 0 },
          };

          data.meals.forEach((entry: any) => {
            entry.data.forEach((meal: MealData) => {
              // Convert to number to ensure addition, not concatenation
              const mealFat = Number(meal.fat) || 0;
              const mealCarb = Number(meal.carb) || 0;
              const mealProtein = Number(meal.protein) || 0;
              const mealCalories = Number(meal.calories) || 0;

              totalNutrition.fat += mealFat;
              totalNutrition.carb += mealCarb;
              totalNutrition.protein += mealProtein;
              totalNutrition.calories += mealCalories;

              if (entry.mealType === "breakfast") {
                mealNutrition.breakfast.fat += mealFat;
                mealNutrition.breakfast.carb += mealCarb;
                mealNutrition.breakfast.protein += mealProtein;
                mealNutrition.breakfast.calories += mealCalories;
              } else if (entry.mealType === "lunch") {
                mealNutrition.lunch.fat += mealFat;
                mealNutrition.lunch.carb += mealCarb;
                mealNutrition.lunch.protein += mealProtein;
                mealNutrition.lunch.calories += mealCalories;
              } else if (entry.mealType === "dinner") {
                mealNutrition.dinner.fat += mealFat;
                mealNutrition.dinner.carb += mealCarb;
                mealNutrition.dinner.protein += mealProtein;
                mealNutrition.dinner.calories += mealCalories;
              }
            });
          });

          setNutritionData({
            total: totalNutrition,
            breakfast: mealNutrition.breakfast,
            lunch: mealNutrition.lunch,
            dinner: mealNutrition.dinner,
          });

          // Update nutrition status
          const terpenuhi =
            totalNutrition.calories >= 500 &&
            totalNutrition.protein >= 10 &&
            totalNutrition.fat >= 10 &&
            totalNutrition.carb >= 40;

          setStatusGizi(terpenuhi ? "sudah terpenuhi" : "belum terpenuhi");
        }
      });
  }, [selectedChild, selectedDay]);

  const formatDayHeader = (date: Date): string => {
    const today = new Date();
    return date.toDateString() === today.toDateString()
      ? "Today"
      : date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  };

  useEffect(() => {
    fetch("/api/anak")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setChildren(data.children);
      });
  }, []);

  useEffect(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(
      currentDate.getDate() -
        currentDate.getDay() +
        (currentDate.getDay() === 0 ? -6 : 1)
    );
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [currentDate]);

  const toggleMealDropdown = (mealType: string) => {
    setDropdownMeal((prev) => ({
      mealType: prev.mealType === mealType && prev.isOpen ? "" : mealType,
      isOpen: prev.mealType !== mealType || !prev.isOpen,
    }));
  };

  const getMealsForDay = (mealType: "breakfast" | "lunch" | "dinner") => {
    const dateKey = selectedDay.toISOString().split("T")[0];
    const entries = mealEntries[dateKey] || [];
    const mealEntry = entries.find((entry) => entry.mealType === mealType);
    return mealEntry ? mealEntry.data : [];
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const isSelectedDay = (date: Date) => {
    return date.toDateString() === selectedDay.toDateString();
  };

  const isPastDay = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date < today;
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedDay(date);
    setShowCalendar(false);
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentCalendarDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekArray = [];
      for (let day = 0; day < 7; day++) {
        weekArray.push(new Date(currentCalendarDate));
        currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
      }
      calendar.push(weekArray);
    }

    return calendar;
  };

  const addMealEntry = (mealType: "breakfast" | "lunch" | "dinner") => {
    const dateKey = selectedDay.toISOString().split("T")[0];
    const newMeal: MealData = {
      id: "contoh-id",
      name: "Nasi Goreng",
      fat: 15,
      carb: 50,
      protein: 10,
      calories: 350,
    };
    setMealEntries((prev) => {
      const entries = prev[dateKey] || [];
      const idx = entries.findIndex((e) => e.mealType === mealType);
      if (idx >= 0) {
        const updated = [...entries];
        updated[idx] = {
          ...updated[idx],
          data: [...updated[idx].data, newMeal],
        };
        return { ...prev, [dateKey]: updated };
      } else {
        return {
          ...prev,
          [dateKey]: [...entries, { mealType, data: [newMeal] }],
        };
      }
    });
    setDropdownMeal({ mealType: "", isOpen: false });
  };

  const submitTracking = async () => {
    if (!selectedChild) return alert("Pilih anak terlebih dahulu");
    const dateKey = selectedDay.toISOString().split("T")[0];
    const entries = mealEntries[dateKey] || [];

    for (const entry of entries) {
      const makanan = entry.data.map((meal) => ({
        id_makanan: meal.id,
        jumlah_porsi: 1,
      }));

      const totalGizi = entry.data.reduce(
        (acc, meal) => {
          // Ensure numbers are properly added, not concatenated
          acc.kalori += Number(meal.calories) || 0;
          acc.protein += Number(meal.protein) || 0;
          acc.lemak += Number(meal.fat) || 0;
          acc.karbo += Number(meal.carb) || 0;
          return acc;
        },
        { kalori: 0, protein: 0, lemak: 0, karbo: 0 }
      );

      const statusGizi =
        totalGizi.kalori >= 500 &&
        totalGizi.protein >= 10 &&
        totalGizi.lemak >= 10 &&
        totalGizi.karbo >= 40
          ? "sudah terpenuhi"
          : "belum terpenuhi";

      const payload = {
        anak_id: selectedChild.id,
        jam_makan:
          entry.mealType === "breakfast"
            ? "Breakfast"
            : entry.mealType === "lunch"
            ? "Lunch"
            : "Dinner",
        tanggal: dateKey,
        status_gizi: statusGizi,
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
        if (!res.ok) throw new Error(result.error);
        console.log("Success:", result);
        // Refetch data agar hasil terbaru muncul di UI
        const refreshed = await fetch(
          `/api/tracker?anak_id=${selectedChild.id}&tanggal=${dateKey}`
        );
        const refreshedData = await refreshed.json();
        if (refreshedData.success) {
          setMealEntries((prev) => ({
            ...prev,
            [dateKey]: refreshedData.meals,
          }));
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Gagal menyimpan tracking");
      }
    }
    alert("Tracking berhasil disimpan!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
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
          <span className="text-gray-900 font-medium">Tracker</span>
        </nav>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - 50% width */}
          <div className="w-full lg:w-1/2 bg-[#BBD8A3] rounded-lg p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Tracking
              </h1>
              <p className="text-gray-700">
                Track Makanan anak anda, untuk perjalanan anak yang lebih baik!
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="child-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pilih Anak
              </label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-gray-500" />
                    <span
                      className={
                        selectedChild ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {selectedChild ? selectedChild.name : "Pilih anak"}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSelectedChild(child);
                          setDropdownOpen(false);
                          localStorage.setItem("anak_id", child.id);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-900">{child.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full overflow-auto">
              <img
                src="image/tracker.png"
                className="w-[150%] h-auto object-contain"
              />
            </div>
          </div>

          {/* Right Section - 50% width */}
          <div className="w-full lg:w-1/2 border-2 border-black rounded-lg overflow-hidden">
            {/* Header with calendar */}
            <div className="bg-white p-4 border-b-2 border-black">
              {/* Date selector with calendar */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevWeek}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  &lt;
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex items-center gap-2 text-xl font-semibold hover:bg-gray-100 p-2 rounded"
                  >
                    <Calendar size={20} />
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </button>

                  {/* Calendar Dropdown */}
                  {showCalendar && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-[100] w-64">
                      <div className="flex justify-between items-center mb-2">
                        <button
                          onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setCurrentDate(newDate);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          &lt;
                        </button>
                        <span className="font-medium">
                          {currentDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setCurrentDate(newDate);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          &gt;
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-sm">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                          <div
                            key={day}
                            className="text-center font-medium p-1"
                          >
                            {day}
                          </div>
                        ))}
                        {generateCalendar().map((week, weekIndex) =>
                          week.map((day, dayIndex) => (
                            <button
                              key={`${weekIndex}-${dayIndex}`}
                              onClick={() => handleDateChange(day)}
                              className={`p-1 text-center hover:bg-blue-100 rounded ${
                                day.getMonth() === currentDate.getMonth()
                                  ? "text-black"
                                  : "text-gray-400"
                              } ${
                                day.toDateString() ===
                                selectedDay.toDateString()
                                  ? "bg-blue-500 text-white"
                                  : ""
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextWeek}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  &gt;
                </button>
              </div>

              {/* Week days progress with connected lines */}
              <div className="flex justify-between items-center relative">
                {/* Background line */}
                <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 z-0"></div>

                {weekDays.map((day, index) => {
                  const isCompleted = isPastDay(day);
                  const isSelected = isSelectedDay(day);

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center cursor-pointer z-10"
                      onClick={() => setSelectedDay(day)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                          ${
                            isCompleted
                              ? "bg-green-500 border-green-500 text-white"
                              : isSelected
                              ? "border-green-500 bg-white"
                              : "border-gray-300 bg-white"
                          }`}
                      >
                        {isCompleted && (
                          <Check size={16} className="text-white" />
                        )}
                      </div>
                      <span className="text-xs mt-1">
                        {day.toLocaleDateString("en-US", {
                          weekday: "narrow",
                        })}
                      </span>
                    </div>
                  );
                })}

                {/* Progress line overlay */}
                <div
                  className="absolute top-5 left-5 h-1 bg-green-500 z-0"
                  style={{
                    width: `${Math.max(
                      0,
                      ((weekDays.filter((day) => isPastDay(day)).length - 1) /
                        Math.max(1, weekDays.length - 1)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Main content */}
            <div className="bg-[#EDF6FF] p-6 min-h-[400px]">
              <h3 className="text-lg font-semibold mb-4">
                {formatDayHeader(selectedDay)}
              </h3>
              {/* Nutrition totals */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="font-medium">Lemak</div>
                  <div>{Math.round(nutritionData.total.fat * 100) / 100}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Karbo</div>
                  <div>{Math.round(nutritionData.total.carb * 100) / 100}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Protein</div>
                  <div>
                    {Math.round(nutritionData.total.protein * 100) / 100}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Kalori</div>
                  <div>
                    {Math.round(nutritionData.total.calories * 100) / 100}kcal
                  </div>
                </div>
              </div>
              {/* Meal cards */}
              <div className="space-y-4 mb-6">
                {/* Breakfast */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="flex justify-between items-center p-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Coffee size={20} color="#0571FF" />
                      <h4 className="font-medium">Breakfast</h4>
                    </div>
                    <div className="relative">
                      <Link
                        href={"/makanan?meal=breakfast"}
                        className="text-green-500 hover:text-green-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                      >
                        <Plus size={20} />
                      </Link>
                    </div>
                  </div>
                  <div className="bg-[#EDF6FF] p-3">
                    {getMealsForDay("breakfast").length > 0 ? (
                      <>
                        <div className="grid grid-cols-4 gap-4 mb-2 font-medium">
                          <div className="text-center">Nama</div>
                          <div className="text-center">Lemak</div>
                          <div className="text-center">Karbo</div>
                          <div className="text-center">Protein</div>
                        </div>
                        {getMealsForDay("breakfast").map((meal, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-4 gap-4 mb-2"
                          >
                            <div className="text-center">{meal.name}</div>
                            <div className="text-center">
                              {Number(meal.fat) || 0}g
                            </div>
                            <div className="text-center">
                              {Number(meal.carb) || 0}g
                            </div>
                            <div className="text-center">
                              {Number(meal.protein) || 0}g
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-2">
                        Belum ada makanan
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-4 mt-2 pt-2 border-t border-gray-200">
                      <div className="text-center font-medium">Total</div>
                      <div className="text-center">
                        {Math.round(nutritionData.breakfast.fat * 100) / 100}g
                      </div>
                      <div className="text-center">
                        {Math.round(nutritionData.breakfast.carb * 100) / 100}g
                      </div>
                      <div className="text-center">
                        {Math.round(nutritionData.breakfast.protein * 100) /
                          100}
                        g
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lunch */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="flex justify-between items-center p-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Sun size={20} color="#FFB109" />
                      <h4 className="font-medium">Lunch</h4>
                    </div>
                    <div className="relative">
                      <Link
                        href={"/makanan?meal=lunch"}
                        className="text-green-500 hover:text-green-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                      >
                        <Plus size={20} />
                      </Link>
                    </div>
                  </div>
                  <div className="bg-[#EDF6FF] p-3">
                    {getMealsForDay("lunch").length > 0 ? (
                      <>
                        <div className="grid grid-cols-4 gap-4 mb-2 font-medium">
                          <div className="text-center">Nama</div>
                          <div className="text-center">Lemak</div>
                          <div className="text-center">Karbo</div>
                          <div className="text-center">Protein</div>
                        </div>
                        {getMealsForDay("lunch").map((meal, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-4 gap-4 mb-2"
                          >
                            <div className="text-center">{meal.name}</div>
                            <div className="text-center">
                              {Number(meal.fat) || 0}g
                            </div>
                            <div className="text-center">
                              {Number(meal.carb) || 0}g
                            </div>
                            <div className="text-center">
                              {Number(meal.protein) || 0}g
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-2">
                        Belum ada makanan
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-4 mt-2 pt-2 border-t border-gray-200">
                      <div className="text-center font-medium">Total</div>
                      <div className="text-center">
                        {Math.round(nutritionData.lunch.fat * 100) / 100}g
                      </div>
                      <div className="text-center">
                        {Math.round(nutritionData.lunch.carb * 100) / 100}g
                      </div>
                      <div className="text-center">
                        {Math.round(nutritionData.lunch.protein * 100) / 100}g
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dinner */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="flex justify-between items-center p-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Utensils size={20} color="#6106B6" />
                      <h4 className="font-medium">Dinner</h4>
                    </div>
                    <div className="relative">
                      <div className="relative">
                        <Link
                          href={"/makanan?meal=dinner"}
                          className="text-green-500 hover:text-green-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                        >
                          <Plus size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#EDF6FF] p-3">
                    {getMealsForDay("dinner").length > 0 ? (
                      <>
                        <div className="grid grid-cols-4 gap-4 mb-2 font-medium">
                          <div className="text-center">Nama</div>
                          <div className="text-center">Lemak</div>
                          <div className="text-center">Karbo</div>
                          <div className="text-center">Protein</div>
                        </div>
                        {getMealsForDay("dinner").map((meal, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-4 gap-4 mb-2"
                          >
                            <div className="text-center">{meal.name}</div>
                            <div className="text-center">
                              {Number(meal.fat) || 0}g
                            </div>
                            <div className="text-center">
                              {Number(meal.carb) || 0}g
                            </div>
                            <div className="text-center">
                              {Number(meal.protein) || 0}g
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-2">
                        Belum ada makanan
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-4 mt-2 pt-2 border-t border-gray-200">
                      <div className="text-center font-medium">Total</div>
                      <div className="text-center">
                        {Math.round(nutritionData.dinner.fat * 100) / 100}g
                      </div>
                      <div className="text-center">
                        {Math.round(nutritionData.dinner.carb * 100) / 100}g
                      </div>
                      <div className="text-center">
                        {Math.round(nutritionData.dinner.protein * 100) / 100}g
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition status */}
              <div
                className={`p-4 rounded-lg border text-center ${
                  statusGizi === "sudah terpenuhi"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p
                  className={
                    statusGizi === "sudah terpenuhi"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {statusGizi === "sudah terpenuhi"
                    ? "Kebutuhan Gizi Hari Ini Sudah Terpenuhi"
                    : "Kebutuhan Gizi Hari Ini Belum Terpenuhi"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
