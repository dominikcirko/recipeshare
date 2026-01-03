package hr.algebra.recipeshare.controller;

import hr.algebra.recipeshare.facade.CreateUserWithRecipesRequest;
import hr.algebra.recipeshare.facade.UserRecipeFacade;
import hr.algebra.recipeshare.facade.UserWithRecipesDto;
import hr.algebra.recipeshare.mapper.UserMapper;
import hr.algebra.recipeshare.model.LoginRequest;
import hr.algebra.recipeshare.model.LoginResponse;
import hr.algebra.recipeshare.model.UserDto;
import hr.algebra.recipeshare.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRecipeFacade userRecipeFacade;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserRecipeFacade userRecipeFacade, UserMapper userMapper) {
        this.userService = userService;
        this.userRecipeFacade = userRecipeFacade;
        this.userMapper = userMapper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> findById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> update(@PathVariable Long id, @RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@RequestBody UserDto dto) {
        UserDto savedDto = userService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/with-recipes")
    public UserWithRecipesDto getWithRecipes(@PathVariable Long id) {
        return userRecipeFacade.getUserWithRecipes(id);
    }

    @PostMapping("/with-recipes")
    public UserWithRecipesDto createWithRecipes(@RequestBody CreateUserWithRecipesRequest request) {
        return userRecipeFacade.createUserWithRecipes(request.getUserDto(), request.getRecipes());
    }

}

