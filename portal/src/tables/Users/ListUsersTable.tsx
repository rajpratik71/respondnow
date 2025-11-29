import React, { useMemo } from 'react';
import { TableV2, Text, Layout, Icon } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Column, CellProps, Renderer } from 'react-table';
import { User } from '@types/rbac';
import { RoleBadge } from '@components/RoleBadge';
import moment from 'moment';

interface ListUsersTableProps {
  users: User[];
  loading?: boolean;
  onUserClick?: (user: User) => void;
}

export const ListUsersTable: React.FC<ListUsersTableProps> = ({
  users,
  loading = false,
  onUserClick
}) => {
  const columns: Column<User>[] = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        width: '25%',
        Cell: ({ row }: CellProps<User>) => {
          const user = row.original;
          return (
            <Layout.Vertical
              spacing="xsmall"
              style={{ cursor: onUserClick ? 'pointer' : 'default' }}
              onClick={() => onUserClick?.(user)}
            >
              <Text color={Color.GREY_900} font={{ weight: 'semi-bold' }}>
                {user.name}
              </Text>
              <Text color={Color.GREY_500} font={{ size: 'small' }}>
                @{user.userId}
              </Text>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'Email',
        accessor: 'email',
        width: '20%',
        Cell: ({ row }: CellProps<User>) => (
          <Text color={Color.GREY_700}>{row.original.email}</Text>
        )
      },
      {
        Header: 'Role',
        accessor: 'systemRole',
        width: '15%',
        Cell: ({ row }: CellProps<User>) => {
          const user = row.original;
          return user.systemRole ? <RoleBadge role={user.systemRole} minimal /> : <Text>-</Text>;
        }
      },
      {
        Header: 'Teams',
        accessor: 'teamIds',
        width: '10%',
        Cell: ({ row }: CellProps<User>) => {
          const teamCount = row.original.teamIds?.length || 0;
          return (
            <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center' }}>
              <Icon name="people" size={14} color={Color.GREY_500} />
              <Text color={Color.GREY_700}>{teamCount}</Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        Header: 'Permissions',
        id: 'permissions',
        width: '12%',
        Cell: ({ row }: CellProps<User>) => {
          const permCount = row.original.permissions?.length || 0;
          return <Text color={Color.GREY_700}>{permCount}</Text>;
        }
      },
      {
        Header: 'Status',
        accessor: 'active',
        width: '10%',
        Cell: ({ row }: CellProps<User>) => {
          const user = row.original;
          return (
            <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: user.active ? Color.GREEN_500 : Color.GREY_400
                }}
              />
              <Text color={user.active ? Color.GREEN_700 : Color.GREY_500}>
                {user.active ? 'Active' : 'Inactive'}
              </Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        Header: 'Last Login',
        accessor: 'lastLoginAt',
        width: '15%',
        Cell: ({ row }: CellProps<User>) => {
          const user = row.original;
          return user.lastLoginAt ? (
            <Text color={Color.GREY_600} font={{ size: 'small' }}>
              {moment.unix(user.lastLoginAt).fromNow()}
            </Text>
          ) : (
            <Text color={Color.GREY_400}>Never</Text>
          );
        }
      }
    ],
    [onUserClick]
  );

  return <TableV2<User> columns={columns} data={users} />;
};
