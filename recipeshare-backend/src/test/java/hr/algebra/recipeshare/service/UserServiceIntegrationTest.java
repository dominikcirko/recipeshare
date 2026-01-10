package hr.algebra.recipeshare.service;

import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.dao.repository.UserJpaRepository;
import hr.algebra.recipeshare.model.LoginRequest;
import hr.algebra.recipeshare.model.UserDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private static final String USERNAME_JOHN = "john_doe";
    private static final String EMAIL_JOHN = "john@test.com";
    private static final String PASSWORD_JOHN = "password123";
    private static final String BIO_JOHN = "Test bio";
    private static final String AVATAR_JOHN = "avatar.png";

    private static final String USERNAME_ALICE = "alice";
    private static final String EMAIL_ALICE = "alice@test.com";
    private static final String PASSWORD_ALICE = "secret";
    private static final String BIO_ALICE = "Bio";
    private static final String AVATAR_ALICE = "avatar.png";

    private static final String USERNAME_BOB = "bob";
    private static final String EMAIL_BOB = "bob@test.com";
    private static final String PASSWORD_BOB_OLD = "oldpass";
    private static final String USERNAME_BOB_NEW = "bob_new";
    private static final String EMAIL_BOB_NEW = "bob_new@test.com";
    private static final String BIO_BOB_NEW = "Updated bio";
    private static final String AVATAR_BOB_NEW = "new_avatar.png";

    private static final String USERNAME_CHARLIE = "charlie";
    private static final String EMAIL_CHARLIE = "charlie@test.com";
    private static final String PASSWORD_CHARLIE = "pass";

    private static final String USERNAME_LOGIN = "login_user";
    private static final String EMAIL_LOGIN = "login@test.com";
    private static final String PASSWORD_LOGIN = "mypassword";

    private static final String USERNAME_LOGIN_FAIL = "login_fail";
    private static final String EMAIL_LOGIN_FAIL = "fail@test.com";
    private static final String PASSWORD_LOGIN_CORRECT = "correct";
    private static final String PASSWORD_LOGIN_WRONG = "wrongpass";

    private static final String INVALID_EMAIL = "notfound@test.com";
    private static final String INVALID_PASSWORD = "pass";

    private UserDto userDto;

    @BeforeEach
    void setup() {
        userDto = UserDto.builder()
                .username(USERNAME_JOHN)
                .email(EMAIL_JOHN)
                .passwordHash(PASSWORD_JOHN)
                .bio(BIO_JOHN)
                .avatarUrl(AVATAR_JOHN)
                .build();
    }

    @Test
    void create_shouldCreateUserWithHashedPassword() {
        UserDto saved = userService.create(userDto);

        assertNotNull(saved.getId());

        UserEntity entity = userJpaRepository.findById(saved.getId()).orElseThrow();
        assertEquals(USERNAME_JOHN, entity.getUsername());
        assertEquals(EMAIL_JOHN, entity.getEmail());
        assertTrue(passwordEncoder.matches(PASSWORD_JOHN, entity.getPasswordHash()));
        assertNull(entity.getDeletedAt());
    }

    @Test
    void findById_shouldReturnUser() {
        UserEntity entity = userJpaRepository.save(
                UserEntity.builder()
                        .username(USERNAME_ALICE)
                        .email(EMAIL_ALICE)
                        .passwordHash(passwordEncoder.encode(PASSWORD_ALICE))
                        .bio(BIO_ALICE)
                        .avatarUrl(AVATAR_ALICE)
                        .build()
        );

        UserDto dto = userService.findById(entity.getId()).orElseThrow();
        assertEquals(USERNAME_ALICE, dto.getUsername());
        assertEquals(EMAIL_ALICE, dto.getEmail());
    }

    @Test
    void update_shouldModifyUser() {
        UserEntity entity = userJpaRepository.save(
                UserEntity.builder()
                        .username(USERNAME_BOB)
                        .email(EMAIL_BOB)
                        .passwordHash(passwordEncoder.encode(PASSWORD_BOB_OLD))
                        .build()
        );

        UserDto update = UserDto.builder()
                .username(USERNAME_BOB_NEW)
                .email(EMAIL_BOB_NEW)
                .bio(BIO_BOB_NEW)
                .avatarUrl(AVATAR_BOB_NEW)
                .build();

        UserDto updated = userService.update(entity.getId(), update);

        assertEquals(USERNAME_BOB_NEW, updated.getUsername());

        UserEntity persisted = userJpaRepository.findById(entity.getId()).orElseThrow();
        assertEquals(EMAIL_BOB_NEW, persisted.getEmail());
        assertEquals(BIO_BOB_NEW, persisted.getBio());
        assertEquals(AVATAR_BOB_NEW, persisted.getAvatarUrl());
    }

    @Test
    void delete_shouldSoftDeleteUser() {
        UserEntity entity = userJpaRepository.save(
                UserEntity.builder()
                        .username(USERNAME_CHARLIE)
                        .email(EMAIL_CHARLIE)
                        .passwordHash(passwordEncoder.encode(PASSWORD_CHARLIE))
                        .build()
        );

        userService.delete(entity.getId());

        UserEntity deleted = userJpaRepository.findById(entity.getId()).orElseThrow();
        assertNotNull(deleted.getDeletedAt());
    }

    @Test
    void login_shouldReturnValidToken() {
        UserEntity entity = userJpaRepository.save(
                UserEntity.builder()
                        .username(USERNAME_LOGIN)
                        .email(EMAIL_LOGIN)
                        .passwordHash(passwordEncoder.encode(PASSWORD_LOGIN))
                        .build()
        );

        LoginRequest request = new LoginRequest(EMAIL_LOGIN, PASSWORD_LOGIN);
        var response = userService.login(request);

        assertEquals(entity.getId(), response.getUserId());
        assertEquals(USERNAME_LOGIN, response.getUsername());
        assertEquals(EMAIL_LOGIN, response.getEmail());
        assertTrue(jwtService.validateToken(response.getToken()));
        assertEquals(USERNAME_LOGIN, jwtService.getUsernameFromToken(response.getToken()));
    }

    @Test
    void login_shouldFailWithInvalidEmail() {
        LoginRequest request = new LoginRequest(INVALID_EMAIL, INVALID_PASSWORD);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test
    void login_shouldFailWithInvalidPassword() {
        UserEntity entity = userJpaRepository.save(
                UserEntity.builder()
                        .username(USERNAME_LOGIN_FAIL)
                        .email(EMAIL_LOGIN_FAIL)
                        .passwordHash(passwordEncoder.encode(PASSWORD_LOGIN_CORRECT))
                        .build()
        );

        LoginRequest request = new LoginRequest(EMAIL_LOGIN_FAIL, PASSWORD_LOGIN_WRONG);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("Invalid credentials", ex.getMessage());
    }
}
