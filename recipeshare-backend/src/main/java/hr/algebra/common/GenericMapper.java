package hr.algebra.common;

import org.mapstruct.MappingTarget;

//DTO, ENTITY
public interface GenericMapper<DTO, E> {
    E dtoToEntity(DTO dto);
    DTO toDto(E entity);
    void updateEntityFromDto(DTO dto, @MappingTarget E entity);
}