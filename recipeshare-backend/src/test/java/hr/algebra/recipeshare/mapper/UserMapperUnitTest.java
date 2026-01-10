package hr.algebra.recipeshare.mapper;

import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.model.UserDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperUnitTest {

    private UserMapper mapper;

    private UserDto userDto;
    private UserEntity userEntity;

    private static final Long ID = 1L;
    private static final String USERNAME = "john";
    private static final String EMAIL = "john@example.com";
    private static final String PASSWORD_HASH = "hashed";
    private static final String BIO = "Hello!";
    private static final String AVATAR_URL = "avatar.png";

    private static final String OLD_USERNAME = "old";
    private static final String OLD_EMAIL = "old@example.com";
    private static final String OLD_PASSWORD_HASH = "oldhash";
    private static final String OLD_BIO = "old bio";
    private static final String OLD_AVATAR_URL = "old.png";

    private static final String NEW_USERNAME = "new";
    private static final String NEW_EMAIL = "new@example.com";
    private static final String NEW_PASSWORD_HASH = "newhash";
    private static final String NEW_BIO = "new bio";
    private static final String NEW_AVATAR_URL = "new.png";

    @BeforeEach
    void setUp() {
        mapper = Mappers.getMapper(UserMapper.class);

        userDto = UserDto.builder()
                .id(ID)
                .username(USERNAME)
                .email(EMAIL)
                .passwordHash(PASSWORD_HASH)
                .bio(BIO)
                .avatarUrl(AVATAR_URL)
                .build();

        userEntity = UserEntity.builder()
                .id(ID)
                .username(USERNAME)
                .email(EMAIL)
                .passwordHash(PASSWORD_HASH)
                .bio(BIO)
                .avatarUrl(AVATAR_URL)
                .build();
    }

    @Test
    void dtoToEntity_shouldMapAllFields() {
        UserEntity entity = mapper.dtoToEntity(userDto);

        assertNotNull(entity);
        assertEquals(userDto.getId(), entity.getId());
        assertEquals(userDto.getUsername(), entity.getUsername());
        assertEquals(userDto.getEmail(), entity.getEmail());
        assertEquals(userDto.getPasswordHash(), entity.getPasswordHash());
        assertEquals(userDto.getBio(), entity.getBio());
        assertEquals(userDto.getAvatarUrl(), entity.getAvatarUrl());
    }

    @Test
    void toDto_shouldMapAllFields() {
        UserDto dto = mapper.toDto(userEntity);

        assertNotNull(dto);
        assertEquals(userEntity.getId(), dto.getId());
        assertEquals(userEntity.getUsername(), dto.getUsername());
        assertEquals(userEntity.getEmail(), dto.getEmail());
        assertEquals(userEntity.getPasswordHash(), dto.getPasswordHash());
        assertEquals(userEntity.getBio(), dto.getBio());
        assertEquals(userEntity.getAvatarUrl(), dto.getAvatarUrl());
    }

    @Test
    void updateEntityFromDto_shouldUpdateFields() {
        UserEntity entity = UserEntity.builder()
                .id(ID)
                .username(OLD_USERNAME)
                .email(OLD_EMAIL)
                .passwordHash(OLD_PASSWORD_HASH)
                .bio(OLD_BIO)
                .avatarUrl(OLD_AVATAR_URL)
                .build();

        UserDto updateDto = UserDto.builder()
                .username(NEW_USERNAME)
                .email(NEW_EMAIL)
                .passwordHash(NEW_PASSWORD_HASH)
                .bio(NEW_BIO)
                .avatarUrl(NEW_AVATAR_URL)
                .build();

        mapper.updateEntityFromDto(updateDto, entity);

        assertEquals(NEW_USERNAME, entity.getUsername());
        assertEquals(NEW_EMAIL, entity.getEmail());
        assertEquals(NEW_PASSWORD_HASH, entity.getPasswordHash());
        assertEquals(NEW_BIO, entity.getBio());
        assertEquals(NEW_AVATAR_URL, entity.getAvatarUrl());
    }
}
