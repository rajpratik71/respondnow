import React, { useState } from 'react';
import { DefaultLayout } from '@layouts';
import { usePermissionMatrix } from '@services/server/hooks/useAuditLogs';
import styles from './UserDetails.module.scss';

type ViewMode = 'roles' | 'users' | 'groups';

export const PermissionMatrixPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: matrix, isLoading, error } = usePermissionMatrix();

  if (isLoading) {
    return (
      <DefaultLayout title="Permission Matrix" padding="large">
        <div className={styles.loading}>Loading permission matrix...</div>
      </DefaultLayout>
    );
  }

  if (error || !matrix) {
    return (
      <DefaultLayout title="Permission Matrix" padding="large">
        <div className={styles.error}>Failed to load permission matrix</div>
      </DefaultLayout>
    );
  }

  const filterBySearch = (items: any[], searchFields: string[]) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      searchFields.some(field => 
        item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  return (
    <DefaultLayout
      title="Permission Matrix"
      subtitle="View and analyze system-wide permissions, roles, and access control"
      padding="large"
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* View Mode Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #dee2e6'
        }}>
          <button
            onClick={() => setViewMode('roles')}
            style={{
              padding: '12px 24px',
              background: viewMode === 'roles' ? '#007bff' : 'transparent',
              color: viewMode === 'roles' ? '#fff' : '#495057',
              border: 'none',
              borderBottom: viewMode === 'roles' ? '3px solid #007bff' : '3px solid transparent',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Roles ({matrix.roles.length})
          </button>
          <button
            onClick={() => setViewMode('users')}
            style={{
              padding: '12px 24px',
              background: viewMode === 'users' ? '#007bff' : 'transparent',
              color: viewMode === 'users' ? '#fff' : '#495057',
              border: 'none',
              borderBottom: viewMode === 'users' ? '3px solid #007bff' : '3px solid transparent',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Users ({matrix.users.length})
          </button>
          <button
            onClick={() => setViewMode('groups')}
            style={{
              padding: '12px 24px',
              background: viewMode === 'groups' ? '#007bff' : 'transparent',
              color: viewMode === 'groups' ? '#fff' : '#495057',
              border: 'none',
              borderBottom: viewMode === 'groups' ? '3px solid #007bff' : '3px solid transparent',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Groups ({matrix.groups.length})
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder={`Search ${viewMode}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #ced4da',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Roles View */}
        {viewMode === 'roles' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filterBySearch(matrix.roles, ['roleName']).map((role) => (
              <div
                key={role.roleName}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#212529' }}>
                      {role.roleName}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#17a2b820',
                      color: '#17a2b8'
                    }}>
                      {role.roleType}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {role.userCount} users · {role.groupCount} groups
                    </div>
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                    Permissions ({role.permissions.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {role.permissions.map((perm) => (
                      <span
                        key={perm}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: '#e7f3ff',
                          color: '#0066cc',
                          fontFamily: 'monospace'
                        }}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users View */}
        {viewMode === 'users' && (
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Username</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Direct Roles</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Group Roles</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Groups</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Total Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterBySearch(matrix.users, ['username', 'email']).map((user) => (
                    <tr key={user.userId} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600' }}>{user.username}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {user.directRoles.length > 0 ? (
                            user.directRoles.map(role => (
                              <span key={role} style={{
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '11px',
                                background: '#28a74520',
                                color: '#28a745',
                                fontWeight: '600'
                              }}>
                                {role}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#6c757d', fontSize: '12px' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {user.groupRoles.length > 0 ? (
                            user.groupRoles.map(role => (
                              <span key={role} style={{
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '11px',
                                background: '#17a2b820',
                                color: '#17a2b8',
                                fontWeight: '600'
                              }}>
                                {role}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#6c757d', fontSize: '12px' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#6c757d' }}>
                        {user.groupNames.length > 0 ? user.groupNames.join(', ') : '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: '#e7f3ff',
                          color: '#0066cc'
                        }}>
                          {user.effectivePermissions.length}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Groups View */}
        {viewMode === 'groups' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filterBySearch(matrix.groups, ['groupName']).map((group) => (
              <div
                key={group.groupId}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#212529' }}>
                      {group.groupName}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {group.memberCount} members
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                    Roles:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {group.roles.length > 0 ? (
                      group.roles.map((role) => (
                        <span
                          key={role}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: '#28a74520',
                            color: '#28a745'
                          }}
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#6c757d', fontSize: '13px' }}>No roles assigned</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                    Effective Permissions ({group.effectivePermissions.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {group.effectivePermissions.map((perm) => (
                      <span
                        key={perm}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: '#e7f3ff',
                          color: '#0066cc',
                          fontFamily: 'monospace'
                        }}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PermissionMatrixPage;
