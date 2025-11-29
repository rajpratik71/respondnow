import React, { useState, useEffect } from 'react';
import { 
  useUpdateGroupMutation, 
  Group,
  useUsers,
  useAddGroupMemberMutation,
  useRemoveGroupMemberMutation,
  User
} from '@services/server';
import styles from '../UserManagement/UserManagement.module.scss';

interface EditGroupDialogProps {
  isOpen: boolean;
  group: Group;
  onClose: () => void;
}

export const EditGroupDialog: React.FC<EditGroupDialogProps> = ({ isOpen, group, onClose }) => {
  const updateGroup = useUpdateGroupMutation();
  const { data: allUsers = [] } = useUsers();
  const addMember = useAddGroupMemberMutation();
  const removeMember = useRemoveGroupMemberMutation();
  
  const [formData, setFormData] = useState({
    name: group.name || '',
    description: group.description || '',
    roleNames: group.roleNames || []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');

  const availableRoles = ['ADMIN', 'MANAGER', 'RESPONDER', 'VIEWER'];

  // Get group members
  const groupMembers = allUsers.filter(user => 
    group.userIds?.includes(user.id) || group.members?.some((m: any) => m.id === user.id)
  );

  // Get users NOT in group
  const availableUsers = allUsers.filter(user => 
    !group.userIds?.includes(user.id) && !group.members?.some((m: any) => m.id === user.id)
  );

  useEffect(() => {
    setFormData({
      name: group.name || '',
      description: group.description || '',
      roleNames: group.roleNames || []
    });
  }, [group]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        data: formData
      });
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update group. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roleNames: prev.roleNames.includes(role)
        ? prev.roleNames.filter(r => r !== role)
        : [...prev.roleNames, role]
    }));
  };

  const handleAddMember = async () => {
    if (!selectedUserToAdd) return;
    
    try {
      await addMember.mutateAsync({ 
        groupId: group.id, 
        userId: selectedUserToAdd 
      });
      setShowAddMember(false);
      setSelectedUserToAdd('');
    } catch (error) {
      alert('Failed to add member to group');
    }
  };

  const handleRemoveMember = async (userId: string, username: string) => {
    if (window.confirm(`Remove ${username} from this group?`)) {
      try {
        await removeMember.mutateAsync({ 
          groupId: group.id, 
          userId 
        });
      } catch (error) {
        alert('Failed to remove member from group');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.dialog} onClick={onClose}>
      <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className={styles.dialogHeader}>
          <h2>Edit Group: {group.name}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.dialogBody}>
            {errors.submit && (
              <div className={styles.error} style={{ marginBottom: '20px' }}>
                {errors.submit}
              </div>
            )}

            {/* Basic Info */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#495057' }}>
                Group Information
              </h3>

              <div className={styles.formGroup}>
                <label>
                  Group Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? styles.error : ''}
                />
                {errors.name && <div className={styles.errorText}>{errors.name}</div>}
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter group description (optional)"
                  rows={3}
                />
              </div>
            </div>

            {/* Roles */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#495057' }}>
                Group Roles
              </h3>
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableRoles.map((role) => (
                    <label
                      key={role}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: formData.roleNames.includes(role) ? '#e7f3ff' : 'white',
                        borderColor: formData.roleNames.includes(role) ? '#0066cc' : '#ced4da'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.roleNames.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{role}</span>
                    </label>
                  ))}
                </div>
                <div className={styles.helpText}>All members inherit these roles</div>
              </div>
            </div>

            {/* Members */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#495057' }}>
                  Members ({groupMembers.length})
                </h3>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowAddMember(!showAddMember)}
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  + Add Member
                </button>
              </div>

              {showAddMember && (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={selectedUserToAdd}
                      onChange={(e) => setSelectedUserToAdd(e.target.value)}
                      style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                    >
                      <option value="">Select a user...</option>
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={handleAddMember}
                      disabled={!selectedUserToAdd}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div>
                {groupMembers.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#6c757d',
                    background: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    No members in this group
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {groupMembers.map(user => (
                      <div
                        key={user.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          background: '#f8f9fa',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>
                            {user.username}
                            {user.roleNames && user.roleNames.length > 0 && (
                              <span style={{ marginLeft: '8px' }}>
                                {user.roleNames.map(role => (
                                  <span 
                                    key={role}
                                    style={{
                                      fontSize: '11px',
                                      padding: '2px 6px',
                                      background: '#e7f3ff',
                                      color: '#0066cc',
                                      borderRadius: '3px',
                                      marginLeft: '4px'
                                    }}
                                  >
                                    {role}
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>{user.email}</div>
                        </div>
                        <button
                          type="button"
                          className={`${styles.btnIcon} ${styles.delete}`}
                          onClick={() => handleRemoveMember(user.id, user.username)}
                          title="Remove member"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '12px', 
              borderRadius: '6px', 
              fontSize: '13px',
              color: '#495057'
            }}>
              <div><strong>Group ID:</strong> {group.id}</div>
              <div><strong>Created:</strong> {group.createdAt ? new Date(group.createdAt).toLocaleString() : '—'}</div>
              <div><strong>Last Updated:</strong> {group.updatedAt ? new Date(group.updatedAt).toLocaleString() : '—'}</div>
            </div>
          </div>

          <div className={styles.dialogFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupDialog;
