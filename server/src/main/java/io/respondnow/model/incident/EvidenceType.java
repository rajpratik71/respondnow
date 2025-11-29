package io.respondnow.model.incident;

/**
 * Types of evidence that can be attached to an incident
 */
public enum EvidenceType {
  TEXT,       // Plain text files, logs
  IMAGE,      // Images (png, jpg, gif, etc.)
  DOCUMENT,   // Documents (pdf, doc, xlsx, etc.)
  VIDEO,      // Video files
  AUDIO,      // Audio files
  OTHER       // Any other file type
}
