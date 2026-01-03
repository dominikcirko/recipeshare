package hr.algebra.recipeshare.facade;

import hr.algebra.recipeshare.model.RecipeDto;
import hr.algebra.recipeshare.model.UserDto;
import lombok.Data;

import java.util.List;

@Data
public class UserWithRecipesDto {

    private Long userId;
    private String username;
    private String email;

    private List<RecipeDto> recipes;

    public UserWithRecipesDto(UserDto user, List<RecipeDto> recipes) {
        this.userId = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.recipes = recipes;
    }

}
