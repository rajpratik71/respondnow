export interface DecodedTokenType {
  email: string;
  name: string;
  username: string; // This is actually the userId from backend
  userId?: string; // Alias for clarity
  roleNames?: string[];
  exp: number;
}
