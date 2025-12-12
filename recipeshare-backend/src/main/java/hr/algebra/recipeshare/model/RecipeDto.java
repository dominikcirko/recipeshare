package hr.algebra.recipeshare.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecipeDto {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String instructions;
    private Integer cookTimeMinutes;
    private String ingredients;
    private Integer calories;
    private Integer protein;
    private Integer fat;
    private Integer carbs;
}
