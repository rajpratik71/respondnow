import React, { useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import {
  Button,
  ButtonVariation,
  Layout,
  Text,
  FormInput,
  Container,
  Page,
  useToaster,
  Heading,
  Toggle
} from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Card } from '@blueprintjs/core';
import { Fallback } from '@errors';
import { DefaultLayout } from '@layouts';
import { PermissionGuard } from '@components/PermissionGuard';
import { Permission, Organization } from '@types/rbac';
import { useCurrentUser } from '@hooks/useCurrentUser';

const OrganizationSettingsView: React.FC = () => {
  const currentUser = useCurrentUser();
  const { showSuccess, showError } = useToaster();

  // Mock data - Replace with actual API call
  const [organization, setOrganization] = useState<Organization>({
    id: 'org1',
    name: 'Engineering Organization',
    identifier: currentUser?.orgIdentifier || 'engineering',
    description: 'Main engineering organization',
    accountIdentifier: currentUser?.accountIdentifier || 'default',
    settings: {
      incidentAutoEscalation: true,
      defaultSeverity: 'SEV2',
      escalationTimeoutMinutes: 30,
      requireIncidentApproval: false,
      enableCustomFields: true,
      enableTemplates: true,
      enableSLA: true
    },
    quotas: {
      maxUsers: 100,
      maxTeams: 20,
      maxIncidents: 10000,
      maxCustomFields: 50,
      maxTemplates: 100,
      storageQuotaBytes: 10737418240 // 10 GB
    },
    createdAt: Date.now() / 1000 - 86400 * 180,
    createdBy: 'admin',
    active: true
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // TODO: Call API to save organization settings
    showSuccess('Organization settings saved successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // TODO: Revert changes
    showSuccess('Changes discarded');
    setIsEditing(false);
  };

  const updateSetting = (key: keyof typeof organization.settings, value: any) => {
    setOrganization(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const updateQuota = (key: keyof typeof organization.quotas, value: any) => {
    setOrganization(prev => ({
      ...prev,
      quotas: {
        ...prev.quotas,
        [key]: value
      }
    }));
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <DefaultLayout
      title="Organization Settings"
      breadcrumbs={[
        { label: 'Settings', url: '/settings' },
        { label: 'Organization', url: '/organization' }
      ]}
      toolbar={
        <Layout.Horizontal spacing="medium">
          {isEditing ? (
            <>
              <Button variation={ButtonVariation.SECONDARY} text="Cancel" onClick={handleCancel} />
              <PermissionGuard permission={Permission.UPDATE_ORGANIZATION}>
                <Button variation={ButtonVariation.PRIMARY} text="Save Changes" onClick={handleSave} />
              </PermissionGuard>
            </>
          ) : (
            <PermissionGuard permission={Permission.UPDATE_ORGANIZATION}>
              <Button
                variation={ButtonVariation.PRIMARY}
                text="Edit Settings"
                icon="edit"
                onClick={() => setIsEditing(true)}
              />
            </PermissionGuard>
          )}
        </Layout.Horizontal>
      }
    >
      <Page.Body>
        <Layout.Vertical spacing="xlarge" padding="xlarge">
          {/* General Information */}
          <Card elevation={1}>
            <Container padding="large">
              <Layout.Vertical spacing="large">
                <Heading level={2} color={Color.GREY_800}>
                  General Information
                </Heading>
                <Layout.Horizontal spacing="large">
                  <FormInput.Text
                    label="Organization Name"
                    name="name"
                    value={organization.name}
                    disabled={!isEditing}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOrganization({ ...organization, name: e.target.value })
                    }
                  />
                  <FormInput.Text
                    label="Identifier"
                    name="identifier"
                    value={organization.identifier}
                    disabled
                  />
                </Layout.Horizontal>
                <FormInput.TextArea
                  label="Description"
                  name="description"
                  value={organization.description}
                  disabled={!isEditing}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setOrganization({ ...organization, description: e.target.value })
                  }
                />
              </Layout.Vertical>
            </Container>
          </Card>

          {/* Incident Settings */}
          <PermissionGuard permission={Permission.MANAGE_ORGANIZATION_SETTINGS}>
            <Card elevation={1}>
              <Container padding="large">
                <Layout.Vertical spacing="large">
                  <Heading level={2} color={Color.GREY_800}>
                    Incident Settings
                  </Heading>

                  <Layout.Horizontal
                    spacing="large"
                    flex={{ alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Layout.Vertical spacing="xsmall">
                      <Text font={{ weight: 'semi-bold' }}>Auto-Escalation</Text>
                      <Text color={Color.GREY_600} font={{ size: 'small' }}>
                        Automatically escalate incidents based on severity and time
                      </Text>
                    </Layout.Vertical>
                    <Toggle
                      checked={organization.settings?.incidentAutoEscalation || false}
                      disabled={!isEditing}
                      onToggle={(checked) => updateSetting('incidentAutoEscalation', checked)}
                    />
                  </Layout.Horizontal>

                  <FormInput.Select
                    label="Default Severity"
                    name="defaultSeverity"
                    value={organization.settings?.defaultSeverity}
                    disabled={!isEditing}
                    items={[
                      { label: 'SEV0 - Critical', value: 'SEV0' },
                      { label: 'SEV1 - High', value: 'SEV1' },
                      { label: 'SEV2 - Medium', value: 'SEV2' }
                    ]}
                    onChange={(option: any) => updateSetting('defaultSeverity', option.value)}
                  />

                  <FormInput.Text
                    label="Escalation Timeout (minutes)"
                    name="escalationTimeout"
                    value={organization.settings?.escalationTimeoutMinutes}
                    disabled={!isEditing}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateSetting('escalationTimeoutMinutes', parseInt(e.target.value) || 0)
                    }
                  />

                  <Layout.Horizontal
                    spacing="large"
                    flex={{ alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Layout.Vertical spacing="xsmall">
                      <Text font={{ weight: 'semi-bold' }}>Require Incident Approval</Text>
                      <Text color={Color.GREY_600} font={{ size: 'small' }}>
                        New incidents must be approved before becoming active
                      </Text>
                    </Layout.Vertical>
                    <Toggle
                      checked={organization.settings?.requireIncidentApproval || false}
                      disabled={!isEditing}
                      onToggle={(checked) => updateSetting('requireIncidentApproval', checked)}
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Container>
            </Card>
          </PermissionGuard>

          {/* Feature Toggles */}
          <PermissionGuard permission={Permission.MANAGE_ORGANIZATION_SETTINGS}>
            <Card elevation={1}>
              <Container padding="large">
                <Layout.Vertical spacing="large">
                  <Heading level={2} color={Color.GREY_800}>
                    Features
                  </Heading>

                  <Layout.Horizontal
                    spacing="large"
                    flex={{ alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Layout.Vertical spacing="xsmall">
                      <Text font={{ weight: 'semi-bold' }}>Custom Fields</Text>
                      <Text color={Color.GREY_600} font={{ size: 'small' }}>
                        Allow custom fields in incidents
                      </Text>
                    </Layout.Vertical>
                    <Toggle
                      checked={organization.settings?.enableCustomFields || false}
                      disabled={!isEditing}
                      onToggle={(checked) => updateSetting('enableCustomFields', checked)}
                    />
                  </Layout.Horizontal>

                  <Layout.Horizontal
                    spacing="large"
                    flex={{ alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Layout.Vertical spacing="xsmall">
                      <Text font={{ weight: 'semi-bold' }}>Incident Templates</Text>
                      <Text color={Color.GREY_600} font={{ size: 'small' }}>
                        Enable incident templates for quick creation
                      </Text>
                    </Layout.Vertical>
                    <Toggle
                      checked={organization.settings?.enableTemplates || false}
                      disabled={!isEditing}
                      onToggle={(checked) => updateSetting('enableTemplates', checked)}
                    />
                  </Layout.Horizontal>

                  <Layout.Horizontal
                    spacing="large"
                    flex={{ alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Layout.Vertical spacing="xsmall">
                      <Text font={{ weight: 'semi-bold' }}>SLA Tracking</Text>
                      <Text color={Color.GREY_600} font={{ size: 'small' }}>
                        Track SLA compliance for incidents
                      </Text>
                    </Layout.Vertical>
                    <Toggle
                      checked={organization.settings?.enableSLA || false}
                      disabled={!isEditing}
                      onToggle={(checked) => updateSetting('enableSLA', checked)}
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Container>
            </Card>
          </PermissionGuard>

          {/* Resource Quotas */}
          <PermissionGuard permission={Permission.MANAGE_ORGANIZATION_SETTINGS}>
            <Card elevation={1}>
              <Container padding="large">
                <Layout.Vertical spacing="large">
                  <Heading level={2} color={Color.GREY_800}>
                    Resource Quotas
                  </Heading>

                  <Layout.Horizontal spacing="large">
                    <FormInput.Text
                      label="Max Users"
                      name="maxUsers"
                      value={organization.quotas?.maxUsers}
                      disabled={!isEditing}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateQuota('maxUsers', parseInt(e.target.value) || 0)
                      }
                    />
                    <FormInput.Text
                      label="Max Teams"
                      name="maxTeams"
                      value={organization.quotas?.maxTeams}
                      disabled={!isEditing}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateQuota('maxTeams', parseInt(e.target.value) || 0)
                      }
                    />
                  </Layout.Horizontal>

                  <Layout.Horizontal spacing="large">
                    <FormInput.Text
                      label="Max Incidents"
                      name="maxIncidents"
                      value={organization.quotas?.maxIncidents}
                      disabled={!isEditing}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateQuota('maxIncidents', parseInt(e.target.value) || 0)
                      }
                    />
                    <FormInput.Text
                      label="Max Custom Fields"
                      name="maxCustomFields"
                      value={organization.quotas?.maxCustomFields}
                      disabled={!isEditing}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateQuota('maxCustomFields', parseInt(e.target.value) || 0)
                      }
                    />
                  </Layout.Horizontal>

                  <Layout.Horizontal spacing="large">
                    <FormInput.Text
                      label="Max Templates"
                      name="maxTemplates"
                      value={organization.quotas?.maxTemplates}
                      disabled={!isEditing}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateQuota('maxTemplates', parseInt(e.target.value) || 0)
                      }
                    />
                    <Layout.Vertical spacing="xsmall" style={{ flex: 1 }}>
                      <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_700}>
                        Storage Quota
                      </Text>
                      <Text color={Color.GREY_600} font={{ size: 'normal' }}>
                        {formatBytes(organization.quotas?.storageQuotaBytes)}
                      </Text>
                    </Layout.Vertical>
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Container>
            </Card>
          </PermissionGuard>
        </Layout.Vertical>
      </Page.Body>
    </DefaultLayout>
  );
};

export default withErrorBoundary(OrganizationSettingsView, { FallbackComponent: Fallback });
