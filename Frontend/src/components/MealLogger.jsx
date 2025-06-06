import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MealLogger = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userEmail: "",
    mealType: "Breakfast",
    foodName: "",
    quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    mealTime: new Date().toISOString().slice(0, 16), // Default to current datetime
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const perGramNutrition = useRef({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const updateMacrosByQuantity = (quantity) => {
    if (!quantity || quantity <= 0) {
      setFormData((prev) => ({
        ...prev,
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      }));
      return;
    }
    const qty = Number(quantity);
    const cals = perGramNutrition.current.calories * qty;
    const protein = perGramNutrition.current.protein * qty;
    const carbs = perGramNutrition.current.carbs * qty;
    const fats = perGramNutrition.current.fats * qty;

    setFormData((prev) => ({
      ...prev,
      calories: cals.toFixed(1),
      protein: protein.toFixed(1),
      carbs: carbs.toFixed(1),
      fats: fats.toFixed(1),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccessMsg("");

    if (name === "quantity") {
      setFormData((prev) => ({ ...prev, quantity: value }));
      updateMacrosByQuantity(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post("http://localhost:8080/api/meals", formData, config);

      setSuccessMsg("Meal logged successfully!");
      setFormData({
        userEmail: "",
        mealType: "Breakfast",
        foodName: "",
        quantity: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        mealTime: new Date().toISOString().slice(0, 16),
      });
      perGramNutrition.current = { calories: 0, protein: 0, carbs: 0, fats: 0 };
      setSearchResult(null);
      setSearchQuery("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log meal.");
    }

    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.get(
        `http://localhost:8080/api/nutrition/search?query=${encodeURIComponent(
          searchQuery
        )}`,
        config
      );

      setSearchResult(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setSearchError("Unauthorized. Please log in again.");
      } else {
        setSearchError("Food not found or failed to fetch data.");
      }
    }

    setSearchLoading(false);
  };

  const handleUseSearchData = () => {
    if (!searchResult) return;

    const baseQuantity = 100;
    const foodQuantity = baseQuantity;
    const calories = Number(searchResult.calories) || 0;
    const protein = Number(searchResult.protein) || 0;
    const carbs = Number(searchResult.carbs) || 0;
    const fats = Number(searchResult.fats) || 0;

    perGramNutrition.current = {
      calories: calories / foodQuantity,
      protein: protein / foodQuantity,
      carbs: carbs / foodQuantity,
      fats: fats / foodQuantity,
    };

    setFormData((prev) => ({
      ...prev,
      foodName: searchResult.foodName ?? prev.foodName,
      quantity: foodQuantity.toString(),
      calories: calories.toFixed(1),
      protein: protein.toFixed(1),
      carbs: carbs.toFixed(1),
      fats: fats.toFixed(1),
    }));

    setSuccessMsg("Data from search applied to form! Adjust quantity to update macros.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 ring-1 ring-gray-200 hover:shadow-3xl transition-shadow duration-300"
        noValidate
      >
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          Log Your Meal 🍽️
        </h2>

        {/* Email */}
        <div className="mb-6">
          <label htmlFor="userEmail" className="block mb-2 font-semibold text-gray-700">
            Email
          </label>
          <input
            id="userEmail"
            type="email"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Meal Time (Date Input) */}
        <div className="mb-6">
          <label htmlFor="mealTime" className="block mb-2 font-semibold text-gray-700">
            Meal Time (Date & Time)
          </label>
          <input
            id="mealTime"
            type="datetime-local"
            name="mealTime"
            value={formData.mealTime}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
        </div>

        {/* Meal Type */}
        <div className="mb-6">
          <label htmlFor="mealType" className="block mb-2 font-semibold text-gray-700">
            Meal Type
          </label>
          <select
            id="mealType"
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            {mealTypes.map((meal) => (
              <option key={meal} value={meal}>
                {meal}
              </option>
            ))}
          </select>
        </div>

        {/* Food Name */}
        <div className="mb-6">
          <label htmlFor="foodName" className="block mb-2 font-semibold text-gray-700">
            Food Name
          </label>
          <input
            id="foodName"
            type="text"
            name="foodName"
            value={formData.foodName}
            onChange={handleChange}
            placeholder="Grilled Chicken Breast"
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Quantity & Calories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="quantity" className="block mb-2 font-semibold text-gray-700">
              Quantity (g/serving)
            </label>
            <input
              id="quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="200"
              min="0"
              step="any"
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label htmlFor="calories" className="block mb-2 font-semibold text-gray-700">
              Calories
            </label>
            <input
              id="calories"
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              placeholder="330"
              min="0"
              step="any"
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {["protein", "carbs", "fats"].map((macro) => (
            <div key={macro}>
              <label htmlFor={macro} className="block mb-2 font-semibold capitalize text-gray-700">
                {macro} (g)
              </label>
              <input
                id={macro}
                type="number"
                name={macro}
                value={formData[macro]}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="any"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          ))}
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <label htmlFor="searchQuery" className="block mb-2 font-semibold text-gray-700">
            Search Food Nutrition
          </label>
          <div className="flex gap-2">
            <input
              id="searchQuery"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Chicken"
              className="flex-grow px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searchLoading}
              className={`px-5 py-3 font-semibold text-white rounded-xl ${
                searchLoading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>
          {searchError && <p className="text-red-600 font-semibold mt-2">{searchError}</p>}
          {searchResult && (
            <div className="mt-4 p-4 border border-gray-300 rounded-xl bg-gray-50">
              <p><strong>Food Name:</strong> {searchResult.foodName ?? "N/A"}</p>
              <p><strong>Calories:</strong> {searchResult.calories ?? "N/A"}</p>
              <p><strong>Protein:</strong> {searchResult.protein ?? "N/A"} g</p>
              <p><strong>Carbs:</strong> {searchResult.carbs ?? "N/A"} g</p>
              <p><strong>Fats:</strong> {searchResult.fats ?? "N/A"} g</p>
              <button
                type="button"
                onClick={handleUseSearchData}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
              >
                Use This Data
              </button>
            </div>
          )}
        </div>

        {/* Error & Success */}
        {error && <p className="text-center text-red-600 font-semibold mb-4">{error}</p>}
        {successMsg && <p className="text-center text-green-600 font-semibold mb-4">{successMsg}</p>}

        {/* Submit & Navigate */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 font-extrabold text-lg text-white rounded-xl transition-transform duration-300 ${
            loading ? "bg-indigo-300 cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-lg"
          }`}
        >
          {loading ? "Logging..." : "Log Meal"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/meal-dashboard")}
          className="mt-6 w-full py-4 font-extrabold text-lg text-white rounded-xl bg-gradient-to-r from-green-500 to-teal-600 hover:scale-105 hover:shadow-lg transition-transform duration-300"
        >
          Go to Meal Dashboard
        </button>
      </form>
    </div>
  );
};

export default MealLogger;
