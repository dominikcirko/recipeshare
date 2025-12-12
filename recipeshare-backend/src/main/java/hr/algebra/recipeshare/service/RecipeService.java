package hr.algebra.recipeshare.service;

import hr.algebra.common.AbstractCrud;
import hr.algebra.recipeshare.dao.RecipeEntity;
import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.dao.repository.RecipeJpaRepository;
import hr.algebra.recipeshare.dao.repository.UserJpaRepository;
import hr.algebra.recipeshare.mapper.RecipeMapper;
import hr.algebra.recipeshare.model.RecipeDto;
import org.springframework.stereotype.Service;

@Service
public class RecipeService extends AbstractCrud<RecipeEntity, RecipeDto> {

    private final UserJpaRepository userJpaRepository;

    public RecipeService(RecipeJpaRepository repository, RecipeMapper mapper,
                         UserJpaRepository userJpaRepository) {
        super(repository, mapper);
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    protected void preCreate(RecipeEntity entity) {
        UserEntity user = userJpaRepository.findById(entity.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        entity.setUser(user);
    }
}
