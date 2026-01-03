package hr.algebra.recipeshare.facade;

import hr.algebra.recipeshare.model.RecipeDto;
import hr.algebra.recipeshare.model.UserDto;
import hr.algebra.recipeshare.service.RecipeService;
import hr.algebra.recipeshare.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserRecipeFacade {

    private final UserService userService;
    private final RecipeService recipeService;

    public UserRecipeFacade(UserService userService, RecipeService recipeService) {
        this.userService = userService;
        this.recipeService = recipeService;
    }

    @Transactional
    public UserWithRecipesDto createUserWithRecipes(UserDto userDto, List<RecipeDto> recipes) {
        UserDto savedUser = userService.create(userDto);

        List<RecipeDto> savedRecipes = recipes.stream()
                .map(r -> {
                    r.setUserId(savedUser.getId());
                    return recipeService.create(r);
                }).toList();

        return new UserWithRecipesDto(savedUser, savedRecipes);
    }

    public UserWithRecipesDto getUserWithRecipes(Long userId) {
        UserDto user = userService.findById(userId).orElseThrow();
        List<RecipeDto> recipes = recipeService.getAllByUserId(userId);
        return new UserWithRecipesDto(user, recipes);
    }

}
