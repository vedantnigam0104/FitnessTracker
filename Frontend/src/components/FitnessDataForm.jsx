import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

const FitnessDataForm = () => {
  const { user } = useContext(UserContext);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10), // default today YYYY-MM-DD
    distanceTravelled: "",
    caloriesBurnt: "",
    waterIntake: "",
    sleepHours: "",
    workoutsDone: "", // new field
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!user) {
    return (
      <p className="text-center text-red-600 mt-12 font-semibold">
        Please login to submit your fitness data.
      </p>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers and decimal for numeric fields
    if (
      ["distanceTravelled", "caloriesBurnt","waterIntake", "sleepHours", "workoutsDone"].includes(
        name
      )
    ) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const { date, distanceTravelled, caloriesBurnt, waterIntake,sleepHours, workoutsDone } =
      formData;
    if (
      !date ||
      distanceTravelled === "" ||
      caloriesBurnt === "" ||
      waterIntake === "" ||
      sleepHours === "" ||
      workoutsDone === ""
    ) {
      setMessage({ type: "error", text: "Please fill all the fields." });
      return;
    }

    const payload = {
      userId: user.id,
      date,
      distanceTravelled: parseFloat(distanceTravelled),
      caloriesBurnt: parseFloat(caloriesBurnt),
      waterIntake: parseFloat(waterIntake),
      sleepHours: parseFloat(sleepHours),
      workoutsDone: parseInt(workoutsDone, 10), // Include water intake
    };

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post("http://localhost:8080/api/fitness-data", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: "success", text: "Data logged successfully!" });
      setFormData((prev) => ({
        ...prev,
        distanceTravelled: "",
        caloriesBurnt: "",
        waterIntake: "",
        sleepHours: "",
        workoutsDone: "",
      }));
    } catch (error) {
      console.error("Error submitting fitness data:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to submit data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-10 mt-12 border border-green-300">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-green-700 tracking-wide">
        Log Your Daily Fitness Data
      </h2>

      {message && (
        <p
          className={`mb-6 px-5 py-3 rounded-lg text-center font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          } shadow-sm`}
          role="alert"
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block mb-2 font-semibold text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            max={new Date().toISOString().slice(0, 10)}
            value={formData.date}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300"
            required
          />
        </div>

        {/* Distance Travelled */}
        <div>
          <label
            htmlFor="distanceTravelled"
            className="block mb-2 font-semibold text-gray-700"
          >
            Distance Travelled (km)
          </label>
          <input
            type="text"
            id="distanceTravelled"
            name="distanceTravelled"
            placeholder="e.g. 5.2"
            value={formData.distanceTravelled}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300"
            required
          />
        </div>

        {/* Calories Burnt */}
        <div>
          <label htmlFor="caloriesBurnt" className="block mb-2 font-semibold text-gray-700">
            Calories Burnt
          </label>
          <input
            type="text"
            id="caloriesBurnt"
            name="caloriesBurnt"
            placeholder="e.g. 300"
            value={formData.caloriesBurnt}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300"
            required
          />
        </div>
        <div>
          <label htmlFor="waterIntake" className="block mb-2 font-semibold text-gray-700">
            Water Intake (litres before sleep)
          </label>
          <input
            type="text"
            id="waterIntake"
            name="waterIntake"
            placeholder="e.g. 1.5"
            value={formData.waterIntake}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300"
            required
          />
        </div>
        {/* Sleep Hours */}
        <div>
          <label htmlFor="sleepHours" className="block mb-2 font-semibold text-gray-700">
            Sleep Hours
          </label>
          <input
            type="text"
            id="sleepHours"
            name="sleepHours"
            placeholder="e.g. 7.5"
            value={formData.sleepHours}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300"
            required
          />
        </div>

        {/* Workouts Done */}
        <div>
          <label htmlFor="workoutsDone" className="block mb-2 font-semibold text-gray-700">
            Workouts Done (count)
          </label>
          <input
            type="text"
            id="workoutsDone"
            name="workoutsDone"
            placeholder="e.g. 2"
            value={formData.workoutsDone}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 rounded-2xl transition duration-300 ease-in-out shadow-lg hover:shadow-xl"
        >
          {loading ? "Logging..." : "Log Data"}
        </button>
      </form>
    </div>
  );
};

export default FitnessDataForm;
