package hr.algebra.recipeshare.controller;

import hr.algebra.recipeshare.mapper.RecipeMapper;
import hr.algebra.recipeshare.model.RecipeDto;
import hr.algebra.recipeshare.service.RecipeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipe")
public class RecipeController {

    private final RecipeService recipeService;
    private final RecipeMapper recipeMapper;

    public RecipeController(RecipeService recipeService, RecipeMapper recipeMapper) {
        this.recipeService = recipeService;
        this.recipeMapper = recipeMapper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<RecipeDto>> getAllByUserId(@PathVariable Long id) {
        List<RecipeDto> recipes = recipeService.getAllByUserId(id);
        if (recipes.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDto> findById(@PathVariable Long id) {
        return recipeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeDto> update(@PathVariable Long id, @RequestBody RecipeDto dto) {
        return ResponseEntity.ok(recipeService.update(id, dto));
    }

    @PostMapping
    public ResponseEntity<RecipeDto> create(@RequestBody RecipeDto dto) {
        RecipeDto savedDto = recipeService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recipeService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
