import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddGoalForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userEmail: "",
    date: "",
    type: "",
    subType: "",
    targetValue: ""
  });

  const goalTypes = [
    "calories_burned",
    "calories_intake",
    "water_intake",
    "distance",
    "sleep",
    "protein",
    "carbs",
    "fats",
    "amount_of_workout_done"
  ];

  const workoutSubTypes = [
    "cycling",
    "swimming",
    "crossfit",
    "pilates",
    "hiit",
    "cardio",
    "strength_training",
    "yoga",
    "running"
  ];

  const getUnitForGoal = (type) => {
    switch (type) {
      case "calories_burned":
      case "calories_intake":
        return "kcal";
      case "water_intake":
        return "L";
      case "distance":
        return "km";
      case "sleep":
        return "hour";
      case "amount_of_workout_done":
        return "minutes";
      case "protein":
      case "carbs":
      case "fats":
        return "g";
      default:
        return "";
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.email) {
      setFormData((prev) => ({ ...prev, userEmail: user.email }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const fullType =
        formData.type === "amount_of_workout_done" && formData.subType
          ? `workout_${formData.subType}`
          : formData.type;

      const payload = {
        ...formData,
        type: fullType,
        unit: getUnitForGoal(formData.type)
      };

      delete payload.subType;

      await axios.post("http://localhost:8080/api/goals", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("🎯 Goal added successfully!");

      setFormData({
        userEmail: formData.userEmail,
        date: "",
        type: "",
        subType: "",
        targetValue: ""
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      alert("❌ Failed to add goal.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Set Your Fitness Goal
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Goal Type</option>
              {goalTypes.map((goal) => (
                <option key={goal} value={goal}>
                  {goal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {formData.type === "amount_of_workout_done" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workout Subtype
              </label>
              <select
                name="subType"
                value={formData.subType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Workout Type</option>
                {workoutSubTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Value
            </label>
            <input
              type="number"
              name="targetValue"
              value={formData.targetValue}
              onChange={handleChange}
              placeholder="Enter value (e.g., 500)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-colors text-white font-bold py-2 rounded-xl shadow-md"
          >
            ➕ Add Goal
          </button>
        </form>
      </div>

      <button
        onClick={() => navigate("/goals-dashboard")}
        className="mt-6 text-white bg-purple-600 hover:bg-purple-700 px-6 py-3 font-semibold text-lg rounded-full shadow-xl transition duration-300"
      >
        📊 Go to Goals Dashboard
      </button>
    </div>
  );
};

export default AddGoalForm;
