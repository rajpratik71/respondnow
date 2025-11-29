import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useGroups, useDeleteGroupMutation, Group } from '@services/server';
import { CreateGroupDialog } from './CreateGroupDialog';
import { EditGroupDialog } from './EditGroupDialog';
import { GroupPermissions } from '@utils';
import { useAppStore } from '@hooks';
import styles from '../UserManagement/UserManagement.module.scss';

export const GroupList: React.FC = () => {
  const history = useHistory();
  const { data: groups, isLoading, error } = useGroups();
  const deleteGroup = useDeleteGroupMutation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  
  // Get current user roles from context
  const { currentUserInfo } = useAppStore();
  const userRoles = currentUserInfo?.roleNames || [];
  
  // Check permissions
  const canCreate = GroupPermissions.canCreate(userRoles);
  const canUpdate = GroupPermissions.canUpdate(userRoles);
  const canDelete = GroupPermissions.canDelete(userRoles);

  const handleDelete = async (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete group "${groupName}"?\n\nThis action cannot be undone.`)) {
      try {
        await deleteGroup.mutateAsync(groupId);
      } catch (error) {
        alert('Failed to delete group. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <svg width="40" height="40" viewBox="0 0 40 40" stroke="currentColor">
            <g fill="none" fillRule="evenodd">
              <circle cx="20" cy="20" r="18" strokeWidth="4" opacity=".2" />
              <path d="M38 20c0-9.94-8.06-18-18-18" strokeWidth="4">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 20 20"
                  to="360 20 20"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </svg>
          <span style={{ marginLeft: '12px' }}>Loading groups...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <strong>Error loading groups</strong>
          <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
          <button className={styles.btnPrimary} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Group Management</h1>
        {canCreate && (
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => setCreateDialogOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
              </svg>
              Create Group
            </button>
          </div>
        )}
      </div>

      <div className={styles.card}>
        {!groups || groups.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="24" cy="20" r="6" />
              <circle cx="40" cy="20" r="6" />
              <circle cx="32" cy="38" r="6" />
              <path d="M16 50c0-4.418 3.582-8 8-8s8 3.582 8 8" />
              <path d="M32 50c0-4.418 3.582-8 8-8s8 3.582 8 8" />
              <path d="M24 56c0-4.418 3.582-8 8-8s8 3.582 8 8" />
            </svg>
            <h3>No groups found</h3>
            <p>{canCreate ? 'Get started by creating your first group' : 'No groups available to view'}</p>
            {canCreate && (
              <button className={styles.btnPrimary} onClick={() => setCreateDialogOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
                </svg>
                Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Description</th>
                  <th>Members</th>
                  <th>Roles</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td><strong>{group.name}</strong></td>
                    <td style={{ maxWidth: '300px' }}>
                      {group.description || <span style={{ color: '#6c757d', fontStyle: 'italic' }}>No description</span>}
                    </td>
                    <td>
                      <span className={styles.badge} style={{ background: '#e7f3ff', color: '#0066cc' }}>
                        {group.memberCount || group.userIds?.length || 0} members
                      </span>
                    </td>
                    <td>
                      <div>
                        {group.roleNames && group.roleNames.length > 0 ? (
                          group.roleNames.map((role) => (
                            <span key={role} className={styles.roleBadge}>
                              {role}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#6c757d', fontSize: '13px' }}>No roles</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {group.createdAt
                        ? new Date(group.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '—'}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.btnIcon} ${styles.view}`}
                          onClick={() => history.push(`/groups/${group.id}`)}
                          title="View details"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                          </svg>
                        </button>
                        {canUpdate && (
                          <button
                            className={`${styles.btnIcon} ${styles.edit}`}
                            onClick={() => setEditGroup(group)}
                            title="Edit group"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                            </svg>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className={`${styles.btnIcon} ${styles.delete}`}
                            onClick={() => handleDelete(group.id, group.name)}
                            title="Delete group"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createDialogOpen && (
        <CreateGroupDialog
          isOpen={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      )}

      {editGroup && (
        <EditGroupDialog
          isOpen={!!editGroup}
          group={editGroup}
          onClose={() => setEditGroup(null)}
        />
      )}
    </div>
  );
};

export default GroupList;
