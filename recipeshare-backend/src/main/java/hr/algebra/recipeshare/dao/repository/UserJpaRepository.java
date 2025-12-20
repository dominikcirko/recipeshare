package hr.algebra.recipeshare.dao.repository;

import hr.algebra.recipeshare.dao.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserEntity,Long> {
    Optional<UserEntity> findByEmail(String email);
}
