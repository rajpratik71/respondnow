import React from 'react';
import { Tag } from '@blueprintjs/core';
import { Color } from '@harnessio/design-system';
import { SystemRole, ROLE_LABELS } from '@types/rbac';

interface RoleBadgeProps {
  role: SystemRole;
  minimal?: boolean;
}

const ROLE_COLORS: Record<SystemRole, string> = {
  [SystemRole.ADMIN]: Color.RED_500,
  [SystemRole.INCIDENT_COMMANDER]: Color.ORANGE_500,
  [SystemRole.RESPONDER]: Color.BLUE_500,
  [SystemRole.OBSERVER]: Color.GREY_500,
  [SystemRole.REPORTER]: Color.GREEN_500
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, minimal = false }) => {
  return (
    <Tag
      minimal={minimal}
      style={{
        backgroundColor: minimal ? 'transparent' : ROLE_COLORS[role],
        color: minimal ? ROLE_COLORS[role] : Color.WHITE,
        border: minimal ? `1px solid ${ROLE_COLORS[role]}` : 'none'
      }}
    >
      {ROLE_LABELS[role]}
    </Tag>
  );
};
