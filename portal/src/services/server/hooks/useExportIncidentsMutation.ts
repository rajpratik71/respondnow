import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { fetcher } from '@services/fetcher';

export interface ExportRequestBody {
  incidentIds?: string[];
  type?: 'Availability' | 'Latency' | 'Security' | 'Other';
  severity?: 'SEV0' | 'SEV1' | 'SEV2';
  status?: 'Started' | 'Acknowledged' | 'Investigating' | 'Identified' | 'Mitigated' | 'Resolved';
  active?: boolean;
  search?: string;
  startDate?: number;
  endDate?: number;
  exportAll?: boolean;
  format?: 'csv' | 'pdf';
}

export interface ExportQueryParams {
  accountIdentifier: string;
  orgIdentifier?: string;
  projectIdentifier?: string;
}

interface ExportResponse {
  data: Blob;
  totalCount: number;
}

async function exportIncidentsToCSV(
  queryParams: ExportQueryParams,
  body: ExportRequestBody
): Promise<ExportResponse> {
  const params = new URLSearchParams();
  params.append('accountIdentifier', queryParams.accountIdentifier);
  if (queryParams.orgIdentifier) params.append('orgIdentifier', queryParams.orgIdentifier);
  if (queryParams.projectIdentifier) params.append('projectIdentifier', queryParams.projectIdentifier);

  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/incident/export/csv?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to export incidents');
  }

  const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
  const data = await response.blob();

  return { data, totalCount };
}

async function exportIncidentsToPDF(
  queryParams: ExportQueryParams,
  body: ExportRequestBody
): Promise<ExportResponse> {
  const params = new URLSearchParams();
  params.append('accountIdentifier', queryParams.accountIdentifier);
  if (queryParams.orgIdentifier) params.append('orgIdentifier', queryParams.orgIdentifier);
  if (queryParams.projectIdentifier) params.append('projectIdentifier', queryParams.projectIdentifier);

  const token = localStorage.getItem('accessToken');

  const response = await fetch(`/api/incident/export/pdf?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to export incidents');
  }

  const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
  const data = await response.blob();

  return { data, totalCount };
}

async function exportSingleIncidentToPDF(
  incidentId: string,
  queryParams: ExportQueryParams
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append('accountIdentifier', queryParams.accountIdentifier);

  const token = localStorage.getItem('accessToken');

  const response = await fetch(`/api/incident/export/pdf/${incidentId}?${params.toString()}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to export incident');
  }

  return response.blob();
}

export interface UseExportCSVProps {
  queryParams: ExportQueryParams;
}

export function useExportCSVMutation(
  props: UseExportCSVProps,
  options?: UseMutationOptions<ExportResponse, Error, ExportRequestBody>
) {
  return useMutation<ExportResponse, Error, ExportRequestBody>(
    (body: ExportRequestBody) => exportIncidentsToCSV(props.queryParams, body),
    options
  );
}

export function useExportPDFMutation(
  props: UseExportCSVProps,
  options?: UseMutationOptions<ExportResponse, Error, ExportRequestBody>
) {
  return useMutation<ExportResponse, Error, ExportRequestBody>(
    (body: ExportRequestBody) => exportIncidentsToPDF(props.queryParams, body),
    options
  );
}

export interface UseExportSinglePDFProps {
  queryParams: ExportQueryParams;
  incidentId: string;
}

export function useExportSinglePDFMutation(
  props: UseExportSinglePDFProps,
  options?: UseMutationOptions<Blob, Error, void>
) {
  return useMutation<Blob, Error, void>(
    () => exportSingleIncidentToPDF(props.incidentId, props.queryParams),
    options
  );
}

// Helper function to download blob as file
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
