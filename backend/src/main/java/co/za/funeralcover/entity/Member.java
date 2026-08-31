package co.za.funeralcover.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "id_number", nullable = false, unique = true, length = 20)
    private String idNumber;

    @Column(name = "access_token", nullable = false, unique = true, length = 36)
    private String accessToken;

    @Column(nullable = false, length = 20)
    private String phone;

    /** Who the parlor should contact/coordinate with, and who receives the plan's cash payout. */
    @Column(name = "beneficiary_name", length = 150)
    private String beneficiaryName;

    @Column(name = "beneficiary_relationship", length = 50)
    private String beneficiaryRelationship;

    @Column(name = "beneficiary_phone", length = 20)
    private String beneficiaryPhone;

    @Column(name = "beneficiary_id_number", length = 20)
    private String beneficiaryIdNumber;

    @Column(length = 150)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    /** Which funeral's printed QR code/link this member signed up from, if any. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funeral_event_id")
    private FuneralEvent funeralEvent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('pending','active','lapsed','deceased')")
    private MemberStatus status = MemberStatus.pending;

    @Column(name = "signup_date", updatable = false)
    private Instant signupDate = Instant.now();
}
