import React from 'react';
import { Layout, Text, Avatar } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { User } from '@types/rbac';
import { RoleBadge } from '@components/RoleBadge';
import { useCurrentUser } from '@hooks/useCurrentUser';

interface UserProfileProps {
  compact?: boolean;
  showRole?: boolean;
}

/**
 * Display current user profile information
 */
export const UserProfile: React.FC<UserProfileProps> = ({ 
  compact = false,
  showRole = true 
}) => {
  const user = useCurrentUser();

  if (!user) {
    return null;
  }

  if (compact) {
    return (
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
        <Avatar name={user.name} size="small" />
        <Text color={Color.GREY_800} font={{ weight: 'semi-bold' }}>
          {user.name}
        </Text>
      </Layout.Horizontal>
    );
  }

  return (
    <Layout.Vertical spacing="small">
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
        <Avatar name={user.name} size="normal" />
        <Layout.Vertical spacing="xsmall">
          <Text color={Color.GREY_900} font={{ weight: 'semi-bold', size: 'normal' }}>
            {user.name}
          </Text>
          <Text color={Color.GREY_600} font={{ size: 'small' }}>
            {user.email}
          </Text>
          {showRole && user.systemRole && (
            <RoleBadge role={user.systemRole} minimal />
          )}
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};
