package hr.algebra.recipeshare.mapper;


import hr.algebra.common.GenericMapper;
import hr.algebra.recipeshare.dao.RecipeEntity;
import hr.algebra.recipeshare.model.RecipeDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RecipeMapper extends GenericMapper<RecipeDto, RecipeEntity> {

    @Override
    RecipeEntity dtoToEntity(RecipeDto dto);

    @Override
    RecipeDto toDto(RecipeEntity entity);

    @Override
    void updateEntityFromDto(RecipeDto dto, @MappingTarget RecipeEntity entity);
}
