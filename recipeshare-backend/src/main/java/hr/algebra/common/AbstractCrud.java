package hr.algebra.common;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public abstract class AbstractCrud<E, DTO>{

    private final JpaRepository<E, Long> baseRepository;
    private final GenericMapper<DTO, E> mapper;

    protected AbstractCrud(JpaRepository<E, Long> baseRepository,
                           GenericMapper<DTO, E> mapper) {
        this.baseRepository = baseRepository;
        this.mapper = mapper;
    }

    public Optional<DTO> findById(Long id) {
        LoggerSingleton.INSTANCE.debug("Calling findById for id: " + id);
        return baseRepository.findById(id).map(mapper::toDto);
    }

    @Transactional
    public DTO create(DTO dto) {
        LoggerSingleton.INSTANCE.debug("Calling create");
        E entity = mapper.dtoToEntity(dto);
        this.preCreate(entity, dto);
        E saved = baseRepository.save(entity);
        LoggerSingleton.INSTANCE.info("Created: " + entity.getClass().getSimpleName());
        return mapper.toDto(saved);
    }

    @Transactional
    public DTO update(Long id, DTO dto) {
        LoggerSingleton.INSTANCE.debug("Calling update");
        E existing = baseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));

        E updated = updateEntity(existing, dto);
        this.preUpdate(updated);
        E saved = baseRepository.save(updated);
        LoggerSingleton.INSTANCE.info("Updated: " + saved.getClass().getSimpleName());
        return mapper.toDto(saved);
    }

    public void delete(Long id) {
        LoggerSingleton.INSTANCE.debug("Calling delete");
        E entity = baseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));
        this.preDelete(entity);
        if (entity instanceof SoftDeletableEntity sd){
            sd.setDeletedAt(Instant.now());
            LoggerSingleton.INSTANCE.info("Deleted: " + entity.getClass().getSimpleName());;
        }
        else{
            baseRepository.deleteById(id);
            LoggerSingleton.INSTANCE.info("Entity hard deleted");
        }
    }

    protected E updateEntity(E existing, DTO dto) {
        mapper.updateEntityFromDto(dto, existing);
        return existing;
    }

    protected void preCreate(E entity, DTO dto) {
        // intentionally empty
    }
    protected void preUpdate(E entity) {
        // intentionally empty
    }
    protected void preDelete(E entity) {
        // intentionally empty
    }

    protected JpaRepository<E, Long> getBaseRepository() {
        return baseRepository;
    }

    protected GenericMapper<DTO, E> getMapper() {
        return mapper;
    }
}

