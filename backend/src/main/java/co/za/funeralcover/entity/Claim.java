package co.za.funeralcover.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "claim")
@Getter
@Setter
@NoArgsConstructor
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /**
     * Null means the claim is against the member themself; non-null means
     * it's against one of their named dependents, in which case the
     * member's own cover stays active.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dependent_id", unique = true)
    private Dependent dependent;

    @Column(name = "date_of_death", nullable = false)
    private LocalDate dateOfDeath;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "recorded_by", length = 50)
    private String recordedBy;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
