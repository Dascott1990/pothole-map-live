import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatDate, getSeverityBadge } from '../utils/helpers';

const ReportCard = ({ report, onClick }) => {
  const { isAuthenticated } = useAuth();
  const [votes, setVotes] = useState({
    upvotes: report.upvotes || 0,
    downvotes: report.downvotes || 0
  });
  const [userVote, setUserVote] = useState(null);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    try {
      const response = await api.post('/api/vote', {
        report_id: report.id,
        vote_type: voteType
      });

      setVotes({
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes
      });
      setUserVote(voteType);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  return (
    <div className="card h-100 shadow-sm report-card" style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {report.thumb_url && (
        <img 
          src={report.thumb_url} 
          className="card-img-top" 
          alt="Pothole"
          style={{ height: '200px', objectFit: 'cover' }}
          onClick={onClick}
        />
      )}
      
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className={`badge ${getSeverityBadge(report.severity)}`}>
            {report.severity.toUpperCase()}
          </span>
          {report.verified && (
            <span className="badge bg-success">Verified</span>
          )}
        </div>

        <p className="card-text" onClick={onClick}>
          {report.text.length > 100 ? `${report.text.substring(0, 100)}...` : report.text}
        </p>

        {report.ai_conf && (
          <div className="mb-2">
            <small className="text-muted">
              AI Confidence: {(report.ai_conf * 100).toFixed(1)}%
            </small>
          </div>
        )}
      </div>

      <div className="card-footer bg-transparent">
        <div className="d-flex justify-content-between align-items-center">
          <div className="btn-group" role="group">
            <button 
              type="button" 
              className={`btn btn-sm btn-outline-success ${userVote === 'up' ? 'active' : ''}`}
              onClick={() => handleVote('up')}
            >
              👍 {votes.upvotes}
            </button>
            <button 
              type="button" 
              className={`btn btn-sm btn-outline-danger ${userVote === 'down' ? 'active' : ''}`}
              onClick={() => handleVote('down')}
            >
              👎 {votes.downvotes}
            </button>
          </div>
          
          <small className="text-muted">
            by {report.username}
          </small>
        </div>
        
        <small className="text-muted d-block mt-1">
          {formatDate(report.created_at)}
        </small>
      </div>
    </div>
  );
};

export default ReportCard;