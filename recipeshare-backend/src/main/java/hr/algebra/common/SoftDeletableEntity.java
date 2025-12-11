package hr.algebra.common;

import java.time.Instant;

public interface SoftDeletableEntity {
    Instant getDeletedAt();
    void setDeletedAt(Instant deletedAt);
}
