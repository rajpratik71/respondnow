package io.respondnow.repository;

import io.respondnow.model.incident.Evidence;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Evidence entity operations
 */
@Repository
public interface EvidenceRepository extends MongoRepository<Evidence, String> {

  /**
   * Find all evidence for a specific incident
   */
  List<Evidence> findByIncidentIdAndRemovedFalse(String incidentId);

  /**
   * Find evidence by ID and incident ID (for security)
   */
  Optional<Evidence> findByIdAndIncidentIdAndRemovedFalse(String id, String incidentId);

  /**
   * Count evidence for an incident
   */
  long countByIncidentIdAndRemovedFalse(String incidentId);
}
