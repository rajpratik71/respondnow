package io.respondnow.model.user;

/**
 * Granular permissions for RBAC system
 * Permissions can be assigned to roles or individual users
 */
public enum Permission {
  // Incident Permissions
  READ_INCIDENT,
  CREATE_INCIDENT,
  UPDATE_INCIDENT,
  DELETE_INCIDENT,
  EXPORT_INCIDENT,
  ACKNOWLEDGE_INCIDENT,
  RESOLVE_INCIDENT,
  
  // User Management Permissions
  READ_USER,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  ASSIGN_ROLE,
  
  // Team Management Permissions
  READ_TEAM,
  CREATE_TEAM,
  UPDATE_TEAM,
  DELETE_TEAM,
  MANAGE_TEAM_MEMBERS,
  
  // Organization Management Permissions
  READ_ORGANIZATION,
  UPDATE_ORGANIZATION,
  MANAGE_ORGANIZATION_SETTINGS,
  
  // Advanced Features
  MANAGE_CUSTOM_FIELDS,
  MANAGE_TEMPLATES,
  VIEW_ANALYTICS,
  BULK_OPERATIONS,
  MANAGE_SLA,
  
  // System Administration
  SYSTEM_ADMIN
}
