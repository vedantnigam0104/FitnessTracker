import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  FaChartLine,
  FaDownload,
  FaSyncAlt,
  FaFire,
  FaRoad,
  FaBed,
  FaTint,
  FaDrumstickBite,
  FaDumbbell,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

ChartJS.register(LineElement, BarElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const HistoryComparison = () => {
  const [type, setType] = useState('week');
  const [metrics, setMetrics] = useState(['caloriesBurnt']);
  const [firstStart, setFirstStart] = useState('');
  const [secondStart, setSecondStart] = useState('');
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState('');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState('');
  const [chartType, setChartType] = useState('line');
  const chartRef = useRef(null);
  const navigate = useNavigate();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    if (storedUser?.id) setUserId(storedUser.id);
    if (storedToken) setToken(storedToken);
  }, []);

  const handleFetch = async () => {
    if (!firstStart || !secondStart || !userId || !token) return;
    try {
      const response = await axios.get('http://localhost:8080/api/history/compare', {
        params: {
          type,
          firstStart,
          secondStart,
          userId,
          metrics: metrics.join(','),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      prepareChart(response.data);
      generateSummary(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const prepareChart = (data) => {
    const labels = Array.from({ length: data.firstPeriodData.length }, (_, i) => `${type} ${i + 1}`);
    const extract = (item, metric) => item[metric] || 0;

    const datasets = metrics.flatMap((metric) => {
      const first = data.firstPeriodData.map((item) => extract(item, metric));
      const second = data.secondPeriodData.map((item) => extract(item, metric));
      const percentage = first.map((val, i) => val === 0 ? 0 : ((second[i] - val) / val) * 100);

      return [
        {
          label: `First (${metric})`,
          data: first,
          backgroundColor: '#4B9CD3',
          borderColor: '#4B9CD3',
          fill: false,
          tension: 0.4,
        },
        {
          label: `Second (${metric})`,
          data: second,
          backgroundColor: '#2ECC71',
          borderColor: '#2ECC71',
          fill: false,
          tension: 0.4,
        },
        {
          label: `Change % (${metric})`,
          data: percentage,
          backgroundColor: '#E74C3C',
          borderColor: '#E74C3C',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
        },
      ];
    });

    setChartData({ labels, datasets });
  };

  const generateSummary = (data) => {
    let msg = '';
    metrics.forEach((metric) => {
      const firstTotal = data.firstPeriodData.reduce((sum, d) => sum + (d[metric] || 0), 0);
      const secondTotal = data.secondPeriodData.reduce((sum, d) => sum + (d[metric] || 0), 0);
      const improved = secondTotal >= firstTotal;
      msg += `${metric}: ${improved ? '✅ Improved' : '❌ Declined'}\n`;
    });
    setSummary(msg.trim());
  };

  useEffect(() => {
    if (userId && token) handleFetch();
  }, [firstStart, secondStart, type, metrics, userId, token]);

  const formatDate = (inputDate) => {
    if (!inputDate) return '';
    const date = new Date(inputDate);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  const renderDateInput = (value, setValue) => {
    if (type === 'week') {
      return (
        <input
          type="date"
          className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
          value={value.replace(/\//g, '-')}
          onChange={(e) => setValue(formatDate(e.target.value))}
        />
      );
    }

    if (type === 'month') {
      const [month, year] = value.split(' ');
      return (
        <div className="flex gap-2">
          <select
            className="w-1/2 px-3 py-2 rounded-md border border-gray-300 bg-white shadow-sm"
            value={month || ''}
            onChange={(e) => setValue(`${e.target.value} ${year || ''}`)}
          >
            <option value="">Month</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="w-1/2 px-3 py-2 rounded-md border border-gray-300 bg-white shadow-sm"
            value={year || ''}
            onChange={(e) => setValue(`${month || ''} ${e.target.value}`)}
          >
            <option value="">Year</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'year') {
      return (
        <select
          className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white shadow-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">Year</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      );
    }
  };

  const handleMetricChange = (metric) => {
    setMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const handleExportCSV = () => {
    if (!chartData) return;
    const csvRows = [['Label', ...chartData.labels]];
    chartData.datasets.forEach((dataset) => {
      csvRows.push([dataset.label, ...dataset.data]);
    });
    const blob = new Blob([csvRows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    saveAs(blob, 'fitness-comparison.csv');
  };

  const handleExportImage = () => {
    if (!chartRef.current) return;
    const url = chartRef.current.toBase64Image();
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fitness-comparison.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Fitness History Comparison</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="font-medium block mb-1">Type</label>
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((option) => (
                <button
                  key={option}
                  onClick={() => setType(option)}
                  className={`px-3 py-2 rounded-md transition font-semibold ${
                    type === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1">Select Metrics</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'caloriesBurnt', icon: <FaFire className="text-red-500" /> },
                { key: 'distanceTravelled', icon: <FaRoad className="text-blue-500" /> },
                { key: 'sleepHours', icon: <FaBed className="text-purple-500" /> },
                { key: 'waterIntake', icon: <FaTint className="text-teal-500" /> },
              ].map(({ key, icon }) => (
                <label key={key} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-md shadow-sm">
                  <input
                    type="checkbox"
                    checked={metrics.includes(key)}
                    onChange={() => handleMetricChange(key)}
                    className="accent-blue-600"
                  />
                  <span className="flex items-center gap-2 capitalize text-gray-700">
                    {icon}
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1">First Period Start</label>
            {renderDateInput(firstStart, setFirstStart)}
          </div>

          <div>
            <label className="font-medium block mb-1">Second Period Start</label>
            {renderDateInput(secondStart, setSecondStart)}
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            <FaSyncAlt /> Toggle Chart Type
          </button>
        </div>

        {summary && (
          <div className="bg-blue-50 p-4 rounded-md mb-6 text-gray-800 font-medium whitespace-pre-wrap border border-blue-200">
            <strong>Summary:</strong>
            <pre>{summary}</pre>
          </div>
        )}

        {chartData ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md">
              {chartType === 'line' ? <Line ref={chartRef} data={chartData} /> : <Bar ref={chartRef} data={chartData} />}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-md text-lg font-semibold flex items-center gap-2 shadow-lg transition"
                onClick={() => navigate('/meal-history')}
              >
                <FaDrumstickBite className="text-xl" /> Go to Meal History
              </button>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-lg font-semibold flex items-center gap-2 shadow-lg transition"
                onClick={() => navigate('/workout-history')}
              >
                <FaDumbbell className="text-xl" /> Go to Workout History
              </button>
            </div>

            <div className="flex gap-4 justify-center mt-6">
              <button onClick={handleExportImage} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <FaDownload /> Export Image
              </button>
              <button onClick={handleExportCSV} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <FaDownload /> Export CSV
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 mt-6">Please select comparison inputs to generate the chart.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryComparison;
