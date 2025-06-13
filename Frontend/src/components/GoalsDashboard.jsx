import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import {
  FaBed,
  FaRunning,
  FaTint,
  FaFire,
  FaWeight,
  FaHeartbeat,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import { FiTarget, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const iconMap = {
  sleep: <FaBed />,
  distance: <FaRunning />,
  water_intake: <FaTint />,
  calories_burned: <FaFire />,
  weight: <FaWeight />,
  workout: <FaHeartbeat />,
};

const GoalsDashboard = () => {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setEmail(user.email);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (email) {
      fetchGoalData();
    }
  }, [period, email]);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !email) {
        console.error('Missing token or email');
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/api/goals/${email}/compare?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(response.data.comparisons || []);
    } catch (error) {
      console.error('Failed to fetch goal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueTypes = [...new Set(data.map((item) => item.type))];

  const chartData = {
    labels: uniqueTypes.map((type) => type.replace('_', ' ')),
    datasets: [
      {
        label: 'Target',
        data: uniqueTypes.map(
          (type) => data.find((item) => item.type === type)?.targetValue || 0
        ),
        backgroundColor: '#6366f1',
      },
      {
        label: 'Actual',
        data: uniqueTypes.map(
          (type) => data.find((item) => item.type === type)?.actualValue || 0
        ),
        backgroundColor: '#10b981',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Goals vs Actuals (${period})`,
        font: { size: 18 },
        color: darkMode ? '#f3f4f6' : '#1f2937',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const periods = ['daily', 'weekly', 'monthly', 'yearly'];

  const containerStyle = {
    background: darkMode ? '#1f2937' : '#f1f5f9',
    color: darkMode ? '#f3f4f6' : '#111827',
    minHeight: '100vh',
    padding: '2rem',
    transition: 'all 0.3s ease',
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#374151' : '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: darkMode
      ? '0 4px 12px rgba(0,0,0,0.5)'
      : '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid',
    borderColor: darkMode ? '#4b5563' : '#e5e7eb',
    transition: 'all 0.3s ease',
  };

  const progressBarBase = {
    height: '20px',
    borderRadius: '999px',
    backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
    overflow: 'hidden',
    marginTop: '0.75rem',
  };

  const progressFillBase = {
    height: '100%',
    background: 'linear-gradient(to right, #34d399, #10b981)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    color: '#ffffff',
    fontSize: '0.75rem',
    paddingRight: '0.5rem',
    transition: 'width 0.4s ease',
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            <FiBarChart2 style={{ marginRight: '0.5rem' }} />
            Goals Dashboard
          </h2>

          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none',
              border: 'none',
              color: darkMode ? '#facc15' : '#1f2937',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
            title="Toggle Dark Mode"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        {/* Period Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                fontWeight: '600',
                backgroundColor: period === p ? '#6366f1' : 'transparent',
                color: period === p ? '#ffffff' : darkMode ? '#d1d5db' : '#374151',
                border: '1px solid',
                borderColor: period === p ? '#6366f1' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div style={{ ...cardStyle, marginBottom: '2rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading chart...</p>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>

        {/* Goal Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {uniqueTypes.map((type) => {
            const goal = data.find((g) => g.type === type);
            const actual = goal?.actualValue || 0;
            const target = goal?.targetValue || 1;
            const progress = Math.min((actual / target) * 100, 100).toFixed(0);
            const readableType = type.replace(/_/g, ' ');
            const icon = iconMap[type] || <FiBarChart2 />;

            return (
              <div key={type} style={cardStyle}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{readableType}</h4>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6366f1' }}>
                    <FiTarget /> Target: {target}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981' }}>
                    <FiCheckCircle /> Actual: {actual}
                  </span>
                </div>

                <div style={progressBarBase}>
                  <div style={{ ...progressFillBase, width: `${progress}%` }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {icon} {progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoalsDashboard;
