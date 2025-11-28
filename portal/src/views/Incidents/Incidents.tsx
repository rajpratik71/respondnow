import React, { useState, useCallback } from 'react';
import { Button, ButtonVariation, FlexExpander, Layout, Pagination, Text, useToaster } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { DefaultLayout } from '@layouts';
import { useStrings } from '@strings';
import { IncidentsTableProps } from '@interfaces';
import MemoisedIncidentListTable from '@tables/Incidents/ListIncidentsTable';
import { useExportCSVMutation, downloadBlob, ExportRequestBody } from '@services/server';
import { getScope } from '@utils';

interface IncidentsViewProps {
  tableData: IncidentsTableProps;
  incidentsSearchBar: React.JSX.Element;
  incidentsStatusFilter: React.JSX.Element;
  incidentsSeverityFilter: React.JSX.Element;
  resetFiltersButton: React.JSX.Element;
  areFiltersSet: boolean;
  onCreateIncident?: () => void;
}

const IncidentsView: React.FC<IncidentsViewProps> = props => {
  const {
    tableData,
    incidentsSearchBar,
    incidentsStatusFilter,
    incidentsSeverityFilter,
    areFiltersSet,
    resetFiltersButton,
    onCreateIncident
  } = props;
  const { getString } = useStrings();
  const { showSuccess, showError } = useToaster();
  const scope = getScope();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const isDataPresent = !!tableData.content.length;
  const selectedCount = selectedIds.size;

  // Export mutation using backend API
  const { mutate: exportCSV } = useExportCSVMutation(
    { queryParams: scope },
    {
      onSuccess: (response) => {
        const filename = `incidents_${new Date().toISOString().split('T')[0]}.csv`;
        downloadBlob(response.data, filename);
        showSuccess(`Exported ${response.totalCount} incidents to CSV`);
        setIsExporting(false);
      },
      onError: () => {
        showError('Failed to export incidents');
        setIsExporting(false);
      }
    }
  );

  const handleSelectionChange = useCallback((newSelection: Set<string>) => {
    setSelectedIds(newSelection);
  }, []);

  const handleExportSelected = () => {
    if (selectedCount === 0) {
      showError('Please select incidents to export');
      return;
    }
    setIsExporting(true);
    const body: ExportRequestBody = {
      incidentIds: Array.from(selectedIds)
    };
    exportCSV(body);
  };

  const handleExportAll = () => {
    setIsExporting(true);
    const body: ExportRequestBody = {
      exportAll: true
    };
    exportCSV(body);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Selection toolbar shown when items are selected
  const selectionToolbar = selectedCount > 0 && (
    <Layout.Horizontal 
      spacing="medium" 
      flex={{ alignItems: 'center' }} 
      padding={{ left: 'medium', right: 'medium', top: 'small', bottom: 'small' }}
      style={{ backgroundColor: '#f3f3fa', borderRadius: '4px', marginBottom: '8px' }}
    >
      <Text color={Color.GREY_800} font={{ weight: 'semi-bold' }}>
        {selectedCount} incident{selectedCount > 1 ? 's' : ''} selected
      </Text>
      <Button
        variation={ButtonVariation.SECONDARY}
        size="small"
        text="Export Selected"
        icon="download-box"
        onClick={handleExportSelected}
        loading={isExporting}
        disabled={isExporting}
      />
      <Button
        variation={ButtonVariation.LINK}
        size="small"
        text="Clear Selection"
        onClick={handleClearSelection}
      />
    </Layout.Horizontal>
  );

  const toolbar = (
    <Layout.Horizontal spacing="small">
      <Button
        variation={ButtonVariation.SECONDARY}
        text={selectedCount > 0 ? `Export Selected (${selectedCount})` : 'Export All'}
        icon="download-box"
        onClick={selectedCount > 0 ? handleExportSelected : handleExportAll}
        disabled={!isDataPresent || isExporting}
        loading={isExporting}
      />
      <Button
        variation={ButtonVariation.PRIMARY}
        text="Create Incident"
        icon="plus"
        onClick={onCreateIncident}
      />
    </Layout.Horizontal>
  );

  return (
    <DefaultLayout
      loading={tableData.isLoading}
      title={getString('incidents')}
      toolbar={toolbar}
      subHeader={
        <>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
            {incidentsStatusFilter}
            {incidentsSeverityFilter}
          </Layout.Horizontal>
          <FlexExpander />
          {incidentsSearchBar}
        </>
      }
      footer={tableData.pagination && <Pagination {...tableData.pagination} />}
      noData={!isDataPresent}
      noDataProps={{
        height: 350,
        ...(areFiltersSet
          ? {
              title: getString('noIncidentsFoundMatchingFilters'),
              subtitle: getString('noIncidentsFoundMatchingFiltersDescription'),
              ctaButton: resetFiltersButton
            }
          : {
              title: getString('noIncidentsFound'),
              subtitle: getString('noIncidentsFoundDescription'),
              ctaButton: toolbar
            })
      }}
    >
      {selectionToolbar}
      <MemoisedIncidentListTable 
        content={tableData.content}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
      />
    </DefaultLayout>
  );
};

export default IncidentsView;
