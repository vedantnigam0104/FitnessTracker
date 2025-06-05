import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import {
  FaGoogle, FaDownload, FaWalking, FaFire, FaTint, FaBed, FaBars, FaTimes, FaUser, FaBullseye,
  FaHistory, FaTrophy, FaAppleAlt, FaUsers, FaSignOutAlt, FaPlus,
} from "react-icons/fa";

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
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    distance: [], calories: [], sleep: [], water: [],
  });
  const [labels, setLabels] = useState([]);
  const [period, setPeriod] = useState("weekly");

  const chartRefs = {
    distance: useRef(null),
    calories: useRef(null),
    sleep: useRef(null),
    water: useRef(null),
  };

  const getAverage = (arr) =>
    arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoogleFitIntegration = () => {
    alert("Integrate with Google Fit API - implement here");
  };

  const menuItems = [
    { label: "Profile", path: "/profile", icon: <FaUser /> },
    { label: "Goals", path: "/goals", icon: <FaBullseye /> },
    { label: "History", path: "/history", icon: <FaHistory /> },
    { label: "Challenges", path: "/challenges", icon: <FaTrophy /> },
    { label: "Nutrition", path: "/nutrition", icon: <FaAppleAlt /> },
    { label: "Community", path: "/community", icon: <FaUsers /> },
    { label: "FitnessDataForm", path: "/add-progress", icon: <FaPlus /> },
  ];

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
      axios.get("http://localhost:8080/api/fitness-data/weekly", config).then((res) => {
        const data = res.data;
        const labelsArr = [], distanceArr = [], caloriesArr = [], sleepArr = [], waterArr = [];

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
        setStats({ distance: distanceArr, calories: caloriesArr, sleep: sleepArr, water: waterArr });
      }).catch(console.error);
    }

    if (period === "monthly") {
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      config.params = { userId: user.id, year, month };
      axios.get("http://localhost:8080/api/fitness-data/monthly", config).then((res) => {
        const data = res.data;
        const daysInMonth = new Date(year, month, 0).getDate();
        const labelsArr = [], distanceArr = [], caloriesArr = [], sleepArr = [], waterArr = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const dateObj = new Date(year, month - 1, day);
          const dateStr = dateObj.toISOString().slice(0, 10);
          labelsArr.push(day);
          const dayData = data.find((item) => item.date === dateStr) || {};
          distanceArr.push(dayData.distanceTravelled || 0);
          caloriesArr.push(dayData.caloriesBurnt || 0);
          sleepArr.push(dayData.sleepHours || 0);
          waterArr.push(dayData.waterIntake || 0);
        }

        setLabels(labelsArr);
        setStats({ distance: distanceArr, calories: caloriesArr, sleep: sleepArr, water: waterArr });
      }).catch(console.error);
    }

    if (period === "yearly") {
      const year = today.getFullYear();
      config.params = { userId: user.id, year };
      axios.get("http://localhost:8080/api/fitness-data/yearly", config).then((res) => {
        const data = res.data;
        const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const distanceArr = new Array(12).fill(0), caloriesArr = new Array(12).fill(0);
        const sleepArr = new Array(12).fill(0), waterArr = new Array(12).fill(0);
        const countByMonth = new Array(12).fill(0);

        data.forEach((item) => {
          if (!item.date) return;
          const d = new Date(item.date);
          const m = d.getMonth();
          distanceArr[m] += item.distanceTravelled || 0;
          caloriesArr[m] += item.caloriesBurnt || 0;
          sleepArr[m] += item.sleepHours || 0;
          waterArr[m] += item.waterIntake || 0;
          countByMonth[m]++;
        });

        for (let i = 0; i < 12; i++) {
          if (countByMonth[i]) {
            distanceArr[i] = +(distanceArr[i] / countByMonth[i]).toFixed(1);
            caloriesArr[i] = +(caloriesArr[i] / countByMonth[i]).toFixed(1);
            sleepArr[i] = +(sleepArr[i] / countByMonth[i]).toFixed(1);
            waterArr[i] = +(waterArr[i] / countByMonth[i]).toFixed(1);
          }
        }

        setLabels(monthLabels);
        setStats({ distance: distanceArr, calories: caloriesArr, sleep: sleepArr, water: waterArr });
      }).catch(console.error);
    }
  }, [user, period]);

  const exportChart = (key) => {
    const chart = chartRefs[key]?.current;
    if (chart) {
      const link = document.createElement("a");
      link.download = `${key}-${period}-chart.png`;
      link.href = chart.toBase64Image();
      link.click();
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 30 } },
      y: { beginAtZero: true },
    },
  };

  const dataSets = {
    distance: {
      labels,
      datasets: [{ label: "Distance (km)", data: stats.distance, borderColor: "#34D399", backgroundColor: "#10B981", tension: 0.4 }],
    },
    calories: {
      labels,
      datasets: [{ label: "Calories Burned", data: stats.calories, backgroundColor: "#3B82F6", borderRadius: 6 }],
    },
    sleep: {
      labels,
      datasets: [{ label: "Sleep (hrs)", data: stats.sleep, borderColor: "#6366F1", backgroundColor: "#A5B4FC", tension: 0.4 }],
    },
    water: {
      labels,
      datasets: [{ label: "Water Intake", data: stats.water, borderColor: "#3B82F6", backgroundColor: "#60A5FA", tension: 0.4 }],
    },
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 bg-green-700 text-white shadow-md p-6 ${collapsed ? "w-20" : "w-64"}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-xl font-bold ${collapsed ? "hidden" : ""}`}>FitTrack</h2>
          <button onClick={() => setCollapsed(!collapsed)} className="text-xl">
            {collapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-150 ${
                location.pathname === item.path
                  ? "bg-green-200 text-green-900 font-semibold"
                  : "hover:bg-green-600"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-100 text-red-200"
          >
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      {/* Main Section */}
      <main className="flex-1 p-6">
        <motion.div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={
                user?.avatarUrl
                  ? `${user.avatarUrl}?t=${new Date().getTime()}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-16 h-16 rounded-full object-cover border-4 border-green-500"
              alt="avatar"
            />
            <h1 className="text-2xl font-bold text-green-700">Welcome, {user?.username || "User"}!</h1>
          </div>
          <button
            onClick={handleGoogleFitIntegration}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full flex items-center gap-3"
          >
            <FaGoogle />
            Sign-in with Google FitBit
          </button>
        </motion.div>

        <div className="mb-6 flex gap-3">
          {["weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                period === p ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-green-100"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { key: "distance", title: "Distance Covered", icon: <FaWalking />, color: "text-green-600" },
            { key: "calories", title: "Calories Burned", icon: <FaFire />, color: "text-blue-600" },
            { key: "sleep", title: "Sleep Hours", icon: <FaBed />, color: "text-purple-600" },
            { key: "water", title: "Water Intake", icon: <FaTint />, color: "text-blue-700" },
          ].map(({ key, title, icon, color }) => (
            <div key={key} className="bg-white rounded-xl p-5 shadow-md h-[460px]">
              <div className="flex justify-between items-center mb-3">
                <h2 className={`flex items-center text-lg font-semibold ${color}`}>
                  {icon}
                  <span className="ml-2">{title}</span>
                </h2>
                <button
                  onClick={() => exportChart(key)}
                  className="text-gray-500 hover:text-black text-sm flex items-center gap-1"
                >
                  <FaDownload />
                  Export
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Average: <strong>{getAverage(stats[key])}</strong>
              </p>
              <div className="h-[370px] p-2">
                {key === "calories" ? (
                  <Bar ref={chartRefs[key]} data={dataSets[key]} options={chartOptions} />
                ) : (
                  <Line ref={chartRefs[key]} data={dataSets[key]} options={chartOptions} />
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
