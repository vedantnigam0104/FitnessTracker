import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import moment from "moment";

// react-share components
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartBarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3v18h18M9 17V9m4 8v-4m4 4v-6"
    />
  </svg>
);

const MealDashboard = () => {
  const [mealData, setMealData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeRange, setTimeRange] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lineChartImage, setLineChartImage] = useState(null);
  const [pieChartImage, setPieChartImage] = useState(null);

  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      setError("");
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        const email = parsedUser.email;
        if (!email) {
          setError("User email not found.");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const res = await axios.get(
          `http://localhost:8080/api/meals/${email}`,
          config
        );

        if (Array.isArray(res.data)) {
          setMealData(res.data);
        } else {
          setError("Invalid meal data received.");
          setMealData([]);
        }
      } catch (err) {
        setError("Failed to fetch meal data.");
      }
      setLoading(false);
    };

    fetchMeals();
  }, []);

  useEffect(() => {
    if (mealData.length > 0) {
      const grouped = groupMealsByTimeRange(mealData, timeRange);
      setFilteredData(grouped);
    } else {
      setFilteredData([]);
    }
  }, [mealData, timeRange]);

  useEffect(() => {
    // Update line chart image
    if (lineChartRef.current) {
      const chartInstance = lineChartRef.current;
      if (chartInstance) {
        const img = chartInstance.toBase64Image();
        setLineChartImage(img);
      }
    }
    // Update pie chart image
    if (pieChartRef.current) {
      const chartInstance = pieChartRef.current;
      if (chartInstance) {
        const img = chartInstance.toBase64Image();
        setPieChartImage(img);
      }
    }
  }, [filteredData, timeRange]);

  const getFullLabelsForRange = (range) => {
    const labels = [];
    const now = moment();

    if (range === "weekly") {
      const startOfWeek = now.clone().startOf("isoWeek");
      for (let i = 0; i < 7; i++) {
        labels.push(startOfWeek.clone().add(i, "days").format("YYYY-MM-DD"));
      }
    } else if (range === "monthly") {
      const daysInMonth = now.daysInMonth();
      const startOfMonth = now.clone().startOf("month");
      for (let i = 0; i < daysInMonth; i++) {
        labels.push(startOfMonth.clone().add(i, "days").format("YYYY-MM-DD"));
      }
    } else {
      const year = now.year();
      for (let m = 0; m < 12; m++) {
        labels.push(moment({ year, month: m }).format("YYYY-MM"));
      }
    }

    return labels;
  };

  const groupMealsByTimeRange = (data, range) => {
    const grouped = {};

    data.forEach((meal) => {
      const date = meal.date || meal.loggedAt || meal.createdAt;
      if (!date) return;

      let key;
      if (range === "weekly" || range === "monthly") {
        key = moment(date).format("YYYY-MM-DD");
      } else {
        key = moment(date).format("YYYY-MM");
      }

      if (!grouped[key]) {
        grouped[key] = { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 };
      }

      grouped[key].calories += Number(meal.calories) || 0;
      grouped[key].protein += Number(meal.protein) || 0;
      grouped[key].carbs += Number(meal.carbs) || 0;
      grouped[key].fats += Number(meal.fats) || 0;
      grouped[key].count += 1;
    });

    const fullLabels = getFullLabelsForRange(range);

    return fullLabels.map((label) => {
      if (grouped[label]) {
        const val = grouped[label];
        return {
          label,
          calories: val.calories / val.count,
          protein: val.protein / val.count,
          carbs: val.carbs / val.count,
          fats: val.fats / val.count,
        };
      } else {
        return {
          label,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
        };
      }
    });
  };

  const chartData = {
    labels:
      filteredData.length > 0
        ? filteredData.map((d) =>
            timeRange === "yearly"
              ? moment(d.label, "YYYY-MM").format("MMM")
              : moment(d.label, "YYYY-MM-DD").format("DD MMM")
          )
        : [],
    datasets: [
      {
        label: "Calories",
        data: filteredData.length > 0 ? filteredData.map((d) => d.calories) : [],
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.3,
      },
      {
        label: "Protein",
        data: filteredData.length > 0 ? filteredData.map((d) => d.protein) : [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
      },
      {
        label: "Carbs",
        data: filteredData.length > 0 ? filteredData.map((d) => d.carbs) : [],
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.3,
      },
      {
        label: "Fats",
        data: filteredData.length > 0 ? filteredData.map((d) => d.fats) : [],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Meal Nutrients - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`,
        font: { size: 18 },
      },
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Average Amount",
        },
      },
      x: {
        title: {
          display: true,
          text:
            timeRange === "weekly"
              ? "Date (Week Days)"
              : timeRange === "monthly"
              ? "Date (Month Days)"
              : "Month (Year)",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
    },
  };

  const now = moment();
  let startDate;

  if (timeRange === "weekly") {
    startDate = now.clone().startOf("isoWeek");
  } else if (timeRange === "monthly") {
    startDate = now.clone().startOf("month");
  } else if (timeRange === "yearly") {
    startDate = now.clone().startOf("year");
  }

  const filteredForPie = mealData.filter((meal) => {
    const date = meal.date || meal.loggedAt || meal.createdAt;
    return date ? moment(date).isSameOrAfter(startDate, "day") : false;
  });

  const pieTotals = filteredForPie.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories) || 0;
      acc.protein += Number(meal.protein) || 0;
      acc.carbs += Number(meal.carbs) || 0;
      acc.fats += Number(meal.fats) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const pieData = {
    labels: ["Calories", "Protein", "Carbs", "Fats"],
    datasets: [
      {
        data: [
          pieTotals.calories,
          pieTotals.protein,
          pieTotals.carbs,
          pieTotals.fats,
        ],
        backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"],
        hoverBackgroundColor: ["#4338CA", "#059669", "#D97706", "#DC2626"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    cutout: "60%",
    plugins: {
      legend: { position: "right", labels: { font: { size: 14 } } },
      title: {
        display: true,
        text: `Nutrient Breakdown - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`,
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}`;
          },
        },
      },
    },
  };

  // Export chart image handler for line chart
  const handleDownloadLineChart = () => {
    if (!lineChartRef.current) return;
    const chartInstance = lineChartRef.current;
    if (!chartInstance) return;
    const base64Image = chartInstance.toBase64Image();
    const link = document.createElement("a");
    link.href = base64Image;
    link.download = `meal-nutrients-line-${timeRange}.png`;
    link.click();
  };

  // Export chart image handler for pie chart
  const handleDownloadPieChart = () => {
    if (!pieChartRef.current) return;
    const chartInstance = pieChartRef.current;
    if (!chartInstance) return;
    const base64Image = chartInstance.toBase64Image();
    const link = document.createElement("a");
    link.href = base64Image;
    link.download = `meal-nutrients-pie-${timeRange}.png`;
    link.click();
  };

  // Copy image to clipboard for Instagram workaround
  const copyImageToClipboard = async () => {
    if (!lineChartImage) {
      alert("Chart image not ready yet.");
      return;
    }

    try {
      const dataUrl = lineChartImage;
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      alert("Chart image copied to clipboard! Paste it in Instagram.");
    } catch (err) {
      alert("Failed to copy image. Your browser might not support this feature.");
    }
  };

  // Share text + url fallback for social buttons
  // Replace url with your actual deployed app URL if needed
  const shareUrl = window.location.href;
  const shareTitle = `Check out my meal nutrient stats for the ${timeRange} timeline!`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center p-8">
      <div className="flex items-center gap-3 mb-4">
        <ChartBarIcon className="w-10 h-10 text-indigo-700" />
        <h1 className="text-4xl font-bold text-indigo-800">Meal Dashboard</h1>
      </div>

      <div className="flex gap-4 mb-6 w-full max-w-5xl">
        {["weekly", "monthly", "yearly"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
              timeRange === range
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-100"
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}

        <button
          onClick={handleDownloadLineChart}
          className="ml-auto px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          title="Download Line Chart as PNG"
        >
          Export Line Chart
        </button>
        <button
          onClick={handleDownloadPieChart}
          className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          title="Download Pie Chart as PNG"
        >
          Export Pie Chart
        </button>
      </div>

      {loading ? (
        <p className="text-lg text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-lg text-red-500">{error}</p>
      ) : filteredData.length === 0 ? (
        <p className="text-lg text-gray-600">No meal data available.</p>
      ) : (
        <>
          <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-lg mb-8">
            <Line ref={lineChartRef} data={chartData} options={chartOptions} />
          </div>

          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg mb-6">
            <Pie ref={pieChartRef} data={pieData} options={pieOptions} />
          </div>

          {/* Share Charts header */}
          <div className="max-w-5xl w-full mb-4">
            <h2 className="text-xl font-semibold text-indigo-700 border-b border-indigo-300 pb-2">
              Share Charts
            </h2>
          </div>

          {/* Social sharing buttons */}
          <div className="flex gap-6 items-center justify-center max-w-5xl">
            <FacebookShareButton url={shareUrl} quote={shareTitle}>
              <FacebookIcon size={48} round />
            </FacebookShareButton>

            <TwitterShareButton url={shareUrl} title={shareTitle}>
              <TwitterIcon size={48} round />
            </TwitterShareButton>

            <WhatsappShareButton url={shareUrl} title={shareTitle} separator=" - ">
              <WhatsappIcon size={48} round />
            </WhatsappShareButton>
          </div>
        </>
      )}
    </div>
  );
};

export default MealDashboard;
