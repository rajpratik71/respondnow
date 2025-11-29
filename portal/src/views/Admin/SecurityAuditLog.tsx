import React, { useState } from 'react';
import { DefaultLayout } from '@layouts';
import { useAuditLogs, useAuditStatistics } from '@services/server/hooks/useAuditLogs';
import styles from './UserDetails.module.scss';

export const SecurityAuditLogPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState<string>('');
  const { data: auditData, isLoading, error } = useAuditLogs(page, 50);
  const { data: stats } = useAuditStatistics();

  const getEventBadgeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'LOGIN': '#28a745',
      'LOGIN_FAILED': '#dc3545',
      'PASSWORD_CHANGE': '#ffc107',
      'USER_CREATED': '#17a2b8',
      'USER_DELETED': '#dc3545',
      'ACCESS_DENIED': '#dc3545',
    };
    return colors[eventType] || '#6c757d';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = auditData?.content.filter(log => 
    !filterType || log.eventType === filterType
  ) || [];

  if (isLoading) {
    return (
      <DefaultLayout title="Security Audit Log" padding="large">
        <div className={styles.loading}>Loading audit logs...</div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout title="Security Audit Log" padding="large">
        <div className={styles.error}>Failed to load audit logs</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout
      title="Security Audit Log"
      subtitle="Track all security-related events and user activities"
      padding="large"
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Statistics Cards */}
        {stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Total Logs</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#212529' }}>{stats.totalLogs}</div>
            </div>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Logins (24h)</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>{stats.loginAttempts24h}</div>
            </div>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Failed Logins (24h)</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc3545' }}>{stats.failedLogins24h}</div>
            </div>
            <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Success Rate (24h)</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>
                {stats.successfulEvents24h + stats.failedEvents24h > 0
                  ? Math.round((stats.successfulEvents24h / (stats.successfulEvents24h + stats.failedEvents24h)) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ 
          padding: '16px', 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '16px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>Filter by Event Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">All Events</option>
            <option value="LOGIN">Login</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="PASSWORD_CHANGE">Password Change</option>
            <option value="USER_CREATED">User Created</option>
            <option value="USER_DELETED">User Deleted</option>
            <option value="ACCESS_DENIED">Access Denied</option>
          </select>
          {filterType && (
            <button
              onClick={() => setFilterType('')}
              style={{
                padding: '8px 12px',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Audit Log Table */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Timestamp</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Event Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Username</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>IP Address</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#6c757d' }}>
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: getEventBadgeColor(log.eventType) + '20',
                          color: getEventBadgeColor(log.eventType)
                        }}>
                          {log.eventType}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '500' }}>
                        {log.username || '—'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'monospace' }}>
                        {log.ipAddress || '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: log.success ? '#28a74520' : '#dc354520',
                          color: log.success ? '#28a745' : '#dc3545'
                        }}>
                          {log.success ? 'SUCCESS' : 'FAILED'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', maxWidth: '300px' }}>
                        {log.details || log.errorMessage || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {auditData && auditData.totalPages > 1 && (
            <div style={{
              padding: '16px',
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Page {page + 1} of {auditData.totalPages} ({auditData.totalElements} total)
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    padding: '8px 16px',
                    background: page === 0 ? '#e9ecef' : '#007bff',
                    color: page === 0 ? '#6c757d' : '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: page === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(auditData.totalPages - 1, p + 1))}
                  disabled={page >= auditData.totalPages - 1}
                  style={{
                    padding: '8px 16px',
                    background: page >= auditData.totalPages - 1 ? '#e9ecef' : '#007bff',
                    color: page >= auditData.totalPages - 1 ? '#6c757d' : '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: page >= auditData.totalPages - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SecurityAuditLogPage;
