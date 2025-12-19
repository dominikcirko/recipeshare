package hr.algebra.recipeshare.dao.repository;

import hr.algebra.recipeshare.dao.RecipeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeJpaRepository extends JpaRepository<RecipeEntity, Long> {
    List<RecipeEntity> getAllByUserId(Long userId);
}