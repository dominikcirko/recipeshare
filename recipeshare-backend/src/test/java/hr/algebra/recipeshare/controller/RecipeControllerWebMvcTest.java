package hr.algebra.recipeshare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hr.algebra.recipeshare.mapper.RecipeMapper;
import hr.algebra.recipeshare.model.RecipeDto;
import hr.algebra.recipeshare.service.JwtService;
import hr.algebra.recipeshare.service.RecipeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RecipeController.class)
class RecipeControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RecipeService recipeService;

    @MockitoBean
    private RecipeMapper recipeMapper;

    @MockitoBean
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private RecipeDto recipeDto;

    private static final Long RECIPE_ID = 1L;
    private static final Long USER_ID = 10L;
    private static final String TITLE = "Pasta";
    private static final String DESCRIPTION = "Pasta";
    private static final String INGREDIENTS = "ingredients";
    private static final int FAT = 1;
    private static final int PROTEIN = 2;
    private static final int CARBS = 2;
    private static final int CALORIES = 200;
    private static final int COOK_TIME_MINUTES = 10;

    @BeforeEach
    void setUp() {
        recipeDto = RecipeDto.builder()
                .id(RECIPE_ID)
                .title(TITLE)
                .description(DESCRIPTION)
                .fat(FAT)
                .carbs(CARBS)
                .ingredients(INGREDIENTS)
                .protein(PROTEIN)
                .calories(CALORIES)
                .cookTimeMinutes(COOK_TIME_MINUTES)
                .userId(USER_ID)
                .build();
    }

    @Test
    void getAllByUserId_shouldReturnRecipes() throws Exception {
        when(recipeService.getAllByUserId(USER_ID))
                .thenReturn(List.of(recipeDto));

        mockMvc.perform(get("/api/recipe/users/{id}", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(RECIPE_ID))
                .andExpect(jsonPath("$[0].title").value(TITLE));
    }

    @Test
    void getAllByUserId_shouldReturn404_whenEmpty() throws Exception {
        when(recipeService.getAllByUserId(USER_ID))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/recipe/users/{id}", USER_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void findById_shouldReturnRecipe() throws Exception {
        when(recipeService.findById(RECIPE_ID))
                .thenReturn(Optional.of(recipeDto));

        mockMvc.perform(get("/api/recipe/{id}", RECIPE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(RECIPE_ID))
                .andExpect(jsonPath("$.title").value(TITLE));
    }

    @Test
    void findById_shouldReturn404_whenNotFound() throws Exception {
        when(recipeService.findById(RECIPE_ID))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/recipe/{id}", RECIPE_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_shouldReturnUpdatedRecipe() throws Exception {
        when(recipeService.update(eq(RECIPE_ID), any(RecipeDto.class)))
                .thenReturn(recipeDto);

        mockMvc.perform(put("/api/recipe/{id}", RECIPE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recipeDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(RECIPE_ID))
                .andExpect(jsonPath("$.title").value(TITLE));
    }

    @Test
    void create_shouldReturnCreatedRecipe() throws Exception {
        when(recipeService.create(any(RecipeDto.class)))
                .thenReturn(recipeDto);

        mockMvc.perform(post("/api/recipe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recipeDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(RECIPE_ID))
                .andExpect(jsonPath("$.title").value(TITLE));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        doNothing().when(recipeService).delete(RECIPE_ID);

        mockMvc.perform(delete("/api/recipe/{id}", RECIPE_ID))
                .andExpect(status().isNoContent());

        verify(recipeService).delete(RECIPE_ID);
    }
}
