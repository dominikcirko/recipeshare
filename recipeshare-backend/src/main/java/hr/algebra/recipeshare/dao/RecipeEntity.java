package hr.algebra.recipeshare.dao;

import hr.algebra.common.AbstractEntity;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "recipes")
@EqualsAndHashCode(callSuper = true)
public class RecipeEntity extends AbstractEntity {

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Column(nullable = false)
    private String instructions;

    @Column(name = "cook_time_minutes")
    private Integer cookTimeMinutes;

    @Column(nullable = false)
    private String ingredients;

    private Integer calories;
    private Integer protein;
    private Integer fat;
    private Integer carbs;
}
