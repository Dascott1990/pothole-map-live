import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import CommentsSection from '../components/CommentsSection';
import { formatDate, getSeverityBadge } from '../utils/helpers';

const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      // Since we don't have a single report endpoint, we'll fetch all and filter
      const response = await api.get('/api/reports?limit=1000');
      const foundReport = response.data.reports.find(r => r.id === parseInt(id));
      
      if (foundReport) {
        setReport(foundReport);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Report not found
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button 
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate('/')}
      >
        ← Back to Reports
      </button>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            {report.image_url && (
              <img 
                src={report.image_url} 
                className="card-img-top"
                alt="Pothole report"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
            )}
            
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className={`badge ${getSeverityBadge(report.severity)} fs-6`}>
                  {report.severity.toUpperCase()} SEVERITY
                </span>
                {report.verified && (
                  <span className="badge bg-success fs-6">Verified</span>
                )}
              </div>

              <p className="card-text fs-5">{report.text}</p>

              {report.ai_conf && (
                <div className="alert alert-info">
                  <strong>AI Analysis:</strong> {report.detection_count || 0} detections with {(report.ai_conf * 100).toFixed(1)}% average confidence
                </div>
              )}

              <div className="mt-4">
                <h6>Location Details</h6>
                <p className="text-muted mb-1">
                  <strong>Coordinates:</strong> {report.lat.toFixed(6)}, {report.lon.toFixed(6)}
                </p>
                <small className="text-muted">
                  Reported by {report.username} on {formatDate(report.created_at)}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <CommentsSection reportId={report.id} />
        </div>
      </div>
    </div>
  );
};

export default ReportPage;