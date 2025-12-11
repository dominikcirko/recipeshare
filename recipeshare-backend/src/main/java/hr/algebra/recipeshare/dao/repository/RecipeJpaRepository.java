package hr.algebra.recipeshare.dao.repository;

import hr.algebra.recipeshare.dao.RecipeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeJpaRepository extends JpaRepository<RecipeEntity, Long> {
}