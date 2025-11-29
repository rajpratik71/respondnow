import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { getTokenFromLocalStorage, isUserAuthenticated, updateUserAndScopeFromAPI, isManagerOrAbove } from '@utils';
import { initialAppContext } from '@context';
import { useAppStore } from '@hooks';
import { paths } from './RouteDefinitions';

interface RoleProtectedRouteProps extends RouteProps {
  requireManagerOrAbove?: boolean;
}

function RoleProtectedRoute({ requireManagerOrAbove, ...props }: RoleProtectedRouteProps): React.ReactElement {
  const showAuthorizedRoutes = isUserAuthenticated();
  const appStore = useAppStore();
  const { token, isInitialLogin } = getTokenFromLocalStorage();

  React.useEffect(() => {
    if (appStore.currentUserInfo === initialAppContext.currentUserInfo && token) {
      updateUserAndScopeFromAPI(appStore.updateAppStore, token, isInitialLogin);
    }
  }, [appStore, token, isInitialLogin]);

  // First check if user is authenticated
  if (!showAuthorizedRoutes) {
    return <Redirect to={paths.toLogin()} />;
  }

  // Then check role requirements
  if (requireManagerOrAbove) {
    const userRoles = appStore.currentUserInfo?.roleNames || [];
    
    // If user info is not yet loaded (roleNames is undefined), show loading
    if (!appStore.currentUserInfo?.email || !userRoles.length) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
    }
    
    const hasPermission = isManagerOrAbove(userRoles);
    
    if (!hasPermission) {
      // Redirect to dashboard if user doesn't have required role
      return <Redirect to={paths.toDashboard()} />;
    }
  }

  return <Route {...props} />;
}

export default RoleProtectedRoute;
