package hr.algebra.recipeshare.mapper;


import hr.algebra.common.GenericMapper;
import hr.algebra.recipeshare.dao.RecipeEntity;
import hr.algebra.recipeshare.model.RecipeDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RecipeMapper extends GenericMapper<RecipeDto, RecipeEntity> {

    @Override
    @Mapping(target = "user", ignore = true)
    RecipeEntity dtoToEntity(RecipeDto dto);

    @Override
    @Mapping(target = "userId", source = "user.id")
    RecipeDto toDto(RecipeEntity entity);

    @Override
    void updateEntityFromDto(RecipeDto dto, @MappingTarget RecipeEntity entity);

    List<RecipeDto> toDtoList(List<RecipeEntity> entities);

}
