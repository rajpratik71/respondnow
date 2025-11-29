package io.respondnow.repository;

import io.respondnow.model.user.SystemRole;
import io.respondnow.model.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends MongoRepository<User, String> {
  // Method to find a user by their email
  Optional<User> findByEmail(String email);

  // Check if email exists in the database
  boolean existsByEmail(String email);

  // Find user by userId (username)
  Optional<User> findByUserId(String userId);

  // Tenant-aware queries
  List<User> findByAccountIdentifierAndOrgIdentifier(String accountIdentifier, String orgIdentifier);

  List<User> findByAccountIdentifier(String accountIdentifier);

  Optional<User> findByUserIdAndAccountIdentifier(String userId, String accountIdentifier);

  Optional<User> findByEmailAndAccountIdentifier(String email, String accountIdentifier);

  // Count for quota checking
  long countByAccountIdentifierAndOrgIdentifier(String accountIdentifier, String orgIdentifier);

  // Find by role
  List<User> findByAccountIdentifierAndOrgIdentifierAndSystemRole(
      String accountIdentifier, String orgIdentifier, SystemRole systemRole);

  // Find active users
  List<User> findByAccountIdentifierAndOrgIdentifierAndActive(
      String accountIdentifier, String orgIdentifier, Boolean active);

  // Search users
  @Query("{ 'accountIdentifier': ?0, 'orgIdentifier': ?1, $or: [ { 'name': { $regex: ?2, $options: 'i' } }, { 'email': { $regex: ?2, $options: 'i' } }, { 'userId': { $regex: ?2, $options: 'i' } } ] }")
  List<User> searchUsers(String accountIdentifier, String orgIdentifier, String searchText);
}
