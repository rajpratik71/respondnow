import React, { useState, useEffect } from 'react';
import { 
  useUpdateUserMutation, 
  User, 
  useGroups,
  useAddGroupMemberMutation,
  useRemoveGroupMemberMutation,
  Group
} from '@services/server';
import styles from './UserManagement.module.scss';

interface EditUserDialogProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ isOpen, user, onClose }) => {
  const updateUser = useUpdateUserMutation();
  const { data: allGroups = [] } = useGroups();
  const addToGroup = useAddGroupMemberMutation();
  const removeFromGroup = useRemoveGroupMemberMutation();
  
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    status: user.status || 'ACTIVE',
    roleNames: user.roleNames || []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddToGroup, setShowAddToGroup] = useState(false);
  const [selectedGroupToAdd, setSelectedGroupToAdd] = useState('');

  const availableRoles = ['ADMIN', 'MANAGER', 'RESPONDER', 'VIEWER'];

  // Get user's current groups
  const userGroups = allGroups.filter(group => 
    group.userIds?.includes(user.id) || group.members?.some((m: any) => m.id === user.id)
  );

  // Get groups user is NOT in
  const availableGroups = allGroups.filter(group => 
    !group.userIds?.includes(user.id) && !group.members?.some((m: any) => m.id === user.id)
  );

  useEffect(() => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      status: user.status || 'ACTIVE',
      roleNames: user.roleNames || []
    });
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
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
      await updateUser.mutateAsync({
        id: user.id,
        data: formData
      });
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update user. Please try again.'
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

  const handleAddToGroup = async () => {
    if (!selectedGroupToAdd) return;
    
    try {
      await addToGroup.mutateAsync({ 
        groupId: selectedGroupToAdd, 
        userId: user.id 
      });
      setShowAddToGroup(false);
      setSelectedGroupToAdd('');
    } catch (error) {
      alert('Failed to add user to group');
    }
  };

  const handleRemoveFromGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Remove ${user.username} from group "${groupName}"?`)) {
      try {
        await removeFromGroup.mutateAsync({ 
          groupId, 
          userId: user.id 
        });
      } catch (error) {
        alert('Failed to remove user from group');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.dialog} onClick={onClose}>
      <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className={styles.dialogHeader}>
          <h2>Edit User: {user.username}</h2>
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
                Basic Information
              </h3>

              <div className={styles.formGroup}>
                <label>Username</label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  style={{ background: '#f8f9fa', cursor: 'not-allowed' }}
                />
                <div className={styles.helpText}>Username cannot be changed</div>
              </div>

              <div className={styles.formGroup}>
                <label>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? styles.error : ''}
                />
                {errors.email && <div className={styles.errorText}>{errors.email}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={styles.formGroup}>
                  <label>
                    First Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={errors.firstName ? styles.error : ''}
                  />
                  {errors.firstName && <div className={styles.errorText}>{errors.firstName}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Last Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={errors.lastName ? styles.error : ''}
                  />
                  {errors.lastName && <div className={styles.errorText}>{errors.lastName}</div>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <div className={styles.helpText}>Inactive users cannot log in</div>
              </div>
            </div>

            {/* Roles */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#495057' }}>
                Role Assignment
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
                <div className={styles.helpText}>Select roles for this user</div>
              </div>
            </div>

            {/* Group Membership */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#495057' }}>
                  Group Membership
                </h3>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowAddToGroup(!showAddToGroup)}
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  + Add to Group
                </button>
              </div>

              {showAddToGroup && (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={selectedGroupToAdd}
                      onChange={(e) => setSelectedGroupToAdd(e.target.value)}
                      style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                    >
                      <option value="">Select a group...</option>
                      {availableGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={handleAddToGroup}
                      disabled={!selectedGroupToAdd}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div>
                {userGroups.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#6c757d',
                    background: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    Not a member of any groups
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userGroups.map(group => (
                      <div
                        key={group.id}
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
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{group.name}</div>
                          {group.description && (
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>{group.description}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          className={`${styles.btnIcon} ${styles.delete}`}
                          onClick={() => handleRemoveFromGroup(group.id, group.name)}
                          title="Remove from group"
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
              <div><strong>User ID:</strong> {user.id}</div>
              <div><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</div>
              <div><strong>Last Updated:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'}</div>
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

export default EditUserDialog;
