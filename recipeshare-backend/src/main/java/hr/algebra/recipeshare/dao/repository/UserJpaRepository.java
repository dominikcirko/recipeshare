package hr.algebra.recipeshare.dao.repository;

import hr.algebra.recipeshare.dao.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserJpaRepository extends JpaRepository<UserEntity,Long> {
}
