package io.respondnow.repository;

import io.respondnow.model.user.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
    Optional<Group> findByName(String name);
    List<Group> findByUserIdsContaining(String userId);
    List<Group> findByRoleNamesContaining(String roleName);
    List<Group> findByActive(Boolean active);
    boolean existsByName(String name);
}
