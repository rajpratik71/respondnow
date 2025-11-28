/* eslint-disable */
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { fetcher, FetcherOptions } from '@services/fetcher';

export interface CreateIncidentRequestBody {
  name: string;
  description?: string;
  type: 'Availability' | 'Latency' | 'Security' | 'Other';
  severity: 'SEV0' | 'SEV1' | 'SEV2';
  summary: string;
  status?: 'Started' | 'Acknowledged' | 'Investigating' | 'Identified' | 'Mitigated' | 'Resolved';
  tags?: string[];
  incidentUrl?: string;
}

export interface CreateIncidentQueryParams {
  accountIdentifier: string;
  orgIdentifier?: string;
  projectIdentifier?: string;
}

export interface CreateIncidentOkResponse {
  status: string;
  message: string;
  data?: {
    incident: any;
    correlationID?: string;
  };
}

export type CreateIncidentErrorResponse = CreateIncidentOkResponse;

export interface CreateIncidentProps extends Omit<FetcherOptions<CreateIncidentQueryParams, CreateIncidentRequestBody>, 'url'> {
  body: CreateIncidentRequestBody;
  queryParams: CreateIncidentQueryParams;
}

export function createIncident(props: CreateIncidentProps): Promise<CreateIncidentOkResponse> {
  return fetcher<CreateIncidentOkResponse, CreateIncidentQueryParams, CreateIncidentRequestBody>({
    url: `/api/incident`,
    method: 'POST',
    ...props
  });
}

export type CreateIncidentMutationProps<T extends keyof CreateIncidentProps> = Omit<CreateIncidentProps, T> &
  Partial<Pick<CreateIncidentProps, T>>;

/**
 * Create a new incident
 */
export function useCreateIncidentMutation<T extends keyof CreateIncidentProps>(
  props: Pick<Partial<CreateIncidentProps>, T>,
  options?: Omit<
    UseMutationOptions<CreateIncidentOkResponse, CreateIncidentErrorResponse, CreateIncidentMutationProps<T>>,
    'mutationKey' | 'mutationFn'
  >
) {
  return useMutation<CreateIncidentOkResponse, CreateIncidentErrorResponse, CreateIncidentMutationProps<T>>(
    (mutateProps: CreateIncidentMutationProps<T>) => createIncident({ ...props, ...mutateProps } as CreateIncidentProps),
    options
  );
}
