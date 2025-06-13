import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { Line, Bar, Pie } from "react-chartjs-2";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { FaDumbbell, FaMedal } from "react-icons/fa";
//import "tailwindcss/tailwind.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const WorkoutDashboard = () => {
  const [workoutData, setWorkoutData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeRange, setTimeRange] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState("line");
  const chartRef = useRef(null);

  const workoutTypes = [
    "Strength Training",
    "HIIT",
    "Cardio",
    "Pilates",
    "Swimming",
    "Running",
    "Yoga",
    "Cycling",
    "CrossFit",
  ];

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      setError("");
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        if (!storedUser) throw new Error("User not logged in.");
        const email = JSON.parse(storedUser).email;
        if (!email) throw new Error("Email not found.");

        const res = await axios.get(
          `http://localhost:8080/api/workouts/${email}`,
          config
        );
        setWorkoutData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.message || "Failed to fetch workout data.");
      }
      setLoading(false);
    };

    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (workoutData.length > 0) {
      const grouped = groupByTime(workoutData, timeRange);
      setFilteredData(grouped);
    }
  }, [workoutData, timeRange]);

  const getLabels = () => {
    const now = moment();
    const labels = [];

    if (timeRange === "weekly") {
      const start = now.clone().startOf("isoWeek");
      for (let i = 0; i < 7; i++) {
        labels.push(start.clone().add(i, "days").format("YYYY-MM-DD"));
      }
    } else if (timeRange === "monthly") {
      const start = now.clone().startOf("month");
      const daysInMonth = now.daysInMonth();
      for (let i = 0; i < daysInMonth; i++) {
        labels.push(start.clone().add(i, "days").format("YYYY-MM-DD"));
      }
    } else {
      for (let m = 0; m < 12; m++) {
        labels.push(moment().month(m).format("YYYY-MM"));
      }
    }
    return labels;
  };

  const groupByTime = (data, range) => {
    const result = {};
    const labels = getLabels();

    workoutTypes.forEach((type) => {
      result[type] = {};
      labels.forEach((label) => {
        result[type][label] = 0;
      });
    });

    data.forEach((item) => {
      const date = moment(item.workoutDate);
      const key = range === "yearly" ? date.format("YYYY-MM") : date.format("YYYY-MM-DD");
      const workoutType = item.type || "Unknown";
      const duration = item.durationInMinutes || 0;

      if (workoutTypes.includes(workoutType)) {
        result[workoutType][key] = (result[workoutType][key] || 0) + duration;
      }
    });

    return workoutTypes.map((type) => ({
      label: type,
      data: labels.map((label) => result[type][label] || 0),
    }));
  };

  const chartData = {
    labels: getLabels().map((label) =>
      timeRange === "yearly"
        ? moment(label, "YYYY-MM").format("MMM")
        : moment(label, "YYYY-MM-DD").format("DD MMM")
    ),
    datasets: filteredData.map((d, i) => ({
      label: d.label,
      data: d.data,
      borderColor: `hsl(${(i * 40) % 360}, 70%, 50%)`,
      backgroundColor: `hsla(${(i * 40) % 360}, 70%, 70%, 0.5)`,
      tension: 0.4,
      fill: chartType === "bar",
      stack: chartType === "bar" ? "stack1" : undefined,
    })),
  };

  const handleDownload = () => {
    if (!chartRef.current) return;
    const base64Image = chartRef.current.toBase64Image();
    const link = document.createElement("a");
    link.href = base64Image;
    link.download = `workout-chart-${timeRange}.png`;
    link.click();
  };

  const workoutCounts = workoutData.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = 0;
    acc[item.type] += item.durationInMinutes;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(workoutCounts),
    datasets: [
      {
        data: Object.values(workoutCounts),
        backgroundColor: Object.keys(workoutCounts).map((_, i) => `hsl(${(i * 40) % 360}, 70%, 60%)`),
      },
    ],
  };

  const heatmapData = workoutData.map((w) => ({
    date: moment(w.workoutDate).format("YYYY-MM-DD"),
    count: w.durationInMinutes,
  }));

  const topWorkouts = Object.entries(workoutCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-800 flex justify-center items-center gap-2">
          <FaDumbbell /> Workout Dashboard
        </h1>
      </div>

      <div className="flex justify-center gap-4 flex-wrap">
        {["weekly", "monthly", "yearly"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition duration-300 ${
              timeRange === range
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-100"
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}

        <button
          onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
          className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
        >
          Toggle to {chartType === "line" ? "Stacked Bar" : "Line"}
        </button>

        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
        >
          Download Chart
        </button>
      </div>

      {loading ? (
        <p className="text-center text-lg text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            {chartType === "line" ? (
              <Line ref={chartRef} data={chartData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            ) : (
              <Bar ref={chartRef} data={chartData} options={{ responsive: true, plugins: { legend: { position: "bottom" } }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-center mb-2">Workout Distribution</h2>
            <Pie data={pieData} />
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md col-span-1">
            <h2 className="text-xl font-semibold text-center mb-2">Top 3 Workouts</h2>
            <ul className="space-y-2">
              {topWorkouts.map(([type, mins], i) => (
                <li key={type} className="flex items-center gap-2 text-lg">
                  <FaMedal className={`text-${["yellow", "gray", "orange"][i]}-500`} />
                  <span className="font-semibold">{type}</span> — {mins} mins
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md col-span-1">
            <h2 className="text-xl font-semibold text-center mb-2">Heatmap Calendar</h2>
            <CalendarHeatmap
              startDate={moment().subtract(11, "months").startOf("month").toDate()}
              endDate={moment().endOf("month").toDate()}
              values={heatmapData}
              classForValue={(value) => {
                if (!value || value.count === 0) return "color-empty";
                if (value.count < 15) return "color-scale-1";
                if (value.count < 30) return "color-scale-2";
                if (value.count < 60) return "color-scale-3";
                return "color-scale-4";
              }}
              showWeekdayLabels
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDashboard;
