package io.respondnow.dto.user;

import io.respondnow.model.user.Permission;
import io.respondnow.model.user.SystemRole;
import java.util.Set;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {

  @NotBlank(message = "Name is required")
  private String name;

  @NotBlank(message = "User ID is required")
  private String userId;

  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email format")
  private String email;

  @NotBlank(message = "Password is required")
  private String password;

  private SystemRole systemRole;

  private Set<Permission> permissions;

  private Boolean active;
}
