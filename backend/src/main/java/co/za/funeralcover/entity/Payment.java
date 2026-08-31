package co.za.funeralcover.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('eft','card','cash')")
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('pending','success','failed')")
    private PaymentStatus status = PaymentStatus.pending;

    @Column(length = 100)
    private String reference;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
