import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Button, ButtonVariation, Layout, useToaster } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Fallback } from '@errors';
import { DefaultLayout } from '@layouts';
import { Incident, useExportCombinedMutation, downloadBlob } from '@services/server';
import { generateSlackChannelLink, getScope } from '@utils';
import { IncidentActions } from '@components/IncidentActions';
import Evidence from '@components/Evidence';
import SlackIcon from '@images/slack-mono.svg';
import DetailsSection from './sections/DetailsSection';
import TimelineSection from './sections/Timeline';

interface IncidentDetailsViewProps {
  incidentData: Incident | undefined;
  incidentDataLoading: boolean;
  onActionComplete?: () => void;
}

const IncidentDetailsView: React.FC<IncidentDetailsViewProps> = props => {
  const { incidentData, incidentDataLoading, onActionComplete } = props;
  const { showSuccess, showError } = useToaster();
  const scope = getScope();

  const isIncidentPresent = !!incidentData;

  // Combined export: PDF + Evidence
  const { mutate: exportCombined, isLoading: isExporting } = useExportCombinedMutation(
    {
      queryParams: scope,
      incidentId: incidentData?.identifier || ''
    },
    {
      onSuccess: (blob) => {
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const filename = `incident-${incidentData?.identifier}-${dateStr}-complete.zip`;
        downloadBlob(blob, filename);
        showSuccess('Incident exported with evidence');
      },
      onError: () => {
        showError('Failed to export incident');
      }
    }
  );

  const handleExportComplete = () => {
    if (!incidentData) return;
    exportCombined();
  };

  return (
    <DefaultLayout
      title={incidentData?.name || 'Incident Name'}
      loading={incidentDataLoading}
      noData={!isIncidentPresent}
      noDataProps={{
        title: 'No Incident Found',
        subtitle: 'The incident you are looking for does not exist or has been deleted.'
      }}
      toolbar={
        <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
          {incidentData && (
            <>
              <Button
                variation={ButtonVariation.SECONDARY}
                text="Export Complete Incident"
                icon="download-box"
                onClick={handleExportComplete}
                loading={isExporting}
                disabled={isExporting}
                tooltip="Export PDF with timeline and all evidence as ZIP"
              />
              <IncidentActions
                incident={incidentData}
                onActionComplete={onActionComplete}
                showDelete={false}
              />
            </>
          )}
          {incidentData?.incidentChannel?.slack?.teamDomain && incidentData?.channels?.[0]?.id ? (
            <Button
              onClick={() => {
                window.open(
                  generateSlackChannelLink(
                    incidentData?.incidentChannel?.slack?.teamDomain || '',
                    incidentData?.channels?.[0].id || ''
                  ),
                  '_blank'
                );
              }}
              variation={ButtonVariation.SECONDARY}
              text="View Channel"
              icon={<img src={SlackIcon} height={16} />}
            />
          ) : incidentData?.incidentUrl ? (
            <Button
              onClick={() => window.open(incidentData.incidentUrl, '_blank')}
              variation={ButtonVariation.SECONDARY}
              text="View Incident URL"
              rightIcon="share"
            />
          ) : null}
        </Layout.Horizontal>
      }
    >
      <Layout.Vertical spacing="large" background={Color.PRIMARY_BG}>
        <Layout.Horizontal height="100%" spacing="large">
          <DetailsSection incidentData={incidentData} />
          <TimelineSection incidentData={incidentData} />
        </Layout.Horizontal>
        {incidentData?.id && incidentData?.identifier && (
          <Evidence incidentId={incidentData.id} incidentIdentifier={incidentData.identifier} />
        )}
      </Layout.Vertical>
    </DefaultLayout>
  );
};

export default withErrorBoundary(IncidentDetailsView, { FallbackComponent: Fallback });
