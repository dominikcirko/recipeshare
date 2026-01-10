package hr.algebra.recipeshare.service;

import hr.algebra.recipeshare.facade.CreateUserWithRecipesRequest;
import hr.algebra.recipeshare.facade.UserRecipeFacade;
import hr.algebra.recipeshare.facade.UserWithRecipesDto;
import hr.algebra.recipeshare.model.RecipeDto;
import hr.algebra.recipeshare.model.UserDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserRecipeFacadeIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private UserRecipeFacade userRecipeFacade;

    private static final String USERNAME_JOHN = "john_doe";
    private static final String EMAIL_JOHN = "john@example.com";
    private static final String PASSWORD_JOHN = "password";
    private static final String BIO_JOHN = "Bio for John";
    private static final String AVATAR_JOHN = "http://example.com/avatar.png";

    private static final String RECIPE1_TITLE = "Pancakes";
    private static final String RECIPE1_DESC = "Fluffy pancakes";
    private static final String RECIPE1_INSTRUCTIONS = "Mix and cook";
    private static final String RECIPE1_INGREDIENTS = "Flour, Milk, Eggs";
    private static final int RECIPE1_COOK_TIME = 10;
    private static final int RECIPE1_CALORIES = 300;
    private static final int RECIPE1_PROTEIN = 10;
    private static final int RECIPE1_FAT = 5;
    private static final int RECIPE1_CARBS = 50;

    private static final String RECIPE2_TITLE = "Omelette";
    private static final String RECIPE2_DESC = "Cheese omelette";
    private static final String RECIPE2_INSTRUCTIONS = "Mix eggs and cook";
    private static final String RECIPE2_INGREDIENTS = "Eggs, Cheese";
    private static final int RECIPE2_COOK_TIME = 5;
    private static final int RECIPE2_CALORIES = 200;
    private static final int RECIPE2_PROTEIN = 15;
    private static final int RECIPE2_FAT = 10;
    private static final int RECIPE2_CARBS = 2;
    private static final int EXPECTED_TWO = 2;

    private UserDto testUser;
    private RecipeDto testRecipe1;
    private RecipeDto testRecipe2;

    @BeforeEach
    void setup() {
        testUser = UserDto.builder()
                .username(USERNAME_JOHN)
                .email(EMAIL_JOHN)
                .passwordHash(PASSWORD_JOHN)
                .bio(BIO_JOHN)
                .avatarUrl(AVATAR_JOHN)
                .build();

        testRecipe1 = RecipeDto.builder()
                .title(RECIPE1_TITLE)
                .description(RECIPE1_DESC)
                .instructions(RECIPE1_INSTRUCTIONS)
                .ingredients(RECIPE1_INGREDIENTS)
                .cookTimeMinutes(RECIPE1_COOK_TIME)
                .calories(RECIPE1_CALORIES)
                .protein(RECIPE1_PROTEIN)
                .fat(RECIPE1_FAT)
                .carbs(RECIPE1_CARBS)
                .build();

        testRecipe2 = RecipeDto.builder()
                .title(RECIPE2_TITLE)
                .description(RECIPE2_DESC)
                .instructions(RECIPE2_INSTRUCTIONS)
                .ingredients(RECIPE2_INGREDIENTS)
                .cookTimeMinutes(RECIPE2_COOK_TIME)
                .calories(RECIPE2_CALORIES)
                .protein(RECIPE2_PROTEIN)
                .fat(RECIPE2_FAT)
                .carbs(RECIPE2_CARBS)
                .build();
    }

    @Test
    void createUserWithRecipes_shouldSaveUserAndRecipes() {
        CreateUserWithRecipesRequest request = new CreateUserWithRecipesRequest(testUser, List.of(testRecipe1, testRecipe2));

        UserWithRecipesDto result = userRecipeFacade.createUserWithRecipes(request.getUserDto(), request.getRecipes());

        assertNotNull(result);
        assertNotNull(result.getUserId());
        assertEquals(USERNAME_JOHN, result.getUsername());
        assertEquals(EMAIL_JOHN, result.getEmail());
        assertEquals(EXPECTED_TWO, result.getRecipes().size());
        result.getRecipes().forEach(r -> assertEquals(result.getUserId(), r.getUserId()));
        assertTrue(userService.findById(result.getUserId()).isPresent());
        assertEquals(EXPECTED_TWO, recipeService.getAllByUserId(result.getUserId()).size());
    }

    @Test
    void getUserWithRecipes_shouldReturnUserAndTheirRecipes() {
        CreateUserWithRecipesRequest request = new CreateUserWithRecipesRequest(testUser, List.of(testRecipe1, testRecipe2));
        UserWithRecipesDto created = userRecipeFacade.createUserWithRecipes(request.getUserDto(), request.getRecipes());

        UserWithRecipesDto fetched = userRecipeFacade.getUserWithRecipes(created.getUserId());

        assertNotNull(fetched);
        assertEquals(created.getUserId(), fetched.getUserId());
        assertEquals(EXPECTED_TWO, fetched.getRecipes().size());
        List<String> titles = fetched.getRecipes().stream().map(r -> r.getTitle()).toList();
        assertTrue(titles.contains(RECIPE1_TITLE));
        assertTrue(titles.contains(RECIPE2_TITLE));
    }
}
