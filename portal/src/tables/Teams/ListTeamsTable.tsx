import React, { useMemo } from 'react';
import { TableV2, Text, Layout, Icon } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Column, CellProps } from 'react-table';
import { Team } from '@types/rbac';
import moment from 'moment';

interface ListTeamsTableProps {
  teams: Team[];
  loading?: boolean;
  onTeamClick?: (team: Team) => void;
}

export const ListTeamsTable: React.FC<ListTeamsTableProps> = ({
  teams,
  loading = false,
  onTeamClick
}) => {
  const columns: Column<Team>[] = useMemo(
    () => [
      {
        Header: 'Team Name',
        accessor: 'name',
        width: '25%',
        Cell: ({ row }: CellProps<Team>) => {
          const team = row.original;
          return (
            <Layout.Vertical
              spacing="xsmall"
              style={{ cursor: onTeamClick ? 'pointer' : 'default' }}
              onClick={() => onTeamClick?.(team)}
            >
              <Text color={Color.GREY_900} font={{ weight: 'semi-bold' }}>
                {team.name}
              </Text>
              <Text color={Color.GREY_500} font={{ size: 'small' }}>
                {team.identifier}
              </Text>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'Description',
        accessor: 'description',
        width: '30%',
        Cell: ({ row }: CellProps<Team>) => (
          <Text color={Color.GREY_700} lineClamp={2}>
            {row.original.description || '-'}
          </Text>
        )
      },
      {
        Header: 'Members',
        accessor: 'members',
        width: '15%',
        Cell: ({ row }: CellProps<Team>) => {
          const team = row.original;
          const memberCount = team.members?.length || 0;
          const leadCount = team.members?.filter(m => m.role === 'LEAD').length || 0;

          return (
            <Layout.Vertical spacing="xsmall">
              <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center' }}>
                <Icon name="people" size={14} color={Color.GREY_500} />
                <Text color={Color.GREY_700}>{memberCount}</Text>
              </Layout.Horizontal>
              {leadCount > 0 && (
                <Text color={Color.GREY_500} font={{ size: 'small' }}>
                  {leadCount} lead{leadCount !== 1 ? 's' : ''}
                </Text>
              )}
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'Permissions',
        id: 'permissions',
        width: '12%',
        Cell: ({ row }: CellProps<Team>) => {
          const permCount = row.original.permissions?.length || 0;
          return <Text color={Color.GREY_700}>{permCount}</Text>;
        }
      },
      {
        Header: 'Status',
        accessor: 'active',
        width: '10%',
        Cell: ({ row }: CellProps<Team>) => {
          const team = row.original;
          return (
            <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: team.active ? Color.GREEN_500 : Color.GREY_400
                }}
              />
              <Text color={team.active ? Color.GREEN_700 : Color.GREY_500}>
                {team.active ? 'Active' : 'Inactive'}
              </Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        Header: 'Created',
        accessor: 'createdAt',
        width: '15%',
        Cell: ({ row }: CellProps<Team>) => {
          const team = row.original;
          return team.createdAt ? (
            <Text color={Color.GREY_600} font={{ size: 'small' }}>
              {moment.unix(team.createdAt).fromNow()}
            </Text>
          ) : (
            <Text color={Color.GREY_400}>-</Text>
          );
        }
      }
    ],
    [onTeamClick]
  );

  return <TableV2<Team> columns={columns} data={teams} />;
};
