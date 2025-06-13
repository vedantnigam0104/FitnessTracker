import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFire, FaDrumstickBite, FaBreadSlice, FaTint, FaDownload } from 'react-icons/fa';

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const MealHistory = () => {
  const [type, setType] = useState('week');
  const [firstDate, setFirstDate] = useState(null);
  const [secondDate, setSecondDate] = useState(null);
  const [mealData, setMealData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const chartRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    if (storedUser?.email) setEmail(storedUser.email);
    if (storedToken) setToken(storedToken);
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    if (type === 'week') return date.toISOString().split('T')[0].replace(/-/g, '/');
    if (type === 'month') return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (type === 'year') return date.getFullYear().toString();
    return '';
  };

  const fetchMealComparison = async () => {
    if (!firstDate || !secondDate || !email || !token) {
      setError('All fields and login info must be present.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8080/api/history/meal/compare`, {
        params: {
          type,
          firstStart: formatDate(firstDate),
          secondStart: formatDate(secondDate),
          email
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMealData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch meal history data. Please check your inputs.');
      console.error(err);
    }
  };

  const getChartData = () => {
    if (!mealData) return {};
    const labels = ['Calories', 'Protein', 'Carbs', 'Fats'];
    const firstData = [
      mealData.firstCalories,
      mealData.firstProtein,
      mealData.firstCarbs,
      mealData.firstFats
    ];
    const secondData = [
      mealData.secondCalories,
      mealData.secondProtein,
      mealData.secondCarbs,
      mealData.secondFats
    ];

    return {
      labels,
      datasets: [
        {
          label: 'First Period',
          data: firstData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2
        },
        {
          label: 'Second Period',
          data: secondData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  const downloadChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = 'meal-history-chart.png';
      link.click();
    }
  };

  const iconMap = {
    Calories: <FaFire className="text-red-500 text-xl inline-block mr-2" />,
    Protein: <FaDrumstickBite className="text-yellow-500 text-xl inline-block mr-2" />,
    Carbs: <FaBreadSlice className="text-orange-500 text-xl inline-block mr-2" />,
    Fats: <FaTint className="text-blue-500 text-xl inline-block mr-2" />
  };

  const renderSummaryCard = () => {
    if (!mealData) return null;

    const nutrients = ['Calories', 'Protein', 'Carbs', 'Fats'];
    const firstValues = [
      mealData.firstCalories,
      mealData.firstProtein,
      mealData.firstCarbs,
      mealData.firstFats
    ];
    const secondValues = [
      mealData.secondCalories,
      mealData.secondProtein,
      mealData.secondCarbs,
      mealData.secondFats
    ];

    const getMessage = (diff, nutrient) => {
      if (diff > 0) return `🔺 Increased ${nutrient} by ${diff.toFixed(1)}%`;
      if (diff < 0) return `🔻 Decreased ${nutrient} by ${Math.abs(diff).toFixed(1)}%`;
      return `⏸️ No change in ${nutrient}`;
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {nutrients.map((nutrient, i) => {
          const first = firstValues[i];
          const second = secondValues[i];
          const diff = first === 0 ? 0 : ((second - first) / first) * 100;

          return (
            <div
              key={nutrient}
              className="bg-white border-l-4 p-4 rounded shadow-md"
              style={{
                borderColor: diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : '#64748b'
              }}
            >
              <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                {iconMap[nutrient]} {nutrient}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{getMessage(diff, nutrient)}</p>
              <p className="text-xs mt-2 text-gray-400">
                First: {first} | Second: {second}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🥗 Meal History Comparison</h2>

        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>

          <DatePicker
            selected={firstDate}
            onChange={setFirstDate}
            dateFormat={type === 'week' ? 'yyyy/MM/dd' : type === 'month' ? 'MMM yyyy' : 'yyyy'}
            showMonthYearPicker={type === 'month'}
            showYearPicker={type === 'year'}
            placeholderText="Start Date 1"
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-40"
          />

          <DatePicker
            selected={secondDate}
            onChange={setSecondDate}
            dateFormat={type === 'week' ? 'yyyy/MM/dd' : type === 'month' ? 'MMM yyyy' : 'yyyy'}
            showMonthYearPicker={type === 'month'}
            showYearPicker={type === 'year'}
            placeholderText="Start Date 2"
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-40"
          />

          <button
            onClick={fetchMealComparison}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
          >
            🔍 Compare
          </button>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setChartType('bar')}
          >
            📊 Bar Chart
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setChartType('line')}
          >
            📈 Line Chart
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-center px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        {mealData && (
          <div className="w-full max-w-3xl mx-auto">
            {chartType === 'bar' ? (
              <Bar ref={chartRef} data={getChartData()} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            ) : (
              <Line ref={chartRef} data={getChartData()} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            )}
            <button
              onClick={downloadChart}
              className="flex items-center mt-4 mx-auto bg-blue-500 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >
              <FaDownload className="mr-2" /> Download Chart
            </button>
          </div>
        )}

        {mealData && renderSummaryCard()}
      </div>
    </div>
  );
};

export default MealHistory;
