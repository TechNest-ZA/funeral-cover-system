package co.za.funeralcover.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

/**
 * A funeral service the parlor printed a signup QR code/link for on the
 * programme, so new members can be attributed to the service that brought
 * them in.
 */
@Entity
@Table(name = "funeral_event")
@Getter
@Setter
@NoArgsConstructor
public class FuneralEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String label;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "qr_token", nullable = false, unique = true, length = 12)
    private String qrToken;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
