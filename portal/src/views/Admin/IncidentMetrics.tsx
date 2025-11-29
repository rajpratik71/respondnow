import React, { useState } from 'react';
import { DefaultLayout } from '@layouts';
import { useIncidentMetrics } from '@services/server/hooks/useIncidentMetrics';
import styles from './UserDetails.module.scss';

export const IncidentMetricsPage: React.FC = () => {
  const [daysFilter, setDaysFilter] = useState<number | undefined>(30);
  const { data: metrics, isLoading, error } = useIncidentMetrics(daysFilter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'OPEN': '#D97706',
      'ACKNOWLEDGED': '#3B82F6',
      'RESOLVED': '#10B981',
      'CLOSED': '#6B7280',
      'IN_PROGRESS': '#8B5CF6'
    };
    return colors[status] || '#6c757d';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'CRITICAL': '#DC2626',
      'HIGH': '#F59E0B',
      'MEDIUM': '#FCD34D',
      'LOW': '#93C5FD',
      'INFO': '#D1D5DB'
    };
    return colors[severity] || '#6c757d';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <DefaultLayout title="Incident Metrics" padding="large">
        <div className={styles.loading}>Loading metrics...</div>
      </DefaultLayout>
    );
  }

  if (error || !metrics) {
    return (
      <DefaultLayout title="Incident Metrics" padding="large">
        <div className={styles.error}>Failed to load incident metrics</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout
      title="Incident Metrics Dashboard"
      subtitle="Monitor incident trends, statistics, and resolution times"
      padding="large"
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Time Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          padding: '12px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setDaysFilter(undefined)}
            style={{
              padding: '8px 16px',
              background: daysFilter === undefined ? '#007bff' : '#f8f9fa',
              color: daysFilter === undefined ? '#fff' : '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            All Time
          </button>
          <button
            onClick={() => setDaysFilter(7)}
            style={{
              padding: '8px 16px',
              background: daysFilter === 7 ? '#007bff' : '#f8f9fa',
              color: daysFilter === 7 ? '#fff' : '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDaysFilter(30)}
            style={{
              padding: '8px 16px',
              background: daysFilter === 30 ? '#007bff' : '#f8f9fa',
              color: daysFilter === 30 ? '#fff' : '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDaysFilter(90)}
            style={{
              padding: '8px 16px',
              background: daysFilter === 90 ? '#007bff' : '#f8f9fa',
              color: daysFilter === 90 ? '#fff' : '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Last 90 Days
          </button>
        </div>

        {/* Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Total Incidents</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#212529' }}>{metrics.totalIncidents}</div>
          </div>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Open</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#D97706' }}>{metrics.openIncidents}</div>
          </div>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Acknowledged</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3B82F6' }}>{metrics.acknowledgedIncidents}</div>
          </div>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Closed</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>{metrics.closedIncidents}</div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>Last 24 Hours</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Created:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last24Hours.created}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Acknowledged:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last24Hours.acknowledged}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Resolved:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last24Hours.resolved}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Closed:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last24Hours.closed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>
                <span style={{ color: '#6c757d' }}>Avg Resolution:</span>
                <span style={{ fontWeight: 'bold' }}>{formatDuration(metrics.last24Hours.averageResolutionTimeMinutes)}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>Last 7 Days</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Created:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last7Days.created}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Acknowledged:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last7Days.acknowledged}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Resolved:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last7Days.resolved}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Closed:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last7Days.closed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>
                <span style={{ color: '#6c757d' }}>Avg Resolution:</span>
                <span style={{ fontWeight: 'bold' }}>{formatDuration(metrics.last7Days.averageResolutionTimeMinutes)}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>Last 30 Days</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Created:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last30Days.created}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Acknowledged:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last30Days.acknowledged}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Resolved:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last30Days.resolved}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Closed:</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.last30Days.closed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>
                <span style={{ color: '#6c757d' }}>Avg Resolution:</span>
                <span style={{ fontWeight: 'bold' }}>{formatDuration(metrics.last30Days.averageResolutionTimeMinutes)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>By Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(metrics.countsByStatus).map(([status, count]) => (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: getStatusColor(status) }}>{status}</span>
                    <span style={{ fontWeight: 'bold' }}>{count}</span>
                  </div>
                  <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(count / metrics.totalIncidents) * 100}%`,
                        background: getStatusColor(status),
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>By Severity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(metrics.countsBySeverity).map(([severity, count]) => (
                <div key={severity}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: getSeverityColor(severity) }}>{severity}</span>
                    <span style={{ fontWeight: 'bold' }}>{count}</span>
                  </div>
                  <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(count / metrics.totalIncidents) * 100}%`,
                        background: getSeverityColor(severity),
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>Timeline View</h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content', padding: '20px 0' }}>
              {metrics.timelineData.map((point) => {
                const maxCount = Math.max(...metrics.timelineData.map(p => p.count));
                const barHeight = Math.max((point.count / maxCount) * 200, 10);
                
                return (
                  <div
                    key={point.date}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: '60px'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#212529' }}>{point.count}</span>
                    <div
                      style={{
                        width: '40px',
                        height: `${barHeight}px`,
                        background: 'linear-gradient(to top, #007bff, #66b3ff)',
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      title={`${point.date}: ${point.count} incidents`}
                    />
                    <span style={{ fontSize: '11px', color: '#6c757d', transform: 'rotate(-45deg)', transformOrigin: 'center', width: '80px', textAlign: 'right' }}>
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default IncidentMetricsPage;
