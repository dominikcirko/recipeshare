package hr.algebra.recipeshare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hr.algebra.recipeshare.facade.CreateUserWithRecipesRequest;
import hr.algebra.recipeshare.facade.UserRecipeFacade;
import hr.algebra.recipeshare.facade.UserWithRecipesDto;
import hr.algebra.recipeshare.filters.JwtAuthenticationFilter;
import hr.algebra.recipeshare.mapper.UserMapper;
import hr.algebra.recipeshare.model.LoginRequest;
import hr.algebra.recipeshare.model.LoginResponse;
import hr.algebra.recipeshare.model.UserDto;
import hr.algebra.recipeshare.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRecipeFacade userRecipeFacade;

    @MockitoBean
    private UserMapper userMapper;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private UserDto userDto;
    private LoginRequest loginRequest;
    private LoginResponse loginResponse;
    private UserWithRecipesDto userWithRecipesDto;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Long USER_ID = 1L;
    private static final String USERNAME = "john";
    private static final String EMAIL = "john@example.com";
    private static final String PASSWORD = "password";
    private static final String HASHED_PASSWORD = "hashed";
    private static final String BIO = "Hello!";
    private static final String AVATAR_URL = "avatar.png";
    private static final String TOKEN = "token";

    @BeforeEach
    void setUp() {
        userDto = UserDto.builder()
                .id(USER_ID)
                .username(USERNAME)
                .email(EMAIL)
                .passwordHash(HASHED_PASSWORD)
                .bio(BIO)
                .avatarUrl(AVATAR_URL)
                .build();

        loginRequest = new LoginRequest(EMAIL, PASSWORD);

        loginResponse = new LoginResponse();
        loginResponse.setToken(TOKEN);

        userWithRecipesDto = new UserWithRecipesDto(userDto, Collections.emptyList());
    }

    @Test
    void findById_shouldReturnUser() throws Exception {
        when(userService.findById(USER_ID)).thenReturn(Optional.of(userDto));

        mockMvc.perform(get("/api/users/{id}", USER_ID))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(USER_ID))
                .andExpect(jsonPath("$.username").value(USERNAME))
                .andExpect(jsonPath("$.email").value(EMAIL));
    }

    @Test
    void findById_shouldReturn404_whenNotFound() throws Exception {
        when(userService.findById(USER_ID)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/{id}", USER_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_shouldReturnUpdatedUser() throws Exception {
        when(userService.update(eq(USER_ID), any(UserDto.class))).thenReturn(userDto);

        mockMvc.perform(put("/api/users/{id}", USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(USER_ID))
                .andExpect(jsonPath("$.username").value(USERNAME))
                .andExpect(jsonPath("$.email").value(EMAIL));
    }

    @Test
    void create_shouldReturnCreatedUser() throws Exception {
        when(userService.create(any(UserDto.class))).thenReturn(userDto);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(USER_ID))
                .andExpect(jsonPath("$.username").value(USERNAME));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        doNothing().when(userService).delete(USER_ID);

        mockMvc.perform(delete("/api/users/{id}", USER_ID))
                .andExpect(status().isNoContent());

        verify(userService).delete(USER_ID);
    }

    @Test
    void login_shouldReturnToken() throws Exception {
        when(userService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(TOKEN));
    }

    @Test
    void getWithRecipes_shouldReturnUserWithRecipes() throws Exception {
        when(userRecipeFacade.getUserWithRecipes(USER_ID)).thenReturn(userWithRecipesDto);

        mockMvc.perform(get("/api/users/{id}/with-recipes", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(USER_ID))
                .andExpect(jsonPath("$.username").value(USERNAME))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.recipes").isArray());
    }

    @Test
    void createWithRecipes_shouldReturnUserWithRecipes() throws Exception {
        CreateUserWithRecipesRequest request = new CreateUserWithRecipesRequest();
        request.setUserDto(userDto);
        request.setRecipes(Collections.emptyList());

        when(userRecipeFacade.createUserWithRecipes(any(UserDto.class), anyList()))
                .thenReturn(userWithRecipesDto);

        mockMvc.perform(post("/api/users/with-recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(USER_ID))
                .andExpect(jsonPath("$.username").value(USERNAME))
                .andExpect(jsonPath("$.recipes").isArray());
    }
}
