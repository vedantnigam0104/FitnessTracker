import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { motion } from "framer-motion";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaGoogle, FaDownload,FaWalking,
  FaFire,
  FaTint,
  FaBed} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserDashboard = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    distance: [],
    calories: [],
    sleep: [],
    water: [],
  });

  const [labels, setLabels] = useState([]);
  const [period, setPeriod] = useState("weekly"); // weekly, monthly, yearly

  const chartRefs = {
    distance: useRef(null),
    calories: useRef(null),
    sleep: useRef(null),
    water: useRef(null),
  };

  const getAverage = (arr) =>
    arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;

  // Utility to get Monday of the current week
  const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const formatMonthLabel = (dateStr) => {
    // dateStr here expected as YYYY-MM-DD; extract month and year
    const d = new Date(dateStr);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Fetch data for each period with your backend endpoints
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");

    const today = new Date();

    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: {},
    };

    if (period === "weekly") {
      const monday = getMonday(today);
      const startDate = monday.toISOString().slice(0, 10);
      config.params = { userId: user.id, startDate };
      axios
        .get("http://localhost:8080/api/fitness-data/weekly", config)
        .then((res) => {
          // response is an array with date (YYYY-MM-DD) and data per day
          const data = res.data;

          // Prepare labels and arrays for 7 days starting from monday
          const labelsArr = [];
          const distanceArr = [];
          const caloriesArr = [];
          const sleepArr = [];
          const waterArr = [];

          for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().slice(0, 10);
            labelsArr.push(formatDateLabel(dateStr));

            const dayData = data.find((item) => item.date === dateStr) || {};
            distanceArr.push(dayData.distanceTravelled || 0);
            caloriesArr.push(dayData.caloriesBurnt || 0);
            sleepArr.push(dayData.sleepHours || 0);
            waterArr.push(dayData.waterIntake || 0);
          }

          setLabels(labelsArr);
          setStats({
            distance: distanceArr,
            calories: caloriesArr,
            sleep: sleepArr,
            water: waterArr,
          });
        })
        .catch((err) => console.error(err));
    } else if (period === "monthly") {
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // JS months 0-indexed
      config.params = { userId: user.id, year, month };
      axios
        .get("http://localhost:8080/api/fitness-data/monthly", config)
        .then((res) => {
          const data = res.data;
          // data is array with date (YYYY-MM-DD)
          // generate labels for all days of month
          const daysInMonth = new Date(year, month, 0).getDate();
          const labelsArr = [];
          const distanceArr = [];
          const caloriesArr = [];
          const sleepArr = [];
          const waterArr = [];

          for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month - 1, day);
            const dateStr = dateObj.toISOString().slice(0, 10);
            labelsArr.push(day); // Just day number for monthly chart

            const dayData = data.find((item) => item.date === dateStr) || {};
            distanceArr.push(dayData.distanceTravelled || 0);
            caloriesArr.push(dayData.caloriesBurnt || 0);
            sleepArr.push(dayData.sleepHours || 0);
            waterArr.push(dayData.waterIntake || 0);
          }

          setLabels(labelsArr);
          setStats({
            distance: distanceArr,
            calories: caloriesArr,
            sleep: sleepArr,
            water: waterArr,
          });
        })
        .catch((err) => console.error(err));
    } else if (period === "yearly") {
      const year = today.getFullYear();
      config.params = { userId: user.id, year };
      axios
        .get("http://localhost:8080/api/fitness-data/yearly", config)
        .then((res) => {
          const data = res.data;
          // data array with date and values (date can be any date in month)
          // We aggregate by month - label = Jan, Feb, etc.
          const monthLabels = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          // Create arrays of length 12, initialize 0
          const distanceArr = new Array(12).fill(0);
          const caloriesArr = new Array(12).fill(0);
          const sleepArr = new Array(12).fill(0);
          const waterArr = new Array(12).fill(0);

          // We assume data includes multiple dates in year; sum by month and count entries to average later
          const countByMonth = new Array(12).fill(0);

          data.forEach((item) => {
            if (!item.date) return;
            const d = new Date(item.date);
            const monthIdx = d.getMonth();
            distanceArr[monthIdx] += item.distanceTravelled || 0;
            caloriesArr[monthIdx] += item.caloriesBurnt || 0;
            sleepArr[monthIdx] += item.sleepHours || 0;
            waterArr[monthIdx] += item.waterIntake || 0;
            countByMonth[monthIdx]++;
          });

          // Average values for months where data exists
          for (let i = 0; i < 12; i++) {
            if (countByMonth[i] > 0) {
              distanceArr[i] = +(distanceArr[i] / countByMonth[i]).toFixed(1);
              caloriesArr[i] = +(caloriesArr[i] / countByMonth[i]).toFixed(1);
              sleepArr[i] = +(sleepArr[i] / countByMonth[i]).toFixed(1);
              waterArr[i] = +(waterArr[i] / countByMonth[i]).toFixed(1);
            }
          }

          setLabels(monthLabels);
          setStats({
            distance: distanceArr,
            calories: caloriesArr,
            sleep: sleepArr,
            water: waterArr,
          });
        })
        .catch((err) => console.error(err));
    }
  }, [user, period]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoogleFitIntegration = () => {
    alert("Integrate with Google Fit API - implement here");
  };

  const distanceData = {
    labels,
    datasets: [
      {
        label: "Distance (km)",
        data: stats.distance,
        borderColor: "#34D399",
        backgroundColor: "#10B981",
        tension: 0.4,
        pointRadius: 5,
      },
    ],
  };

  const caloriesData = {
    labels,
    datasets: [
      {
        label: "Calories Burned",
        data: stats.calories,
        backgroundColor: "#3B82F6",
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const sleepData = {
    labels,
    datasets: [
      {
        label: "Sleep (hrs)",
        data: stats.sleep,
        borderColor: "#6366F1",
        backgroundColor: "#A5B4FC",
        tension: 0.4,
        pointRadius: 5,
      },
    ],
  };

  const waterData = {
    labels,
    datasets: [
      {
        label: "Water Intake (liters)",
        data: stats.water,
        borderColor: "#3B82F6",
        backgroundColor: "#60A5FA",
        tension: 0.4,
        pointRadius: 5,
      },
    ],
  };

  const exportChart = (key) => {
    const chart = chartRefs[key]?.current;
    if (chart) {
      const link = document.createElement("a");
      link.download = `${key}-${period}-chart.png`;
      link.href = chart.toBase64Image();
      link.click();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h2 className="text-2xl font-bold text-green-700 mb-8">FitTrack</h2>
        <nav className="space-y-4">
          <button
            onClick={() => navigate("/profile")}
            className="w-full text-left px-4 py-2 hover:bg-green-100 rounded-lg font-medium"
          >
            Profile
          </button>
          <button
            onClick={() => navigate("/goals")}
            className="w-full text-left px-4 py-2 hover:bg-green-100 rounded-lg font-medium"
          >
            Goals
          </button>
          <button
            onClick={() => navigate("/history")}
            className="w-full text-left px-4 py-2 hover:bg-green-100 rounded-lg font-medium"
          >
            History
          </button>
          <button
            onClick={() => navigate("/challenges")}
            className="w-full text-left px-4 py-2 hover:bg-green-100 rounded-lg font-medium"
          >
            Challenges
          </button>
          <button
            onClick={() => navigate("/nutrition")}
            className="w-full text-left px-4 py-2 hover:bg-green-100 rounded-lg font-medium"
          >
            Nutrition
          </button>
          <button
            onClick={() => navigate("/community")}
            className="w-full text-left px-4 py-2 hover:bg-green-100 rounded-lg font-medium"
          >
            Community
          </button>
          <button
            onClick={() => navigate("/add-progress")}
            className="w-full text-left px-4 py-2 hover:bg-green-100 rounded-lg font-medium"
          >
            FitnessDataForm
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg font-medium"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <img
              src={
                user?.avatarUrl
                  ? `${user.avatarUrl}?t=${new Date().getTime()}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="User Avatar"
              className="w-16 h-16 rounded-full object-cover shadow-lg border-4 border-green-400"
            />
            <h1 className="text-3xl font-bold text-green-700">
              Welcome, {user?.username || "User"}!
            </h1>
          </div>
          <button
            onClick={handleGoogleFitIntegration}
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-transform transform hover:scale-105"
          >
            <FaGoogle className="text-xl" />
            Integrate with Google Fit
          </button>
        </motion.div>

        {/* Period Toggle */}
        <div className="mb-8 flex gap-4 justify-center md:justify-start">
          {["weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                period === p
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-green-100"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-12">
          {[
            { key: "distance", title: "Distance Covered", color: "text-green-600", data: distanceData, icon: <FaWalking /> },
            { key: "calories", title: "Calories Burned", color: "text-blue-600", data: caloriesData, icon: <FaFire /> },
            { key: "sleep", title: "Sleep Hours", color: "text-purple-600", data: sleepData, icon: <FaBed />  },
            { key: "water", title: "Water Intake", color: "text-blue-700", data: waterData, icon: <FaTint /> },
          ].map(({ key, title, color, data,icon  }) => (
            <div
              key={key}
              className="bg-white rounded-2xl shadow-lg p-6 h-[420px] relative"
            >
              <div className="flex justify-between items-center mb-2">
              <h2 className={`flex items-center text-xl font-semibold ${color}`}>
              {icon}
              <span className="ml-2">{title}</span>
              </h2>
                <button
                  onClick={() => exportChart(key)}
                  className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
                  aria-label={`Export ${title} chart as PNG`}
                >
                  <FaDownload />
                  Export
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Average: <span className="font-medium">{getAverage(stats[key])}</span>
              </p>
              {key === "calories" ? (
                <Bar
                  ref={chartRefs[key]}
                  data={data}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              ) : (
                <Line
                  ref={chartRefs[key]}
                  data={data}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
