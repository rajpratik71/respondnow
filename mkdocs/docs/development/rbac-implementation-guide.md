# RBAC & Multi-Tenancy Implementation Guide

## 🎯 What's Been Implemented

### Core Foundation (✅ Complete)

#### 1. RBAC Models
- **`SystemRole` enum** - 5 hierarchical roles (ADMIN → INCIDENT_COMMANDER → RESPONDER → OBSERVER → REPORTER)
- **`Permission` enum** - 30+ granular permissions covering incidents, users, teams, organizations, and system admin
- **Enhanced `User` entity** - Added systemRole, permissions set, team IDs, org IDs, and tenant fields
  - Built-in permission checking methods: `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`
  - Admin role automatically gets all permissions
- **`Team` entity** - Complete team model with members, roles (LEAD/MEMBER), permissions
  - Helper methods: `addMember()`, `removeMember()`, `hasMember()`, `isLead()`
- **`Organization` entity** - Organization with settings, quotas, and quota checking
  - Settings: auto-escalation, default severity, custom fields toggle
  - Quotas: max users, teams, incidents, custom fields, templates, storage

#### 2. Multi-Tenancy Support
All entities now include:
- `accountIdentifier` - Top-level account (indexed)
- `orgIdentifier` - Organization within account (indexed)
- `projectIdentifier` - Project within organization

Hierarchy: **Account → Organization → Project → Resources**

### Permission Matrix

| Role | Create Incident | Update Incident | Delete Incident | Manage Users | Manage Teams | View Analytics | System Admin |
|------|----------------|-----------------|-----------------|--------------|--------------|----------------|--------------|
| **ADMIN** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **INCIDENT_COMMANDER** | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| **RESPONDER** | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **OBSERVER** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **REPORTER** | ✓ | Limited | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 📋 Implementation Roadmap

### Phase 1: RBAC Infrastructure (You are here)
- [x] SystemRole enum
- [x] Permission enum
- [x] Enhanced User entity with RBAC fields
- [x] Team entity
- [x] Organization entity
- [ ] PermissionEvaluator service
- [ ] TenantContext for request-scoped tenant info
- [ ] RBACInterceptor for automatic authorization
- [ ] @RequiresPermission annotation

### Phase 2: Repositories & Services
- [ ] UserRepository with tenant-aware queries
- [ ] TeamRepository
- [ ] OrganizationRepository
- [ ] UserService (CRUD, role assignment, team management)
- [ ] TeamService (CRUD, member management)
- [ ] OrganizationService (CRUD, settings, quotas)

### Phase 3: Controllers & APIs
- [ ] UserController (REST APIs)
- [ ] TeamController
- [ ] OrganizationController
- [ ] Update IncidentController with RBAC checks

### Phase 4: Advanced Incident Features
- [ ] CustomField entity & service
- [ ] IncidentTemplate entity & service
- [ ] IncidentRelationship entity & service
- [ ] Bulk operations endpoints
- [ ] SLA configuration & tracking
- [ ] Post-mortem generation

### Phase 5: Frontend
- [ ] usePermissions hook
- [ ] useCurrentUser hook
- [ ] PermissionGuard component
- [ ] User management UI
- [ ] Team management UI
- [ ] Organization settings UI

### Phase 6: Testing
- [ ] Unit tests for all services
- [ ] Integration tests for all APIs
- [ ] Frontend component tests
- [ ] E2E tests

---

## 🏗️ Architecture Patterns

### 1. Service Layer Pattern

```java
@Service
public class UserService {
  @Autowired
  private UserRepository userRepository;
  @Autowired
  private PermissionEvaluator permissionEvaluator;
  
  public User createUser(User user, User currentUser) {
    // 1. Check permissions
    if (!permissionEvaluator.hasPermission(currentUser, Permission.CREATE_USER)) {
      throw new UnauthorizedException("No permission to create users");
    }
    
    // 2. Validate tenant isolation
    user.setAccountIdentifier(currentUser.getAccountIdentifier());
    user.setOrgIdentifier(currentUser.getOrgIdentifier());
    
    // 3. Set defaults
    user.setCreatedAt(Instant.now().getEpochSecond());
    user.setCreatedBy(currentUser.getUserId());
    user.setActive(true);
    
    // 4. Save
    return userRepository.save(user);
  }
  
  public List<User> listUsers(String accountId, String orgId) {
    // Always filter by tenant
    return userRepository.findByAccountIdentifierAndOrgIdentifier(accountId, orgId);
  }
}
```

### 2. Controller Layer Pattern

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
  @Autowired
  private UserService userService;
  
  @PostMapping
  public ResponseEntity<User> createUser(
      @RequestBody CreateUserRequest request,
      HttpServletRequest httpRequest) {
    User currentUser = getCurrentUser(httpRequest);
    User user = userService.createUser(request.toUser(), currentUser);
    return ResponseEntity.ok(user);
  }
  
  @GetMapping
  public ResponseEntity<List<User>> listUsers(
      @RequestParam String accountIdentifier,
      @RequestParam(required = false) String orgIdentifier,
      HttpServletRequest httpRequest) {
    User currentUser = getCurrentUser(httpRequest);
    List<User> users = userService.listUsers(accountIdentifier, orgIdentifier);
    return ResponseEntity.ok(users);
  }
}
```

### 3. Repository Layer Pattern

```java
@Repository
public interface UserRepository extends MongoRepository<User, String> {
  
  // Tenant-aware queries
  List<User> findByAccountIdentifierAndOrgIdentifier(String accountId, String orgId);
  
  Optional<User> findByUserIdAndAccountIdentifier(String userId, String accountId);
  
  // Ensure unique constraints are tenant-scoped
  Optional<User> findByEmailAndAccountIdentifier(String email, String accountId);
  
  // Count for quota checking
  long countByAccountIdentifierAndOrgIdentifier(String accountId, String orgId);
}
```

### 4. Permission Checking Pattern

```java
// In service methods
public void deleteIncident(String incidentId, User currentUser) {
  // Check permission
  if (!currentUser.hasPermission(Permission.DELETE_INCIDENT)) {
    throw new UnauthorizedException("No permission to delete incidents");
  }
  
  // ... perform deletion
}

// Multiple permissions (any)
if (!currentUser.hasAnyPermission(Permission.UPDATE_INCIDENT, Permission.DELETE_INCIDENT)) {
  throw new UnauthorizedException("Insufficient permissions");
}

// Multiple permissions (all required)
if (!currentUser.hasAllPermissions(Permission.CREATE_TEAM, Permission.MANAGE_TEAM_MEMBERS)) {
  throw new UnauthorizedException("Missing required permissions");
}
```

### 5. Tenant Isolation Pattern

```java
// ALWAYS filter by tenant in queries
public List<Incident> listIncidents(String accountId, String orgId) {
  Criteria criteria = new Criteria();
  criteria.and("accountIdentifier").is(accountId);
  
  if (orgId != null) {
    criteria.and("orgIdentifier").is(orgId);
  }
  
  Query query = new Query(criteria);
  return mongoTemplate.find(query, Incident.class);
}

// ALWAYS set tenant fields on create
public Incident createIncident(CreateRequest request, User currentUser) {
  Incident incident = new Incident();
  // ... set fields
  
  // Enforce tenant isolation
  incident.setAccountIdentifier(currentUser.getAccountIdentifier());
  incident.setOrgIdentifier(currentUser.getOrgIdentifier());
  incident.setProjectIdentifier(currentUser.getProjectIdentifier());
  
  return incidentRepository.save(incident);
}
```

---

## 🧪 Testing Patterns

### Unit Test Example

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
  
  @Mock
  private UserRepository userRepository;
  
  @Mock
  private PermissionEvaluator permissionEvaluator;
  
  @InjectMocks
  private UserService userService;
  
  @Test
  void createUser_withValidPermission_shouldSucceed() {
    // Arrange
    User currentUser = createAdminUser();
    User newUser = createNewUser();
    
    when(permissionEvaluator.hasPermission(currentUser, Permission.CREATE_USER))
        .thenReturn(true);
    when(userRepository.save(any(User.class))).thenReturn(newUser);
    
    // Act
    User result = userService.createUser(newUser, currentUser);
    
    // Assert
    assertNotNull(result);
    assertEquals(currentUser.getAccountIdentifier(), result.getAccountIdentifier());
    verify(userRepository).save(any(User.class));
  }
  
  @Test
  void createUser_withoutPermission_shouldThrowException() {
    // Arrange
    User currentUser = createObserverUser();
    User newUser = createNewUser();
    
    when(permissionEvaluator.hasPermission(currentUser, Permission.CREATE_USER))
        .thenReturn(false);
    
    // Act & Assert
    assertThrows(UnauthorizedException.class, () -> {
      userService.createUser(newUser, currentUser);
    });
    
    verify(userRepository, never()).save(any(User.class));
  }
  
  @Test
  void listUsers_shouldEnforceTenantIsolation() {
    // Arrange
    String accountId = "account1";
    String orgId = "org1";
    List<User> expectedUsers = Arrays.asList(createUser(), createUser());
    
    when(userRepository.findByAccountIdentifierAndOrgIdentifier(accountId, orgId))
        .thenReturn(expectedUsers);
    
    // Act
    List<User> result = userService.listUsers(accountId, orgId);
    
    // Assert
    assertEquals(2, result.size());
    verify(userRepository).findByAccountIdentifierAndOrgIdentifier(accountId, orgId);
  }
}
```

### Integration Test Example

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class UserControllerIntegrationTest {
  
  @Autowired
  private MockMvc mockMvc;
  
  @Autowired
  private UserRepository userRepository;
  
  @Autowired
  private JWTUtil jwtUtil;
  
  private String adminToken;
  
  @BeforeEach
  void setUp() {
    userRepository.deleteAll();
    User admin = createAdminUser();
    userRepository.save(admin);
    adminToken = jwtUtil.generateToken(admin);
  }
  
  @Test
  void createUser_withValidToken_shouldReturn201() throws Exception {
    CreateUserRequest request = new CreateUserRequest();
    request.setName("New User");
    request.setEmail("newuser@example.com");
    request.setSystemRole(SystemRole.RESPONDER);
    
    mockMvc.perform(post("/api/users")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("New User"))
        .andExpect(jsonPath("$.systemRole").value("RESPONDER"));
  }
  
  @Test
  void listUsers_shouldReturnOnlyTenantUsers() throws Exception {
    // Create users in different tenants
    userRepository.save(createUser("account1", "org1"));
    userRepository.save(createUser("account1", "org1"));
    userRepository.save(createUser("account2", "org2")); // Different tenant
    
    mockMvc.perform(get("/api/users")
        .param("accountIdentifier", "account1")
        .param("orgIdentifier", "org1")
        .header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2)); // Only account1/org1 users
  }
}
```

---

## 🚀 Next Steps to Complete Implementation

### Step 1: Create RBAC Infrastructure (Priority: HIGH)

**File**: `/server/src/main/java/io/respondnow/security/PermissionEvaluator.java`
```java
@Component
public class PermissionEvaluator {
  
  public boolean hasPermission(User user, Permission permission) {
    return user != null && user.hasPermission(permission);
  }
  
  public boolean hasAnyPermission(User user, Permission... permissions) {
    return user != null && user.hasAnyPermission(permissions);
  }
  
  public boolean hasAllPermissions(User user, Permission... permissions) {
    return user != null && user.hasAllPermissions(permissions);
  }
}
```

**File**: `/server/src/main/java/io/respondnow/security/TenantContext.java`
```java
public class TenantContext {
  private static final ThreadLocal<String> currentAccountId = new ThreadLocal<>();
  private static final ThreadLocal<String> currentOrgId = new ThreadLocal<>();
  
  public static void setAccountId(String accountId) {
    currentAccountId.set(accountId);
  }
  
  public static String getAccountId() {
    return currentAccountId.get();
  }
  
  public static void setOrgId(String orgId) {
    currentOrgId.set(orgId);
  }
  
  public static String getOrgId() {
    return currentOrgId.get();
  }
  
  public static void clear() {
    currentAccountId.remove();
    currentOrgId.remove();
  }
}
```

### Step 2: Create Repositories

**File**: `/server/src/main/java/io/respondnow/repository/UserRepository.java`
```java
@Repository
public interface UserRepository extends MongoRepository<User, String> {
  List<User> findByAccountIdentifierAndOrgIdentifier(String accountId, String orgId);
  Optional<User> findByUserIdAndAccountIdentifier(String userId, String accountId);
  Optional<User> findByEmailAndAccountIdentifier(String email, String accountId);
  long countByAccountIdentifierAndOrgIdentifier(String accountId, String orgId);
}
```

**File**: `/server/src/main/java/io/respondnow/repository/TeamRepository.java`
**File**: `/server/src/main/java/io/respondnow/repository/OrganizationRepository.java`

### Step 3: Implement Services
Follow the service pattern shown above for:
- `UserService`
- `TeamService`
- `OrganizationService`

### Step 4: Create Controllers
Follow the controller pattern shown above.

### Step 5: Write Tests
Follow the testing patterns shown above.

### Step 6: Frontend Implementation
Create React hooks and components following similar patterns.

---

## 📚 Additional Resources

- See `IMPLEMENTATION_PLAN.md` for complete file list
- See `ROADMAP.md` for feature roadmap
- Database indexes are defined in entity annotations (@Indexed)
- All tenant queries MUST include accountIdentifier filter
- Admin role bypasses all permission checks
- Permission checks should happen in service layer, not controllers

---

## ⚠️ Important Security Notes

1. **Always validate tenant isolation** - Never trust client-provided tenant IDs
2. **Always check permissions in services** - Controllers are just entry points
3. **Use parameterized queries** - Prevent NoSQL injection
4. **Audit sensitive operations** - Log all permission changes, user creation/deletion
5. **Rate limit APIs** - Prevent abuse
6. **Validate all inputs** - Use @Valid and custom validators
7. **Hash passwords** - Use BCrypt (already implemented)
8. **Rotate JWT tokens** - Implement token refresh mechanism

---

## 🎓 Learning Path

If you're new to this codebase, study in this order:
1. Read the enhanced `User`, `Team`, `Organization` entities
2. Understand `Permission` and `SystemRole` enums
3. Study the permission checking methods in `User` entity
4. Review service pattern examples
5. Review controller pattern examples
6. Review testing pattern examples
7. Implement UserService following the pattern
8. Write tests for UserService
9. Implement UserController
10. Write integration tests
11. Repeat for Team and Organization
12. Move to frontend

**Estimated time to complete all 105 files: 6-8 weeks for one developer**

Good luck! 🚀
