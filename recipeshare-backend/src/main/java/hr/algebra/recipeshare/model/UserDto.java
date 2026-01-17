package hr.algebra.recipeshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    @JsonIgnore
    private String passwordHash;
    private String bio;
    private String avatarUrl;
}
