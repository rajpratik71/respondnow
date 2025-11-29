import React from 'react';
import { DefaultLayout } from '@layouts';
import { GroupList } from '@components/GroupManagement/GroupList';

export const GroupsPage: React.FC = () => {
  return (
    <DefaultLayout
      title="Group Management"
      subtitle="Manage groups and group memberships"
      padding="none"
    >
      <GroupList />
    </DefaultLayout>
  );
};

export default GroupsPage;
