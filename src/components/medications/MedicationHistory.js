import React, { useState, useEffect, useCallback } from 'react';
import { getMedicationHistory } from '../../services/medicationService';

const MedicationHistory = ({ petId, medicationId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'administered', 'skipped'

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMedicationHistory(petId, medicationId);
      setHistory(response.administrationHistory || []);
    } catch (err) {
      setError('Failed to load medication history: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [petId, medicationId]);

  useEffect(() => {
    if (petId && medicationId) {
      fetchHistory();
    }
  }, [petId, medicationId, fetchHistory]);

  const filteredHistory = history.filter(entry => {
    if (filter === 'all') return true;
    return entry.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status) => {
    return status === 'administered' ? '✓' : '✗';
  };

  const getStatusColor = (status) => {
    return status === 'administered' ? '#28a745' : '#6c757d';
  };

  if (loading) {
    return (
      <div className="medication-history">
        <div className="loading">Loading medication history...</div>
        <style jsx>{`
          .medication-history {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          .loading {
            text-align: center;
            padding: 20px;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medication-history">
        <div className="error">{error}</div>
        <button onClick={fetchHistory} className="retry-btn">
          Try Again
        </button>
        <style jsx>{`
          .medication-history {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          .error {
            color: #dc3545;
            text-align: center;
            padding: 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            margin-bottom: 10px;
          }
          .retry-btn {
            display: block;
            margin: 0 auto;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="medication-history">
      <div className="history-header">
        <h3>Medication History</h3>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All ({history.length})</option>
            <option value="administered">
              Administered ({history.filter(h => h.status === 'administered').length})
            </option>
            <option value="skipped">
              Skipped ({history.filter(h => h.status === 'skipped').length})
            </option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="no-history">
          {filter === 'all' 
            ? 'No medication history found.' 
            : `No ${filter} entries found.`
          }
        </div>
      ) : (
        <div className="history-list">
          {filteredHistory.map(entry => (
            <div key={entry.id} className={`history-entry ${entry.status}`}>
              <div className="entry-header">
                <span 
                  className={`status-badge ${entry.status}`}
                  style={{ color: getStatusColor(entry.status) }}
                >
                  {getStatusIcon(entry.status)} {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                </span>
                <span className="entry-date">
                  {formatDate(entry.administeredAt)}
                </span>
              </div>
              {entry.notes && (
                <div className="entry-notes">
                  <strong>Notes:</strong> {entry.notes}
                </div>
              )}
              <div className="entry-logged">
                Logged: {formatDate(entry.loggedAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .medication-history {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
          border: 1px solid #e0e0e0;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .history-header h3 {
          margin: 0;
          color: #333;
        }
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          color: #333;
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .history-entry {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px;
          background: #fafafa;
        }
        .history-entry.administered {
          border-left: 4px solid #28a745;
        }
        .history-entry.skipped {
          border-left: 4px solid #6c757d;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          background: #f8f9fa;
        }
        .status-badge.administered {
          background: #d4edda;
          color: #155724;
        }
        .status-badge.skipped {
          background: #f8f9fa;
          color: #6c757d;
        }
        .entry-date {
          font-weight: bold;
          color: #333;
          font-size: 14px;
        }
        .entry-notes {
          margin: 8px 0;
          font-size: 14px;
          color: #666;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }
        .entry-logged {
          font-size: 12px;
          color: #999;
          font-style: italic;
        }
        .no-history {
          text-align: center;
          padding: 40px 20px;
          color: #666;
          font-style: italic;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .history-header {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-select {
            width: 100%;
          }
          .entry-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default MedicationHistory;