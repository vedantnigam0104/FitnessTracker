import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FaCalendarAlt, FaClock, FaInfoCircle, FaArrowRight } from "react-icons/fa";

const workoutOptions = [
  { value: "Cardio", label: "Cardio" },
  { value: "Strength Training", label: "Strength Training" },
  { value: "Yoga", label: "Yoga" },
  { value: "Pilates", label: "Pilates" },
  { value: "HIIT", label: "HIIT" },
  { value: "CrossFit", label: "CrossFit" },
  { value: "Cycling", label: "Cycling" },
  { value: "Swimming", label: "Swimming" },
  { value: "Running", label: "Running" },
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: "1rem",
    border: "none",
    boxShadow: state.isFocused
      ? "inset 6px 6px 10px #d1d9e6, inset -6px -6px 10px #ffffff"
      : "6px 6px 12px #c1c9d6, -6px -6px 12px #ffffff",
    padding: "3px",
    minHeight: "50px",
    transition: "box-shadow 0.3s ease",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "1rem",
    boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#e0e7ff" : "white",
    color: "#1e293b",
    cursor: "pointer",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#94a3b8",
    fontStyle: "italic",
  }),
};

const Tooltip = ({ text }) => (
  <div className="relative group inline-block cursor-pointer ml-1">
    <FaInfoCircle className="text-gray-400 hover:text-indigo-500 transition" />
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 rounded-lg bg-indigo-600 text-white text-xs shadow-lg z-50">
      {text}
    </div>
  </div>
);

const FloatingLabelInput = ({
  label,
  id,
  type,
  value,
  onChange,
  icon,
  error,
  max,
}) => {
  const isDateType = type === "date";
  // Always float label for date type to prevent overlap
  // For other types, float label on focus or when value present
  return (
    <div className="relative w-full mb-8">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        max={max}
        placeholder={isDateType ? "" : " "}
        className={`peer w-full rounded-2xl bg-gray-100 py-4 pl-12 pr-4 text-gray-900 text-lg font-medium
          focus:outline-none focus:ring-4 focus:ring-indigo-400
          shadow-neumorph
          transition duration-300
          ${
            error
              ? "ring-2 ring-red-500 bg-red-50"
              : "ring-0 focus:bg-white"
          }
        `}
      />
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500">
          {icon}
        </div>
      )}
      <label
        htmlFor={id}
        className={`absolute left-12 text-gray-500 text-lg font-semibold pointer-events-none
        transition-all duration-300
        ${
          isDateType
            ? "top-2 text-indigo-600 text-sm" // Always float label above for date inputs
            : "peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-indigo-600 peer-focus:text-sm"
        }
        ${
          error ? "text-red-500 peer-focus:text-red-600" : ""
        }
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-semibold">{error}</p>
      )}
    </div>
  );
};

const WorkoutForm = () => {
  const [workoutDate, setWorkoutDate] = useState("");
  const [workoutType, setWorkoutType] = useState(null);
  const [duration, setDuration] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.email) setUserEmail(parsedUser.email);
      } catch {
        setErrors((prev) => ({ ...prev, api: "Invalid user data in localStorage" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, api: "User not found in localStorage. Please login." }));
    }

    if (storedToken) {
      setToken(storedToken);
    } else {
      setErrors((prev) => ({ ...prev, api: "Token not found in localStorage. Please login." }));
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!workoutDate) newErrors.workoutDate = "Please select a workout date.";
    if (!workoutType) newErrors.workoutType = "Please select workout type.";
    if (!duration) newErrors.duration = "Please enter workout duration.";
    else if (isNaN(duration) || duration <= 0)
      newErrors.duration = "Duration must be a positive number.";

    if (!userEmail) newErrors.api = "User email not found. Please login again.";
    if (!token) newErrors.api = "Authorization token not found. Please login again.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validate()) return;

    const payload = {
      workoutDate,
      type: workoutType.value,
      durationInMinutes: Number(duration),
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/workouts?email=${encodeURIComponent(userEmail)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      if (response.ok) {
        setSuccessMessage(text || "Workout saved successfully!");
        setWorkoutDate("");
        setWorkoutType(null);
        setDuration("");
        setErrors({});
        alert('Workout Saved successfully');
      } else {
        setErrors({ api: text || "Failed to save workout" });
      }
    } catch (error) {
      setErrors({ api: "Server error. Please try again later." });
    }
  };

  // Navigate to workout dashboard
  const goToDashboard = () => {
    window.location.href = "/workout-dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-gray-50 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-neumorph p-10 max-w-lg w-full animate-fadeIn"
        style={{ boxShadow: "12px 12px 20px #c1c9d6, -12px -12px 20px #ffffff" }}
      >
        <h2 className="text-4xl font-extrabold text-indigo-700 mb-8 text-center tracking-wider">
          Log Your Workout
        </h2>

        {errors.api && (
          <div className="mb-6 px-5 py-3 bg-red-100 border border-red-400 text-red-700 font-semibold rounded-xl text-center">
            {errors.api}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 px-5 py-3 bg-green-100 border border-green-400 text-green-700 font-semibold rounded-xl text-center">
            {successMessage}
          </div>
        )}

        {/* Workout Date */}
        <div className="relative">
          <FloatingLabelInput
            label="Workout Date"
            id="workoutDate"
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            error={errors.workoutDate}
            icon={<FaCalendarAlt size={20} />}
          />
          <Tooltip text="Select the date when you performed the workout." />
        </div>

        {/* Workout Type */}
        <div className="mb-10 relative">
          <label
            htmlFor="workoutType"
            className="block mb-2 font-semibold text-indigo-700 text-lg flex items-center"
          >
            Workout Type
            <Tooltip text="Choose the workout category that best fits your activity." />
          </label>
          <Select
            inputId="workoutType"
            options={workoutOptions}
            value={workoutType}
            onChange={setWorkoutType}
            placeholder="Select workout type..."
            styles={customSelectStyles}
            classNamePrefix={errors.workoutType ? "react-select-error" : "react-select"}
            isClearable
          />
          {errors.workoutType && (
            <p className="mt-2 text-red-600 font-semibold">{errors.workoutType}</p>
          )}
        </div>

        {/* Workout Duration Heading */}
        <div className="mb-2 flex items-center font-semibold text-indigo-700 text-lg">
          <label htmlFor="duration" className="flex items-center gap-1">
            Workout Duration (minutes)
            <Tooltip text="Enter how long your workout lasted in minutes." />
          </label>
        </div>

        {/* Duration Input */}
        <div className="relative">
          <FloatingLabelInput
            label="Duration (minutes)"
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            error={errors.duration}
            icon={<FaClock size={20} />}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-8 py-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-extrabold
          shadow-lg hover:shadow-indigo-400/70 hover:scale-[1.03] transform transition-all duration-300
          focus:outline-none focus:ring-4 focus:ring-indigo-400 active:scale-[0.98]"
        >
          Log Workout
        </button>

        {/* Go To Dashboard Button */}
        <button
          type="button"
          onClick={goToDashboard}
          className="w-full mt-6 py-4 rounded-3xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400
          text-white text-xl font-extrabold flex justify-center items-center gap-3
          shadow-lg hover:shadow-yellow-400/80 hover:scale-[1.05] transform transition-all duration-300
          focus:outline-none focus:ring-4 focus:ring-yellow-300 active:scale-[0.98]"
        >
          Go to Workout Dashboard <FaArrowRight />
        </button>
      </form>

      <style>{`
        .shadow-neumorph {
          box-shadow:
            8px 8px 15px #c1c9d6,
            -8px -8px 15px #ffffff;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WorkoutForm;
