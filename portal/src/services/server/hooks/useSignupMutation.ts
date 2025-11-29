/* eslint-disable */
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import type { SignupResponseDto } from '../schemas/SignupResponseDto';
import type { SignupUserInput } from '../schemas/SignupUserInput';
import { fetcher, FetcherOptions } from '@services/fetcher';

export type SignupRequestBody = SignupUserInput;

export type SignupOkResponse = SignupResponseDto;

export type SignupErrorResponse = SignupResponseDto;

export interface SignupProps extends Omit<FetcherOptions<unknown, SignupRequestBody>, 'url'> {
  body: SignupRequestBody;
}

export function signup(props: SignupProps): Promise<SignupOkResponse> {
  return fetcher<SignupOkResponse, unknown, SignupRequestBody>({
    url: `/api/auth/signup`,
    method: 'POST',
    ...props
  });
}

export type SignupMutationProps<T extends keyof SignupProps> = Omit<SignupProps, T> & Partial<Pick<SignupProps, T>>;

/**
 * User signup
 */
export function useSignupMutation<T extends keyof SignupProps>(
  props: Pick<Partial<SignupProps>, T>,
  options?: Omit<
    UseMutationOptions<SignupOkResponse, SignupErrorResponse, SignupMutationProps<T>>,
    'mutationKey' | 'mutationFn'
  >
) {
  return useMutation<SignupOkResponse, SignupErrorResponse, SignupMutationProps<T>>(
    (mutateProps: SignupMutationProps<T>) => signup({ ...props, ...mutateProps } as SignupProps),
    options
  );
}
