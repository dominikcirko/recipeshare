package hr.algebra.recipeshare.service;

import hr.algebra.common.AbstractCrud;
import hr.algebra.recipeshare.dao.RecipeEntity;
import hr.algebra.recipeshare.dao.UserEntity;
import hr.algebra.recipeshare.dao.repository.RecipeJpaRepository;
import hr.algebra.recipeshare.dao.repository.UserJpaRepository;
import hr.algebra.recipeshare.mapper.RecipeMapper;
import hr.algebra.recipeshare.model.RecipeDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipeService extends AbstractCrud<RecipeEntity, RecipeDto> {

    private final UserJpaRepository userJpaRepository;
    private final RecipeJpaRepository recipeJpaRepository;
    private final RecipeMapper recipeMapper;

    public RecipeService(RecipeJpaRepository repository, RecipeMapper mapper,
                         UserJpaRepository userJpaRepository, RecipeJpaRepository recipeJpaRepository, RecipeMapper recipeMapper) {
        super(repository, mapper);
        this.userJpaRepository = userJpaRepository;
        this.recipeJpaRepository = recipeJpaRepository;
        this.recipeMapper = recipeMapper;
    }

    public List<RecipeDto> getAllByUserId(Long userId) {
        List<RecipeEntity> entities = recipeJpaRepository.getAllByUserId(userId);
        return recipeMapper.toDtoList(entities);
    }

    @Override
    protected void preCreate(RecipeEntity entity, RecipeDto dto) {
        UserEntity user = userJpaRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        entity.setUser(user);
    }
}
