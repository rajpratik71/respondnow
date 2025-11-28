import React from 'react';
import {
  Button,
  ButtonVariation,
  Dialog,
  FormInput,
  Formik,
  FormikForm,
  Layout,
  SelectOption,
  useToaster
} from '@harnessio/uicore';
import * as Yup from 'yup';
import { useCreateIncidentMutation, CreateIncidentRequestBody } from '@services/server';
import { getScope } from '@utils';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const severityOptions: SelectOption[] = [
  { label: 'SEV0 - Critical', value: 'SEV0' },
  { label: 'SEV1 - Major', value: 'SEV1' },
  { label: 'SEV2 - Minor', value: 'SEV2' }
];

const typeOptions: SelectOption[] = [
  { label: 'Availability', value: 'Availability' },
  { label: 'Latency', value: 'Latency' },
  { label: 'Security', value: 'Security' },
  { label: 'Other', value: 'Other' }
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  summary: Yup.string().required('Summary is required'),
  severity: Yup.string().required('Severity is required'),
  type: Yup.string().required('Type is required')
});

const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToaster();
  const scope = getScope();

  const { mutate: createIncident, isLoading } = useCreateIncidentMutation(
    { queryParams: scope },
    {
      onSuccess: () => {
        showSuccess('Incident created successfully');
        onClose();
        onSuccess?.();
      },
      onError: (error: any) => {
        showError(error?.message || 'Failed to create incident');
      }
    }
  );

  const handleSubmit = (values: CreateIncidentRequestBody) => {
    createIncident({
      body: values,
      queryParams: scope
    });
  };

  const initialValues: CreateIncidentRequestBody = {
    name: '',
    summary: '',
    description: '',
    severity: 'SEV1',
    type: 'Availability',
    tags: [],
    incidentUrl: ''
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Incident"
      enforceFocus={false}
      style={{ width: 600, maxHeight: '90vh', overflow: 'auto' }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        formName="createIncidentForm"
      >
        {formik => (
          <FormikForm>
            <Layout.Vertical spacing="medium" padding="xlarge">
              <FormInput.Text
                name="name"
                label="Incident Name"
                placeholder="Enter incident name"
              />
              <FormInput.Select
                name="severity"
                label="Severity"
                items={severityOptions}
                placeholder="Select severity"
              />
              <FormInput.Select
                name="type"
                label="Type"
                items={typeOptions}
                placeholder="Select incident type"
              />
              <FormInput.TextArea
                name="summary"
                label="Summary"
                placeholder="Provide a summary of the incident"
              />
              <FormInput.TextArea
                name="description"
                label="Description (Optional)"
                placeholder="Provide detailed description"
              />
              <FormInput.Text
                name="incidentUrl"
                label="Incident URL (Optional)"
                placeholder="Enter external URL for this incident (e.g., runbook, dashboard)"
              />
              <Layout.Horizontal spacing="medium" flex={{ justifyContent: 'flex-end' }}>
                <Button
                  variation={ButtonVariation.TERTIARY}
                  text="Cancel"
                  onClick={onClose}
                  disabled={isLoading}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text="Create Incident"
                  disabled={!formik.isValid || isLoading}
                  loading={isLoading}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </FormikForm>
        )}
      </Formik>
    </Dialog>
  );
};

export default CreateIncidentModal;
