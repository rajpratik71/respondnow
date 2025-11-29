import React, { useState, useMemo } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import {
  Button,
  ButtonVariation,
  Layout,
  Text,
  SelectOption,
  Select,
  TextInput,
  Page,
  useToaster
} from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Fallback } from '@errors';
import { DefaultLayout } from '@layouts';
import { ListUsersTable } from '@tables/Users/ListUsersTable';
import { PermissionGuard } from '@components/PermissionGuard';
import { Permission, SystemRole, ROLE_LABELS, User } from '@types/rbac';
import { useCurrentUser } from '@hooks/useCurrentUser';
import { useListUsers } from '@services/server';

const UsersView: React.FC = () => {
  const currentUser = useCurrentUser();
  const { showSuccess } = useToaster();

  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<SystemRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch users from API
  const { data: allUsers = [], isLoading } = useListUsers({
    accountIdentifier: currentUser?.accountIdentifier || 'default',
    orgIdentifier: currentUser?.orgIdentifier || 'default'
  });

  const roleOptions: SelectOption[] = [
    { label: 'All Roles', value: 'all' },
    ...Object.entries(ROLE_LABELS).map(([value, label]) => ({
      label,
      value
    }))
  ];

  const statusOptions: SelectOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  // Filter users client-side
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user: User) => {
      const matchesSearch =
        !searchText ||
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.userId.toLowerCase().includes(searchText.toLowerCase());

      const matchesRole = selectedRole === 'all' || user.systemRole === selectedRole;

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && user.active) ||
        (selectedStatus === 'inactive' && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchText, selectedRole, selectedStatus]);

  const handleUserClick = (user: User) => {
    console.log('User clicked:', user);
    showSuccess(`Viewing details for ${user.name}`);
  };

  const handleCreateUser = () => {
    showSuccess('Create user functionality coming soon');
  };

  const handleImportUsers = () => {
    showSuccess('Import users functionality coming soon');
  };

  return (
    <DefaultLayout
      title="User Management"
      breadcrumbs={[
        { label: 'Settings', url: '/settings' },
        { label: 'Users', url: '/users' }
      ]}
      toolbar={
        <Layout.Horizontal spacing="medium">
          <PermissionGuard permission={Permission.CREATE_USER}>
            <Button
              variation={ButtonVariation.PRIMARY}
              text="Create User"
              icon="plus"
              onClick={handleCreateUser}
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.CREATE_USER}>
            <Button
              variation={ButtonVariation.SECONDARY}
              text="Import Users"
              icon="import"
              onClick={handleImportUsers}
            />
          </PermissionGuard>
        </Layout.Horizontal>
      }
    >
      <Page.Body>
        <Layout.Vertical spacing="large" style={{ height: '100%' }}>
          {/* Filters */}
          <Layout.Horizontal
            spacing="medium"
            flex={{ alignItems: 'center', justifyContent: 'space-between' }}
            padding={{ top: 'medium', bottom: 'medium' }}
            style={{ borderBottom: `1px solid ${Color.GREY_200}` }}
          >
            <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
              <TextInput
                placeholder="Search users..."
                leftIcon="search"
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                items={roleOptions}
                value={selectedRole}
                onChange={(option: SelectOption) => setSelectedRole(option.value as SystemRole | 'all')}
                placeholder="Filter by role"
              />
              <Select
                items={statusOptions}
                value={selectedStatus}
                onChange={(option: SelectOption) =>
                  setSelectedStatus(option.value as 'all' | 'active' | 'inactive')
                }
                placeholder="Filter by status"
              />
            </Layout.Horizontal>
            <Text color={Color.GREY_600}>
              Showing {filteredUsers.length} of {allUsers.length} users
            </Text>
          </Layout.Horizontal>

          {/* Table */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {isLoading ? (
              <Layout.Vertical
                flex={{ alignItems: 'center', justifyContent: 'center' }}
                style={{ height: '400px' }}
              >
                <Text color={Color.GREY_600}>Loading users...</Text>
              </Layout.Vertical>
            ) : filteredUsers.length > 0 ? (
              <ListUsersTable users={filteredUsers} onUserClick={handleUserClick} />
            ) : (
              <Layout.Vertical
                flex={{ alignItems: 'center', justifyContent: 'center' }}
                spacing="medium"
                style={{ height: '400px' }}
              >
                <Text color={Color.GREY_600} font={{ size: 'large', weight: 'semi-bold' }}>
                  No users found
                </Text>
                <Text color={Color.GREY_500}>
                  {searchText || selectedRole !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first user'}
                </Text>
                <PermissionGuard permission={Permission.CREATE_USER}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text="Create User"
                    icon="plus"
                    onClick={handleCreateUser}
                  />
                </PermissionGuard>
              </Layout.Vertical>
            )}
          </div>
        </Layout.Vertical>
      </Page.Body>
    </DefaultLayout>
  );
};

export default withErrorBoundary(UsersView, { FallbackComponent: Fallback });
