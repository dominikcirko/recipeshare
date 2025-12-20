package hr.algebra.recipeshare.service;

import hr.algebra.common.AbstractCrud;
import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.dao.repository.UserJpaRepository;
import hr.algebra.recipeshare.mapper.UserMapper;
import hr.algebra.recipeshare.model.LoginRequest;
import hr.algebra.recipeshare.model.LoginResponse;
import hr.algebra.recipeshare.model.UserDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService extends AbstractCrud<UserEntity, UserDto> {

    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserJpaRepository repository, UserMapper mapper, UserJpaRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        super(repository, mapper);
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    protected void preCreate(UserEntity entity, UserDto userDto) {
        entity.setPasswordHash(passwordEncoder.encode(userDto.getPasswordHash()));
    }

    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getUsername());

        return LoginResponse.builder()
                .userId(user.getId())
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}
