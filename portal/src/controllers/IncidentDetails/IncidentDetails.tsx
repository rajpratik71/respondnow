import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import IncidentDetailsView from '@views/IncidentDetails';
import { useGetIncidentQuery } from '@services/server';
import { IncidentDetailsPathProps } from '@routes/RouteDefinitions';
import { getScope } from '@utils';

const IncidentDetailsController: React.FC = () => {
  const scope = getScope();
  const queryClient = useQueryClient();
  const { incidentId } = useParams<IncidentDetailsPathProps>();

  const { data: incidentData, isLoading: incidentDataLoading } = useGetIncidentQuery(
    {
      incidentIdentifier: incidentId || '',
      queryParams: scope
    },
    {
      enabled: !!incidentId
      // Removed: && scopeExists()
      // Allow query without scope - backend will handle access control
    }
  );

  const handleActionComplete = () => {
    queryClient.invalidateQueries(['getIncident']);
  };

  return (
    <IncidentDetailsView
      incidentData={incidentData?.data}
      incidentDataLoading={incidentDataLoading}
      onActionComplete={handleActionComplete}
    />
  );
};

export default IncidentDetailsController;
