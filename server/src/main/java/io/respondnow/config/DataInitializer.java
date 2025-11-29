package io.respondnow.config;

import io.respondnow.model.user.User;
import io.respondnow.model.user.UserStatus;
import io.respondnow.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Initializes the database with default users for each role.
 * Runs automatically on application startup.
 */
@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Starting database initialization...");
        
        createDefaultUsers();
        
        log.info("Database initialization completed!");
    }

    private void createDefaultUsers() {
        // Create System Admin
        createUserIfNotExists(
            "admin",
            "admin@respondnow.io",
            "admin@respondnow",
            "System",
            "Administrator",
            new HashSet<>(Arrays.asList("SYSTEM_ADMIN", "ADMIN"))
        );

        // Create Manager
        createUserIfNotExists(
            "manager",
            "manager@respondnow.io",
            "manager@respondnow",
            "Incident",
            "Manager",
            new HashSet<>(Arrays.asList("MANAGER"))
        );

        // Create Responder
        createUserIfNotExists(
            "responder",
            "responder@respondnow.io",
            "responder@respondnow",
            "Incident",
            "Responder",
            new HashSet<>(Arrays.asList("RESPONDER"))
        );

        // Create Viewer
        createUserIfNotExists(
            "viewer",
            "viewer@respondnow.io",
            "viewer@respondnow",
            "Read Only",
            "Viewer",
            new HashSet<>(Arrays.asList("VIEWER"))
        );
    }

    private void createUserIfNotExists(
            String username,
            String email,
            String password,
            String firstName,
            String lastName,
            Set<String> roleNames
    ) {
        if (userRepository.existsByEmail(email)) {
            log.info("User already exists: {} ({})", username, email);
            return;
        }

        User user = new User();
        user.setUserId(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(firstName + " " + lastName);
        user.setActive(true);
        user.setChangePasswordRequired(false);
        user.setStatus(UserStatus.ACTIVE);
        user.setRoleNames(roleNames);
        user.setGroupIds(new HashSet<>());
        user.setCreatedAt(System.currentTimeMillis());
        user.setUpdatedAt(System.currentTimeMillis());

        userRepository.save(user);
        log.info("✅ Created default user: {} ({}) with roles: {}", username, email, roleNames);
    }
}
