import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@services/fetcher';
import { CreateUserRequest, UpdateUserRequest, User } from '../types/UserManagement';

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => fetcher<User[]>({
      url: '/api/users',
      method: 'GET'
    })
  });
};

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => fetcher<User>({
      url: `/api/users/${id}`,
      method: 'GET'
    }),
    enabled: !!id
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateUserRequest) => fetcher<User>({
      url: '/api/users',
      method: 'POST',
      body: request
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => fetcher<User>({
      url: `/api/users/${id}`,
      method: 'PUT',
      body: data
    }),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    }
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => fetcher<void>({
      url: `/api/users/${id}`,
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useAssignRoleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => fetcher<void>({
      url: `/api/users/${userId}/roles?roleName=${roleName}`,
      method: 'POST'
    }),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useRemoveRoleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => fetcher<void>({
      url: `/api/users/${userId}/roles/${roleName}`,
      method: 'DELETE'
    }),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useUserPermissions = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'permissions'],
    queryFn: () => fetcher({
      url: `/api/users/${userId}/permissions`,
      method: 'GET'
    }),
    enabled: !!userId
  });
};
