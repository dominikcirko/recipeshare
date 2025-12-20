package hr.algebra.common.operations;

public interface Updatable<DTO> {
    DTO update(Long id, DTO dto);
}