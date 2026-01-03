package hr.algebra.recipeshare.facade;

import hr.algebra.recipeshare.model.RecipeDto;
import hr.algebra.recipeshare.model.UserDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserWithRecipesRequest {
    private UserDto userDto;
    private List<RecipeDto> recipes;
}
