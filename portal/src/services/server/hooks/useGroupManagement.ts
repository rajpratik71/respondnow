import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@services/fetcher';
import { CreateGroupRequest, Group } from '../types/UserManagement';

export const useGroups = () => {
  return useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => fetcher<Group[]>({
      url: '/api/groups',
      method: 'GET'
    })
  });
};

export const useGroup = (id: string) => {
  return useQuery<Group>({
    queryKey: ['groups', id],
    queryFn: () => fetcher<Group>({
      url: `/api/groups/${id}`,
      method: 'GET'
    }),
    enabled: !!id
  });
};

export const useCreateGroupMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateGroupRequest) => fetcher<Group>({
      url: '/api/groups',
      method: 'POST',
      body: request
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useUpdateGroupMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateGroupRequest }) => fetcher<Group>({
      url: `/api/groups/${id}`,
      method: 'PUT',
      body: data
    }),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id] });
    }
  });
};

export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => fetcher<void>({
      url: `/api/groups/${id}`,
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useAddGroupMemberMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => fetcher<void>({
      url: `/api/groups/${groupId}/members?userId=${userId}`,
      method: 'POST'
    }),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useRemoveGroupMemberMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => fetcher<void>({
      url: `/api/groups/${groupId}/members/${userId}`,
      method: 'DELETE'
    }),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useAssignGroupRoleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, roleName }: { groupId: string; roleName: string }) => fetcher<void>({
      url: `/api/groups/${groupId}/roles?roleName=${roleName}`,
      method: 'POST'
    }),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};
