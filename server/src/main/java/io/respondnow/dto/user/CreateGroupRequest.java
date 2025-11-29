package io.respondnow.dto.user;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;

@Data
public class CreateGroupRequest {
    @NotBlank
    private String name;

    private String description;
    private Set<String> userIds = new HashSet<>();
    private Set<String> roleNames = new HashSet<>();
}
