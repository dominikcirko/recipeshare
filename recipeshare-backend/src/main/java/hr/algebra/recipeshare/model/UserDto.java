package hr.algebra.recipeshare.model;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    @Setter(AccessLevel.NONE)
    private Long id;
    private String username;
    private String email;
    private String passwordHash;
    private String bio;
    private String avatarUrl;
}
