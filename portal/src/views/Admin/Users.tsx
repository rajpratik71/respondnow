import React from 'react';
import { DefaultLayout } from '@layouts';
import { UserList } from '@components/UserManagement/UserList';

export const UsersPage: React.FC = () => {
  return (
    <DefaultLayout
      title="User Management"
      subtitle="Manage users, roles, and permissions"
      padding="none"
    >
      <UserList />
    </DefaultLayout>
  );
};

export default UsersPage;
