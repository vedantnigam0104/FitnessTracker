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
import { FaBolt, FaDownload, FaChartLine, FaRunning, FaSwimmer, FaBicycle, FaDumbbell, FaHeartbeat, FaFire, FaSpa, FaBalanceScale } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

const exerciseTypes = [
  'swimming',
  'running',
  'cardio',
  'strength training',
  'pilates',
  'hiit',
  'crossfit',
  'yoga',
  'cycling'
];

const exerciseIcons = {
  swimming: <FaSwimmer />,
  running: <FaRunning />,
  cardio: <FaHeartbeat />,
  'strength training': <FaDumbbell />,
  pilates: <FaBalanceScale />,
  hiit: <FaFire />,
  crossfit: <FaBolt />,
  yoga: <FaSpa />,
  cycling: <FaBicycle />
};

const WorkoutHistoryByType = () => {
  const [type, setType] = useState('week');
  const [firstDate, setFirstDate] = useState(null);
  const [secondDate, setSecondDate] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const chartRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    if (storedUser?.id) setUserId(storedUser.id);
    if (storedToken) setToken(storedToken);
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    if (type === 'week') return date.toISOString().split('T')[0].replace(/-/g, '/');
    if (type === 'month') return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (type === 'year') return date.getFullYear().toString();
    return '';
  };

  const fetchWorkoutComparison = async () => {
    if (!firstDate || !secondDate || !userId || !token) {
      setError('All fields and login info must be present.');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/api/history/workout/compare`, {
        params: {
          type,
          firstStart: formatDate(firstDate),
          secondStart: formatDate(secondDate),
          userId
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWorkoutData(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch workout history data.');
      console.error(err);
    }
  };

  const aggregateDurationsByType = (data = []) => {
    const map = Object.fromEntries(exerciseTypes.map(type => [type, 0]));
    for (const entry of data) {
      const exType = entry.type?.toLowerCase();
      if (map.hasOwnProperty(exType)) {
        map[exType] += entry.durationInMinutes;
      }
    }
    return map;
  };

  const getChartData = () => {
    if (!workoutData) return {};
    const firstDataMap = aggregateDurationsByType(workoutData.firstPeriodData);
    const secondDataMap = aggregateDurationsByType(workoutData.secondPeriodData);

    const firstData = exerciseTypes.map(type => firstDataMap[type]);
    const secondData = exerciseTypes.map(type => secondDataMap[type]);

    return {
      labels: exerciseTypes,
      datasets: [
        {
          label: 'First Period',
          data: firstData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
          tension: 0.3
        },
        {
          label: 'Second Period',
          data: secondData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: false,
          tension: 0.3
        }
      ]
    };
  };

  const getMostImprovedExercise = () => {
    if (!workoutData) return null;
    const first = aggregateDurationsByType(workoutData.firstPeriodData);
    const second = aggregateDurationsByType(workoutData.secondPeriodData);

    let maxDiff = -Infinity;
    let improved = '';
    for (let type of exerciseTypes) {
      const diff = second[type] - first[type];
      if (diff > maxDiff) {
        maxDiff = diff;
        improved = type;
      }
    }
    return improved && maxDiff > 0 ? `${improved.toUpperCase()} (+${maxDiff} mins)` : 'No significant improvement';
  };

  const getLeastImprovedExercise = () => {
    if (!workoutData) return null;
    const first = aggregateDurationsByType(workoutData.firstPeriodData);
    const second = aggregateDurationsByType(workoutData.secondPeriodData);

    let minDiff = Infinity;
    let least = '';
    for (let type of exerciseTypes) {
      const diff = second[type] - first[type];
      if (diff < minDiff) {
        minDiff = diff;
        least = type;
      }
    }
    return least && minDiff < 0 ? `${least.toUpperCase()} (${minDiff} mins)` : 'No significant decrease';
  };

  const getTotalDuration = (periodData = []) =>
    periodData.reduce((acc, curr) => acc + curr.durationInMinutes, 0);

  const getMostPerformedExercise = (periodData = []) => {
    const map = aggregateDurationsByType(periodData);
    let max = 0;
    let most = '';
    for (let type of exerciseTypes) {
      if (map[type] > max) {
        max = map[type];
        most = type;
      }
    }
    return most ? `${most.toUpperCase()} (${max} mins)` : 'N/A';
  };

  const downloadChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = 'workout-type-comparison.png';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🏋️‍♀️ Exercise Type Comparison</h2>

        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
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
            onClick={fetchWorkoutComparison}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
          >
            🔍 Compare
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="text-lg text-indigo-800 font-medium">Most Improved: {getMostImprovedExercise()}</p>
          <p className="text-lg text-red-700 font-medium">Least Improved: {getLeastImprovedExercise()}</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-center px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        {workoutData && (
          <div className="w-full max-w-3xl mx-auto">
            {chartType === 'bar' ? (
              <Bar ref={chartRef} data={getChartData()} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            ) : (
              <Line ref={chartRef} data={getChartData()} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            )}

            <button
              onClick={downloadChart}
              className="flex items-center mt-4 mx-auto bg-indigo-500 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded"
            >
              <FaDownload className="mr-2" /> Download Chart
            </button>

            <div className="mt-8 bg-gray-100 rounded-lg shadow p-6 text-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-700 flex items-center justify-center gap-2">
                <FaChartLine /> Insights Summary
              </h3>
              <p><strong>Total Duration (Period 1):</strong> {getTotalDuration(workoutData.firstPeriodData)} mins</p>
              <p><strong>Total Duration (Period 2):</strong> {getTotalDuration(workoutData.secondPeriodData)} mins</p>
              <p><strong>Most Performed Exercise (P2):</strong> {getMostPerformedExercise(workoutData.secondPeriodData)}</p>
              <p><strong>Most Improved Exercise:</strong> {getMostImprovedExercise()}</p>
            </div>

            {/* Per-Exercise Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {exerciseTypes.map((type, index) => {
                const first = aggregateDurationsByType(workoutData.firstPeriodData)[type];
                const second = aggregateDurationsByType(workoutData.secondPeriodData)[type];
                const diff = second - first;
                const trend = diff === 0 ? 'No Change' : diff > 0 ? `+${diff} mins ↑` : `${diff} mins ↓`;
                const trendColor = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600';

                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-gradient-to-br from-white to-indigo-50 p-5 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl text-indigo-600">{exerciseIcons[type]}</div>
                      <div className="flex flex-col">
                        <div className="text-lg font-semibold capitalize text-gray-800">{type}</div>
                        <div className={`text-sm font-medium ${trendColor}`}>{trend}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutHistoryByType;