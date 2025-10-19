import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import ReportCard from './ReportCard';

const ReportList = ({ onReportSelect }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    severity: '',
    verified: ''
  });

  const { reports: socketReports, setReports: setSocketReports } = useSocket();

  useEffect(() => {
    fetchReports();
  }, [filters]);

  useEffect(() => {
    if (socketReports.length > 0) {
      setReports(prev => [...socketReports, ...prev]);
    }
  }, [socketReports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/api/reports?${params}`);
      setReports(response.data.reports);
      setPagination(response.data.pagination);
      setSocketReports(response.data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (loading && reports.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <select 
            className="form-select"
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="col-md-4">
          <select 
            className="form-select"
            value={filters.verified}
            onChange={(e) => handleFilterChange('verified', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
        <div className="col-md-4">
          <button 
            className="btn btn-outline-secondary w-100"
            onClick={() => setFilters({ page: 1, limit: 12, severity: '', verified: '' })}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="row">
        {reports.map(report => (
          <div key={report.id} className="col-lg-4 col-md-6 mb-4">
            <ReportCard 
              report={report} 
              onClick={() => onReportSelect && onReportSelect(report)}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link"
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </button>
            </li>
            
            {[...Array(pagination.pages)].map((_, i) => (
              <li key={i} className={`page-item ${filters.page === i + 1 ? 'active' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${filters.page === pagination.pages ? 'disabled' : ''}`}>
              <button 
                className="page-link"
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

      {reports.length === 0 && (
        <div className="text-center py-5">
          <h5>No reports found</h5>
          <p className="text-muted">Try adjusting your filters or be the first to report a pothole!</p>
        </div>
      )}
    </div>
  );
};

export default ReportList;