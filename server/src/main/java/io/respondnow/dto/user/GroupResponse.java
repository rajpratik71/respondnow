package io.respondnow.dto.user;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class GroupResponse {
    private String id;
    private String name;
    private String description;
    private Set<String> userIds;
    private Set<String> usernames; // Human-readable usernames for UI
    private Set<String> roleNames;
    private Integer memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
