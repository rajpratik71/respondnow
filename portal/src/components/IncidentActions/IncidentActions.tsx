import React, { useState } from 'react';
import {
  Button,
  ButtonVariation,
  ConfirmationDialog,
  Layout,
  Popover,
  useToaster
} from '@harnessio/uicore';
import { Menu, MenuItem, Intent } from '@blueprintjs/core';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteIncidentMutation,
  useAcknowledgeIncidentMutation,
  useUpdateIncidentStatusMutation,
  Incident
} from '@services/server';
import { getScope } from '@utils';

interface IncidentActionsProps {
  incident: Incident;
  onActionComplete?: () => void;
  showAcknowledge?: boolean;
  showStatusUpdate?: boolean;
  showDelete?: boolean;
}

const statusOptions = [
  { label: 'Started', value: 'Started' },
  { label: 'Acknowledged', value: 'Acknowledged' },
  { label: 'Investigating', value: 'Investigating' },
  { label: 'Identified', value: 'Identified' },
  { label: 'Mitigated', value: 'Mitigated' },
  { label: 'Resolved', value: 'Resolved' }
] as const;

const IncidentActions: React.FC<IncidentActionsProps> = ({
  incident,
  onActionComplete,
  showAcknowledge = true,
  showStatusUpdate = true,
  showDelete = true
}) => {
  const { showSuccess, showError } = useToaster();
  const queryClient = useQueryClient();
  const scope = getScope();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const refreshData = () => {
    queryClient.invalidateQueries(['listIncidents']);
    queryClient.invalidateQueries(['getIncident']);
    onActionComplete?.();
  };

  const { mutate: deleteIncident, isLoading: isDeleting } = useDeleteIncidentMutation(
    { queryParams: scope },
    {
      onSuccess: () => {
        showSuccess('Incident deleted successfully');
        setShowDeleteDialog(false);
        refreshData();
      },
      onError: (error: any) => {
        showError(error?.message || 'Failed to delete incident');
      }
    }
  );

  const { mutate: acknowledgeIncident, isLoading: isAcknowledging } = useAcknowledgeIncidentMutation(
    { queryParams: scope },
    {
      onSuccess: () => {
        showSuccess('Incident acknowledged');
        refreshData();
      },
      onError: (error: any) => {
        showError(error?.message || 'Failed to acknowledge incident');
      }
    }
  );

  const { mutate: updateStatus, isLoading: isUpdatingStatus } = useUpdateIncidentStatusMutation(
    { queryParams: scope },
    {
      onSuccess: () => {
        showSuccess('Status updated successfully');
        refreshData();
      },
      onError: (error: any) => {
        showError(error?.message || 'Failed to update status');
      }
    }
  );

  const handleDelete = () => {
    if (incident.identifier) {
      deleteIncident({
        incidentIdentifier: incident.identifier,
        queryParams: scope
      });
    }
  };

  const handleAcknowledge = () => {
    if (incident.identifier) {
      acknowledgeIncident({
        incidentIdentifier: incident.identifier,
        queryParams: scope
      });
    }
  };

  const handleStatusChange = (newStatus: typeof statusOptions[number]['value']) => {
    if (incident.identifier) {
      updateStatus({
        incidentIdentifier: incident.identifier,
        body: { status: newStatus },
        queryParams: scope
      });
    }
  };

  const isLoading = isDeleting || isAcknowledging || isUpdatingStatus;
  const canAcknowledge = incident.status === 'Started';

  return (
    <>
      <Layout.Horizontal spacing="small">
        {showAcknowledge && canAcknowledge && (
          <Button
            variation={ButtonVariation.SECONDARY}
            size="small"
            text="Acknowledge"
            onClick={handleAcknowledge}
            disabled={isLoading}
          />
        )}
        {showStatusUpdate && (
          <Popover
            interactionKind="click"
            position="bottom-right"
            content={
              <Menu>
                {statusOptions.map(option => (
                  <MenuItem
                    key={option.value}
                    text={option.label}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={incident.status === option.value}
                  />
                ))}
              </Menu>
            }
          >
            <Button
              variation={ButtonVariation.TERTIARY}
              size="small"
              text="Update Status"
              rightIcon="chevron-down"
              disabled={isLoading}
            />
          </Popover>
        )}
        {showDelete && (
          <Button
            variation={ButtonVariation.TERTIARY}
            size="small"
            icon="trash"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
          />
        )}
      </Layout.Horizontal>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        titleText="Delete Incident"
        contentText={`Are you sure you want to delete incident "${incident.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        intent={Intent.DANGER}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default IncidentActions;
