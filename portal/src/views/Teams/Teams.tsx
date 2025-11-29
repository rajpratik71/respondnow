import React, { useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import {
  Button,
  ButtonVariation,
  Layout,
  Text,
  TextInput,
  Page,
  useToaster,
  SelectOption,
  Select
} from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Fallback } from '@errors';
import { DefaultLayout } from '@layouts';
import { ListTeamsTable } from '@tables/Teams/ListTeamsTable';
import { PermissionGuard } from '@components/PermissionGuard';
import { Permission, Team, TeamRole } from '@types/rbac';
import { useCurrentUser } from '@hooks/useCurrentUser';

const TeamsView: React.FC = () => {
  const currentUser = useCurrentUser();
  const { showSuccess } = useToaster();

  // Mock data - Replace with actual API call
  const [teams] = useState<Team[]>([
    {
      id: 'team1',
      name: 'Incident Response Team',
      identifier: 'incident-response',
      description: 'Primary team handling critical incidents',
      accountIdentifier: currentUser?.accountIdentifier || 'default',
      orgIdentifier: currentUser?.orgIdentifier || 'default',
      members: [
        { userId: 'admin', role: TeamRole.LEAD, joinedAt: Date.now() / 1000 - 86400 * 30 },
        { userId: 'commander', role: TeamRole.LEAD, joinedAt: Date.now() / 1000 - 86400 * 20 },
        { userId: 'responder1', role: TeamRole.MEMBER, joinedAt: Date.now() / 1000 - 86400 * 15 }
      ],
      permissions: [Permission.CREATE_INCIDENT, Permission.UPDATE_INCIDENT, Permission.RESOLVE_INCIDENT],
      createdAt: Date.now() / 1000 - 86400 * 60,
      createdBy: 'admin',
      active: true
    },
    {
      id: 'team2',
      name: 'Security Team',
      identifier: 'security',
      description: 'Handles security-related incidents',
      accountIdentifier: currentUser?.accountIdentifier || 'default',
      orgIdentifier: currentUser?.orgIdentifier || 'default',
      members: [
        { userId: 'admin', role: TeamRole.MEMBER, joinedAt: Date.now() / 1000 - 86400 * 45 },
        { userId: 'reporter1', role: TeamRole.MEMBER, joinedAt: Date.now() / 1000 - 86400 * 10 }
      ],
      permissions: [Permission.CREATE_INCIDENT, Permission.UPDATE_INCIDENT, Permission.VIEW_ANALYTICS],
      createdAt: Date.now() / 1000 - 86400 * 45,
      createdBy: 'admin',
      active: true
    },
    {
      id: 'team3',
      name: 'On-Call Engineers',
      identifier: 'on-call',
      description: 'Rotation-based on-call team for after-hours support',
      accountIdentifier: currentUser?.accountIdentifier || 'default',
      orgIdentifier: currentUser?.orgIdentifier || 'default',
      members: [
        { userId: 'responder1', role: TeamRole.LEAD, joinedAt: Date.now() / 1000 - 86400 * 25 }
      ],
      permissions: [Permission.CREATE_INCIDENT, Permission.UPDATE_INCIDENT, Permission.ACKNOWLEDGE_INCIDENT],
      createdAt: Date.now() / 1000 - 86400 * 25,
      createdBy: 'commander',
      active: true
    },
    {
      id: 'team4',
      name: 'Analytics Team',
      identifier: 'analytics',
      description: 'Team focused on incident metrics and reporting',
      accountIdentifier: currentUser?.accountIdentifier || 'default',
      orgIdentifier: currentUser?.orgIdentifier || 'default',
      members: [],
      permissions: [Permission.READ_INCIDENT, Permission.VIEW_ANALYTICS, Permission.EXPORT_INCIDENT],
      createdAt: Date.now() / 1000 - 86400 * 10,
      createdBy: 'admin',
      active: false
    }
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const statusOptions: SelectOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  const filteredTeams = teams.filter(team => {
    const matchesSearch =
      !searchText ||
      team.name.toLowerCase().includes(searchText.toLowerCase()) ||
      team.identifier.toLowerCase().includes(searchText.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && team.active) ||
      (selectedStatus === 'inactive' && !team.active);

    return matchesSearch && matchesStatus;
  });

  const handleTeamClick = (team: Team) => {
    console.log('Team clicked:', team);
    showSuccess(`Viewing details for ${team.name}`);
  };

  const handleCreateTeam = () => {
    showSuccess('Create team functionality coming soon');
  };

  return (
    <DefaultLayout
      title="Team Management"
      breadcrumbs={[
        { label: 'Settings', url: '/settings' },
        { label: 'Teams', url: '/teams' }
      ]}
      toolbar={
        <Layout.Horizontal spacing="medium">
          <PermissionGuard permission={Permission.CREATE_TEAM}>
            <Button
              variation={ButtonVariation.PRIMARY}
              text="Create Team"
              icon="plus"
              onClick={handleCreateTeam}
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
                placeholder="Search teams..."
                leftIcon="search"
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                style={{ width: 300 }}
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
              Showing {filteredTeams.length} of {teams.length} teams
            </Text>
          </Layout.Horizontal>

          {/* Table */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filteredTeams.length > 0 ? (
              <ListTeamsTable teams={filteredTeams} onTeamClick={handleTeamClick} />
            ) : (
              <Layout.Vertical
                flex={{ alignItems: 'center', justifyContent: 'center' }}
                spacing="medium"
                style={{ height: '400px' }}
              >
                <Text color={Color.GREY_600} font={{ size: 'large', weight: 'semi-bold' }}>
                  No teams found
                </Text>
                <Text color={Color.GREY_500}>
                  {searchText || selectedStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first team'}
                </Text>
                <PermissionGuard permission={Permission.CREATE_TEAM}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text="Create Team"
                    icon="plus"
                    onClick={handleCreateTeam}
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

export default withErrorBoundary(TeamsView, { FallbackComponent: Fallback });
