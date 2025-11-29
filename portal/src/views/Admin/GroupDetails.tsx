import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { DefaultLayout } from '@layouts';
import { Button, Card, Container, Layout, Text, useToaster } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { useGroup, useDeleteGroupMutation, useUsers } from '@services/server';
import { paths } from '@routes/RouteDefinitions';
import { EditGroupDialog } from '@components/GroupManagement/EditGroupDialog';
import styles from './UserDetails.module.scss'; // Reuse same styles

export const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { showSuccess, showError } = useToaster();
  const { data: group, isLoading, error } = useGroup(id);
  const { data: allUsers = [] } = useUsers();
  const deleteGroup = useDeleteGroupMutation();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Get members from group object (now includes usernames field)
  const groupUsernames = group?.usernames || [];
  const groupMembers = allUsers.filter(user => 
    groupUsernames.includes(user.username) || 
    group?.userIds?.includes(user.id) || 
    group?.userIds?.includes(user.username)
  );

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${group?.name}?`)) {
      try {
        await deleteGroup.mutateAsync(id);
        showSuccess('Group deleted successfully');
        history.push(paths.toGroups());
      } catch (error) {
        showError('Failed to delete group');
      }
    }
  };

  if (isLoading) {
    return (
      <DefaultLayout title="Group Details" padding="large">
        <div className={styles.loading}>Loading group details...</div>
      </DefaultLayout>
    );
  }

  if (error || !group) {
    return (
      <DefaultLayout title="Group Not Found" padding="large">
        <div className={styles.error}>Group not found or an error occurred.</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout
      title={`Group Details: ${group.name}`}
      subtitle="View complete group information, members, and audit history"
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
            text="Back to Groups"
            icon="arrow-left"
            minimal
            onClick={() => history.push(paths.toGroups())}
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
                  Group Name
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {group.name}
                </Text>
              </div>

              <div className={styles.infoRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Description
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {group.description || '—'}
                </Text>
              </div>

              <div className={styles.infoRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Member Count
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {groupMembers.length} {groupMembers.length === 1 ? 'member' : 'members'}
                </Text>
              </div>

              <div className={styles.infoRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Group ID
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL, family: 'mono' }}>
                  {group.id}
                </Text>
              </div>
            </Layout.Vertical>
          </Layout.Vertical>
        </Card>

        {/* Group Roles Card */}
        <Card className={styles.card}>
          <Layout.Vertical spacing="medium">
            <Text color={Color.GREY_900} font={{ variation: FontVariation.H5, weight: 'bold' }}>
              Group Roles
            </Text>
            <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
              All members of this group inherit these roles
            </Text>
            
            {group.roleNames && group.roleNames.length > 0 ? (
              <div className={styles.badgeContainer}>
                {group.roleNames.map(role => (
                  <span key={role} className={styles.roleBadge}>
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY }}>
                No roles assigned to this group
              </Text>
            )}
          </Layout.Vertical>
        </Card>

        {/* Members Card */}
        <Card className={styles.card}>
          <Layout.Vertical spacing="medium">
            <Text color={Color.GREY_900} font={{ variation: FontVariation.H5, weight: 'bold' }}>
              Members ({groupMembers.length})
            </Text>
            
            {groupMembers.length > 0 ? (
              <Layout.Vertical spacing="small">
                {groupMembers.map(user => (
                  <div key={user.id} className={styles.groupItem}>
                    <Layout.Vertical spacing="xsmall" style={{ flex: 1 }}>
                      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
                        <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                          {user.username}
                        </Text>
                        <span className={`${styles.statusBadge} ${user.status === 'ACTIVE' ? styles.active : styles.inactive}`}>
                          {user.status || 'ACTIVE'}
                        </span>
                      </Layout.Horizontal>
                      <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
                        {user.email}
                      </Text>
                      {user.roleNames && user.roleNames.length > 0 && (
                        <div className={styles.badgeContainer}>
                          <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
                            Individual Roles:
                          </Text>
                          {user.roleNames.map(role => (
                            <span key={role} className={styles.groupRoleBadge}>
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </Layout.Vertical>
                    <Button
                      text="View User"
                      minimal
                      icon="arrow-right"
                      onClick={() => history.push(`/users/${user.id}`)}
                    />
                  </div>
                ))}
              </Layout.Vertical>
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY }}>
                  No members in this group
                </Text>
                <Button
                  text="Add Members"
                  icon="plus"
                  minimal
                  onClick={() => setIsEditDialogOpen(true)}
                  style={{ marginTop: '1rem' }}
                />
              </div>
            )}
          </Layout.Vertical>
        </Card>

        {/* Effective Permissions Summary */}
        {group.roleNames && group.roleNames.length > 0 && (
          <Card className={styles.card}>
            <Layout.Vertical spacing="medium">
              <Text color={Color.GREY_900} font={{ variation: FontVariation.H5, weight: 'bold' }}>
                Permissions Summary
              </Text>
              <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
                Members inherit all permissions from group roles
              </Text>
              
              <div style={{ 
                padding: '1rem', 
                background: '#fff3cd',
                borderRadius: '6px',
                border: '1px solid #ffc107'
              }}>
                <Text color={Color.GREY_800} font={{ variation: FontVariation.SMALL }}>
                  <strong>{groupMembers.length}</strong> {groupMembers.length === 1 ? 'member has' : 'members have'} access to permissions granted by <strong>{group.roleNames.join(', ')}</strong> {group.roleNames.length === 1 ? 'role' : 'roles'}
                </Text>
              </div>
            </Layout.Vertical>
          </Card>
        )}

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
                  {group.createdAt ? new Date(group.createdAt).toLocaleString('en-US', {
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
                  {group.updatedAt ? new Date(group.updatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : '—'}
                </Text>
              </div>

              {group.createdAt && group.updatedAt && (
                <div className={styles.auditRow}>
                  <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                    Group Age
                  </Text>
                  <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                    {Math.floor((new Date().getTime() - new Date(group.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                  </Text>
                </div>
              )}

              <div className={styles.auditRow}>
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }}>
                  Total Member Changes
                </Text>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
                  {groupMembers.length} current {groupMembers.length === 1 ? 'member' : 'members'}
                </Text>
              </div>
            </Layout.Vertical>
          </Layout.Vertical>
        </Card>
      </Layout.Vertical>

      {isEditDialogOpen && (
        <EditGroupDialog
          isOpen={isEditDialogOpen}
          group={group}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}
    </DefaultLayout>
  );
};

export default GroupDetailsPage;
