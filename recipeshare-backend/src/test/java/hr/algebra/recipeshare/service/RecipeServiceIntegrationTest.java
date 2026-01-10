package hr.algebra.recipeshare.service;

import hr.algebra.recipeshare.dao.RecipeEntity;
import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.dao.repository.RecipeJpaRepository;
import hr.algebra.recipeshare.dao.repository.UserJpaRepository;
import hr.algebra.recipeshare.model.RecipeDto;
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
class RecipeServiceIntegrationTest {

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private RecipeJpaRepository recipeJpaRepository;

    private static final String USERNAME_JOHN = "john_doe";
    private static final String EMAIL_JOHN = "john@test.com";
    private static final String PASSWORD_HASHED = "hashed-password";
    private static final String BIO_JOHN = "Bio";
    private static final String AVATAR_JOHN = "avatar.png";

    private static final String RECIPE1_TITLE = "Pasta";
    private static final String RECIPE1_DESC = "Nice pasta";
    private static final String RECIPE1_INSTRUCTIONS = "Cook it";
    private static final String RECIPE1_INGREDIENTS = "Pasta, Salt";
    private static final int RECIPE1_COOK_TIME = 10;
    private static final int RECIPE1_CALORIES = 500;
    private static final int RECIPE1_PROTEIN = 20;
    private static final int RECIPE1_FAT = 10;
    private static final int RECIPE1_CARBS = 80;
    private static final int EXPECTED_TWO = 2;

    private static final String RECIPE2_TITLE = "Soup";
    private static final String RECIPE2_INSTRUCTIONS2 = "Boil";
    private static final String RECIPE2_INGREDIENTS2 = "Water";

    private static final String OLD_TITLE = "Old title";
    private static final String OLD_INSTRUCTIONS = "Old instructions";
    private static final String OLD_INGREDIENTS = "Old ingredients";

    private static final String NEW_TITLE = "New title";
    private static final String NEW_INSTRUCTIONS = "New instructions";
    private static final String NEW_INGREDIENTS = "New ingredients";

    private static final String DELETE_TITLE = "To delete";
    private static final String RECIPE_X = "x";

    private static final String RECIPE3_TITLE = "Recipe 1";
    private static final String RECIPE4_TITLE = "Recipe 2";

    private UserEntity user;

    @BeforeEach
    void setup() {
        user = userJpaRepository.save(
                UserEntity.builder()
                        .username(USERNAME_JOHN)
                        .email(EMAIL_JOHN)
                        .passwordHash(PASSWORD_HASHED)
                        .bio(BIO_JOHN)
                        .avatarUrl(AVATAR_JOHN)
                        .build()
        );
    }

    @Test
    void create_shouldCreateRecipe() {
        RecipeDto dto = RecipeDto.builder()
                .userId(user.getId())
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

        RecipeDto saved = recipeService.create(dto);

        assertNotNull(saved.getId());

        RecipeEntity entity = recipeJpaRepository.findById(saved.getId()).orElseThrow();
        assertEquals(RECIPE1_TITLE, entity.getTitle());
        assertEquals(user.getId(), entity.getUser().getId());
        assertNull(entity.getDeletedAt());
    }

    @Test
    void findById_shouldFindById() {
        RecipeEntity entity = recipeJpaRepository.save(
                RecipeEntity.builder()
                        .user(user)
                        .title(RECIPE2_TITLE)
                        .instructions(RECIPE2_INSTRUCTIONS2)
                        .ingredients(RECIPE2_INGREDIENTS2)
                        .build()
        );

        RecipeDto dto = recipeService.findById(entity.getId()).orElseThrow();

        assertEquals(RECIPE2_TITLE, dto.getTitle());
        assertEquals(user.getId(), dto.getUserId());
    }

    @Test
    void update_shouldUpdateRecipe() {
        RecipeEntity entity = recipeJpaRepository.save(
                RecipeEntity.builder()
                        .user(user)
                        .title(OLD_TITLE)
                        .instructions(OLD_INSTRUCTIONS)
                        .ingredients(OLD_INGREDIENTS)
                        .build()
        );

        RecipeDto update = RecipeDto.builder()
                .userId(user.getId())
                .title(NEW_TITLE)
                .instructions(NEW_INSTRUCTIONS)
                .ingredients(NEW_INGREDIENTS)
                .build();

        RecipeDto updated = recipeService.update(entity.getId(), update);

        assertEquals(NEW_TITLE, updated.getTitle());

        RecipeEntity persisted = recipeJpaRepository.findById(entity.getId()).orElseThrow();
        assertEquals(NEW_INSTRUCTIONS, persisted.getInstructions());
    }

    @Test
    void delete_shouldSoftDeleteRecipe() {
        RecipeEntity entity = recipeJpaRepository.save(
                RecipeEntity.builder()
                        .user(user)
                        .title(DELETE_TITLE)
                        .instructions(RECIPE_X)
                        .ingredients(RECIPE_X)
                        .build()
        );

        recipeService.delete(entity.getId());

        RecipeEntity deleted = recipeJpaRepository.findById(entity.getId()).orElseThrow();
        assertNotNull(deleted.getDeletedAt());
    }

    @Test
    void getAllByUserId_shouldGetAllRecipesByUserId() {
        recipeJpaRepository.save(
                RecipeEntity.builder()
                        .user(user)
                        .title(RECIPE3_TITLE)
                        .instructions(RECIPE_X)
                        .ingredients(RECIPE_X)
                        .build()
        );

        recipeJpaRepository.save(
                RecipeEntity.builder()
                        .user(user)
                        .title(RECIPE4_TITLE)
                        .instructions(RECIPE_X)
                        .ingredients(RECIPE_X)
                        .build()
        );

        List<RecipeDto> recipes = recipeService.getAllByUserId(user.getId());

        assertEquals(EXPECTED_TWO, recipes.size());
        assertTrue(recipes.stream().allMatch(r -> r.getUserId().equals(user.getId())));
    }
}
