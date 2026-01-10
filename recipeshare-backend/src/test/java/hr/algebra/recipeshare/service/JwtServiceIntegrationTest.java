package hr.algebra.recipeshare.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class JwtServiceIntegrationTest {

    @Autowired
    private JwtService jwtService;

    private static final String USERNAME = "testuser";
    private static final long EXPIRATION_MS = 1000L;
    private static final long SLEEP_AFTER_EXPIRATION_MS = 1500L;
    private static final String TOKEN_TAMPER_SUFFIX = "abc";

    private String username;

    @BeforeEach
    void setup() {
        username = USERNAME;
    }

    @Test
    void generateToken_shouldReturnNonNullToken() {
        String token = jwtService.generateToken(username);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void getUsernameFromToken_shouldReturnCorrectUsername() {
        String token = jwtService.generateToken(username);
        String extracted = jwtService.getUsernameFromToken(token);
        assertEquals(username, extracted);
    }

    @Test
    void validateToken_shouldReturnTrueForValidToken() {
        String token = jwtService.generateToken(username);
        assertTrue(jwtService.validateToken(token));
    }

    @Test
    void validateToken_shouldReturnFalseForTamperedToken() {
        String token = jwtService.generateToken(username);
        String tampered = token + TOKEN_TAMPER_SUFFIX;
        assertFalse(jwtService.validateToken(tampered));
    }

    @Test
    void generateToken_andValidate_shouldExpireCorrectly() throws InterruptedException {
        ReflectionTestUtils.setField(jwtService, "expiration", EXPIRATION_MS);

        String token = jwtService.generateToken(username);
        assertTrue(jwtService.validateToken(token));

        Thread.sleep(SLEEP_AFTER_EXPIRATION_MS);

        assertFalse(jwtService.validateToken(token));
    }
}
