package hr.algebra.common.operations;

import java.util.Optional;

public interface Readable<DTO> {
    Optional<DTO> findById(Long id);
}
