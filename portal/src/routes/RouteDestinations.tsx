import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import LoginController from '@controllers/Login';
import SignupController from '@controllers/Signup';
import { GenericErrorHandler } from '@errors';
import Dashboard from '@views/Dashboard';
import GettingStartedController from '@controllers/GettingStarted';
import IncidentsController from '@controllers/Incidents';
import IncidentDetailsController from '@controllers/IncidentDetails';
import PasswordResetController from '@controllers/PasswordReset';
import UsersPage from '@views/Admin/Users';
import GroupsPage from '@views/Admin/Groups';
import UserDetailsPage from '@views/Admin/UserDetails';
import GroupDetailsPage from '@views/Admin/GroupDetails';
import PermissionMatrixPage from '@views/Admin/PermissionMatrix';
import SecurityAuditLogPage from '@views/Admin/SecurityAuditLog';
import IncidentMetricsPage from '@views/Admin/IncidentMetrics';
import { paths } from './RouteDefinitions';
import AuthenticatedRoute from './AuthenticatedRoute';
import UnauthenticatedRoute from './UnauthenticatedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';

export function Routes(): React.ReactElement {
  const incidentId = ':incidentId';
  const userId = ':id';
  const groupId = ':id';

  return (
    <Switch>
      <Redirect exact from={paths.toRoot()} to={paths.toDashboard()} />
      <AuthenticatedRoute exact path={paths.toDashboard()} component={Dashboard} />
      <AuthenticatedRoute exact path={paths.toGetStarted()} component={GettingStartedController} />
      <AuthenticatedRoute exact path={paths.toIncidentDashboard()} component={IncidentsController} />
      <AuthenticatedRoute exact path={paths.toIncidentMetrics()} component={IncidentMetricsPage} />
      <AuthenticatedRoute exact path={paths.toIncidentDetails({ incidentId })} component={IncidentDetailsController} />
      <AuthenticatedRoute exact path={paths.toPasswordReset()} component={PasswordResetController} />
      <RoleProtectedRoute exact path={paths.toUsers()} component={UsersPage} requireManagerOrAbove />
      <RoleProtectedRoute exact path={`/users/${userId}`} component={UserDetailsPage} requireManagerOrAbove />
      <RoleProtectedRoute exact path={paths.toGroups()} component={GroupsPage} requireManagerOrAbove />
      <RoleProtectedRoute exact path={`/groups/${groupId}`} component={GroupDetailsPage} requireManagerOrAbove />
      <RoleProtectedRoute exact path={paths.toPermissionMatrix()} component={PermissionMatrixPage} requireManagerOrAbove />
      <RoleProtectedRoute exact path={paths.toSecurityAuditLog()} component={SecurityAuditLogPage} requireManagerOrAbove />
      <UnauthenticatedRoute exact path={paths.toLogin()} component={LoginController} />
      <UnauthenticatedRoute exact path={paths.toSignup()} component={SignupController} />
      <Route path="*" component={GenericErrorHandler} />
    </Switch>
  );
}
