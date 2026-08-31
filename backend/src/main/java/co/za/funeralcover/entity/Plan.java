package co.za.funeralcover.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "plan")
@Getter
@Setter
@NoArgsConstructor
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "monthly_premium", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPremium;

    /** Cash paid to the member's beneficiary, on top of the funeral service itself. */
    @Column(name = "cover_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal coverAmount;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Newline-separated list of what this plan actually provides (casket, transport, tent, catering, ...). */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String benefits;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false, insertable = false)
    private Instant createdAt;

    public List<String> getBenefitsList() {
        return benefits.lines().toList();
    }
}
