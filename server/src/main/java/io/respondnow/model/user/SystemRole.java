package io.respondnow.model.user;

/**
 * System-level user roles with hierarchical permissions
 * ADMIN > INCIDENT_COMMANDER > RESPONDER > OBSERVER > REPORTER
 */
public enum SystemRole {
  /**
   * Platform administrator - full system access
   */
  ADMIN,
  
  /**
   * Incident commander - can manage incidents and assign roles
   */
  INCIDENT_COMMANDER,
  
  /**
   * Active responder - can update incidents and participate
   */
  RESPONDER,
  
  /**
   * Observer - read-only access to incidents
   */
  OBSERVER,
  
  /**
   * Reporter - can create incidents but limited update access
   */
  REPORTER
}
