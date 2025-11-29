import React from 'react';
import { useHistory } from 'react-router-dom';
import { DefaultLayout } from '@layouts';
import { Button, Card, Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { paths } from '@routes/RouteDefinitions';
import { useAppStore } from '@hooks';
import { isManagerOrAbove } from '@utils';
import css from './Dashboard.module.scss';

export const Dashboard: React.FC = () => {
  const history = useHistory();
  const { currentUserInfo } = useAppStore();
  const userRoles = currentUserInfo?.roleNames || [];
  const canAccessAdmin = isManagerOrAbove(userRoles);

  const quickActions = [
    {
      title: 'View Incidents',
      description: 'Monitor and respond to incidents',
      icon: 'warning-sign',
      path: paths.toIncidentDashboard(),
      color: '#D97706',
      show: true
    },
    {
      title: 'Incident Metrics',
      description: 'View incident statistics and trends',
      icon: 'chart',
      path: paths.toIncidentMetrics(),
      color: '#3B82F6',
      show: true
    },
    {
      title: 'Manage Users',
      description: 'Create, edit, and manage user accounts',
      icon: 'user',
      path: paths.toUsers(),
      color: '#0278D5',
      show: canAccessAdmin
    },
    {
      title: 'Manage Groups',
      description: 'Organize users into groups',
      icon: 'users',
      path: paths.toGroups(),
      color: '#6938C0',
      show: canAccessAdmin
    },
    {
      title: 'Permission Matrix',
      description: 'View roles, permissions, and access control',
      icon: 'lock',
      path: paths.toPermissionMatrix(),
      color: '#7C3AED',
      show: canAccessAdmin
    },
    {
      title: 'Security Audit Log',
      description: 'Track security events and user activities',
      icon: 'list',
      path: paths.toSecurityAuditLog(),
      color: '#DC2626',
      show: canAccessAdmin
    },
    {
      title: 'Getting Started',
      description: 'Set up your Slack app integration',
      icon: 'learning',
      path: paths.toGetStarted(),
      color: '#059669',
      show: true
    }
  ].filter(action => action.show);

  return (
    <DefaultLayout
      title={`Welcome back, ${currentUserInfo.name || currentUserInfo.username}!`}
      subtitle="Here's what you can do with RespondNow"
    >
      <Layout.Vertical spacing="large" className={css.dashboard}>
        {/* Overview Stats */}
        <Layout.Horizontal spacing="medium" className={css.statsRow}>
          <Card className={css.statCard}>
            <Layout.Vertical spacing="xsmall">
              <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
                Your Role
              </Text>
              <Text color={Color.GREY_900} font={{ variation: FontVariation.H4, weight: 'bold' }}>
                {currentUserInfo.roleNames?.join(', ') || 'User'}
              </Text>
            </Layout.Vertical>
          </Card>

          <Card className={css.statCard}>
            <Layout.Vertical spacing="xsmall">
              <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
                Status
              </Text>
              <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center' }}>
                <span className={css.statusDot} style={{ backgroundColor: '#059669' }} />
                <Text color={Color.GREY_900} font={{ variation: FontVariation.H4, weight: 'bold' }}>
                  Active
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Card>

          <Card className={css.statCard}>
            <Layout.Vertical spacing="xsmall">
              <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
                Account Email
              </Text>
              <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                {currentUserInfo.email}
              </Text>
            </Layout.Vertical>
          </Card>
        </Layout.Horizontal>

        {/* Quick Actions */}
        <Layout.Vertical spacing="small">
          <Text color={Color.GREY_800} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
            Quick Actions
          </Text>
          <Layout.Horizontal spacing="medium" className={css.quickActionsGrid}>
            {quickActions.map((action) => (
              <Card
                key={action.path}
                className={css.actionCard}
                onClick={() => history.push(action.path)}
              >
                <Layout.Vertical spacing="small" height="100%">
                  <div className={css.iconWrapper} style={{ backgroundColor: action.color }}>
                    <Text icon={action.icon as any} iconProps={{ size: 24, color: 'white' }} />
                  </div>
                  <Layout.Vertical spacing="xsmall" style={{ flexGrow: 1 }}>
                    <Text color={Color.GREY_900} font={{ variation: FontVariation.H6, weight: 'semi-bold' }}>
                      {action.title}
                    </Text>
                    <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
                      {action.description}
                    </Text>
                  </Layout.Vertical>
                  <Button
                    text="Go"
                    icon="arrow-right"
                    iconProps={{ size: 12 }}
                    minimal
                    className={css.actionButton}
                  />
                </Layout.Vertical>
              </Card>
            ))}
          </Layout.Horizontal>
        </Layout.Vertical>

        {/* Getting Started Guide */}
        <Card className={css.guideCard}>
          <Layout.Horizontal spacing="large" flex={{ alignItems: 'center' }}>
            <div className={css.guideIcon}>
              <Text icon="book" iconProps={{ size: 32, color: Color.PRIMARY_7 }} />
            </div>
            <Layout.Vertical spacing="xsmall" style={{ flexGrow: 1 }}>
              <Text color={Color.GREY_900} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
                Need Help Getting Started?
              </Text>
              <Text color={Color.GREY_600} font={{ variation: FontVariation.BODY }}>
                Check out our documentation and guides to make the most of RespondNow
              </Text>
            </Layout.Vertical>
            <Button
              text="View Documentation"
              icon="share"
              onClick={() => window.open('https://respondnow.github.io/respondnow', '_blank')}
            />
          </Layout.Horizontal>
        </Card>
      </Layout.Vertical>
    </DefaultLayout>
  );
};

export default Dashboard;
