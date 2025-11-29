import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { DefaultLayout } from '@layouts';
import { Button, Card, Container, Layout, Text, useToaster } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { useUser, useDeleteUserMutation, useGroups } from '@services/server';
import { paths } from '@routes/RouteDefinitions';
import { EditUserDialog } from '@components/UserManagement/EditUserDialog';
import styles from './UserDetails.module.scss';

export const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { showSuccess, showError } = useToaster();
  const { data: user, isLoading, error } = useUser(id);
  const { data: allGroups = [] } = useGroups();
  const deleteUser = useDeleteUserMutation();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Get groups from user object (now includes groupNames field)
  const userGroupNames = user?.groupNames || [];
  const userGroups = allGroups.filter(group => 
    userGroupNames.includes(group.name) || 
    group.userIds?.includes(id) || 
    user?.groupIds?.includes(group.id)
  );

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${user?.username}?`)) {
      try {
        await deleteUser.mutateAsync(id);
        showSuccess('User deleted successfully');
        history.push(paths.toUsers());
      } catch (error) {
        showError('Failed to delete user');
      }
    }
  };

  if (isLoading) {
    return (
      <DefaultLayout title="User Details" padding="large">
        <div className={styles.loading}>Loading user details...</div>
      </DefaultLayout>
    );
  }

  if (error || !user) {
    return (
      <DefaultLayout title="User Not Found" padding="large">
        <div className={styles.error}>User not found or an error occurred.</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout
      title={`User Details: ${user.username}`}
      subtitle="View complete user information and audit history"
      toolbar={
        <Layout.Horizontal spacing="small">
          <Button
            text="Edit"
            icon="edit"
            onClick={() => setIsEditDialogOpen(true)}
          />
          <Button
            text="Delete"
            icon="trash"
            intent="danger"
            onClick={handleDelete}
          />
          <Button
            text="Back to Users"
            icon="arrow-left"
            minimal
            onClick={() => history.push(paths.toUsers())}
          />
        </Layout.Horizontal>
      }
    >
      <Layout.Vertical spacing="large" className={styles.container}>
        {/* Basic Information Card */}
        <Card className={styles.card}>
          <Layout.Vertical spacing="medium">
            <Text color={Color.GREY_900} font={{ variation: FontVariation.H5, weight: 'bold' }}>
              Basic Information
            </Text>
            
            <Layout.Vertical spacing="small" className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Username
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {user.username}
                </Text>
              </div>

              <div className={styles.infoRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Full Name
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {user.firstName} {user.lastName}
                </Text>
              </div>

              <div className={styles.infoRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Email
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {user.email}
                </Text>
              </div>

              <div className={styles.infoRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Status
                </Text>
                <span className={`${styles.statusBadge} ${user.status === 'ACTIVE' ? styles.active : styles.inactive}`}>
                  {user.status || 'ACTIVE'}
                </span>
              </div>

              <div className={styles.infoRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  User ID
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL, family: 'mono' }}>
                  {user.id}
                </Text>
              </div>
            </Layout.Vertical>
          </Layout.Vertical>
        </Card>

        {/* Roles Card */}
        <Card className={styles.card}>
          <Layout.Vertical spacing="medium">
            <Text color={Color.GREY_900} font={{ variation: FontVariation.H5, weight: 'bold' }}>
              Roles & Permissions
            </Text>
            
            {user.roleNames && user.roleNames.length > 0 ? (
              <div className={styles.badgeContainer}>
                {user.roleNames.map(role => (
                  <span key={role} className={styles.roleBadge}>
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY }}>
                No roles assigned
              </Text>
            )}

            {user.effectivePermissions && user.effectivePermissions.length > 0 && (
              <div className={styles.permissionsSection}>
                <Text color={Color.GREY_700} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Effective Permissions:
                </Text>
                <div className={styles.permissionsList}>
                  {user.effectivePermissions.map((perm: any) => (
                    <span key={perm} className={styles.permissionBadge}>
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Layout.Vertical>
        </Card>

        {/* Groups Card */}
        <Card className={styles.card}>
          <Layout.Vertical spacing="medium">
            <Text color={Color.GREY_900} font={{ variation: FontVariation.H5, weight: 'bold' }}>
              Group Memberships
            </Text>
            
            {userGroups.length > 0 ? (
              <Layout.Vertical spacing="small">
                {userGroups.map(group => (
                  <div key={group.id} className={styles.groupItem}>
                    <Layout.Vertical spacing="xsmall">
                      <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                        {group.name}
                      </Text>
                      {group.description && (
                        <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
                          {group.description}
                        </Text>
                      )}
                      {group.roleNames && group.roleNames.length > 0 && (
                        <div className={styles.badgeContainer}>
                          {group.roleNames.map(role => (
                            <span key={role} className={styles.groupRoleBadge}>
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </Layout.Vertical>
                    <Button
                      text="View Group"
                      minimal
                      icon="arrow-right"
                      onClick={() => history.push(`/groups/${group.id}`)}
                    />
                  </div>
                ))}
              </Layout.Vertical>
            ) : (
              <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY }}>
                Not a member of any groups
              </Text>
            )}
          </Layout.Vertical>
        </Card>

        {/* Audit Information Card */}
        <Card className={styles.card}>
          <Layout.Vertical spacing="medium">
            <Text color={Color.GREY_900} font={{ variation: FontVariation.H5, weight: 'bold' }}>
              Audit Information
            </Text>
            
            <Layout.Vertical spacing="small" className={styles.auditGrid}>
              <div className={styles.auditRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Created At
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : '—'}
                </Text>
              </div>

              <div className={styles.auditRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Last Updated
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : '—'}
                </Text>
              </div>

              <div className={styles.auditRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Last Login
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : 'Never logged in'}
                </Text>
              </div>

              {user.createdAt && user.updatedAt && (
                <div className={styles.auditRow}>
                  <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                    Account Age
                  </Text>
                  <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                    {Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                  </Text>
                </div>
              )}
            </Layout.Vertical>
          </Layout.Vertical>
        </Card>
      </Layout.Vertical>

      {isEditDialogOpen && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          user={user}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}
    </DefaultLayout>
  );
};

export default UserDetailsPage;
