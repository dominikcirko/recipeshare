package hr.algebra.recipeshare.service;

import hr.algebra.common.AbstractCrud;
import hr.algebra.recipeshare.dao.RecipeEntity;
import hr.algebra.recipeshare.dao.repository.RecipeJpaRepository;
import hr.algebra.recipeshare.mapper.RecipeMapper;
import hr.algebra.recipeshare.model.RecipeDto;
import org.springframework.stereotype.Service;

@Service
public class RecipeService extends AbstractCrud<RecipeEntity, RecipeDto> {

    public RecipeService(RecipeJpaRepository repository, RecipeMapper mapper) {
        super(repository, mapper);
    }

}
