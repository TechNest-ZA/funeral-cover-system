package co.za.funeralcover.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "dependent")
@Getter
@Setter
@NoArgsConstructor
public class Dependent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "id_number", length = 20)
    private String idNumber;

    @Column(nullable = false, length = 50)
    private String relationship;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
