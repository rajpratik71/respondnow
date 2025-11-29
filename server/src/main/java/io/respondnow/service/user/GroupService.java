package io.respondnow.service.user;

import io.respondnow.dto.user.CreateGroupRequest;
import io.respondnow.dto.user.GroupResponse;
import io.respondnow.model.user.Group;
import io.respondnow.model.user.User;
import io.respondnow.repository.GroupRepository;
import io.respondnow.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    // Constructor injection to avoid cyclic dependency issues
    public GroupService(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    public GroupResponse createGroup(CreateGroupRequest request, String currentUser) {
        if (groupRepository.existsByName(request.getName())) {
            throw new RuntimeException("Group already exists: " + request.getName());
        }

        Group group = new Group(request.getName(), request.getDescription());
        group.setCreatedBy(currentUser);
        group.setUpdatedBy(currentUser);
        
        if (request.getUserIds() != null) {
            group.getUserIds().addAll(request.getUserIds());
        }
        
        if (request.getRoleNames() != null) {
            group.getRoleNames().addAll(request.getRoleNames());
        }

        Group saved = groupRepository.save(group);
        log.info("Created group: {} by user: {}", saved.getName(), currentUser);
        return toResponse(saved);
    }

    public GroupResponse updateGroup(String id, CreateGroupRequest request, String currentUser) {
        Group group = groupRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found: " + id));

        group.setDescription(request.getDescription());
        group.setUpdatedBy(currentUser);
        group.setUpdatedAt(LocalDateTime.now());

        Group updated = groupRepository.save(group);
        log.info("Updated group: {} by user: {}", updated.getName(), currentUser);
        return toResponse(updated);
    }

    public void deleteGroup(String id) {
        groupRepository.deleteById(id);
        log.info("Deleted group: {}", id);
    }

    public GroupResponse getGroupById(String id) {
        Group group = groupRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found: " + id));
        return toResponse(group);
    }

    public List<GroupResponse> getAllGroups() {
        return groupRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public void addMember(String groupId, String userId, String currentUser) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));
        
        // Find user by either MongoDB ID or userId
        User user = userRepository.findById(userId)
            .or(() -> userRepository.findByUserId(userId))
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        // Add user to group's userIds
        group.addMember(user.getUserId());
        group.setUpdatedBy(currentUser);
        groupRepository.save(group);
        
        // Add group to user's groupIds (bidirectional relationship)
        if (user.getGroupIds() == null) {
            user.setGroupIds(new java.util.HashSet<>());
        }
        user.getGroupIds().add(groupId);
        user.setUpdatedAt(System.currentTimeMillis());
        userRepository.save(user);
        
        log.info("Added user {} to group {} by {} (updated both sides)", user.getUserId(), groupId, currentUser);
    }

    public void removeMember(String groupId, String userId, String currentUser) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));
        
        // Find user by either MongoDB ID or userId
        User user = userRepository.findById(userId)
            .or(() -> userRepository.findByUserId(userId))
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        // Remove user from group's userIds
        group.removeMember(user.getUserId());
        group.setUpdatedBy(currentUser);
        groupRepository.save(group);
        
        // Remove group from user's groupIds (bidirectional relationship)
        if (user.getGroupIds() != null) {
            user.getGroupIds().remove(groupId);
            user.setUpdatedAt(System.currentTimeMillis());
            userRepository.save(user);
        }
        
        log.info("Removed user {} from group {} by {} (updated both sides)", user.getUserId(), groupId, currentUser);
    }

    public void assignRole(String groupId, String roleName, String currentUser) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));
        
        group.assignRole(roleName);
        group.setUpdatedBy(currentUser);
        groupRepository.save(group);
        log.info("Assigned role {} to group {} by {}", roleName, groupId, currentUser);
    }

    public List<String> getUserGroups(String userId) {
        return groupRepository.findByUserIdsContaining(userId).stream()
            .map(Group::getName)
            .collect(Collectors.toList());
    }

    public List<Group> getAllGroupsByIds(Iterable<String> groupIds) {
        List<Group> groups = new java.util.ArrayList<>();
        groupRepository.findAllById(groupIds).forEach(groups::add);
        return groups;
    }

    /**
     * Sync existing group memberships - fixes bidirectional relationship
     * for users who were added to groups before the fix.
     * This should be called once after deploying the fix.
     */
    public void syncGroupMemberships() {
        log.info("Starting group membership sync...");
        int syncedCount = 0;
        
        List<Group> allGroups = groupRepository.findAll();
        for (Group group : allGroups) {
            if (group.getUserIds() != null && !group.getUserIds().isEmpty()) {
                for (String userId : group.getUserIds()) {
                    try {
                        User user = userRepository.findByUserId(userId)
                            .orElse(null);
                        
                        if (user != null) {
                            if (user.getGroupIds() == null) {
                                user.setGroupIds(new java.util.HashSet<>());
                            }
                            
                            if (!user.getGroupIds().contains(group.getId())) {
                                user.getGroupIds().add(group.getId());
                                user.setUpdatedAt(System.currentTimeMillis());
                                userRepository.save(user);
                                syncedCount++;
                                log.info("Synced group {} to user {}", group.getName(), user.getUserId());
                            }
                        } else {
                            log.warn("User {} not found in group {}", userId, group.getName());
                        }
                    } catch (Exception e) {
                        log.error("Error syncing user {} in group {}", userId, group.getName(), e);
                    }
                }
            }
        }
        
        log.info("Group membership sync completed. Synced {} user-group relationships", syncedCount);
    }

    private GroupResponse toResponse(Group group) {
        GroupResponse response = new GroupResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setDescription(group.getDescription());
        response.setUserIds(group.getUserIds());
        
        // Populate usernames for UI display
        Set<String> usernames = new java.util.HashSet<>();
        if (group.getUserIds() != null && !group.getUserIds().isEmpty()) {
            for (String userId : group.getUserIds()) {
                userRepository.findByUserId(userId).ifPresent(user -> usernames.add(user.getUserId()));
            }
        }
        response.setUsernames(usernames);
        
        log.debug("Group {} response: userIds={}, usernames={}", group.getName(), group.getUserIds(), usernames);
        
        response.setRoleNames(group.getRoleNames());
        response.setMemberCount(group.getUserIds() != null ? group.getUserIds().size() : 0);
        response.setCreatedAt(group.getCreatedAt());
        response.setUpdatedAt(group.getUpdatedAt());
        return response;
    }
}
