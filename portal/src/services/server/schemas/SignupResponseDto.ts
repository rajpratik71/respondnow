import { User } from '../types/UserManagement';

export interface SignupResponseDto {
  status: string;
  message: string;
  token?: string;
  data?: User;
}
