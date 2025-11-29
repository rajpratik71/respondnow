package io.respondnow.dto.user;

import io.respondnow.model.user.UserStatus;
import lombok.Data;

import javax.validation.constraints.Email;
import java.util.Set;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;

    @Email
    private String email;

    private UserStatus status;
    private Set<String> roleNames;
    private Set<String> groupIds;
}
