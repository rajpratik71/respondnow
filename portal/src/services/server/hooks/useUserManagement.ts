import { useMutation, useQuery, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { fetcher } from '@services/fetcher';
import { User, SystemRole } from '@types/rbac';

export interface CreateUserRequest {
  name: string;
  userId: string;
  email: string;
  password: string;
  systemRole?: SystemRole;
  active?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  systemRole?: SystemRole;
  teamIds?: string[];
  active?: boolean;
}

export interface ListUsersParams {
  accountIdentifier: string;
  orgIdentifier?: string;
  role?: string;
  active?: boolean;
  search?: string;
}

/**
 * Hook to list users
 */
export function useListUsers(params: ListUsersParams) {
  return useQuery<User[]>(
    ['users', params],
    () =>
      fetcher<User[]>({
        url: '/api/users',
        queryParams: params
      }),
    {
      enabled: !!params.accountIdentifier
    }
  );
}

/**
 * Hook to get a single user
 */
export function useGetUser(userId: string, accountIdentifier: string) {
  return useQuery<User>(
    ['users', userId, accountIdentifier],
    () =>
      fetcher<User>({
        url: `/api/users/${userId}`,
        queryParams: { accountIdentifier }
      }),
    {
      enabled: !!userId && !!accountIdentifier
    }
  );
}

/**
 * Hook to create a user
 */
export function useCreateUserMutation(
  accountIdentifier: string,
  orgIdentifier?: string,
  options?: UseMutationOptions<User, Error, CreateUserRequest>
) {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserRequest>(
    (userData: CreateUserRequest) =>
      fetcher<User>({
        url: '/api/users',
        method: 'POST',
        queryParams: {
          accountIdentifier,
          ...(orgIdentifier && { orgIdentifier })
        },
        body: userData
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        // Invalidate users list to refetch
        queryClient.invalidateQueries(['users']);
        options?.onSuccess?.(data, variables, context);
      }
    }
  );
}

/**
 * Hook to update a user
 */
export function useUpdateUserMutation(
  userId: string,
  accountIdentifier: string,
  options?: UseMutationOptions<User, Error, UpdateUserRequest>
) {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserRequest>(
    (userData: UpdateUserRequest) =>
      fetcher<User>({
        url: `/api/users/${userId}`,
        method: 'PUT',
        queryParams: { accountIdentifier },
        body: userData
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        // Invalidate users list and specific user
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['users', userId]);
        options?.onSuccess?.(data, variables, context);
      }
    }
  );
}

/**
 * Hook to delete a user
 */
export function useDeleteUserMutation(
  accountIdentifier: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>(
    (userId: string) =>
      fetcher<void>({
        url: `/api/users/${userId}`,
        method: 'DELETE',
        queryParams: { accountIdentifier }
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        // Invalidate users list
        queryClient.invalidateQueries(['users']);
        options?.onSuccess?.(data, variables, context);
      }
    }
  );
}
