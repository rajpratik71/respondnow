package io.respondnow.dto.user;

import io.respondnow.model.user.Permission;
import io.respondnow.model.user.SystemRole;
import java.util.List;
import java.util.Set;
import javax.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

  private String name;

  @Email(message = "Invalid email format")
  private String email;

  private SystemRole systemRole;

  private Set<Permission> permissions;

  private List<String> teamIds;

  private Boolean active;
}
