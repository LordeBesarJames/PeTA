"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Utensils,
  Coffee,
  Sun,
  User,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

// Types
interface ChildData {
  id: string;
  name: string;
  weight: number;
  height: number;
  birthDate: Date;
  gender: string;
}

interface MealData {
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
  // State for children data and selected child
  const [children, setChildren] = useState<ChildData[]>([
    {
      id: "1",
      name: "Rayhan Aurelia",
      weight: 20.1,
      height: 175,
      birthDate: new Date("2015-03-10"),
      gender: "Male",
    },
    {
      id: "2",
      name: "Anisa Putri",
      weight: 18.3,
      height: 162,
      birthDate: new Date("2016-07-22"),
      gender: "Female",
    },
    {
      id: "3",
      name: "Fahri Ramadhan",
      weight: 22.0,
      height: 170,
      birthDate: new Date("2014-11-05"),
      gender: "Male",
    },
    {
      id: "4",
      name: "Citra Ayu",
      weight: 19.5,
      height: 160,
      birthDate: new Date("2017-01-15"),
      gender: "Female",
    },
  ]);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // State for current week tracking
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Nutrition data state
  const [nutritionData, setNutritionData] = useState({
    total: { fat: 0, carb: 0, protein: 0, calories: 0 },
    breakfast: { fat: 0, carb: 0, protein: 0, calories: 0 },
    lunch: { fat: 0, carb: 0, protein: 0, calories: 0 },
    dinner: { fat: 0, carb: 0, protein: 0, calories: 0 },
  });

  // Meal entries state
  const [mealEntries, setMealEntries] = useState<Record<string, MealEntry[]>>(
    {}
  );
  const [dropdownMeal, setDropdownMeal] = useState<{
    mealType: string;
    isOpen: boolean;
  }>({ mealType: "", isOpen: false });

  // Generate week days when currentDate changes
  useEffect(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(
      currentDate.getDate() -
        currentDate.getDay() +
        (currentDate.getDay() === 0 ? -6 : 1)
    ); // Adjust to Monday as first day

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    setWeekDays(days);
  }, [currentDate]);

  // Calculate nutrition data when meal entries change
  useEffect(() => {
    const dateKey = selectedDay.toISOString().split("T")[0];
    const entries = mealEntries[dateKey] || [];

    const newNutritionData = {
      total: { fat: 0, carb: 0, protein: 0, calories: 0 },
      breakfast: { fat: 0, carb: 0, protein: 0, calories: 0 },
      lunch: { fat: 0, carb: 0, protein: 0, calories: 0 },
      dinner: { fat: 0, carb: 0, protein: 0, calories: 0 },
    };

    entries.forEach((entry) => {
      entry.data.forEach((meal) => {
        newNutritionData[entry.mealType].fat += meal.fat;
        newNutritionData[entry.mealType].carb += meal.carb;
        newNutritionData[entry.mealType].protein += meal.protein;
        newNutritionData[entry.mealType].calories += meal.calories;

        newNutritionData.total.fat += meal.fat;
        newNutritionData.total.carb += meal.carb;
        newNutritionData.total.protein += meal.protein;
        newNutritionData.total.calories += meal.calories;
      });
    });

    setNutritionData(newNutritionData);
  }, [mealEntries, selectedDay]);

  // Format date to "Today" if it's the current day
  const formatDayHeader = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString()
      ? "Today"
      : date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  };

  // Handle week navigation
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

  // Check if a date is the selected day
  const isSelectedDay = (date: Date) => {
    return date.toDateString() === selectedDay.toDateString();
  };

  // Check if a date is in the past (for completed days)
  const isPastDay = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    return date < today;
  };

  // Handle calendar date selection
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedDay(date);
    setShowCalendar(false);
  };

  // Generate calendar for date picker
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

  // Add meal entry (simulated)
  const addMealEntry = (mealType: "breakfast" | "lunch" | "dinner") => {
    const dateKey = selectedDay.toISOString().split("T")[0];
    const newMeal: MealData = {
      name: "Nasi Goreng",
      fat: 15,
      carb: 50,
      protein: 10,
      calories: 350,
    };

    setMealEntries((prev) => {
      const existingEntries = prev[dateKey] || [];
      const mealEntryIndex = existingEntries.findIndex(
        (entry) => entry.mealType === mealType
      );

      if (mealEntryIndex >= 0) {
        // Add to existing meal type
        const updatedEntries = [...existingEntries];
        updatedEntries[mealEntryIndex] = {
          ...updatedEntries[mealEntryIndex],
          data: [...updatedEntries[mealEntryIndex].data, newMeal],
        };
        return {
          ...prev,
          [dateKey]: updatedEntries,
        };
      } else {
        // Create new meal type entry
        return {
          ...prev,
          [dateKey]: [...existingEntries, { mealType, data: [newMeal] }],
        };
      }
    });

    setDropdownMeal({ mealType: "", isOpen: false });
  };

  // Toggle meal dropdown
  const toggleMealDropdown = (mealType: string) => {
    setDropdownMeal((prev) => ({
      mealType: prev.mealType === mealType && prev.isOpen ? "" : mealType,
      isOpen: prev.mealType !== mealType || !prev.isOpen,
    }));
  };

  // Get meals for selected day and meal type
  const getMealsForDay = (mealType: "breakfast" | "lunch" | "dinner") => {
    const dateKey = selectedDay.toISOString().split("T")[0];
    const entries = mealEntries[dateKey] || [];
    const mealEntry = entries.find((entry) => entry.mealType === mealType);
    return mealEntry ? mealEntry.data : [];
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
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

            <div className="flex justify-center items-center h-64">
              {/* Placeholder for image */}
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Tracker Image</span>
              </div>
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
                  <div>{nutritionData.total.fat}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Karbo</div>
                  <div>{nutritionData.total.carb}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Protein</div>
                  <div>{nutritionData.total.protein}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Kalori</div>
                  <div>{nutritionData.total.calories}kcal</div>
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
                      <button
                        onClick={() => toggleMealDropdown("breakfast")}
                        className="text-green-500 hover:text-green-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                      >
                        <Plus size={20} />
                      </button>
                      {dropdownMeal.mealType === "breakfast" &&
                        dropdownMeal.isOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <Link
                              href="/makanan?meal=breakfast"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Tambah Makanan
                            </Link>
                            <button
                              onClick={() => addMealEntry("breakfast")}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Tambah Contoh
                            </button>
                          </div>
                        )}
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
                            <div className="text-center">{meal.fat}g</div>
                            <div className="text-center">{meal.carb}g</div>
                            <div className="text-center">{meal.protein}g</div>
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
                        {nutritionData.breakfast.fat}g
                      </div>
                      <div className="text-center">
                        {nutritionData.breakfast.carb}g
                      </div>
                      <div className="text-center">
                        {nutritionData.breakfast.protein}g
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
                      <button
                        onClick={() => toggleMealDropdown("lunch")}
                        className="text-green-500 hover:text-green-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                      >
                        <Plus size={20} />
                      </button>
                      {dropdownMeal.mealType === "lunch" &&
                        dropdownMeal.isOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <Link
                              href="/makanan?meal=lunch"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Tambah Makanan
                            </Link>
                            <button
                              onClick={() => addMealEntry("lunch")}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Tambah Contoh
                            </button>
                          </div>
                        )}
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
                            <div className="text-center">{meal.fat}g</div>
                            <div className="text-center">{meal.carb}g</div>
                            <div className="text-center">{meal.protein}g</div>
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
                        {nutritionData.lunch.fat}g
                      </div>
                      <div className="text-center">
                        {nutritionData.lunch.carb}g
                      </div>
                      <div className="text-center">
                        {nutritionData.lunch.protein}g
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
                      <button
                        onClick={() => toggleMealDropdown("dinner")}
                        className="text-green-500 hover:text-green-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                      >
                        <Plus size={20} />
                      </button>
                      {dropdownMeal.mealType === "dinner" &&
                        dropdownMeal.isOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <Link
                              href="/makanan?meal=dinner"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Tambah Makanan
                            </Link>
                            <button
                              onClick={() => addMealEntry("dinner")}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Tambah Contoh
                            </button>
                          </div>
                        )}
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
                            <div className="text-center">{meal.fat}g</div>
                            <div className="text-center">{meal.carb}g</div>
                            <div className="text-center">{meal.protein}g</div>
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
                        {nutritionData.dinner.fat}g
                      </div>
                      <div className="text-center">
                        {nutritionData.dinner.carb}g
                      </div>
                      <div className="text-center">
                        {nutritionData.dinner.protein}g
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition status */}
              <div
                className="p-4 rounded-lg border border-gray-200 text-center"
                style={{
                  backgroundColor: "rgba(220, 38, 38, 0.12)", // red-600 with 12% opacity
                  borderColor: "rgba(220, 38, 38, 0.3)", // red-600 with 30% opacity for border
                }}
              >
                <p className="text-red-600 font-medium">
                  Kebutuhan Gizi Hari Ini Belum Terpenuhi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
