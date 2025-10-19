import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../utils/api';
import { formatDate } from '../utils/helpers';

const CommentsSection = ({ reportId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { comments: socketComments, setComments: setSocketComments } = useSocket();

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  useEffect(() => {
    if (socketComments[reportId]) {
      setComments(socketComments[reportId]);
    }
  }, [socketComments, reportId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/comments?report_id=${reportId}`);
      setComments(response.data);
      setSocketComments(prev => ({ ...prev, [reportId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await api.post('/api/comment', {
        report_id: reportId,
        text: newComment
      });
      
      setNewComment('');
      // Socket will update via context
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h6 className="card-title">Comments ({comments.length})</h6>

        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="mb-4">
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={loading || !newComment.trim()}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="alert alert-info">
            Please <a href="/login">login</a> to comment
          </div>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="text-muted text-center py-3">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="card mb-2">
                <div className="card-body py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <strong>{comment.username}</strong>
                    <small className="text-muted">
                      {formatDate(comment.created_at)}
                    </small>
                  </div>
                  <p className="mb-0 mt-1">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;