package hr.algebra.recipeshare.service;

import hr.algebra.common.AbstractCrud;
import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.dao.repository.UserJpaRepository;
import hr.algebra.recipeshare.mapper.UserMapper;
import hr.algebra.recipeshare.model.UserDto;
import org.springframework.stereotype.Service;

@Service
public class UserService extends AbstractCrud<UserEntity, UserDto> {

    public UserService(UserJpaRepository repository, UserMapper mapper) {
        super(repository, mapper);
    }
}
