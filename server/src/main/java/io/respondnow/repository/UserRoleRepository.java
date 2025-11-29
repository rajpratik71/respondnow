package io.respondnow.repository;

import io.respondnow.model.user.UserRole;
import io.respondnow.model.user.UserRoleType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends MongoRepository<UserRole, String> {
    Optional<UserRole> findByName(String name);
    List<UserRole> findByType(UserRoleType type);
    boolean existsByName(String name);
}
