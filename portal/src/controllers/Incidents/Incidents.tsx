import React, { useState } from 'react';
import { useToaster } from '@harnessio/uicore';
import { useQueryClient } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import IncidentsView from '@views/Incidents';
import { getScope } from '@utils';
import { initialIncidenrsFilterState, useIncidentsFilter, usePagination } from '@hooks';
import { IncidentsTableProps } from '@interfaces';
import { useListIncidentsQuery } from '@services/server';
import { CreateIncidentModal } from '@components/CreateIncidentModal';
import {
  FilterProps,
  IncidentsSearchBar,
  IncidentsSeverityFilter,
  IncidentsStatusFilter,
  ResetFilterButton
} from './IncidentsFilters';

const IncidentsController: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const scope = getScope();
  const { showError } = useToaster();
  // Filter props
  const { page, limit, setPage, setLimit, pageSizeOptions } = usePagination([10, 20], { page: 0, limit: 10 }, true);
  const { state, dispatch } = useIncidentsFilter();
  const resetPage = (): void => {
    setPage(0);
  };

  const filterProps: FilterProps = {
    state,
    dispatch,
    resetPage
  };

  const { data: incidentList, isLoading: incidentListLoading } = useListIncidentsQuery(
    {
      queryParams: {
        ...scope,
        page,
        all: false,
        limit,
        search: state.incidentName,
        status: state.incidentStatus,
        severity: state.incidentSeverity
      }
    },
    {
      onError: error => {
        showError((error as any)?.message);
      },
      refetchInterval: 20000
      // Removed: enabled: scopeExists()
      // Allow query without scope - backend will return all incidents for ADMIN users
    }
  );

  const totalPages = incidentList?.data?.pagination?.totalPages || 0;
  const totalItems = incidentList?.data?.pagination?.totalItems || 0;
  
  const tableData: IncidentsTableProps = {
    content: incidentList?.data?.content ?? [],
    pagination: totalItems > 0 ? {
      itemCount: totalItems,
      pageCount: totalPages,
      pageIndex: incidentList?.data?.pagination?.index || 0,
      pageSize: incidentList?.data?.pagination?.limit || 10,
      pageSizeOptions: pageSizeOptions,
      gotoPage: setPage,
      onPageSizeChange: setLimit
    } : undefined,
    isLoading: incidentListLoading
  };

  const areFiltersSet = !isEqual(state, initialIncidenrsFilterState);

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries(['listIncidents']);
  };

  return (
    <>
      <IncidentsView
        tableData={tableData}
        incidentsSearchBar={<IncidentsSearchBar {...filterProps} />}
        incidentsStatusFilter={<IncidentsStatusFilter {...filterProps} />}
        incidentsSeverityFilter={<IncidentsSeverityFilter {...filterProps} />}
        resetFiltersButton={<ResetFilterButton {...filterProps} />}
        areFiltersSet={areFiltersSet}
        onCreateIncident={() => setIsCreateModalOpen(true)}
      />
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

export default IncidentsController;
