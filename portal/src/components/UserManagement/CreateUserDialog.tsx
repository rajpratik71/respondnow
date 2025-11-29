import React, { useState } from 'react';
import { useCreateUserMutation } from '@services/server';
import styles from './UserManagement.module.scss';

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ isOpen, onClose }) => {
  const createUser = useCreateUserMutation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleNames: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRoles = ['ADMIN', 'MANAGER', 'RESPONDER', 'VIEWER'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
      await createUser.mutateAsync(formData);
      onClose();
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roleNames: []
      });
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create user. Please try again.'
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
          <h2>Create New User</h2>
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
                Username <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={errors.username ? styles.error : ''}
                placeholder="Enter username"
              />
              {errors.username && <div className={styles.errorText}>{errors.username}</div>}
              <div className={styles.helpText}>Unique username for login</div>
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
                placeholder="user@example.com"
              />
              {errors.email && <div className={styles.errorText}>{errors.email}</div>}
            </div>

            <div className={styles.formGroup}>
              <label>
                Password <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? styles.error : ''}
                placeholder="Min. 8 characters"
              />
              {errors.password && <div className={styles.errorText}>{errors.password}</div>}
              <div className={styles.helpText}>Minimum 8 characters</div>
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
                  placeholder="First name"
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
                  placeholder="Last name"
                />
                {errors.lastName && <div className={styles.errorText}>{errors.lastName}</div>}
              </div>
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
              <div className={styles.helpText}>Select one or more roles for this user</div>
            </div>
          </div>

          <div className={styles.dialogFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserDialog;
