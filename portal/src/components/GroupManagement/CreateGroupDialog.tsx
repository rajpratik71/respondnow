import React, { useState } from 'react';
import { useCreateGroupMutation } from '@services/server';
import styles from '../UserManagement/UserManagement.module.scss';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ isOpen, onClose }) => {
  const createGroup = useCreateGroupMutation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    roleNames: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRoles = ['ADMIN', 'MANAGER', 'RESPONDER', 'VIEWER'];

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
      await createGroup.mutateAsync(formData);
      onClose();
      setFormData({ name: '', description: '', roleNames: [] });
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create group. Please try again.'
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

  if (!isOpen) return null;

  return (
    <div className={styles.dialog} onClick={onClose}>
      <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h2>Create New Group</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.dialogBody}>
            {errors.submit && (
              <div className={styles.error} style={{ marginBottom: '20px' }}>
                {errors.submit}
              </div>
            )}

            <div className={styles.formGroup}>
              <label>
                Group Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? styles.error : ''}
                placeholder="Enter group name"
              />
              {errors.name && <div className={styles.errorText}>{errors.name}</div>}
              <div className={styles.helpText}>A unique name for this group</div>
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter group description (optional)"
                rows={3}
              />
              <div className={styles.helpText}>Brief description of the group's purpose</div>
            </div>

            <div className={styles.formGroup}>
              <label>Assign Roles</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
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
              <div className={styles.helpText}>Select roles that all group members will inherit</div>
            </div>
          </div>

          <div className={styles.dialogFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupDialog;
