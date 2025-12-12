package hr.algebra.recipeshare.mapper;

import hr.algebra.common.GenericMapper;
import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.model.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper extends GenericMapper<UserDto, UserEntity> {

    @Override
    //@Mapping(target = "id", ignore = true)
    UserEntity dtoToEntity(UserDto dto);

    @Override
    UserDto toDto(UserEntity entity);

    @Override
    void updateEntityFromDto(UserDto dto, @MappingTarget UserEntity entity);
}

