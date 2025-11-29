import jwtDecode from 'jwt-decode';
import { pick } from 'lodash-es';
import { DecodedTokenType } from 'models';
import { AppStoreContextProps, Scope } from '@context';
import { getUserMappings } from '@services/server';

export function setUserDetails(
  updateAppStore: AppStoreContextProps['updateAppStore'],
  accessToken: string,
  isInitialLogin?: boolean,
  scope?: Scope
): void {
  const decodedToken = accessToken ? (jwtDecode(accessToken) as DecodedTokenType) : null;
  const userId = decodedToken?.username || ''; // Backend stores userId in "username" claim
  const email = decodedToken?.email || '';
  const name = decodedToken?.name || '';
  const username = decodedToken?.name || ''; // Use name as display username
  const roleNames = decodedToken?.roleNames || [];

  // Parse firstName and lastName from full name
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || ''; // Handle multi-part last names

  updateAppStore({
    currentUserInfo: { 
      userId, 
      email, 
      name, 
      username, 
      firstName,
      lastName,
      roleNames 
    },
    scope,
    isInitialLogin
  });
}

export function getUsername(accessToken: string): string {
  return accessToken ? (jwtDecode(accessToken) as DecodedTokenType).username : '';
}

export function updateLocalStorage(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export async function updateUserAndScopeFromAPI(
  updateAppStore: AppStoreContextProps['updateAppStore'],
  accessToken: string,
  isInitialLogin?: boolean
): Promise<void> {
  try {
    const mappingData = await getUserMappings({
      queryParams: {
        userId: getUsername(accessToken)
      }
    });
    
    const scope: Scope = pick(mappingData?.data?.defaultMapping, [
      'accountIdentifier',
      'orgIdentifier',
      'projectIdentifier'
    ]);

    setUserDetails(updateAppStore, accessToken, isInitialLogin, scope);
  } catch (error) {
    // If user mappings don't exist (new user), just set user details without scope
    console.warn('No user mappings found, setting user details without scope:', error);
    setUserDetails(updateAppStore, accessToken, isInitialLogin);
  }
}
