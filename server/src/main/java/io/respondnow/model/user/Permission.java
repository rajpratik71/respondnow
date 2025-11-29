package io.respondnow.model.user;

/**
 * Enum representing fine-grained permissions in the system.
 * These permissions are assigned to roles and control access to various features.
 */
public enum Permission {
    // Incident Permissions
    INCIDENT_VIEW("View incidents"),
    INCIDENT_CREATE("Create incidents"),
    INCIDENT_UPDATE("Update incidents"),
    INCIDENT_DELETE("Delete incidents"),
    INCIDENT_EXPORT("Export incidents"),
    INCIDENT_ASSIGN("Assign incidents to users"),
    
    // User Management Permissions
    USER_VIEW("View users"),
    USER_CREATE("Create users"),
    USER_UPDATE("Update users"),
    USER_DELETE("Delete users"),
    USER_MANAGE_ROLES("Manage user roles"),
    USER_RESET_PASSWORD("Reset user passwords"),
    
    // Group Management Permissions
    GROUP_VIEW("View groups"),
    GROUP_CREATE("Create groups"),
    GROUP_UPDATE("Update groups"),
    GROUP_DELETE("Delete groups"),
    GROUP_MANAGE_MEMBERS("Manage group members"),
    GROUP_MANAGE_ROLES("Manage group roles"),
    
    // Evidence Permissions
    EVIDENCE_VIEW("View evidence"),
    EVIDENCE_UPLOAD("Upload evidence"),
    EVIDENCE_DELETE("Delete evidence"),
    EVIDENCE_DOWNLOAD("Download evidence"),
    
    // Export Permissions
    EXPORT_CSV("Export to CSV"),
    EXPORT_PDF("Export to PDF"),
    EXPORT_COMBINED("Export combined (PDF + Evidence)"),
    
    // Role Management Permissions (Admin only)
    ROLE_VIEW("View roles"),
    ROLE_CREATE("Create custom roles"),
    ROLE_UPDATE("Update custom roles"),
    ROLE_DELETE("Delete custom roles"),
    
    // System Administration Permissions
    SYSTEM_ADMIN("Full system administration"),
    SYSTEM_CONFIG("Configure system settings"),
    SYSTEM_AUDIT("View audit logs");
    
    private final String description;
    
    Permission(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return this.name();
    }
}
