import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { Evidence } from '../types/Evidence';

export interface UploadEvidenceParams {
  incidentId: string;
  file: File;
  description?: string;
  accountIdentifier: string;
  orgIdentifier?: string;
  projectIdentifier?: string;
}

export interface AddTextEvidenceParams {
  incidentId: string;
  textContent: string;
  filename?: string;
  description?: string;
  accountIdentifier: string;
  orgIdentifier?: string;
  projectIdentifier?: string;
}

async function uploadEvidence(params: UploadEvidenceParams): Promise<Evidence> {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.description) formData.append('description', params.description);
  
  const queryParams = new URLSearchParams();
  queryParams.append('accountIdentifier', params.accountIdentifier);
  if (params.orgIdentifier) queryParams.append('orgIdentifier', params.orgIdentifier);
  if (params.projectIdentifier) queryParams.append('projectIdentifier', params.projectIdentifier);

  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `/api/incident/evidence/${params.incidentId}/upload?${queryParams.toString()}`,
    {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload evidence');
  }

  return response.json();
}

async function addTextEvidence(params: AddTextEvidenceParams): Promise<Evidence> {
  const queryParams = new URLSearchParams();
  queryParams.append('accountIdentifier', params.accountIdentifier);
  queryParams.append('textContent', params.textContent);
  if (params.filename) queryParams.append('filename', params.filename);
  if (params.description) queryParams.append('description', params.description);
  if (params.orgIdentifier) queryParams.append('orgIdentifier', params.orgIdentifier);
  if (params.projectIdentifier) queryParams.append('projectIdentifier', params.projectIdentifier);

  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `/api/incident/evidence/${params.incidentId}/text?${queryParams.toString()}`,
    {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to add text evidence');
  }

  return response.json();
}

async function getEvidenceForIncident(incidentId: string): Promise<Evidence[]> {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/incident/evidence/${incidentId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch evidence');
  }

  return response.json();
}

async function deleteEvidence(evidenceId: string): Promise<void> {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/incident/evidence/${evidenceId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete evidence');
  }
}

async function exportEvidenceAsZip(incidentId: string, incidentIdentifier: string): Promise<Blob> {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `/api/incident/evidence/${incidentId}/export?incidentIdentifier=${incidentIdentifier}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export evidence');
  }

  return response.blob();
}

export function useUploadEvidence(options?: UseMutationOptions<Evidence, Error, UploadEvidenceParams>) {
  return useMutation<Evidence, Error, UploadEvidenceParams>(uploadEvidence, options);
}

export function useAddTextEvidence(options?: UseMutationOptions<Evidence, Error, AddTextEvidenceParams>) {
  return useMutation<Evidence, Error, AddTextEvidenceParams>(addTextEvidence, options);
}

export function useGetEvidence(incidentId: string, options?: UseQueryOptions<Evidence[], Error>) {
  return useQuery<Evidence[], Error>(['evidence', incidentId], () => getEvidenceForIncident(incidentId), options);
}

export function useDeleteEvidence(options?: UseMutationOptions<void, Error, string>) {
  return useMutation<void, Error, string>(deleteEvidence, options);
}

export function useExportEvidenceZip(options?: UseMutationOptions<Blob, Error, { incidentId: string; incidentIdentifier: string }>) {
  return useMutation<Blob, Error, { incidentId: string; incidentIdentifier: string }>(
    ({ incidentId, incidentIdentifier }) => exportEvidenceAsZip(incidentId, incidentIdentifier),
    options
  );
}
