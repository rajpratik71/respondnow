import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Button, ButtonVariation, Layout, useToaster } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Fallback } from '@errors';
import { DefaultLayout } from '@layouts';
import { Incident, useExportSinglePDFMutation, downloadBlob } from '@services/server';
import { generateSlackChannelLink, getScope } from '@utils';
import { IncidentActions } from '@components/IncidentActions';
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

  // Use backend API for PDF export
  const { mutate: exportPDF, isLoading: isExporting } = useExportSinglePDFMutation(
    {
      queryParams: scope,
      incidentId: incidentData?.identifier || ''
    },
    {
      onSuccess: (blob) => {
        const filename = `incident_${incidentData?.identifier}_${new Date().toISOString().split('T')[0]}.txt`;
        downloadBlob(blob, filename);
        showSuccess('Incident exported to PDF');
      },
      onError: () => {
        showError('Failed to export incident to PDF');
      }
    }
  );

  const handleExportPDF = () => {
    if (!incidentData) return;
    exportPDF();
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
                text="Export PDF"
                icon="document"
                onClick={handleExportPDF}
                loading={isExporting}
                disabled={isExporting}
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
      <Layout.Horizontal height="100%" spacing="large" background={Color.PRIMARY_BG}>
        <DetailsSection incidentData={incidentData} />
        <TimelineSection incidentData={incidentData} />
      </Layout.Horizontal>
    </DefaultLayout>
  );
};

export default withErrorBoundary(IncidentDetailsView, { FallbackComponent: Fallback });
