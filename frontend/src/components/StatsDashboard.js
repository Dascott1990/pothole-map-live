import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="alert alert-danger">
        Failed to load statistics
      </div>
    );
  }

  const severityData = {
    labels: Object.keys(stats.severity_counts).map(s => s.toUpperCase()),
    datasets: [
      {
        data: Object.values(stats.severity_counts),
        backgroundColor: [
          '#28a745', // low - green
          '#ffc107', // medium - yellow
          '#dc3545', // high - red
        ],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  };

  const activityData = {
    labels: ['Total Reports', 'Recent Reports (7 days)', 'Total Users'],
    datasets: [
      {
        label: 'Count',
        data: [stats.total_reports, stats.recent_reports, stats.total_users],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="row">
      {/* Summary Cards */}
      <div className="col-md-3 mb-4">
        <div className="card bg-primary text-white">
          <div className="card-body">
            <h4 className="card-title">{stats.total_reports}</h4>
            <p className="card-text">Total Reports</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-4">
        <div className="card bg-success text-white">
          <div className="card-body">
            <h4 className="card-title">{stats.recent_reports}</h4>
            <p className="card-text">Recent Reports</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-4">
        <div className="card bg-info text-white">
          <div className="card-body">
            <h4 className="card-title">{stats.total_users}</h4>
            <p className="card-text">Total Users</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-4">
        <div className="card bg-warning text-white">
          <div className="card-body">
            <h4 className="card-title">
              {Object.keys(stats.severity_counts).length}
            </h4>
            <p className="card-text">Severity Levels</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="col-md-8 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="card-title">Activity Overview</h6>
            <Bar data={activityData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="card-title">Severity Distribution</h6>
            <Doughnut data={severityData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="card-title">Severity Breakdown</h6>
            <div className="row">
              {Object.entries(stats.severity_counts).map(([severity, count]) => (
                <div key={severity} className="col-md-4 mb-2">
                  <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                    <span className={`badge ${getSeverityBadge(severity)}`}>
                      {severity.toUpperCase()}
                    </span>
                    <strong>{count}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for severity badges
function getSeverityBadge(severity) {
  const severityStyles = {
    low: 'bg-success',
    medium: 'bg-warning',
    high: 'bg-danger'
  };
  return severityStyles[severity] || 'bg-secondary';
}

export default StatsDashboard;