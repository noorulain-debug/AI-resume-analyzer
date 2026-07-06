import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ScorePill({ score }) {
  const color = score >= 7 ? '#4ade80' : score >= 5 ? '#fb923c' : '#f87171';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 600,
      color: color,
      background: `${color}18`,
      border: `1px solid ${color}40`,
    }}>
      {score}/10
    </span>
  );
}

function History() {
  const { token } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null); // id of item being deleted

 useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/api/analyze/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyses(res.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API}/api/analyze/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert('Could not delete. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="page-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#8b949e',
          padding: '40px 0',
        }}>
          <span className="spinner" style={{
            borderTopColor: '#1D9E75',
            borderColor: '#30363d',
          }} />
          Loading your history...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 className="page-title">Analysis History</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {analyses.length === 0
              ? 'No analyses yet'
              : `${analyses.length} resume${analyses.length === 1 ? '' : 's'} analyzed`}
          </p>
        </div>
        <Link to="/analyze">
          <button className="btn-primary" style={{
            width: 'auto',
            padding: '9px 20px',
            fontSize: '14px',
          }}>
            + New analysis
          </button>
        </Link>
      </div>

      {/* Empty state */}
      {analyses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No analyses yet</h3>
          <p>Analyze your first resume to see results here.</p>
          <Link to="/analyze">
            <button className="btn-primary" style={{
              width: 'auto',
              padding: '10px 24px',
              marginTop: '16px',
            }}>
              Analyze my resume
            </button>
          </Link>
        </div>
      )}

      {/* History list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {analyses.map((analysis) => (
          <div
            key={analysis._id}
            className="card"
            style={{
              opacity: deleting === analysis._id ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              {/* Left: info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontWeight: 600,
                    fontSize: '15px',
                    color: '#e6edf3',
                  }}>
                    {analysis.jobRole || 'General'}
                  </span>
                  <ScorePill score={analysis.score} />
                </div>

                {/* Skills found */}
                {analysis.keywords && analysis.keywords.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#484f58', marginRight: '6px' }}>
                      Skills found:
                    </span>
                    {analysis.keywords.slice(0, 6).map((k) => (
                      <span key={k} className="badge badge-found" style={{ fontSize: '11px' }}>
                        {k}
                      </span>
                    ))}
                    {analysis.keywords.length > 6 && (
                      <span style={{ fontSize: '12px', color: '#484f58' }}>
                        +{analysis.keywords.length - 6} more
                      </span>
                    )}
                  </div>
                )}

                {/* Missing skills */}
                {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#484f58', marginRight: '6px' }}>
                      Missing:
                    </span>
                    {analysis.missingSkills.slice(0, 4).map((k) => (
                      <span key={k} className="badge badge-missing" style={{ fontSize: '11px' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                )}

                <span style={{ fontSize: '12px', color: '#484f58' }}>
                  {formatDate(analysis.createdAt)}
                </span>
              </div>

              {/* Right: delete button */}
              <button
                onClick={() => handleDelete(analysis._id)}
                className="btn-danger"
                disabled={deleting === analysis._id}
                style={{ flexShrink: 0 }}
              >
                {deleting === analysis._id ? '...' : 'Delete'}
              </button>
            </div>

            {/* AI summary if available */}
            {analysis.summary && (
              <>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '13px', flexShrink: 0 }}>🤖</span>
                  <p style={{
                    fontSize: '13px',
                    color: '#8b949e',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {analysis.summary}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
