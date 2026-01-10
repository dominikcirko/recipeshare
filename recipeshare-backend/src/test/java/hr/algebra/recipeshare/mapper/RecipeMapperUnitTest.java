package hr.algebra.recipeshare.mapper;

import hr.algebra.recipeshare.dao.RecipeEntity;
import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.model.RecipeDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RecipeMapperUnitTest {

    private RecipeMapper mapper;

    private UserEntity userEntity;

    private static final Long USER_ID = 1L;
    private static final Long DTO_ID_1 = 100L;
    private static final Long ENTITY_ID_1 = 1L;
    private static final Long ENTITY_ID_2 = 2L;
    private static final Long DTO_ID_2 = 200L;

    private static final String USERNAME = "john";
    private static final String USER_EMAIL = "john@example.com";

    private static final String TITLE_PASTA = "Pasta";
    private static final String DESCRIPTION_PASTA = "Delicious pasta";
    private static final String INSTRUCTIONS_PASTA = "Boil water, cook pasta";
    private static final int COOK_TIME_PASTA = 20;
    private static final String INGREDIENTS_PASTA = "Pasta, salt, water";
    private static final int CALORIES_PASTA = 400;
    private static final int PROTEIN_PASTA = 15;
    private static final int FAT_PASTA = 10;
    private static final int CARBS_PASTA = 60;

    private static final String TITLE_SALAD = "Salad";
    private static final String DESCRIPTION_SALAD = "Fresh salad";
    private static final String INSTRUCTIONS_SALAD = "Mix ingredients";
    private static final int COOK_TIME_SALAD = 10;
    private static final String INGREDIENTS_SALAD = "Lettuce, tomato, cucumber";
    private static final int CALORIES_SALAD = 150;
    private static final int PROTEIN_SALAD = 5;
    private static final int FAT_SALAD = 3;
    private static final int CARBS_SALAD = 20;
    private static final int EXPECTED_TWO = 2;

    private static final String TITLE_OLD = "Old title";
    private static final String DESCRIPTION_OLD = "Old desc";
    private static final String INSTRUCTIONS_OLD = "Old instructions";
    private static final int COOK_TIME_OLD = 30;
    private static final String INGREDIENTS_OLD = "Old ingredients";
    private static final int CALORIES_OLD = 300;
    private static final int PROTEIN_OLD = 10;
    private static final int FAT_OLD = 5;
    private static final int CARBS_OLD = 40;
    private static final int FIRST = 0;
    private static final int SECOND = 1;

    private static final String TITLE_NEW = "New title";
    private static final String DESCRIPTION_NEW = "New description";
    private static final String INSTRUCTIONS_NEW = "New instructions";
    private static final int COOK_TIME_NEW = 25;
    private static final String INGREDIENTS_NEW = "New ingredients";
    private static final int CALORIES_NEW = 350;
    private static final int PROTEIN_NEW = 12;
    private static final int FAT_NEW = 6;
    private static final int CARBS_NEW = 45;

    private static final String TITLE_R1 = "R1";
    private static final String TITLE_R2 = "R2";
    private static final String INSTRUCTIONS_R1 = "I1";
    private static final String INSTRUCTIONS_R2 = "I2";
    private static final String INGREDIENTS_R1 = "Ing1";
    private static final String INGREDIENTS_R2 = "Ing2";

    @BeforeEach
    void setUp() {
        mapper = Mappers.getMapper(RecipeMapper.class);

        userEntity = UserEntity.builder()
                .id(USER_ID)
                .username(USERNAME)
                .email(USER_EMAIL)
                .build();
    }

    @Test
    void dtoToEntity_shouldMapFields() {
        RecipeDto dto = RecipeDto.builder()
                .id(DTO_ID_1)
                .title(TITLE_PASTA)
                .description(DESCRIPTION_PASTA)
                .instructions(INSTRUCTIONS_PASTA)
                .cookTimeMinutes(COOK_TIME_PASTA)
                .ingredients(INGREDIENTS_PASTA)
                .calories(CALORIES_PASTA)
                .protein(PROTEIN_PASTA)
                .fat(FAT_PASTA)
                .carbs(CARBS_PASTA)
                .build();

        RecipeEntity entity = mapper.dtoToEntity(dto);

        assertNotNull(entity);
        assertEquals(dto.getId(), entity.getId());
        assertEquals(dto.getTitle(), entity.getTitle());
        assertEquals(dto.getDescription(), entity.getDescription());
        assertEquals(dto.getInstructions(), entity.getInstructions());
        assertEquals(dto.getCookTimeMinutes(), entity.getCookTimeMinutes());
        assertEquals(dto.getIngredients(), entity.getIngredients());
        assertEquals(dto.getCalories(), entity.getCalories());
        assertEquals(dto.getProtein(), entity.getProtein());
        assertEquals(dto.getFat(), entity.getFat());
        assertEquals(dto.getCarbs(), entity.getCarbs());
        assertNull(entity.getUser());
    }

    @Test
    void toDto_shouldMapFieldsIncludingUserId() {
        RecipeEntity entity = RecipeEntity.builder()
                .id(DTO_ID_2)
                .user(userEntity)
                .title(TITLE_SALAD)
                .description(DESCRIPTION_SALAD)
                .instructions(INSTRUCTIONS_SALAD)
                .cookTimeMinutes(COOK_TIME_SALAD)
                .ingredients(INGREDIENTS_SALAD)
                .calories(CALORIES_SALAD)
                .protein(PROTEIN_SALAD)
                .fat(FAT_SALAD)
                .carbs(CARBS_SALAD)
                .build();

        RecipeDto dto = mapper.toDto(entity);

        assertNotNull(dto);
        assertEquals(entity.getId(), dto.getId());
        assertEquals(entity.getUser().getId(), dto.getUserId());
        assertEquals(entity.getTitle(), dto.getTitle());
        assertEquals(entity.getDescription(), dto.getDescription());
        assertEquals(entity.getInstructions(), dto.getInstructions());
        assertEquals(entity.getCookTimeMinutes(), dto.getCookTimeMinutes());
        assertEquals(entity.getIngredients(), dto.getIngredients());
        assertEquals(entity.getCalories(), dto.getCalories());
        assertEquals(entity.getProtein(), dto.getProtein());
        assertEquals(entity.getFat(), dto.getFat());
        assertEquals(entity.getCarbs(), dto.getCarbs());
    }

    @Test
    void updateEntityFromDto_shouldUpdateFieldsWithoutChangingUser() {
        RecipeEntity entity = RecipeEntity.builder()
                .id(ENTITY_ID_1)
                .user(userEntity)
                .title(TITLE_OLD)
                .description(DESCRIPTION_OLD)
                .instructions(INSTRUCTIONS_OLD)
                .cookTimeMinutes(COOK_TIME_OLD)
                .ingredients(INGREDIENTS_OLD)
                .calories(CALORIES_OLD)
                .protein(PROTEIN_OLD)
                .fat(FAT_OLD)
                .carbs(CARBS_OLD)
                .build();

        RecipeDto dto = RecipeDto.builder()
                .title(TITLE_NEW)
                .description(DESCRIPTION_NEW)
                .instructions(INSTRUCTIONS_NEW)
                .cookTimeMinutes(COOK_TIME_NEW)
                .ingredients(INGREDIENTS_NEW)
                .calories(CALORIES_NEW)
                .protein(PROTEIN_NEW)
                .fat(FAT_NEW)
                .carbs(CARBS_NEW)
                .build();

        mapper.updateEntityFromDto(dto, entity);

        assertEquals(TITLE_NEW, entity.getTitle());
        assertEquals(DESCRIPTION_NEW, entity.getDescription());
        assertEquals(INSTRUCTIONS_NEW, entity.getInstructions());
        assertEquals(COOK_TIME_NEW, entity.getCookTimeMinutes());
        assertEquals(INGREDIENTS_NEW, entity.getIngredients());
        assertEquals(CALORIES_NEW, entity.getCalories());
        assertEquals(PROTEIN_NEW, entity.getProtein());
        assertEquals(FAT_NEW, entity.getFat());
        assertEquals(CARBS_NEW, entity.getCarbs());
        assertEquals(userEntity, entity.getUser());
    }

    @Test
    void toDtoList_shouldMapAllEntities() {
        RecipeEntity entity1 = RecipeEntity.builder()
                .id(ENTITY_ID_1)
                .user(userEntity)
                .title(TITLE_R1)
                .instructions(INSTRUCTIONS_R1)
                .ingredients(INGREDIENTS_R1)
                .build();
        RecipeEntity entity2 = RecipeEntity.builder()
                .id(ENTITY_ID_2)
                .user(userEntity)
                .title(TITLE_R2)
                .instructions(INSTRUCTIONS_R2)
                .ingredients(INGREDIENTS_R2)
                .build();

        List<RecipeDto> dtoList = mapper.toDtoList(List.of(entity1, entity2));

        assertNotNull(dtoList);
        assertEquals(EXPECTED_TWO, dtoList.size());
        assertEquals(ENTITY_ID_1, dtoList.get(FIRST).getId());
        assertEquals(ENTITY_ID_2, dtoList.get(SECOND).getId());
        assertEquals(USER_ID, dtoList.get(FIRST).getUserId());
        assertEquals(USER_ID, dtoList.get(SECOND).getUserId());
    }
}
